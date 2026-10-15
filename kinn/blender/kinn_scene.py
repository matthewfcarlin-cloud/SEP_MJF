"""Kinn v2 - procedural product scene (Blender 4.2+ / 5.x).
MODE: 'save' (build only), 'still' (render STILL_FRAMES), 'anim' (render animation)."""
import bpy, math, os, sys
import bmesh
from mathutils import Vector

CFG = dict(MODE='anim', OUT='/Users/matthew/Movies/kinn_render', SAMPLES=64, PCT=100,
           STILL_FRAMES=[], GPU=True)
CFG.update(globals().get('KINN_CFG', {}))
MM = 0.001
FPS = 24

if bpy.context.window is not None:
    sc = bpy.data.scenes.new('Kinn'); bpy.context.window.scene = sc
else:
    sc = bpy.context.scene
    for o in list(sc.objects): bpy.data.objects.remove(o)
col = sc.collection

def adopt(o):
    for c in list(o.users_collection):
        if c != col: c.objects.unlink(o)
    if o.name not in col.objects: col.objects.link(o)
    return o

def link(o):
    col.objects.link(o); return o

# ---------------- materials ----------------
def pbsdf(name, color, rough=0.5, metal=0.0, extra=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    def s(k, v):
        if k in b.inputs: b.inputs[k].default_value = v
    s('Base Color', (*color, 1)); s('Roughness', rough); s('Metallic', metal)
    for k, v in (extra or {}).items(): s(k, v)
    return m, b

def fabric(name, color):
    m, b = pbsdf(name, color, 0.85, 0, {'Sheen Weight': 0.6, 'Sheen Roughness': 0.4, 'Sheen Tint': (0.8, 0.8, 0.85, 1)})
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord')
    w1 = nt.nodes.new('ShaderNodeTexWave'); w1.bands_direction = 'X'; w1.inputs['Scale'].default_value = 900; w1.inputs['Distortion'].default_value = .6
    w2 = nt.nodes.new('ShaderNodeTexWave'); w2.bands_direction = 'Y'; w2.inputs['Scale'].default_value = 1300; w2.inputs['Distortion'].default_value = .6
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 2500
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'
    bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = .6; bm.inputs['Distance'].default_value = 0.00008
    for w in (w1, w2, nz): nt.links.new(tc.outputs['Object'], w.inputs['Vector'])
    nt.links.new(w1.outputs['Fac'], mul.inputs[0]); nt.links.new(w2.outputs['Fac'], mul.inputs[1])
    nt.links.new(mul.outputs[0], add.inputs[0]); nt.links.new(nz.outputs['Fac'], add.inputs[1])
    nt.links.new(add.outputs[0], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    return m

def emission(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m, e

M_sand = fabric('TapeSand', (0.42, 0.33, 0.24))
M_navy = fabric('TapeNavy', (0.014, 0.024, 0.05))
M_graph = fabric('TapeGraphite', (0.03, 0.03, 0.032))
M_ink, _ = pbsdf('SilverInk', (0.82, 0.83, 0.85), 0.3, 1.0)
M_alu, _ = pbsdf('Aluminum', (0.6, 0.61, 0.63), 0.26, 1.0, {'Anisotropic': 0.5})
M_gold, _ = pbsdf('Gold', (1.0, 0.76, 0.34), 0.18, 1.0)
M_coin, _ = pbsdf('CoinCeramic', (0.86, 0.86, 0.84), 0.38, 0, {'Coat Weight': 0.4, 'Coat Roughness': 0.15})
M_coinBase, _ = pbsdf('CoinBase', (0.05, 0.05, 0.055), 0.4, 0)
M_engrave, _ = pbsdf('Engrave', (0.55, 0.56, 0.57), 0.5, 0)
M_floor, _ = pbsdf('Floor', (0.006, 0.006, 0.007), 0.62, 0, {'Specular IOR Level': 0.35})
TEAL = (0.05, 0.95, 0.72)

# ---------------- helpers ----------------
def outline_curve(name, loops, thick, bevel, mat, z=0.0):
    """loops: list of lists of (x,y) in meters, closed. Filled 2D curve (holes via even-odd)."""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = thick / 2; cu.bevel_depth = bevel; cu.bevel_resolution = 3
    for pts in loops:
        sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
        for i, (x, y) in enumerate(pts): sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    o = link(bpy.data.objects.new(name, cu)); o.location.z = z + thick / 2 + bevel
    cu.materials.append(mat)
    return o

def tube_curve(name, pts, radius, mat, z, flatten=0.25):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 2
    sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for i, (x, y) in enumerate(pts): sp.points[i].co = (x, y, 0, 1)
    o = link(bpy.data.objects.new(name, cu)); o.location.z = z; o.scale.z = flatten
    cu.materials.append(mat); return o

def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

def ellipse(cx, cy, a, b, n=72):
    return [(cx + a * math.cos(2 * math.pi * i / n), cy + b * math.sin(2 * math.pi * i / n)) for i in range(n)]

def profile_shape(L, prof, n=160):
    """symmetric shape along x from -L..L, half-width prof(|x|) (must reach 0 at L)."""
    top = []
    for i in range(n + 1):
        x = -L + 2 * L * i / n
        top.append((x, prof(abs(x))))
    bot = [(x, -y) for (x, y) in reversed(top[1:-1])]
    return top + bot

def capped(L, half_fn, cap):
    def f(ax):
        if ax <= L - cap: return half_fn(ax)
        r = half_fn(L - cap)
        u = (ax - (L - cap)) / cap
        return r * math.sqrt(max(0.0, 1 - u * u)) if ax < L else 0.0
    return f

def coin_obj(name, led_mat):
    """Coin v2: 22 mm, 3.2 mm, domed ceramic top, dark base, LED ring, engraved wordmark."""
    R, H = 11 * MM, 3.2 * MM
    prof = [(0, 0), (R - 0.6 * MM, 0), (R, 0.5 * MM), (R, 1.0 * MM)]
    # top dome profile
    for i in range(1, 17):
        t = i / 16
        r = R - (R - 7.5 * MM) * (1 - math.cos(t * math.pi / 2))
        z = 1.0 * MM + (H - 1.0 * MM) * math.sin(t * math.pi / 2)
        prof.append((r, z))
    prof.append((0, H))
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for (r, z) in prof]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=128, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    o = link(bpy.data.objects.new(name, me))
    me.materials.append(M_coin); me.materials.append(M_coinBase)
    for p in me.polygons:
        if p.center.z < 0.95 * MM: p.material_index = 1
    # LED ring
    bpy.ops.mesh.primitive_torus_add(major_radius=10.85 * MM, minor_radius=0.28 * MM, major_segments=128, minor_segments=12, location=(0, 0, 0))
    ring = bpy.context.active_object; ring.name = name + '_LED'
    ring.location = (0, 0, 1.05 * MM); ring.scale.z = 0.6
    for p in ring.data.polygons: p.use_smooth = True
    ring.data.materials.append(led_mat); ring.parent = o; adopt(ring)
    # wordmark
    td = bpy.data.curves.new(name + '_txt', 'FONT'); td.body = 'kinn'; td.size = 4.2 * MM
    td.align_x = 'CENTER'; td.align_y = 'CENTER'; td.extrude = 0.03 * MM
    t = link(bpy.data.objects.new(name + '_txt', td)); t.location = (0, 0, H + 0.01 * MM); t.parent = o
    td.materials.append(M_engrave)
    return o

def dock(name, x, y, z0):
    loops = [ellipse(x, y, 12.2 * MM, 12.2 * MM, 96), ellipse(x, y, 11.3 * MM, 11.3 * MM, 96)]
    d = outline_curve(name, loops, 0.5 * MM, 0.08 * MM, M_alu, z0)
    pins = []
    for k, a in enumerate((90, 210, 330)):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.9 * MM, depth=0.12 * MM, vertices=32,
            location=(x + 5.5 * MM * math.cos(math.radians(a)), y + 5.5 * MM * math.sin(math.radians(a)), z0 + 0.06 * MM))
        c = bpy.context.active_object; c.name = f'{name}_pin{k}'; c.data.materials.append(M_gold); adopt(c)
        pins.append(c)
    return [d] + pins

def parent_all(root, objs):
    for o in objs:
        if o.parent is None: o.parent = root

# ---------------- strips ----------------
T = 0.6 * MM
def build_knee(root_name, loc, rot):
    root = link(bpy.data.objects.new(root_name, None)); root.location = loc; root.rotation_euler = (0, 0, rot)
    L = 115 * MM
    half = capped(L, lambda ax: 27 * MM + 9 * MM * (1 - smooth(0, 55 * MM, ax)), 27 * MM)
    outer = profile_shape(L, half)
    outer = [(y, x) for (x, y) in outer]  # vertical strip along y
    hole = ellipse(0, -8 * MM, 16 * MM, 21 * MM, 72)
    tape = outline_curve(root_name + '_tape', [outer, hole], T, 0.12 * MM, M_sand)
    # sensor traces arcing around the patella hole
    objs = [tape]
    for side in (-1, 1):
        pts = []
        for i in range(41):
            t = i / 40
            yy = -60 * MM + 120 * MM * t - 8 * MM * 0
            ang = math.pi * (t - 0.5)
            xx = side * (22 * MM + 4.5 * MM * math.cos(ang) + 0)
            pts.append((xx * (0.9 + 0.1 * math.cos(ang)), yy))
        for k, off in enumerate((-1.6, 0, 1.6)):
            objs.append(tube_curve(f'{root_name}_tr{side}{k}', [(x + side * off * MM, y) for x, y in pts], 0.45 * MM, M_ink, T + 0.25 * MM, 0.3))
    dz = T + 0.25 * MM
    objs += dock(root_name + '_dock', 0, 82 * MM, T)
    # lead from dock to traces
    objs.append(tube_curve(root_name + '_lead', [(0, 70 * MM), (0, 62 * MM), (-22 * MM, 60 * MM)], 0.4 * MM, M_ink, dz, 0.3))
    objs.append(tube_curve(root_name + '_lead2', [(0, 62 * MM), (22 * MM, 60 * MM)], 0.4 * MM, M_ink, dz, 0.3))
    parent_all(root, objs)
    return root, (0, 82 * MM)

def build_shoulder(root_name, loc, rot):
    root = link(bpy.data.objects.new(root_name, None)); root.location = loc; root.rotation_euler = (0, 0, rot)
    L = 120 * MM
    half = capped(L, lambda ax: 14 * MM + 9 * MM * smooth(L - 70 * MM, L - 30 * MM, ax), 30 * MM)
    outer = [(y, x) for (x, y) in profile_shape(L, half)]
    tape = outline_curve(root_name + '_tape', [outer], T, 0.12 * MM, M_navy)
    objs = [tape]
    sen = [(y, x) for (x, y) in profile_shape(52 * MM, capped(52 * MM, lambda ax: 7 * MM, 7 * MM), 60)]
    sen = [(x, y - 12 * MM) for (x, y) in sen]
    objs.append(outline_curve(root_name + '_sensor', [sen], 0.06 * MM, 0.02 * MM, M_ink, T))
    objs += dock(root_name + '_dock', 0, 84 * MM, T)
    objs.append(tube_curve(root_name + '_lead', [(0, 72 * MM), (0, 40 * MM)], 0.4 * MM, M_ink, T + 0.2 * MM, 0.3))
    parent_all(root, objs)
    return root, (0, 84 * MM)

def build_back(root_name, loc, rot):
    root = link(bpy.data.objects.new(root_name, None)); root.location = loc; root.rotation_euler = (0, 0, rot)
    L = 140 * MM
    half = capped(L, lambda ax: 22 * MM - 4 * MM * smooth(0, L, ax), 18 * MM)
    outer = [(y, x) for (x, y) in profile_shape(L, half)]
    tape = outline_curve(root_name + '_tape', [outer], T, 0.12 * MM, M_graph)
    objs = [tape]
    for k, off in enumerate((-6, 0, 6)):
        objs.append(tube_curve(f'{root_name}_tr{k}', [(off * MM, -110 * MM), (off * MM, -16 * MM)], 0.45 * MM, M_ink, T + 0.25 * MM, 0.3))
        objs.append(tube_curve(f'{root_name}_tu{k}', [(off * MM, 16 * MM), (off * MM, 110 * MM)], 0.45 * MM, M_ink, T + 0.25 * MM, 0.3))
    objs += dock(root_name + '_dock', 0, 0, T)
    parent_all(root, objs)
    return root, (0, 0)

knee, knee_dock = build_knee('Knee', (0, 0, 0), 0)
sh, sh_dock = build_shoulder('Shoulder', (-0.085, 0.01, 0), math.radians(10))
bk, bk_dock = build_back('Back', (0.085, 0.0, 0), math.radians(-10))

led_hero, led_hero_e = emission('LEDHero', TEAL, 0.0)
led_static, _ = emission('LEDStatic', TEAL, 14.0)
coin_hero = coin_obj('CoinHero', led_hero)
coin_sh = coin_obj('CoinShoulder', led_static); coin_sh.parent = sh; coin_sh.location = (sh_dock[0], sh_dock[1], T + 0.05 * MM)
coin_bk = coin_obj('CoinBack', led_static); coin_bk.parent = bk; coin_bk.location = (bk_dock[0], bk_dock[1], T + 0.05 * MM)
coin_rest = Vector((knee_dock[0], knee_dock[1], T + 0.05 * MM))

# ---------------- stage ----------------
bpy.ops.mesh.primitive_plane_add(size=6, location=(0, 0, -0.00001))
floor = adopt(bpy.context.active_object); floor.name = 'Floor'; floor.data.materials.append(M_floor)
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.0, 0.0, 0.0, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.0

def area(name, loc, target, size, energy, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
    ld.energy = energy; ld.color = color
    o = link(bpy.data.objects.new(name, ld)); o.location = loc
    d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
    return o
area('RimL', (-0.4, 0.45, 0.3), (0, 0, 0), (1.2, 0.05), 1.6, (0.85, 0.92, 1.0))
area('RimR', (0.4, 0.45, 0.3), (0, 0, 0), (1.2, 0.05), 1.6, (1.0, 0.95, 0.9))
area('Top', (0.0, -0.1, 0.55), (0, 0, 0), (0.25, 0.6), 0.7, (1, 1, 1))
area('Kick', (0.0, -0.6, 0.06), (0, 0, 0.01), (0.8, 0.04), 0.35, (0.75, 0.9, 1.0))
area('TealAccent', (-0.25, -0.2, 0.05), (0, 0.05, 0), (0.3, 0.03), 0.25, TEAL)

# ---------------- animation ----------------
def kf(o, path, f, val):
    setattr(o, path, val); o.keyframe_insert(path, frame=f)

def cam(name, lens, fstop):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = 36; cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
    return link(bpy.data.objects.new(name, cd)), cd

def look(o, tgt):
    o.rotation_euler = (Vector(tgt) - o.location).to_track_quat('-Z', 'Y').to_euler()

def key_cam(o, cd, f, loc, tgt, focus):
    o.location = Vector(loc); look(o, tgt)
    o.keyframe_insert('location', frame=f); o.keyframe_insert('rotation_euler', frame=f)
    cd.dof.focus_distance = (Vector(focus) - Vector(loc)).length; cd.dof.keyframe_insert('focus_distance', frame=f)

hover = coin_rest + Vector((0, 0, 0.03))
coin_hero.location = hover
# Shot A 1-72: coin hovering, LED ring wakes up, macro orbit
kf(coin_hero, 'location', 1, hover.copy()); kf(coin_hero, 'location', 96, hover.copy())
kf(coin_hero, 'rotation_euler', 1, Vector((math.radians(14), 0, math.radians(-30))))
kf(coin_hero, 'rotation_euler', 96, Vector((math.radians(10), 0, math.radians(40))))
# Shot B 73-156: coin descends & clicks in at 128
kf(coin_hero, 'location', 128, coin_rest.copy())
kf(coin_hero, 'rotation_euler', 128, Vector((0, 0, math.radians(90))))
kf(coin_hero, 'location', 288, coin_rest.copy()); kf(coin_hero, 'rotation_euler', 288, Vector((0, 0, math.radians(90))))
for f, s in ((1, 0), (18, 0), (40, 22), (72, 16), (126, 12), (129, 80), (136, 30), (150, 18), (288, 18)):
    led_hero_e.inputs['Strength'].default_value = s; led_hero_e.inputs['Strength'].keyframe_insert('default_value', frame=f)

cc = coin_rest
cA, dA = cam('CamA', 100, 16.0)
key_cam(cA, dA, 1, (cc.x + 0.06, cc.y - 0.12, 0.04), (cc.x, cc.y, 0.028), hover)
key_cam(cA, dA, 72, (cc.x - 0.05, cc.y - 0.11, 0.036), (cc.x, cc.y, 0.028), hover)
cB, dB = cam('CamB', 85, 9.0)
key_cam(cB, dB, 73, (cc.x + 0.07, cc.y - 0.12, 0.06), (cc.x, cc.y, 0.012), cc)
key_cam(cB, dB, 156, (cc.x + 0.055, cc.y - 0.1, 0.045), (cc.x, cc.y, 0.003), cc)
cC, dC = cam('CamC', 55, 5.6)
key_cam(cC, dC, 157, (-0.32, -0.3, 0.13), (0.0, 0.0, 0.0), (0, 0, 0))
key_cam(cC, dC, 240, (0.3, -0.31, 0.13), (0.0, 0.01, 0.0), (0, 0, 0))
cD, dD = cam('CamD', 65, 8.0)
key_cam(cD, dD, 241, (-0.01, -0.06, 0.86), (0.0, 0.0, 0.0), (0, 0, 0))
key_cam(cD, dD, 288, (0.0, -0.06, 0.70), (0.0, 0.0, 0.0), (0, 0, 0))
for f, c in ((1, cA), (73, cB), (157, cC), (241, cD)):
    m = sc.timeline_markers.new(f'm{f}', frame=f); m.camera = c
sc.camera = cA

def cam_for(f):
    return cA if f < 73 else cB if f < 157 else cC if f < 241 else cD

# ---------------- render ----------------
sc.render.engine = 'CYCLES'
if CFG['GPU']:
    try:
        pr = bpy.context.preferences.addons['cycles'].preferences
        pr.compute_device_type = 'METAL'; pr.get_devices()
        for d in pr.devices: d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:
        print('GPU setup failed', e)
sc.cycles.samples = CFG['SAMPLES']; sc.cycles.use_denoising = True
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 4
sc.render.resolution_x = 1920; sc.render.resolution_y = 1080; sc.render.resolution_percentage = CFG['PCT']
sc.render.fps = FPS; sc.frame_start = 1; sc.frame_end = 288
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - High Contrast'
except Exception: pass
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 94
os.makedirs(CFG['OUT'], exist_ok=True)

if CFG['MODE'] == 'still':
    for f in CFG['STILL_FRAMES']:
        sc.frame_set(f); sc.camera = cam_for(f)
        sc.render.filepath = os.path.join(CFG['OUT'], 'still_%03d.jpg' % f)
        bpy.ops.render.render(write_still=True)
elif CFG['MODE'] == 'anim':
    sc.render.filepath = os.path.join(CFG['OUT'], 'f####')
    sc.render.use_overwrite = False; sc.render.use_placeholder = True
    bpy.ops.render.render(animation=True)
