"""RECO v7 photoreal scene (Kinn v7 CAD dims) for the website scroll films.

blender -b -P build_reco_v7.py -- <mode> <outdir> [pct] [samples] [f0] [f1] [nf]
mode: stills | hero | film | flex
Tape: v7 outline (exported from Fusion), lens knee window, six wires under the knit
(height map), black mount bonded to the tape, RECO puck (bead-blasted aluminium shell,
teal light ring, black glass face with the RECO wordmark printed under the glass).
Leg: MakeHuman CC0 base mesh, left leg, bent procedurally at the knee.
"""
import bpy, bmesh, math, sys, os, json
D = os.path.dirname(os.path.abspath(__file__))
for pl in (os.path.expanduser("~/Blender/kinn_coin/pylib"),):
    if os.path.isdir(pl) and pl not in sys.path: sys.path.append(pl)
import numpy as np
import shapely
from shapely.geometry import Polygon, Point
from shapely.ops import nearest_points
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree

MM = 0.001
A = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = A[0] if A else "stills"
OUT = A[1] if len(A) > 1 else os.path.join(D, "out")
PCT = int(A[2]) if len(A) > 2 else 100
SAMPLES = int(A[3]) if len(A) > 3 else 128
F0 = int(A[4]) if len(A) > 4 else 0
F1 = int(A[5]) if len(A) > 5 else 1
NF = int(A[6]) if len(A) > 6 else 120
STEP = int(os.environ.get("RECO_STEP", 1))   # every Nth frame, for a quick look at a shot
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
CERAMIC, TEAL, INK = "#f2f1ec", "#3ddbb8", "#1c1e1a"


def srgb(c):
    return tuple((int(c.lstrip("#")[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))


# ================================================================ materials
def mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes["Principled BSDF"]


def principled(name, color, rough, **kw):
    m, nt, b = mat(name)
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m


def bump_noise(m, scale, strength, dist):
    nt = m.node_tree; b = nt.nodes["Principled BSDF"]
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = scale; nz.inputs["Detail"].default_value = 4
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = strength; bp.inputs["Distance"].default_value = dist
    nt.links.new(nz.outputs["Fac"], bp.inputs["Height"]); nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


# bead-blasted aluminium: diffuse-ish metal with a fine isotropic grain
M_SHELL = bump_noise(principled("Bead-blasted aluminium", (0.80, 0.80, 0.81), 0.36, **{"Metallic": 1.0}), 26000, 0.35, 0.000003)
M_CHROME = principled("Polished bezel", (0.92, 0.92, 0.93), 0.06, **{"Metallic": 1.0})
M_BASE = bump_noise(principled("Puck base graphite", (0.055, 0.056, 0.06), 0.55, **{"Specular IOR Level": 0.35}), 18000, 0.1, 0.000003)
M_MOUNT = bump_noise(principled("Mount satin black", (0.012, 0.012, 0.013), 0.42, **{"Specular IOR Level": 0.45}), 18000, 0.06, 0.000003)
M_GOLD = principled("Contacts", (1.0, 0.78, 0.36), 0.22, **{"Metallic": 1.0})
M_SURF = principled("Ceramic surface", srgb(CERAMIC), 0.8)

# black glass face, RECO wordmark printed on the underside (ceramic letters, teal arc)
M_FACE, nt, b = mat("Black glass + RECO")
tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
WM_W = 12.6  # mm, wordmark width on the 20.6 mm face
mp.inputs["Location"].default_value = (0.5, 0.5, 0); mp.inputs["Scale"].default_value = (1 / (WM_W * MM), 1 / (WM_W * MM * 910 / 3000), 1)
nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
# mapping does (v*scale)+loc, so: loc after scale
mp.vector_type = 'POINT'
img = nt.nodes.new("ShaderNodeTexImage"); img.image = bpy.data.images.load(os.path.join(D, "wm_ceramic.png")); img.extension = 'CLIP'
img.interpolation = 'Cubic'
nt.links.new(mp.outputs["Vector"], img.inputs["Vector"])
mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = 'RGBA'
mix.inputs[6].default_value = (0.004, 0.004, 0.0045, 1)
nt.links.new(img.outputs["Alpha"], mix.inputs[0]); nt.links.new(img.outputs["Color"], mix.inputs[7])
nt.links.new(mix.outputs[2], b.inputs["Base Color"])
rmix = nt.nodes.new("ShaderNodeMapRange"); rmix.inputs["To Min"].default_value = 0.12; rmix.inputs["To Max"].default_value = 0.45
nt.links.new(img.outputs["Alpha"], rmix.inputs["Value"]); nt.links.new(rmix.outputs["Result"], b.inputs["Roughness"])
b.inputs["Coat Weight"].default_value = 1.0; b.inputs["Coat Roughness"].default_value = 0.02; b.inputs["Coat IOR"].default_value = 1.52
b.inputs["Specular IOR Level"].default_value = 0.2

# teal light ring (frosted diffuser + emission, strength animated)
M_RING, nt, b = mat("Light ring")
b.inputs["Base Color"].default_value = (*srgb("#cfeee5"), 1); b.inputs["Roughness"].default_value = 0.5
b.inputs["Transmission Weight"].default_value = 0.4
b.inputs["Emission Color"].default_value = (*srgb(TEAL), 1); b.inputs["Emission Strength"].default_value = 3.0


def kt_tape():
    """Black cotton kinesiology tape: soft terry-like loops, fine fibre fuzz, velvety sheen, almost no gloss."""
    m, nt, b = mat("KT cotton black"); L = nt.links.new
    b.inputs["Roughness"].default_value = 1.0; b.inputs["Specular IOR Level"].default_value = 0.02
    b.inputs["Sheen Weight"].default_value = 1.0; b.inputs["Sheen Roughness"].default_value = 0.32
    b.inputs["Sheen Tint"].default_value = (0.42, 0.42, 0.43, 1)
    uv = nt.nodes.new("ShaderNodeUVMap"); uv.uv_map = "mm"
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); L(uv.outputs["UV"], sep.inputs["Vector"])
    cmb = nt.nodes.new("ShaderNodeCombineXYZ")                     # knit rows run along the tape: squash across
    L(sep.outputs["X"], cmb.inputs["X"])
    sy = nt.nodes.new("ShaderNodeMath"); sy.operation = 'MULTIPLY'; sy.inputs[1].default_value = 1.6
    L(sep.outputs["Y"], sy.inputs[0]); L(sy.outputs[0], cmb.inputs["Y"])
    loops = nt.nodes.new("ShaderNodeTexVoronoi"); loops.inputs["Scale"].default_value = 2.7; loops.inputs["Randomness"].default_value = 0.85
    L(cmb.outputs["Vector"], loops.inputs["Vector"])
    lr = nt.nodes.new("ShaderNodeMapRange"); lr.inputs["From Min"].default_value = 0.0; lr.inputs["From Max"].default_value = 0.55
    lr.inputs["To Min"].default_value = 1.0; lr.inputs["To Max"].default_value = 0.0; lr.interpolation_type = 'SMOOTHSTEP'
    L(loops.outputs["Distance"], lr.inputs["Value"])
    fuzz = nt.nodes.new("ShaderNodeTexNoise"); fuzz.inputs["Scale"].default_value = 22; fuzz.inputs["Detail"].default_value = 15; fuzz.inputs["Roughness"].default_value = 0.75
    L(uv.outputs["UV"], fuzz.inputs["Vector"])
    clump = nt.nodes.new("ShaderNodeTexNoise"); clump.inputs["Scale"].default_value = 0.9; clump.inputs["Detail"].default_value = 6
    L(cmb.outputs["Vector"], clump.inputs["Vector"])

    def op(o, x, y=None, v=None):
        n = nt.nodes.new("ShaderNodeMath"); n.operation = o; L(x, n.inputs[0])
        if y is not None: L(y, n.inputs[1])
        if v is not None: n.inputs[1].default_value = v
        return n.outputs[0]
    h = op('ADD', op('MULTIPLY', lr.outputs["Result"], None, 0.6), op('MULTIPLY', fuzz.outputs["Fac"], None, 0.45))
    h = op('ADD', h, op('MULTIPLY', clump.outputs["Fac"], None, 0.25))
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 1.0; bp.inputs["Distance"].default_value = 0.00017
    L(h, bp.inputs["Height"]); L(bp.outputs["Normal"], b.inputs["Normal"]); L(bp.outputs["Normal"], b.inputs["Sheen Tint"]) if False else None
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.25; ramp.color_ramp.elements[0].color = (0.0025, 0.0025, 0.0028, 1)
    ramp.color_ramp.elements[1].position = 1.15; ramp.color_ramp.elements[1].color = (0.020, 0.020, 0.022, 1)
    L(h, ramp.inputs["Fac"]); L(ramp.outputs["Color"], b.inputs["Base Color"])
    return m


M_TAPE = kt_tape()


def skin():
    m, nt, b = mat("Skin")
    b.inputs["Roughness"].default_value = 0.52
    b.inputs["Subsurface Weight"].default_value = 0.6; b.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.18)
    b.inputs["Subsurface Scale"].default_value = 0.006; b.inputs["Specular IOR Level"].default_value = 0.38
    b.inputs["Coat Weight"].default_value = 0.08; b.inputs["Coat Roughness"].default_value = 0.35
    L = nt.links.new
    tcn = nt.nodes.new("ShaderNodeTexCoord")
    pores = nt.nodes.new("ShaderNodeTexVoronoi"); pores.inputs["Scale"].default_value = 2600
    L(tcn.outputs["Object"], pores.inputs["Vector"])
    fine = nt.nodes.new("ShaderNodeTexNoise"); fine.inputs["Scale"].default_value = 900; fine.inputs["Detail"].default_value = 8
    L(tcn.outputs["Object"], fine.inputs["Vector"])
    blot = nt.nodes.new("ShaderNodeTexNoise"); blot.inputs["Scale"].default_value = 40; blot.inputs["Detail"].default_value = 4
    L(tcn.outputs["Object"], blot.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath"); add.operation = 'ADD'
    L(pores.outputs["Distance"], add.inputs[0]); L(fine.outputs["Fac"], add.inputs[1])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.3; bp.inputs["Distance"].default_value = 0.00008
    L(add.outputs[0], bp.inputs["Height"]); L(bp.outputs["Normal"], b.inputs["Normal"])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].color = (0.36, 0.20, 0.13, 1); cr.color_ramp.elements[1].color = (0.46, 0.27, 0.18, 1)
    L(blot.outputs["Fac"], cr.inputs["Fac"]); L(cr.outputs["Color"], b.inputs["Base Color"])
    return m


M_SKIN = skin()


# ================================================================ helpers
def link(ob):
    scn.collection.objects.link(ob); return ob


def lathe(name, prof, m, parent=None, steps=256):
    bm = bmesh.new()
    vs = [bm.verts.new((r * MM, 0, z * MM)) for r, z in prof]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = link(bpy.data.objects.new(name, me)); ob.data.materials.append(m)
    if parent: ob.parent = parent
    return ob


def arc(cx, cz, r, a0, a1, n=16):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cz + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


# ================================================================ RECO puck (v7: D34 x 8)
def build_puck():
    root = link(bpy.data.objects.new("Puck", None))
    lathe("Base", [(0, 0.35), (11.6, 0.35), (12.2, 0.05), (15.8, 0.05)] + arc(15.8, 0.75, 0.7, -90, 0, 6)[1:] + [(16.6, 2.0), (16.85, 3.8)], M_BASE, root)
    lathe("Light ring", [(16.85, 3.8), (16.93, 3.86), (16.93, 4.06), (16.85, 4.12)], M_RING, root)
    lathe("Shell", [(16.85, 4.12), (16.98, 4.3), (17.0, 5.5)] + arc(14.5, 5.5, 2.5, 0, 90, 24)[1:] + [(11.25, 8.0)] + arc(11.25, 7.88, 0.12, 90, 160, 4)[1:], M_SHELL, root)
    lathe("Bezel", [(11.14, 7.92), (10.9, 7.86), (10.55, 7.74), (10.35, 7.70)], M_CHROME, root)
    face = lathe("Face", [(0, 7.62), (10.2, 7.62), (10.32, 7.56), (10.35, 7.40)], M_FACE, root)
    for r in (4.4, 7.4):
        bpy.ops.mesh.primitive_torus_add(major_radius=r * MM, minor_radius=0.25 * MM, major_segments=128, minor_segments=8, location=(0, 0, 0.35 * MM))
        t = bpy.context.active_object; t.data.materials.append(M_GOLD); t.parent = root; t.scale = (1, 1, 0.3)
    return root, face


# ================================================================ tape (v7 outline, wires under the knit)
O = json.load(open(os.path.join(D, "tape_outline.json")))
RM = json.load(open(os.path.join(D, "ridge_map.json")))
TAPE = Polygon(O["outer"]).difference(Polygon(O["window"]))
MOUNT_C = (108.0, 0.0)
MOUNT = Point(*MOUNT_C).buffer(18.0, 128)
RIDGE_IMG = bpy.data.images.load(os.path.join(D, "ridge_height.png")); RIDGE_IMG.colorspace_settings.name = 'Non-Color'
RIDGE_TEX = bpy.data.textures.new("Ridges", 'IMAGE'); RIDGE_TEX.image = RIDGE_IMG; RIDGE_TEX.extension = 'EXTEND'
RIDGE_TEX.use_interpolation = True


def grid_mesh(shape, step):
    """Quad grid clipped to a polygon; rim vertices snapped onto the true outline."""
    minx, miny, maxx, maxy = shape.bounds
    us = np.arange(minx - step, maxx + step * 1.5, step); vs = np.arange(miny - step, maxy + step * 1.5, step)
    UU, VV = np.meshgrid(us, vs, indexing='ij')
    inside = shapely.contains_xy(shape, UU, VV)
    nu, nv = len(us), len(vs)
    c = inside[:-1, :-1].astype(int) + inside[1:, :-1] + inside[1:, 1:] + inside[:-1, 1:]
    cu, cv = (UU[:-1, :-1] + step / 2), (VV[:-1, :-1] + step / 2)
    keep = (c >= 2) | ((c == 1) & shapely.contains_xy(shape, cu, cv))
    I, J = np.nonzero(keep)
    quads = np.stack([I * nv + J, (I + 1) * nv + J, (I + 1) * nv + J + 1, I * nv + J + 1], 1)
    used, inv = np.unique(quads, return_inverse=True)
    P = np.stack([UU.ravel()[used], VV.ravel()[used]], 1)
    F = inv.reshape(-1, 4)
    # snap boundary verts (edges used once) onto the outline
    e = np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 3]], F[:, [3, 0]]]), 1)
    eu, cnt = np.unique(e, axis=0, return_counts=True)
    bverts = np.unique(eu[cnt == 1])
    B = shape.boundary
    pts = shapely.points(P[bverts])
    sl = shapely.shortest_line(pts, B)                     # robust on the multi-ring boundary (outer + window)
    P[bverts] = shapely.get_coordinates(sl).reshape(-1, 2, 2)[:, 1]
    return P, F


def curl(u, v):
    """Soft fabric: ends lift a touch, faint long wrinkles (flat scenes only)."""
    e = np.clip((np.abs(u - 10) - 105) / 20, 0, 1)
    return 1.4 * e * e + 0.08 * np.sin(u * 0.21 + 1.3 * np.sin(v * 0.09)) * np.sin(v * 0.07 + 0.4)


def make_sheet(name, shape, step, mapper, top, thick, mtl, ridges=False):
    P, F = grid_mesh(shape, step)
    X, N = mapper(P[:, 0], P[:, 1], top)
    me = bpy.data.meshes.new(name)
    me.from_pydata(X * MM, [], F.tolist()); me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    uvl = bm.loops.layers.uv.new("mm"); uvr = bm.loops.layers.uv.new("ridge")
    for f_ in bm.faces:
        for lp_ in f_.loops:
            u_, v_ = P[lp_.vert.index]
            lp_[uvl].uv = (u_, v_); lp_[uvr].uv = ((u_ - RM["x0"]) / (RM["x1"] - RM["x0"]), (v_ - RM["y0"]) / (RM["y1"] - RM["y0"]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.03 * MM)
    bmesh.ops.dissolve_degenerate(bm, dist=0.01 * MM, edges=bm.edges)
    bad = [f_ for f_ in bm.faces if f_.calc_area() < (0.002 * MM) ** 2]
    bmesh.ops.delete(bm, geom=bad, context='FACES')
    bm.to_mesh(me); bm.free(); me.update()
    me.uv_layers.active = me.uv_layers["mm"]
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = link(bpy.data.objects.new(name, me)); ob.data.materials.append(mtl)
    if ridges:
        sb = ob.modifiers.new("Fine", 'SUBSURF'); sb.subdivision_type = 'SIMPLE'; sb.levels = sb.render_levels = 1 if sys.platform == "darwin" else 0
        dm = ob.modifiers.new("Wires under the knit", 'DISPLACE'); dm.texture = RIDGE_TEX; dm.texture_coords = 'UV'
        dm.uv_layer = "ridge"; dm.direction = 'NORMAL'; dm.mid_level = 0.0; dm.strength = 0.44 * MM
    so = ob.modifiers.new("Thickness", 'SOLIDIFY'); so.thickness = thick * MM; so.offset = -1; so.use_even_offset = False; so.use_rim = True
    ob["P"] = 0
    return ob, P


def flat_mapper(u, v, top):
    X = np.stack([v, u, top + curl(u, v)], 1)   # tape runs along world Y, puck at +Y
    return X, np.tile([0, 0, 1.0], (len(u), 1))


# ================================================================ leg (MakeHuman CC0, left leg)
def load_leg():
    Vs, Fs, grp, g = [], [], {}, None
    for ln in open(os.path.join(D, "base.obj")):
        if ln.startswith('v '): Vs.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith('g '): g = ln.split()[1]
        elif ln.startswith('f '):
            f = [int(t.split('/')[0]) - 1 for t in ln.split()[1:]]
            grp.setdefault(g, []).append(f)
    V = np.array(Vs)
    j = lambda k: V[np.unique(np.concatenate(grp[k]))].mean(0)
    H, K, Ak = j('joint-l-upper-leg'), j('joint-l-knee'), j('joint-l-ankle')
    y = H - Ak; y /= np.linalg.norm(y)
    z = np.array([0, 0, 1.0]); z = z - z.dot(y) * y; z /= np.linalg.norm(z)
    x = np.cross(y, z)
    R = np.stack([x, y, z]); S = 100.0  # MakeHuman unit = 1 dm
    body = grp['body']
    L = ((V - K) @ R.T) * S
    keep = (V[:, 0] > 0.12) & (L[:, 1] < 380)
    faces = [f for f in body if all(keep[i] for i in f)]
    used = sorted({i for f in faces for i in f}); remap = {o: n for n, o in enumerate(used)}
    me = bpy.data.meshes.new("Leg base"); me.from_pydata([tuple(L[i] * MM) for i in used], [], [[remap[i] for i in f] for f in faces])
    me.update()
    ob = link(bpy.data.objects.new("Leg", me)); ob.data.materials.append(M_SKIN)
    sub = ob.modifiers.new("S", 'SUBSURF'); sub.levels = sub.render_levels = 2
    dg = bpy.context.evaluated_depsgraph_get()
    dense = bpy.data.meshes.new_from_object(ob.evaluated_get(dg)); ob.modifiers.clear()
    old = ob.data; ob.data = dense; bpy.data.meshes.remove(old)
    dense.polygons.foreach_set("use_smooth", [True] * len(dense.polygons))
    return ob


def leg_wrapper(leg):
    """Map flat tape coords (u along the tape, v across) onto the front of the straight leg,
    preserving arc length across the leg so the knit doesn't stretch."""
    me = leg.data
    co = np.array([v.co[:] for v in me.vertices]) / MM
    bvh = BVHTree.FromObject(leg, bpy.context.evaluated_depsgraph_get())
    front = co[(np.abs(co[:, 1]) < 60) & (np.abs(co[:, 0]) < 30)]
    Yp = front[np.argmax(front[:, 2]), 1]                  # kneecap = most anterior point near the joint
    ys = np.arange(-160, 300, 1.0)
    al = np.radians(np.linspace(-110, 110, 441))
    tabS, tabP, tabN = [], [], []
    for Y in ys:
        sl = co[np.abs(co[:, 1] - Y) < 2.0]
        c = sl.mean(0) if len(sl) else np.array([0, Y, 0])
        P = np.zeros((len(al), 3)); Nn = np.zeros((len(al), 3))
        for i, a in enumerate(al):
            d = Vector((math.sin(a), 0, math.cos(a)))
            hit = bvh.ray_cast(Vector((c[0], Y, c[2])) * MM + d * 0.001 * 0, d)
            if hit[0] is None: hit = bvh.ray_cast(Vector((c[0], Y, c[2])) * MM, d)
            P[i] = np.array(hit[0]) / MM if hit[0] else P[i - 1]
            Nn[i] = np.array(hit[1]) if hit[1] else Nn[i - 1]
        top = np.argmax(P[:, 2])
        s = np.r_[0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]; s -= s[top]
        Nn[np.einsum('ij,ij->i', Nn, P - c) < 0] *= -1
        tabS.append(s); tabP.append(P); tabN.append(Nn)
    tabS, tabP, tabN = map(np.array, (tabS, tabP, tabN))

    def mapper(u, v, top):
        Y = Yp + (u + 5.0)                                 # window centre (u = -5) over the kneecap
        fi = np.clip((Y - ys[0]) / 1.0, 0, len(ys) - 1.001); i0 = fi.astype(int); t = fi - i0
        out = np.zeros((len(u), 3)); nrm = np.zeros((len(u), 3))
        for k in range(len(u)):
            pp, nn = [], []
            for ii in (i0[k], i0[k] + 1):
                s = tabS[ii]
                pp.append(np.array([np.interp(-v[k], s, tabP[ii][:, q]) for q in range(3)]))
                nn.append(np.array([np.interp(-v[k], s, tabN[ii][:, q]) for q in range(3)]))
            p = pp[0] * (1 - t[k]) + pp[1] * t[k]; n = nn[0] * (1 - t[k]) + nn[1] * t[k]; n /= np.linalg.norm(n)
            p[1] = Y[k]
            out[k] = p + n * top; nrm[k] = n
        return out, nrm
    return mapper, Yp


def vec_mapper(m):
    """Vectorise the per-vertex leg mapper by grouping (it is only run once per object)."""
    return m


# ================================================================ knee bend (angle-blended rotation about the knee axis)
def flex_weight(Y):
    t = np.clip((Y + 30.0) / 50.0, 0, 1); t = t * t * (3 - 2 * t)
    return 1 - t                         # 1 on the shin, 0 on the thigh


def bend(P, phi):
    """P in mm (local leg space, knee centre at origin, thigh +Y). Shin swings to -Z."""
    w = flex_weight(P[:, 1]); a = phi * w
    y, z = P[:, 1], P[:, 2]
    out = P.copy(); out[:, 1] = y * np.cos(a) - z * np.sin(a); out[:, 2] = y * np.sin(a) + z * np.cos(a)
    return out


# ================================================================ world, light, camera
world = bpy.data.worlds.new("W"); scn.world = world; world.use_nodes = True
wn = world.node_tree; bg = wn.nodes["Background"]; bg.inputs["Color"].default_value = (*srgb(CERAMIC), 1); bg.inputs["Strength"].default_value = 0.35
bgc = wn.nodes.new("ShaderNodeBackground"); bgc.inputs["Color"].default_value = (*srgb(CERAMIC), 1); bgc.inputs["Strength"].default_value = 1.0
lp = wn.nodes.new("ShaderNodeLightPath"); mx = wn.nodes.new("ShaderNodeMixShader")
wn.links.new(lp.outputs["Is Camera Ray"], mx.inputs[0]); wn.links.new(bg.outputs[0], mx.inputs[1]); wn.links.new(bgc.outputs[0], mx.inputs[2])
wn.links.new(mx.outputs[0], wn.nodes["World Output"].inputs["Surface"])


def aim(ob, loc, tgt, roll=0.0):
    ob.location = loc; q = (Vector(tgt) - Vector(loc)).to_track_quat('-Z', 'Y'); ob.rotation_euler = q.to_euler()
    if roll: ob.rotation_euler.rotate_axis('Z', math.radians(roll))


LIGHTS = {}


def area(name, loc, tgt, sx, sy, power, col=(1, 1, 1)):
    ld = bpy.data.lights.new(name, 'AREA'); ld.shape = 'RECTANGLE'; ld.size = sx; ld.size_y = sy; ld.energy = power; ld.color = col
    ob = link(bpy.data.objects.new(name, ld)); aim(ob, loc, tgt); LIGHTS[name] = ob; return ob


area("Key", (-0.45, 0.30, 0.60), (0, 0.05, 0), 0.9, 0.9, 22, (1.0, 0.97, 0.93))
area("Fill", (0.55, -0.45, 0.30), (0, 0.05, 0), 1.0, 0.6, 5, (0.95, 0.97, 1.0))
area("Rim", (0.30, 0.65, 0.12), (0, 0.05, 0), 0.7, 0.10, 14, (1.0, 0.98, 0.95))
area("Graze", (-0.6, -0.05, 0.05), (0, 0.05, 0), 0.5, 0.06, 6, (1.0, 0.98, 0.95))   # low light that pulls out the wire ridges


def soft_reflections(strength=9.0):
    """The rectangular lights show as hard blocks in the coin's glass. Hide them from reflections and hang one big card,
    seen only in reflections, that fades smoothly to nothing: the glow sits high on the coin with no edges."""
    for name in ("Key", "Fill"): LIGHTS[name].visible_glossy = False
    me = bpy.data.meshes.new("SoftCard"); me.from_pydata([(-1, -1, 0), (1, -1, 0), (1, 1, 0), (-1, 1, 0)], [], [(0, 1, 2, 3)]); me.update()
    card = link(bpy.data.objects.new("SoftCard", me)); card.scale = (0.9, 0.55, 1); aim(card, (0.10, 1.0, 0.50), (0, 0.09, 0.03))
    m = bpy.data.materials.new("SoftCard"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(tc.outputs["Object"], sep.inputs[0])
    d = nt.nodes.new("ShaderNodeMath"); d.operation = "SQRT"
    sx = nt.nodes.new("ShaderNodeMath"); sx.operation = "POWER"; sx.inputs[1].default_value = 2; nt.links.new(sep.outputs["X"], sx.inputs[0])
    sy = nt.nodes.new("ShaderNodeMath"); sy.operation = "POWER"; sy.inputs[1].default_value = 2; nt.links.new(sep.outputs["Y"], sy.inputs[0])
    ad = nt.nodes.new("ShaderNodeMath"); ad.operation = "ADD"; nt.links.new(sx.outputs[0], ad.inputs[0]); nt.links.new(sy.outputs[0], ad.inputs[1]); nt.links.new(ad.outputs[0], d.inputs[0])
    ramp = nt.nodes.new("ShaderNodeValToRGB"); cr = ramp.color_ramp; cr.interpolation = "EASE"
    cr.elements[0].position = 0.0; cr.elements[0].color = (1, 1, 1, 1); cr.elements[1].position = 1.0; cr.elements[1].color = (0, 0, 0, 1)
    nt.links.new(d.outputs[0], ramp.inputs["Fac"])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength; nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    out = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(em.outputs[0], out.inputs["Surface"])
    me.materials.append(m)
    card.visible_camera = False; card.visible_diffuse = False; card.visible_shadow = False; card.visible_transmission = False; card.visible_volume_scatter = False


if os.environ.get("RECO_SOFT"): soft_reflections(float(os.environ["RECO_SOFT"]))

cd = bpy.data.cameras.new("Cam"); cd.sensor_width = 36; cd.clip_start = 0.0005
cam = link(bpy.data.objects.new("Cam", cd)); scn.camera = cam
cd.dof.use_dof = True; foc = link(bpy.data.objects.new("Focus", None)); cd.dof.focus_object = foc

scn.render.engine = 'CYCLES'; scn.cycles.samples = SAMPLES; scn.cycles.use_denoising = True
scn.cycles.max_bounces = 8; scn.cycles.device = 'CPU'
if sys.platform == "darwin":
    cp = bpy.context.preferences.addons["cycles"].preferences
    cp.compute_device_type = 'METAL'; cp.get_devices()
    for d in cp.devices: d.use = True
    scn.cycles.device = 'GPU'
scn.render.resolution_x, scn.render.resolution_y = 1600, 900
scn.render.resolution_percentage = PCT
scn.view_settings.view_transform = 'AgX'; scn.view_settings.look = 'AgX - Medium High Contrast'; scn.view_settings.exposure = 0.0
scn.render.film_transparent = True
scn.render.image_settings.color_mode = 'RGBA'
scn.cycles.film_exposure = 1.0


def shot(path):
    scn.render.filepath = path; bpy.ops.render.render(write_still=True); print("SAVED", path, flush=True)


def ease(t):
    t = min(max(t, 0.0), 1.0); return t * t * (3 - 2 * t)


def place_puck(root, pos, nrm, tang, lift=0.0, yaw=0.0, tilt=0.0):
    z = Vector(nrm).normalized(); y = Vector(tang); y = (y - y.dot(z) * z).normalized(); x = y.cross(z)
    M = Matrix((x, y, z)).transposed().to_4x4()
    M = M @ Matrix.Rotation(math.radians(tilt), 4, 'X') @ Matrix.Rotation(math.radians(yaw), 4, 'Z')
    M.translation = Vector(pos) * MM + z * lift * MM
    root.matrix_world = M


def ring_glow(s):
    M_RING.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = s


# ================================================================ scenes
puck, face = build_puck()
TAPE_TOP = 0.55; MOUNT_TOP = TAPE_TOP + 0.5

if MODE in ("stills", "hero", "renders", "cursor"):
    bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, -0.02 * MM)); surf = bpy.context.active_object; surf.data.materials.append(M_SURF)
    surf.is_shadow_catcher = True
    tape, _ = make_sheet("Tape", TAPE.difference(Point(*MOUNT_C).buffer(16.0, 96)) if False else TAPE, 0.2 if sys.platform == "darwin" else 0.5, flat_mapper, TAPE_TOP, 0.5, M_TAPE, ridges=True)
    mount, _ = make_sheet("Mount", MOUNT, 0.3, flat_mapper, MOUNT_TOP, 0.5, M_MOUNT)
    lathe("Mount ring", [(13.6, MOUNT_TOP + curl(np.array([108.0]), np.array([0.0]))[0]), (13.6, MOUNT_TOP + 0.75), (15.4, MOUNT_TOP + 0.75), (15.6, MOUNT_TOP)], M_MOUNT).location = (0, MOUNT_C[0] * MM, 0)
    seat = Vector((0, MOUNT_C[0], MOUNT_TOP + 0.75 + curl(np.array([108.0]), np.array([0.0]))[0]))

    COIN_YAW = float(os.environ.get("RECO_YAW", 26))   # keeps RECO level to this camera

    def hero_pose(t):
        """t 0..1: float+turn (0-.35), drop+twist (.35-.62), pull back to exactly where the wrap onto the knee starts (.62-1).
        The camera is on the same side as that shot, so the tape never changes direction."""
        a = ease(t / 0.35); b_ = ease((t - 0.35) / 0.22); tw = ease((t - 0.50) / 0.12); c = ease((t - 0.62) / 0.38)
        lift = 26 * (1 - b_) + 0.0
        yaw = COIN_YAW + (-60 - COIN_YAW) * a + 60 * tw          # drop in at -60, twist to 0 (RECO upright when locked)
        tilt = (22 - 10 * a) * (1 - b_)
        place_puck(puck, seat, (0, 0, 1), (0, 1, 0), lift=lift, yaw=yaw, tilt=tilt)
        ring_glow(1.5 + 5.0 * ease((t - 0.58) / 0.05) * (1 - ease((t - 0.7) / 0.25)))
        # camera: close 3/4 on the floating puck -> over the mount -> high pull-back over the strip
        tgt0 = Vector((0, MOUNT_C[0], lift + 5)) * MM
        tgt1 = Vector((0, MOUNT_C[0], 4)) * MM
        tgt2 = Vector((0, 20, 0)) * MM
        tgt = tgt0.lerp(tgt1, b_).lerp(tgt2, c)
        d0 = Vector((0.06, -0.16, 0.085)); d2 = Vector((0.20, -0.20, 0.24))
        dv = d0.lerp(d2, c)
        aim(cam, tgt + dv, tgt); cd.lens = 70 - 20 * c
        foc.location = tgt; k0 = float(os.environ.get("RECO_FSTOP", 5.6)); cd.dof.aperture_fstop = k0 + (11 - k0) * c
        LIGHTS["Graze"].data.energy = 6 + 6 * c

    if MODE == "stills":
        # 1) hero: puck floating over the mount
        hero_pose(0.18); shot(os.path.join(OUT, "still_1_hero.png"))
        # 2) locked: twisted in, ring lit, wires converging into the mount
        hero_pose(0.60)
        aim(cam, Vector((-0.075, 0.035, 0.07)), Vector((0, 0.094, 0.002))); cd.lens = 60; foc.location = Vector((0, 0.1, 0.004)); cd.dof.aperture_fstop = 4
        shot(os.path.join(OUT, "still_2_locked.png"))
        # 3) fiber macro: the knit over a wire, kneecap window edge
        hero_pose(1.0)
        tg = Vector((22.1, 15.0, 0.95)) * MM
        aim(cam, tg + Vector((-0.006, -0.012, 0.011)), tg); cd.lens = 100; foc.location = tg; cd.dof.aperture_fstop = 22
        LIGHTS["Graze"].data.energy = 16
        shot(os.path.join(OUT, "still_3_fiber.png"))
        # 4) whole strip
        hero_pose(1.0); shot(os.path.join(OUT, "still_4_strip.png"))
    elif MODE == "renders":
        scn.render.resolution_x, scn.render.resolution_y = 2400, 1350
        def cam_at(loc, tgt, lens, fs, graze=10):
            aim(cam, Vector(loc), Vector(tgt)); cd.lens = lens; foc.location = Vector(tgt); cd.dof.aperture_fstop = fs
            LIGHTS["Graze"].data.energy = graze
        locked = lambda: (place_puck(puck, seat, (0, 0, 1), (0, 1, 0), lift=0, yaw=0, tilt=0), ring_glow(4.0))
        # 1) hero 3/4: full product, puck locked, ring lit
        locked(); cam_at((-0.20, -0.16, 0.22), (0, 0.012, 0.0), 50, 14, 12); shot(os.path.join(OUT, "r1_hero_three_quarter.png"))
        # 2) top-down flat lay
        locked(); cam_at((0.0, 0.010, 0.40), (0.0, 0.010, 0.0), 50, 18, 8)
        cam.rotation_euler = (0, 0, math.radians(90)); shot(os.path.join(OUT, "r2_flat_lay.png"))
        # 3) twist-lock: puck lifted above the mount, the strip running away behind
        place_puck(puck, seat, (0, 0, 1), (0, 1, 0), lift=16, yaw=-60, tilt=6); ring_glow(2.0)
        cam_at((-0.085, 0.175, 0.075), (0, 0.098, 0.010), 70, 8, 10); shot(os.path.join(OUT, "r3_twist_lock.png"))
        # 4) low profile: how thin it sits, light ring lit, strip receding
        locked(); cam_at((0.11, 0.165, 0.028), (0, 0.090, 0.003), 85, 9, 16); shot(os.path.join(OUT, "r4_profile.png"))
        # 5) puck close-up: RECO on black glass, bead-blasted shell, wires into the mount
        locked(); cam_at((-0.045, 0.060, 0.060), (0, 0.104, 0.004), 85, 7, 12); shot(os.path.join(OUT, "r5_puck_detail.png"))
    elif MODE == "cursor":
        # the floating coin of the intro's first frame, turned to face wherever the cursor is
        YS, XS = tuple(range(-21, 22, 3)), tuple(range(-9, 10, 3))
        hero_pose(0.0)
        base = puck.matrix_world.copy()
        place_puck(puck, seat, (0, 0, 1), (0, 1, 0), lift=26, yaw=0, tilt=0); B0 = puck.matrix_world.copy(); T0 = B0.translation.copy()
        n = 0
        poses_only = os.environ.get("RECO_POSES")   # no renders: writes flow/coin/poses.json, where the coin sits in each frame, for lining frames up on the site
        faces = []
        def face_on_screen():
            from bpy_extras.object_utils import world_to_camera_view as w2c
            bpy.context.view_layer.update()
            pts = [puck.matrix_world @ Vector((x * MM, y * MM, 7.6 * MM)) for x, y in ((0, 0), (17, 0), (-17, 0), (0, 17), (0, -17))] + [puck.matrix_world @ Vector((0, 0, 0))]
            return [(c.x * 1536, (1 - c.y) * 864) for c in (w2c(scn, scn.camera, p) for p in pts)]
        for j, dx in enumerate(XS):
            for i, dy in enumerate(YS):
                R_ = Matrix.Rotation(math.radians(22 + dx), 4, 'X') @ Matrix.Rotation(math.radians(dy), 4, 'Y') @ Matrix.Rotation(math.radians(COIN_YAW), 4, 'Z')
                M_ = B0 @ R_; M_.translation = T0
                if poses_only:
                    puck.matrix_world = M_; faces.append(face_on_screen())
                elif F0 <= n < F1 and not os.path.exists(os.path.join(OUT, f"c_{j}_{i}.png")):
                    puck.matrix_world = M_
                    bpy.context.view_layer.update(); shot(os.path.join(OUT, f"c_{j}_{i}.png"))
                n += 1
        if poses_only:
            import numpy as np
            F = np.array(faces); home = F[len(XS) // 2 * len(YS) + len(YS) // 2]
            A = np.c_[home[:5], np.ones(5)]
            poses = []
            for pts in F:
                X = np.linalg.lstsq(A, pts[:5], rcond=None)[0]
                poses.append([round(float(v), 4) for v in (X[0, 0], X[0, 1], X[1, 0], X[1, 1], X[2, 0], X[2, 1])])
            c = home[0]; a = (home[1] - home[2]) / 2; b = (home[3] - home[4]) / 2
            coin = {"top": [round(float(v), 2) for v in c], "a": [round(float(v), 2) for v in a], "b": [round(float(v), 2) for v in b], "base": [round(float(v), 2) for v in home[5]]}
            json.dump({"poses": poses, "coin": coin}, open(poses_only, "w"), separators=(",", ":"))
    else:
        for f in range(F0, F1):
            hero_pose(f / (NF - 1)); shot(os.path.join(OUT, f"h_{f + 1:03d}.png"))

else:   # floating tape: film (fiber -> whole strip) and flex (bends over an invisible knee)
    RK, RLEG = 48.0, 58.0

    def knee_xyz(u, v, top, phi, level=1.0):
        """Fold the flat tape over an invisible knee: arc of radius RK at the window, wrap of radius
        RLEG across the width. level 1: thigh end (puck) stays level, shin end swings down.
        level 0: an arch, both ends fall away from the peak."""
        y = u + 5.0; h = phi / 2
        T = np.clip(y / RK, -h, h) if phi > 1e-6 else np.zeros_like(y)
        cy, cz = RK * np.sin(T), RK * np.cos(T) - RK
        s_ = y - RK * T; cy, cz = cy + s_ * np.cos(T), cz - s_ * np.sin(T)
        ny, nz = np.sin(T), np.cos(T)
        w = v / RLEG; lat = (RLEG + top) * np.sin(w); off = (RLEG + top) * np.cos(w) - RLEG
        Y, Z = cy + off * ny, cz + off * nz
        r = h * level
        Yr, Zr = Y * math.cos(r) - Z * math.sin(r), Y * math.sin(r) + Z * math.cos(r)
        return np.stack([lat, Yr, Zr], 1)

    step = 0.2 if sys.platform == "darwin" else 0.5
    flatm = lambda u, v, top: (np.stack([v, u, np.full_like(u, top)], 1), None)
    tape, _ = make_sheet("Tape", TAPE, step, flatm, 0.5, 0.5, M_TAPE, ridges=True)
    mount, _ = make_sheet("Mount", MOUNT, 0.3, flatm, 1.0, 0.5, M_MOUNT)
    lathe("Mount ring", [(13.6, -1.0), (13.6, 0.0), (15.4, 0.0), (15.6, -1.0)], M_MOUNT, puck)
    objs = [tape, mount]
    REST = {o.name: np.array([v.co[:] for v in o.data.vertices]) / MM for o in objs}

    def flat_xyz(u, v, top):
        """The tape exactly as the coin's film leaves it lying, so the bend can start from that frame."""
        return np.stack([v, u, top + 0.05 + curl(u, v)], 1)

    def pose(phi, level=1.0, flat=0.0):
        for o in objs:
            R_ = REST[o.name]
            Q = knee_xyz(R_[:, 1], R_[:, 0], R_[:, 2], phi, level) * (1 - flat) + flat_xyz(R_[:, 1], R_[:, 0], R_[:, 2]) * flat
            o.data.vertices.foreach_set("co", (Q * MM).ravel()); o.data.update()
        u_c, v_c, top_c = np.array([MOUNT_C[0]]), np.array([0.0]), np.array([1.75])
        pc = knee_xyz(u_c, v_c, top_c, phi, level)[0] * (1 - flat) + flat_xyz(u_c, v_c, top_c)[0] * flat
        h = phi / 2 * (1 - level)
        place_puck(puck, pc, (0, math.sin(h), math.cos(h)), (0, math.cos(h), -math.sin(h)), yaw=0)

    def flex_cam():
        aim(cam, Vector((0.40, -0.27, 0.16)), Vector((0, 0.03, -0.035))); cd.lens = 50
        foc.location = Vector((0.0, 0.01, -0.01)); cd.dof.aperture_fstop = 9
        LIGHTS["Graze"].data.energy = 14

    def lerp3(a, b, k): return Vector(a).lerp(Vector(b), k)

    # the bend's camera stays near the angle shared by the end of the coin's film and the photo, so the tape is what moves: it only drops lower and turns a little to show the arch
    BEND_PEAK = 130.0
    BEND_LEVEL = 0.45   # part way between an even arch and a level thigh, so the coin still shows its face at the peak
    BEND_START = dict(loc=(0.20, -0.18, 0.24), tgt=(0.0, 0.02, 0.0), foc=(0.0, 0.02, 0.0), fs=11.0, lens=50.0, graze=12.0)
    BEND_ARCH = dict(loc=(0.335, -0.115, 0.185), tgt=(0.0, 0.004, -0.048), foc=(0.0, 0.010, 0.004), fs=11.0, lens=50.0, graze=14.0)
    BEND_WHOLE = dict(loc=(0.325, -0.105, 0.170), tgt=(0.0, 0.0, -0.045), foc=(0.0, 0.010, 0.004), fs=12.0, lens=58.0, graze=14.0)
    FLATTENS_BY, SHADOW_GONE_BY, SHADOW_DROP = 0.3, 0.25, 0.4   # of the shot, and metres: the coin's film has a shadow under the tape, this one sinks it out of sight

    def bend_cam(u):
        a = ease(u / 0.7); b = ease((u - 0.62) / 0.38)
        at = lambda key: lerp3(BEND_START[key], BEND_ARCH[key], a).lerp(Vector(BEND_WHOLE[key]), b)
        num = lambda key: BEND_START[key] + (BEND_ARCH[key] - BEND_START[key]) * a + (BEND_WHOLE[key] - BEND_ARCH[key]) * b
        aim(cam, at("loc"), at("tgt")); cd.lens = num("lens"); foc.location = at("foc")
        cd.dof.aperture_fstop = num("fs"); LIGHTS["Graze"].data.energy = num("graze")

    if MODE == "legstills":
        pose(math.radians(0))
        aim(cam, Vector((0.20, -0.20, 0.24)), Vector((0, 0.02, 0.0))); cd.lens = 50; foc.location = Vector((0, 0.02, 0.0)); cd.dof.aperture_fstop = 11
        shot(os.path.join(OUT, "still_5_float.png"))
        pose(math.radians(80)); flex_cam(); ring_glow(4.0)
        shot(os.path.join(OUT, "still_6_flex.png"))
    elif MODE == "flex":
        bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, -0.02 * MM)); surf = bpy.context.active_object; surf.data.materials.append(M_SURF)
        surf.is_shadow_catcher = True
        for f in range(F0, F1, STEP):
            u = f / (NF - 1); phi = math.radians(BEND_PEAK * ease(u)); pose(phi, level=BEND_LEVEL, flat=1 - ease(u / FLATTENS_BY)); bend_cam(u)
            surf.location.z = -0.02 * MM - SHADOW_DROP * ease(u / SHADOW_GONE_BY); surf.hide_render = u >= SHADOW_GONE_BY
            ring_glow(1.5 + 4.0 * ease((math.degrees(phi) - 105) / 10))
            shot(os.path.join(OUT, f"k_{f + 1:03d}.png"))
    elif MODE == "lineup":
        # the preorder page's graphic: the same tape from flat to a full bend, standing in a row on a ceramic surface
        SOLO = os.environ.get("RECO_SOLO")   # one tape at this bend, close up, instead of the row
        LINEUP_BENDS = (float(SOLO),) if SOLO else (0, 35, 70, 100, 130)
        LINEUP_X = (0.0,) if SOLO else (-0.335, -0.135, 0.02, 0.165, 0.30)   # metres. A flatter tape takes up more of the row
        LINEUP_TURN, LINEUP_RING = math.radians(128), 2.8
        LIGHTS["Key"].data.energy *= 2.2; LIGHTS["Fill"].data.energy *= 3.0   # the film is lit for a dark page; on ceramic the tape has to hold its grey
        LIGHTS["Rim"].visible_glossy = False   # it leaves a hot spot on the steepest coin's glass
        scn.render.resolution_x, scn.render.resolution_y = 2400, 1200
        bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0)); floor = bpy.context.active_object; floor.data.materials.append(M_SURF); floor.is_shadow_catcher = True

        def copy_tree(ob, parent, local=None):
            c = ob.copy()
            if ob.data: c.data = ob.data.copy()
            link(c); c.parent = parent
            if local is not None: c.matrix_parent_inverse = Matrix.Identity(4); c.matrix_local = local
            for child in ob.children: copy_tree(child, c)
            return c

        for i, deg in enumerate(LINEUP_BENDS):
            pose(math.radians(deg), level=0.0); ring_glow(1.5); bpy.context.view_layer.update()
            group = link(bpy.data.objects.new(f"Lineup {deg}", None))
            for o in objs: copy_tree(o, group, Matrix.Identity(4))
            copy_tree(puck, group, puck.matrix_world @ Matrix.Rotation(-LINEUP_TURN, 4, 'Z'))   # turned back, so RECO reads level to the camera
            lowest = min(v.co.z for v in tape.data.vertices)
            group.rotation_euler = (0, 0, LINEUP_TURN)
            group.location = (LINEUP_X[i], 0, -lowest + 0.2 * MM)
        for o in objs + [puck] + list(puck.children): o.hide_render = True
        ring_glow(LINEUP_RING)
        cam_x = 0.0 if SOLO else -0.046
        tg = Vector((cam_x, 0.005, 0.03)); aim(cam, Vector((cam_x, -1.15, 0.62)), tg)
        cd.lens = 150.0 if SOLO else 54.0; foc.location = tg; cd.dof.aperture_fstop = 22
        LIGHTS["Graze"].data.energy = 14
        shot(os.path.join(OUT, "lineup.png"))
    elif MODE in ("dump", "wrap"):
        exec(open(os.path.join(D, "reco_flow.py")).read())
    elif MODE == "film":
        pose(0.0)
        tgA = Vector(knee_xyz(np.array([15.0]), np.array([22.1]), np.array([0.95]), 0.0)[0]) * MM
        tgB = Vector((0, 0.02, 0.0)); dB = Vector((0.20, -0.20, 0.24))
        for f in range(F0, F1):
            u = f / (NF - 1); e = ease(u)
            dist = 0.02 * (dB.length / 0.02) ** (u ** 1.2)
            dirv = Vector((-0.25, -0.55, 0.8)).normalized().lerp(dB.normalized(), ease(min(1, u * 1.15))).normalized()
            tg = tgA.lerp(tgB, ease(min(1, u * 1.1)))
            aim(cam, tg + dirv * dist, tg); cd.lens = 100 - 50 * e; foc.location = tg; cd.dof.aperture_fstop = 22 - 11 * e
            LIGHTS["Graze"].data.energy = 16 - 4 * e
            shot(os.path.join(OUT, f"v_{f + 1:03d}.png"))
print("RECO v7 done", MODE, flush=True)
