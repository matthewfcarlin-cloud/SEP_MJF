"""Kinn flex - knee strip slowly bending in a black void.
Woven tape fibers, printed silver serpentine traces that stretch and flatten at the bend,
signal pulses running to the coin, LED ring lights when the bend passes the line.
Runs headless:  python3 kinn_flex.py OUT N W H SAMPLES [frames]
"""
import bpy, bmesh, math, os, sys, json
import numpy as np
from mathutils import Vector, Matrix, Euler

A = sys.argv[1:]
OUT = A[0] if len(A) > 0 else 'flex_out'
N = int(A[1]) if len(A) > 1 else 96
RW = int(A[2]) if len(A) > 2 else 1600
RH = int(A[3]) if len(A) > 3 else 900
SAMPLES = int(A[4]) if len(A) > 4 else 48
ONLY = [int(x) for x in A[5].split(',')] if len(A) > 5 else None
MM = 0.001
HERE = os.path.dirname(os.path.abspath(__file__))
SH = json.load(open(os.path.join(HERE, 'shapes.json')))['K']
LIMIT_T = 120 / 135          # knee flexion 0..135 deg mapped to t; the line is 120 deg

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
col = sc.collection

# ---------------- materials ----------------
def pbsdf(name, color, rough=0.5, metal=0.0, extra=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    def s(k, v):
        if k in b.inputs: b.inputs[k].default_value = v
    s('Base Color', (*color, 1)); s('Roughness', rough); s('Metallic', metal)
    for k, v in (extra or {}).items(): s(k, v)
    return m, b

def node(nt, t, **kw):
    n = nt.nodes.new(t)
    for k, v in kw.items(): setattr(n, k, v)
    return n

def math_node(nt, op, a=None, b=None):
    n = nt.nodes.new('ShaderNodeMath'); n.operation = op
    for i, v in enumerate((a, b)):
        if v is None: continue
        if isinstance(v, (int, float)): n.inputs[i].default_value = v
        else: nt.links.new(v, n.inputs[i])
    return n.outputs[0]

def woven(name, color):
    """kinesiology weave on the rest-pose UV (mm). warp along y, weft along x, over/under checker."""
    m, b = pbsdf(name, color, 0.9, 0, {'Sheen Weight': 0.15, 'Sheen Roughness': 0.4, 'Sheen Tint': (1, 1, 1, 1), 'Specular IOR Level': 0.12})
    nt = m.node_tree; L = nt.links
    uv = node(nt, 'ShaderNodeUVMap'); uv.uv_map = 'rest'
    sep = node(nt, 'ShaderNodeSeparateXYZ'); L.new(uv.outputs['UV'], sep.inputs[0])
    P = 0.34   # thread pitch, mm
    u = math_node(nt, 'DIVIDE', sep.outputs[0], P); v = math_node(nt, 'DIVIDE', sep.outputs[1], P)
    # thread cross-section profiles
    warp = math_node(nt, 'ABSOLUTE', math_node(nt, 'SINE', math_node(nt, 'MULTIPLY', u, math.pi)))
    weft = math_node(nt, 'ABSOLUTE', math_node(nt, 'SINE', math_node(nt, 'MULTIPLY', v, math.pi)))
    # over/under: parity of floor(u)+floor(v)
    par = math_node(nt, 'MODULO', math_node(nt, 'ADD', math_node(nt, 'FLOOR', u), math_node(nt, 'FLOOR', v)), 2)
    par = math_node(nt, 'ABSOLUTE', par)
    # lengthwise undulation of the top thread
    wu = math_node(nt, 'ABSOLUTE', math_node(nt, 'SINE', math_node(nt, 'MULTIPLY', v, math.pi / 1.0)))
    hw = math_node(nt, 'MULTIPLY', warp, math_node(nt, 'ADD', 0.55, math_node(nt, 'MULTIPLY', wu, 0.45)))
    h = node(nt, 'ShaderNodeMix'); h.data_type = 'FLOAT'
    L.new(par, h.inputs['Factor']); L.new(hw, h.inputs[2]); L.new(weft, h.inputs[3])
    hgt = h.outputs[0]
    # fuzz
    nz = node(nt, 'ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 9; nz.inputs['Detail'].default_value = 8
    L.new(uv.outputs['UV'], nz.inputs['Vector'])
    fz = math_node(nt, 'MULTIPLY', nz.outputs['Fac'], 0.35)
    hh = math_node(nt, 'ADD', hgt, fz)
    bm = node(nt, 'ShaderNodeBump'); bm.inputs['Strength'].default_value = 1.0; bm.inputs['Distance'].default_value = 0.00012
    L.new(hh, bm.inputs['Height']); L.new(bm.outputs['Normal'], b.inputs['Normal'])
    cr = node(nt, 'ShaderNodeValToRGB')
    cr.color_ramp.elements[0].color = (color[0] * 0.25, color[1] * 0.25, color[2] * 0.25, 1)
    cr.color_ramp.elements[1].position = 0.7
    cr.color_ramp.elements[1].color = (color[0] * 1.25, color[1] * 1.25, color[2] * 1.25, 1)
    L.new(hgt, cr.inputs['Fac']); L.new(cr.outputs['Color'], b.inputs['Base Color'])
    return m

def trace_mat():
    """printed silver ink + a travelling signal glow (attribute 'u' along length, 'strain')."""
    m, b = pbsdf('Ink', (0.30, 0.31, 0.33), 0.5, 0.85)
    nt = m.node_tree; L = nt.links
    au = node(nt, 'ShaderNodeAttribute'); au.attribute_name = 'u'
    ast = node(nt, 'ShaderNodeAttribute'); ast.attribute_name = 'strain'
    ph = node(nt, 'ShaderNodeValue'); ph.name = 'PHASE'; ph.outputs[0].default_value = 0
    gain = node(nt, 'ShaderNodeValue'); gain.name = 'GAIN'; gain.outputs[0].default_value = 1
    # pulse = smooth bump of fract(u*K - phase)
    x = math_node(nt, 'FRACT', math_node(nt, 'SUBTRACT', math_node(nt, 'MULTIPLY', au.outputs['Fac'], 2.0), ph.outputs[0]))
    pulse = math_node(nt, 'POWER', math_node(nt, 'MULTIPLY', math_node(nt, 'SINE', math_node(nt, 'MULTIPLY', x, math.pi)), 1.0), 40)
    st = math_node(nt, 'MULTIPLY', ast.outputs['Fac'], 0.9)
    e = math_node(nt, 'MULTIPLY', math_node(nt, 'ADD', math_node(nt, 'MULTIPLY', pulse, 40.0), st), gain.outputs[0])
    b.inputs['Emission Color'].default_value = (0.86, 0.92, 1.0, 1)
    L.new(e, b.inputs['Emission Strength'])
    return m

def emission(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'BSDF_PRINCIPLED': nt.nodes.remove(n)
    e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Color'].default_value = (*color, 1); e.inputs['Strength'].default_value = strength
    nt.links.new(e.outputs[0], nt.nodes['Material Output'].inputs['Surface'])
    return m, e

M_tape = woven('Tape', (0.014, 0.014, 0.016))
M_pad = woven('Pad', (0.03, 0.03, 0.034))
M_ink = trace_mat()
M_logo, _ = pbsdf('Logo', (0.35, 0.35, 0.36), 0.6, 0.6)
M_coin, _ = pbsdf('CoinCeramic', (0.86, 0.86, 0.85), 0.34, 0, {'Coat Weight': 0.5, 'Coat Roughness': 0.1})
M_coinBase, _ = pbsdf('CoinBase', (0.04, 0.04, 0.045), 0.35, 0.3)
M_engrave, _ = pbsdf('Engrave', (0.55, 0.56, 0.57), 0.5, 0)
M_led, LED = emission('LED', (0.9, 0.95, 1.0), 1.0)

# ---------------- flat geometry (rest pose, mm) ----------------
T = 0.5; BV = 0.08; TOP = T + 2 * BV

def curve_mesh(loops, thick, bevel, z, res=3):
    cu = bpy.data.curves.new('c', 'CURVE'); cu.dimensions = '2D'; cu.fill_mode = 'BOTH'
    cu.extrude = thick / 2; cu.bevel_depth = bevel; cu.bevel_resolution = res
    for pts in loops:
        sp = cu.splines.new('POLY'); sp.points.add(len(pts) - 1)
        for i, (x, y) in enumerate(pts): sp.points[i].co = (x, y, 0, 1)
        sp.use_cyclic_u = True
    o = bpy.data.objects.new('c', cu); col.objects.link(o); o.location.z = z + thick / 2 + bevel
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    me.transform(Matrix.Translation(o.location))
    bpy.data.objects.remove(o); return me

def text_mesh(body, size, loc, rot):
    td = bpy.data.curves.new('t', 'FONT'); td.body = body; td.size = size
    td.align_x = 'CENTER'; td.align_y = 'CENTER'
    o = bpy.data.objects.new('t', td); col.objects.link(o)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
    me.transform(Matrix.Translation(Vector(loc)) @ Matrix.Rotation(math.radians(rot), 4, 'Z'))
    bpy.data.objects.remove(o); return me

tape_loops = [SH['shape']['ext']] + SH['shape']['holes']
dx, dy = SH['dock']
pad = [(dx + 12.6 * math.cos(2 * math.pi * i / 96), dy + 12.6 * math.sin(2 * math.pi * i / 96)) for i in range(96)]
parts = [(curve_mesh(tape_loops, T, BV, 0), 0),
         (curve_mesh([pad], 0.3, 0.16, TOP - 0.02, 5), 1),
         (text_mesh('kinn', 6.5, (SH['logo'][0], SH['logo'][1], TOP + 0.012), SH['logo'][2]), 2)]
bm = bmesh.new()
for me, mi in parts:
    n0 = len(bm.faces); bm.from_mesh(me)
    bm.faces.ensure_lookup_table()
    for f in bm.faces[n0:]: f.material_index = mi
# slice along y so the strip bends smoothly
ys = np.arange(-136, 137, 0.8)
for y in ys:
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, float(y), 0), plane_no=(0, 1, 0))
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
uvl = bm.loops.layers.uv.new('rest')
for f in bm.faces:
    for l in f.loops: l[uvl].uv = (l.vert.co.x, l.vert.co.y)
tape_me = bpy.data.meshes.new('Strip'); bm.to_mesh(tape_me); bm.free()
for m in (M_tape, M_pad, M_logo): tape_me.materials.append(m)
tape = bpy.data.objects.new('Strip', tape_me); col.objects.link(tape)
REST = np.zeros(len(tape_me.vertices) * 3); tape_me.vertices.foreach_get('co', REST); REST = REST.reshape(-1, 3)
print('strip verts', len(REST))

# trace centre paths (mm), as in gen_shapes.py
def kpath(sx):
    pts = []
    for i in range(0, 61):
        t = i / 60; ang = math.pi / 2 - math.pi * t
        pts.append((sx * 23 * math.cos(ang) * (0.6 + 0.4 * math.cos(ang)) + sx * 3, -6 + 28 * math.sin(ang)))
    return [(sx * 4, dy - 4)] + pts + [(sx * 26, -40), (sx * 40, -100)]

def resample(pts, step):
    P = np.array(pts, float); seg = np.linalg.norm(np.diff(P, axis=0), axis=1)
    s = np.concatenate([[0], np.cumsum(seg)]); L = s[-1]
    d = np.arange(0, L, step)
    x = np.interp(d, s, P[:, 0]); y = np.interp(d, s, P[:, 1])
    Q = np.stack([x, y], 1)
    tg = np.gradient(Q, axis=0); tg /= np.linalg.norm(tg, axis=1, keepdims=True) + 1e-9
    # smooth tangents
    k = np.ones(9) / 9
    tg = np.stack([np.convolve(np.pad(tg[:, i], 4, mode='edge'), k, 'valid') for i in range(2)], 1)
    tg /= np.linalg.norm(tg, axis=1, keepdims=True)
    nrm = np.stack([-tg[:, 1], tg[:, 0]], 1)
    return Q, nrm, d / L, d

TR = []
for sx in (-1, 1):
    Q, nrm, u, d = resample(kpath(sx), 0.12)
    for off in (-1.15, 1.15):
        TR.append((Q + nrm * off, nrm, 1 - u, d))   # u: 0 at the tail end, 1 at the dock

AMP, WL, TW, TZ = 1.05, 3.6, 0.5, TOP + 0.015
trace_me = bpy.data.meshes.new('Traces'); trace_me.materials.append(M_ink)
traces = bpy.data.objects.new('Traces', trace_me); col.objects.link(traces)

# ---------------- coin ----------------
def coin_obj():
    R, H = 11, 3.2
    prof = [(0, 0), (R - 0.6, 0), (R, 0.5), (R, 1.0)]
    for i in range(1, 17):
        t = i / 16
        prof.append((R - (R - 7.5) * (1 - math.cos(t * math.pi / 2)), 1.0 + (H - 1.0) * math.sin(t * math.pi / 2)))
    prof.append((0, H))
    me = bpy.data.meshes.new('Coin'); b = bmesh.new()
    vs = [b.verts.new((r * MM, 0, z * MM)) for (r, z) in prof]
    es = [b.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(b, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=128, use_duplicate=False)
    bmesh.ops.remove_doubles(b, verts=b.verts, dist=1e-7); b.to_mesh(me); b.free()
    for p in me.polygons: p.use_smooth = True
    o = bpy.data.objects.new('Coin', me); col.objects.link(o)
    me.materials.append(M_coin); me.materials.append(M_coinBase)
    for p in me.polygons:
        if p.center.z < 0.95 * MM: p.material_index = 1
    bpy.ops.mesh.primitive_torus_add(major_radius=11.15 * MM, minor_radius=0.38 * MM, major_segments=128, minor_segments=12)
    ring = bpy.context.active_object; ring.location = (0, 0, 1.05 * MM); ring.scale.z = 0.6
    ring.data.materials.append(M_led); ring.parent = o
    for p in ring.data.polygons: p.use_smooth = True
    td = bpy.data.curves.new('ct', 'FONT'); td.body = 'kinn'; td.size = 4.2 * MM
    td.align_x = 'CENTER'; td.align_y = 'CENTER'; td.extrude = 0.03 * MM
    t = bpy.data.objects.new('ct', td); col.objects.link(t); t.location = (0, 0, H * MM + 0.01 * MM); t.parent = o
    t.rotation_euler = (0, 0, math.radians(-90))
    td.materials.append(M_engrave)
    return o
coin = coin_obj()
gl = bpy.data.lights.new('CoinGlow', 'POINT'); gl.shadow_soft_size = 0.004; gl.energy = 0; gl.color = (0.9, 0.95, 1.0)
glow = bpy.data.objects.new('CoinGlow', gl); col.objects.link(glow); glow.parent = coin; glow.location = (0, 0, 0.0015)
COIN_Z = TOP + 0.6

# ---------------- deformation ----------------
YG = np.arange(-150, 150.0001, 0.1)
Y0 = -6.0; SIG = 15.0
def build_bend(t):
    """returns maps from rest y to (stretched arc pos, z, angle) for flex amount t in 0..1"""
    g = np.exp(-0.5 * ((YG - Y0) / SIG) ** 2)
    stretch = 0.14 * t
    ds = 1 + stretch * g                                  # local stretch of the outer face
    total = math.radians(118) * t                        # total bend
    k = total * g / (g.sum() * 0.1)                      # curvature per mm (of rest y)
    i0 = np.searchsorted(YG, Y0)
    th = np.cumsum(k) * 0.1; th -= th[i0]; th = -th
    seg = ds * 0.1
    py = np.cumsum(seg * np.cos(th)); pz = np.cumsum(seg * np.sin(th))
    py -= py[i0]; pz -= pz[i0]
    return dict(g=g, py=py, pz=pz, th=th, stretch=stretch)

def deform(B, x, y, z):
    py = np.interp(y, YG, B['py']); pz = np.interp(y, YG, B['pz']); th = np.interp(y, YG, B['th'])
    ny, nz = -np.sin(th), np.cos(th)
    return np.stack([x, py + z * ny, pz + z * nz], 1) * MM

def strain_at(B, y):
    return np.interp(y, YG, B['g']) * (B['stretch'] / 0.14)

def build_traces(B):
    verts = []; faces = []; U = []; S = []
    for (Q, nrm, u, d) in TR:
        s = strain_at(B, Q[:, 1])
        amp = AMP * (1 - 0.62 * s)
        off = amp * np.sin(2 * np.pi * d / WL)
        C = Q + nrm * off[:, None]
        # ribbon edges: offset along local normal of the serpentine
        tg = np.gradient(C, axis=0); tg /= np.linalg.norm(tg, axis=1, keepdims=True) + 1e-9
        nn = np.stack([-tg[:, 1], tg[:, 0]], 1)
        w = TW * (1 - 0.18 * s)                        # ink thins a little as it stretches
        Lft = C + nn * (w / 2)[:, None]; Rgt = C - nn * (w / 2)[:, None]
        n = len(C); base = len(verts) // 3 if False else sum(len(v) for v in verts)
        top_l = deform(B, Lft[:, 0], Lft[:, 1], np.full(n, TZ))
        top_r = deform(B, Rgt[:, 0], Rgt[:, 1], np.full(n, TZ))
        bot_l = deform(B, Lft[:, 0], Lft[:, 1], np.full(n, TOP - 0.01))
        bot_r = deform(B, Rgt[:, 0], Rgt[:, 1], np.full(n, TOP - 0.01))
        V = np.concatenate([top_l, top_r, bot_l, bot_r])
        a, b_, c, e = base, base + n, base + 2 * n, base + 3 * n
        for i in range(n - 1):
            faces.append((a + i, a + i + 1, b_ + i + 1, b_ + i))        # top
            faces.append((c + i, a + i, a + i + 1, c + i + 1)[::-1])    # left wall
            faces.append((b_ + i, e + i, e + i + 1, b_ + i + 1)[::-1])  # right wall
        verts.append(V); U.append(np.tile(u, 4)); S.append(np.tile(s, 4))
    V = np.concatenate(verts); U = np.concatenate(U); S = np.concatenate(S)
    me = trace_me
    me.clear_geometry()
    me.from_pydata([tuple(p) for p in V], [], faces)
    for nm, arr in (('u', U), ('strain', S)):
        if nm in me.attributes: me.attributes.remove(me.attributes[nm])
        at = me.attributes.new(nm, 'FLOAT', 'POINT'); at.data.foreach_set('value', arr.astype(np.float32))
    me.update()

def pose(t, phase, led, gain):
    B = build_bend(t)
    V = deform(B, REST[:, 0], REST[:, 1], REST[:, 2])
    tape_me.vertices.foreach_set('co', V.ravel()); tape_me.update()
    build_traces(B)
    # coin rides the dock
    py = np.interp(dy, YG, B['py']); pz = np.interp(dy, YG, B['pz']); th = float(np.interp(dy, YG, B['th']))
    nrm = Vector((0, -math.sin(th), math.cos(th)))
    coin.location = Vector((dx * MM, py * MM, pz * MM)) + nrm * (COIN_Z * MM)
    coin.rotation_euler = Euler((th, 0, 0))
    M_ink.node_tree.nodes['PHASE'].outputs[0].default_value = phase
    M_ink.node_tree.nodes['GAIN'].outputs[0].default_value = gain
    LED.inputs['Strength'].default_value = led
    gl.energy = 0.25 if led > 10 else 0.0
    return B

# ---------------- lights / world ----------------
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0, 0, 0, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0

def area(name, loc, target, size, energy, color=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'; ld.size = size[0]; ld.size_y = size[1]
    ld.energy = energy; ld.color = color
    o = bpy.data.objects.new(name, ld); col.objects.link(o); o.location = loc
    o.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    return o
area('Key', (-0.10, -0.06, 0.32), (0, 0, 0), (0.30, 0.12), 1.6, (1, 0.98, 0.96))
area('Graze', (-0.30, 0.02, 0.05), (0, 0, 0.01), (0.04, 0.5), 3, (0.92, 0.95, 1.0))
area('RimL', (0.22, -0.26, 0.06), (0, 0, 0.01), (0.6, 0.03), 4, (0.9, 0.94, 1.0))
area('RimR', (0.22, 0.26, 0.06), (0, 0, 0.01), (0.6, 0.03), 4, (1, 1, 1))
area('Back', (0.30, 0.0, 0.18), (0, 0, 0), (0.05, 0.4), 3)

# ---------------- camera ----------------
cd = bpy.data.cameras.new('Cam'); cd.lens = 60; cd.sensor_width = 36; cd.clip_start = 0.002
cd.dof.use_dof = True; cd.dof.aperture_fstop = 5.6
cam = bpy.data.objects.new('Cam', cd); col.objects.link(cam); sc.camera = cam

def ease(x): return x * x * (3 - 2 * x)
def lerp(a, b, k): return a + (b - a) * k
def vlerp(a, b, k): return Vector(a).lerp(Vector(b), k)

CAM0 = ((-0.085, -0.022, 0.050), (-0.024, -0.004, 0.000), (-0.024, -0.004, 0.001), 4.0)
CAM1 = ((-0.275, 0.055, 0.165), (0.000, -0.002, -0.020), (0.0, 0.010, 0.004), 8.0)

# ---------------- render ----------------
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.glossy_bounces = 3; sc.cycles.transparent_max_bounces = 2
sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.02
sc.render.resolution_x = RW; sc.render.resolution_y = RH; sc.render.resolution_percentage = 100
sc.view_settings.view_transform = 'AgX'; sc.view_settings.exposure = -0.7
try: sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 92
sc.render.threads_mode = 'AUTO'
os.makedirs(OUT, exist_ok=True)

frames = ONLY if ONLY is not None else list(range(N))
for f in frames:
    path = os.path.join(OUT, 'k_%03d.jpg' % (f + 1))
    if ONLY is None and os.path.exists(path): continue
    p = f / (N - 1)
    t = ease(p)
    over = t >= LIMIT_T
    k = ease(min(1, p * 1.0))
    loc = vlerp(CAM0[0], CAM1[0], k); tgt = vlerp(CAM0[1], CAM1[1], k)
    cam.location = loc
    cam.rotation_euler = (tgt - loc).to_track_quat('-Z', 'Y').to_euler()
    cd.dof.focus_distance = (vlerp(CAM0[2], CAM1[2], k) - loc).length
    cd.dof.aperture_fstop = lerp(CAM0[3], CAM1[3], k)
    led = 0.6 + 2.0 * t
    gain = 0.35 + 0.65 * t
    if over:
        led = 28.0; gain = 1.6
    pose(t, phase=p * 9.0, led=led, gain=gain)
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('frame', f + 1, 'done', tuple(round(c,3) for c in cam.location), tuple(round(c,4) for c in tape_me.vertices[0].co), flush=True)
