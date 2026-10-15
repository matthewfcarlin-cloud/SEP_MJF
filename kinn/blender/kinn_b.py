"""Kinn concept B - center-spine tape on oak table (Blender 4.2+/5.x)."""
import bpy, math, os
import bmesh
from mathutils import Vector

CFG = dict(MODE='still', OUT='/Users/matthew/Movies/kinn_b', SAMPLES=128, PCT=100, SHOTS=['hero', 'flat', 'macro', 'pair'], GPU=True)
CFG.update(globals().get('KINN_CFG', {}))
MM = 0.001

if bpy.context.window is not None:
    sc = bpy.data.scenes.new('KinnB'); bpy.context.window.scene = sc
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

def fabric(name, color, sheen=0.5):
    m, b = pbsdf(name, color, 0.9, 0, {'Sheen Weight': sheen, 'Sheen Roughness': 0.45, 'Sheen Tint': (0.95, 0.92, 0.88, 1)})
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord')
    w1 = nt.nodes.new('ShaderNodeTexWave'); w1.bands_direction = 'X'; w1.inputs['Scale'].default_value = 1100; w1.inputs['Distortion'].default_value = .8
    w2 = nt.nodes.new('ShaderNodeTexWave'); w2.bands_direction = 'Y'; w2.inputs['Scale'].default_value = 1500; w2.inputs['Distortion'].default_value = .8
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 3200; nz.inputs['Detail'].default_value = 6
    mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'
    bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = .75; bm.inputs['Distance'].default_value = 0.00007
    for w in (w1, w2, nz): nt.links.new(tc.outputs['Object'], w.inputs['Vector'])
    nt.links.new(w1.outputs['Fac'], mul.inputs[0]); nt.links.new(w2.outputs['Fac'], mul.inputs[1])
    nt.links.new(mul.outputs[0], add.inputs[0]); nt.links.new(nz.outputs['Fac'], add.inputs[1])
    nt.links.new(add.outputs[0], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    # subtle color variation
    mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'
    mix.inputs['Factor'].default_value = 0.08
    mix.inputs[6].default_value = (*color, 1); mix.inputs[7].default_value = (color[0] * 0.8, color[1] * 0.8, color[2] * 0.8, 1)
    nt.links.new(nz.outputs['Fac'], mix.inputs['Factor'])
    nt.links.new(mix.outputs[2], b.inputs['Base Color'])
    return m

def emission(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m

def wood():
    m, b = pbsdf('Oak', (0.55, 0.40, 0.26), 0.42, 0, {'Coat Weight': 0.15, 'Coat Roughness': 0.35})
    nt = m.node_tree
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.35, 9.0, 1.0)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 4; nz.inputs['Detail'].default_value = 6; nz.inputs['Distortion'].default_value = 1.0
    wv = nt.nodes.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Y'; wv.inputs['Scale'].default_value = 3
    wv.inputs['Distortion'].default_value = 14; wv.inputs['Detail'].default_value = 6; wv.inputs['Detail Scale'].default_value = 1.5
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.50, 0.36, 0.23, 1); ramp.color_ramp.elements[1].color = (0.68, 0.53, 0.36, 1)
    bm = nt.nodes.new('ShaderNodeBump'); bm.inputs['Strength'].default_value = 0.08; bm.inputs['Distance'].default_value = 0.0004
    nt.links.new(tc.outputs['Object'], mp.inputs['Vector'])
    nt.links.new(mp.outputs['Vector'], wv.inputs['Vector']); nt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
    mixf = nt.nodes.new('ShaderNodeMath'); mixf.operation = 'MULTIPLY'
    nt.links.new(wv.outputs['Fac'], mixf.inputs[0]); mixf.inputs[1].default_value = 1.0
    add = nt.nodes.new('ShaderNodeMath'); add.operation = 'ADD'
    nt.links.new(mixf.outputs[0], add.inputs[0]); nt.links.new(nz.outputs['Fac'], add.inputs[1])
    mul2 = nt.nodes.new('ShaderNodeMath'); mul2.operation = 'MULTIPLY'; mul2.inputs[1].default_value = 0.5
    nt.links.new(add.outputs[0], mul2.inputs[0])
    nt.links.new(mul2.outputs[0], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    nt.links.new(mul2.outputs[0], bm.inputs['Height']); nt.links.new(bm.outputs['Normal'], b.inputs['Normal'])
    return m

TAPE_COL = (0.36, 0.27, 0.19)          # warm sand
M_tape = fabric('TapeSand', TAPE_COL)
M_tape2 = fabric('TapeGraphite', (0.035, 0.036, 0.04), 0.7)
M_thread = fabric('Thread', (0.78, 0.74, 0.68), 0.3)
M_thread2 = fabric('Thread2', (0.42, 0.43, 0.45), 0.3)
M_liner, _ = pbsdf('Liner', (0.88, 0.88, 0.86), 0.55, 0, {'Coat Weight': 0.35, 'Coat Roughness': 0.2})
M_print, _ = pbsdf('LinerPrint', (0.62, 0.64, 0.66), 0.6)
M_coin, _ = pbsdf('CoinCeramic', (0.86, 0.86, 0.84), 0.36, 0, {'Coat Weight': 0.45, 'Coat Roughness': 0.12})
M_coinBase, _ = pbsdf('CoinBase', (0.05, 0.05, 0.055), 0.4, 0)
M_engrave, _ = pbsdf('Engrave', (0.6, 0.61, 0.62), 0.5, 0)
M_gold, _ = pbsdf('Gold', (1.0, 0.76, 0.34), 0.2, 1.0)
M_led = emission('LED', (0.05, 0.95, 0.72), 9.0)
M_wood = wood()

# ---------------- helpers ----------------
def outline_curve(name, loops, thick, bevel, mat, z=0.0, res=4):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = thick / 2; cu.bevel_depth = bevel; cu.bevel_resolution = res
    for pts in loops:
        sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
        for i, (x, y) in enumerate(pts): sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    o = link(bpy.data.objects.new(name, cu)); o.location.z = z + thick / 2 + bevel
    cu.materials.append(mat); return o

def rrect(w, h, r, n=12, cx=0, cy=0):
    pts = []
    for (qx, qy, a0) in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for i in range(n + 1):
            a = math.radians(a0 + 90 * i / n)
            pts.append((cx + qx + r * math.cos(a), cy + qy + r * math.sin(a)))
    return pts

def spine(name, y0, y1, width, height, mat, z):
    """pillowed channel: flattened capped tube following a straight path, tapering at the far end"""
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'
    cu.bevel_depth = width / 2; cu.bevel_resolution = 6; cu.use_fill_caps = True
    sp = cu.splines.new('POLY'); n = 40; sp.points.add(n)
    for i in range(n + 1):
        t = i / n; y = y0 + (y1 - y0) * t
        r = 1.0 if t < 0.96 else max(0.55, 1 - (t - 0.96) / 0.04 * 0.45)
        sp.points[i].co = (0, y, 0, 1); sp.points[i].radius = r
    o = link(bpy.data.objects.new(name, cu)); o.scale.z = height / width * 2; o.location.z = z
    cu.materials.append(mat); return o

def stitches(name, x, y0, y1, mat, z, pitch=2.6 * MM, length=1.6 * MM):
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    n = int((y1 - y0) / pitch)
    for i in range(n):
        y = y0 + i * pitch
        res = bmesh.ops.create_cube(bm, size=1.0)
        for v in res['verts']:
            v.co.x = x + v.co.x * 0.42 * MM; v.co.y = y + v.co.y * length; v.co.z = z + v.co.z * 0.16 * MM
    bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me)); me.materials.append(mat)
    md = o.modifiers.new('bev', 'BEVEL'); md.width = 0.07 * MM; md.segments = 2
    for p in me.polygons: p.use_smooth = True
    return o

def coin_obj(name):
    R, H = 11 * MM, 3.2 * MM
    prof = [(0, 0), (R - 0.6 * MM, 0), (R, 0.5 * MM), (R, 1.0 * MM)]
    for i in range(1, 17):
        t = i / 16
        prof.append((R - (R - 7.5 * MM) * (1 - math.cos(t * math.pi / 2)), 1.0 * MM + (H - 1.0 * MM) * math.sin(t * math.pi / 2)))
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
    bpy.ops.mesh.primitive_torus_add(major_radius=10.85 * MM, minor_radius=0.28 * MM, major_segments=128, minor_segments=12)
    ring = adopt(bpy.context.active_object); ring.location = (0, 0, 1.05 * MM); ring.scale.z = 0.6
    ring.data.materials.append(M_led); ring.parent = o
    for p in ring.data.polygons: p.use_smooth = True
    td = bpy.data.curves.new(name + '_txt', 'FONT'); td.body = 'kinn'; td.size = 4.2 * MM
    td.align_x = 'CENTER'; td.align_y = 'CENTER'; td.extrude = 0.03 * MM
    t = link(bpy.data.objects.new(name + '_txt', td)); t.location = (0, 0, H + 0.01 * MM); t.parent = o
    td.materials.append(M_engrave)
    return o

def dock_bud(name, x, y, mat, z):
    """fabric-wrapped soft raised base the coin snaps into"""
    loops = [[(x + 13.2 * MM * math.cos(2 * math.pi * i / 96), y + 13.2 * MM * math.sin(2 * math.pi * i / 96)) for i in range(96)]]
    return outline_curve(name, loops, 0.7 * MM, 0.55 * MM, mat, z, res=6)

T = 0.55 * MM
L, W = 250 * MM, 50 * MM

def strip(name, mat, thread, with_coin, loc, rot, liner=False):
    root = link(bpy.data.objects.new(name, None)); root.location = loc; root.rotation_euler = (0, 0, rot)
    objs = []
    z0 = 0
    if liner:
        lo = outline_curve(name + '_liner', [rrect(W + 6 * MM, L + 6 * MM, 6 * MM)], 0.25 * MM, 0.04 * MM, M_liner, 0)
        objs.append(lo); z0 = 0.33 * MM
        # printed guide lines + logo on liner margin
        for k in range(-11, 12):
            yy = k * 10 * MM
            pl = outline_curve(f'{name}_tick{k}', [rrect(2.2 * MM, 0.35 * MM, 0.1 * MM, 2, W / 2 + 1.6 * MM, yy)], 0.01 * MM, 0.0, M_print, 0.26 * MM)
            objs.append(pl)
    tape = outline_curve(name + '_tape', [rrect(W, L, 9 * MM)], T, 0.18 * MM, mat, z0)
    objs.append(tape)
    top = z0 + T + 0.36 * MM
    dock_y = L / 2 - 30 * MM
    objs.append(spine(name + '_spine', dock_y - 12 * MM, -L / 2 + 26 * MM, 9 * MM, 1.5 * MM, mat, top - 0.3 * MM))
    for sx in (-6.4 * MM, 6.4 * MM):
        objs.append(stitches(f'{name}_st{sx>0}', sx, -L / 2 + 22 * MM, dock_y - 14 * MM, thread, top + 0.02 * MM))
    objs.append(dock_bud(name + '_bud', 0, dock_y, mat, top - 0.3 * MM))
    # snap contacts (visible only when coin is off)
    for k, a in enumerate((90, 210, 330)):
        bpy.ops.mesh.primitive_cylinder_add(radius=1.0 * MM, depth=0.2 * MM, vertices=32,
            location=(5.2 * MM * math.cos(math.radians(a)), dock_y + 5.2 * MM * math.sin(math.radians(a)), top + 1.32 * MM))
        c = adopt(bpy.context.active_object); c.data.materials.append(M_gold); objs.append(c)
    coin = None
    if with_coin:
        coin = coin_obj(name + '_coin'); coin.location = (0, dock_y, top + 1.35 * MM); objs.append(coin)
    for o in objs:
        if o.parent is None: o.parent = root
    return root, coin, dock_y

main, coin_main, dock_y = strip('Main', M_tape, M_thread, True, (0, 0, 0), math.radians(-8))
spare, _, _ = strip('Spare', M_tape, M_thread, False, (0.072, -0.012, 0), math.radians(-3), liner=True)
dark, coin_dark, _ = strip('Dark', M_tape2, M_thread2, True, (-0.075, 0.01, 0), math.radians(-12))
loose = coin_obj('LooseCoin'); loose.location = (0.13, 0.11, 0); loose.rotation_euler = (0, 0, math.radians(30))
SHOT_OBJS = {'pair': [main, spare], 'hero': [main, spare, dark], 'flat': [main, spare, dark], 'macro': [main, spare, dark]}

# ---------------- table + light ----------------
bpy.ops.mesh.primitive_plane_add(size=3, location=(0, 0, -0.00002))
table = adopt(bpy.context.active_object); table.data.materials.append(M_wood)
sd = bpy.data.lights.new('Sun', 'SUN'); sd.energy = 1.4; sd.angle = math.radians(9); sd.color = (1.0, 0.95, 0.88)
sun = link(bpy.data.objects.new('Sun', sd)); sun.rotation_euler = (math.radians(52), math.radians(-8), math.radians(-128))
ad = bpy.data.lights.new('Window', 'AREA'); ad.shape = 'RECTANGLE'; ad.size = 1.2; ad.size_y = 0.8; ad.energy = 10; ad.color = (0.9, 0.95, 1.0)
win = link(bpy.data.objects.new('Window', ad)); win.location = (-0.6, 0.3, 0.7)
win.rotation_euler = (Vector((0, 0, 0)) - win.location).to_track_quat('-Z', 'Y').to_euler()
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.92, 0.9, 0.86, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.12

# ---------------- cameras ----------------
def cam(name, lens, fstop, loc, tgt, focus):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_width = 36
    cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
    o = link(bpy.data.objects.new(name, cd)); o.location = Vector(loc)
    o.rotation_euler = (Vector(tgt) - o.location).to_track_quat('-Z', 'Y').to_euler()
    cd.dof.focus_distance = (Vector(focus) - Vector(loc)).length
    return o
mw = main.matrix_world
bpy.context.view_layer.update()
dock_w = main.matrix_world @ Vector((0, dock_y, 0.002))
mid_w = main.matrix_world @ Vector((0, -0.02, 0.001))
cams = {
    'hero': cam('CamHero', 85, 5.6, (dock_w.x + 0.13, dock_w.y - 0.2, 0.11), (dock_w.x - 0.005, dock_w.y - 0.035, 0.0), dock_w),
    'flat': cam('CamFlat', 50, 11, (0.02, 0.0, 0.62), (0.02, 0.0, 0.0), (0.02, 0.0, 0.0)),
    'macro': cam('CamMacro', 100, 11, (mid_w.x + 0.07, mid_w.y - 0.1, 0.06), (mid_w.x, mid_w.y + 0.01, 0.0005), mid_w),
    'pair': cam('CamPair', 70, 8, (0.05, -0.33, 0.24), (0.04, 0.0, 0.0), (0.04, 0.0, 0.0)),
}
for o in cams.values():
    o.data.dof.focus_distance = o.data.dof.focus_distance

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
sc.render.resolution_x = 1920; sc.render.resolution_y = 1080; sc.render.resolution_percentage = CFG['PCT']
sc.view_settings.view_transform = 'AgX'
try: sc.view_settings.look = 'AgX - Base Contrast'
except Exception: pass
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 95
os.makedirs(CFG['OUT'], exist_ok=True)
if CFG['MODE'] == 'still':
    for s in CFG['SHOTS']:
        sc.camera = cams[s]
        sc.render.filepath = os.path.join(CFG['OUT'], f'kinnB_{s}.jpg')
        bpy.ops.render.render(write_still=True)
