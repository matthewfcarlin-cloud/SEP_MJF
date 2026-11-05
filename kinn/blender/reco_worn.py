"""RECO worn: the v7 tape and puck on a real leg, for the home page scroll films.

  /Applications/Blender.app/Contents/MacOS/Blender -b -P reco_worn.py -- <mode> <outdir> [pct] [samples] [f0] [f1] [nf]

modes (the last four chain into one film on the page: bend, link_press, press, link_phone, phone, link_away, link_legs, turn)
  test    one frame of each shot, for checking fit and light
  on      tape smooths onto the knee from the kneecap outward, puck twists in, ring lights
  bend    side-on knee bend, 0 to 130 degrees (same eased angle the page reads out)
  dark    the bare knee in the dark; one bar of light passes over it and is gone (the PT visit)
  press   close on the puck: it clicks down and the ring answers
  turn    both legs standing, the camera walks round them (portrait frames)
  phone   a phone turns in the dark, showing the real app screens (v7/app_*.png)
  link_press  from the end of bend: the knee straightens and the camera flies down to the first frame of press
  link_phone  from the end of press: into the coin's black face, then the app screen lights out of that black and pulls back to the first frame of phone (first 24 frames are the coin)
  link_away   from the end of phone: it turns edge-on and goes out
  link_legs   from black: the ring first, then the legs, ending on the first frame of turn
  still   the wide worn stills

Frames are transparent and the leg fades out at both ends, so they sit on any page colour.
Inputs live in ./v7: tape outline and wire map (from the Fusion v7 CAD), MakeHuman CC0 base mesh.
Needs numpy and shapely on the Blender python path: RECO_PYLIB, default ~/Blender/kinn_coin/pylib.
"""
import bpy, bmesh, json, math, os, sys

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "v7")
PYLIB = os.environ.get("RECO_PYLIB", os.path.expanduser("~/Blender/kinn_coin/pylib"))
if os.path.isdir(PYLIB) and PYLIB not in sys.path:
    sys.path.append(PYLIB)
import numpy as np
import shapely
from shapely.geometry import Point, Polygon
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

MM = 0.001
A = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
MODE = A[0] if A else "test"
OUT = A[1] if len(A) > 1 else os.path.join(os.path.dirname(D), "worn_out")
PCT = int(A[2]) if len(A) > 2 else 100
SAMPLES = int(A[3]) if len(A) > 3 else 96
F0 = int(A[4]) if len(A) > 4 else 0
F1 = int(A[5]) if len(A) > 5 else 1
NF = int(A[6]) if len(A) > 6 else 96
os.makedirs(OUT, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scn = bpy.context.scene
TEAL = "#3ddbb8"

# where the tape sits. Thigh is +Y in leg space; 0 is the knee joint centre.
KNEECAP_Y = 22.0     # mm above the joint centre, the middle of the patella on this mesh
WINDOW_U = -5.0      # tape u at the centre of the lens window
FADE_THIGH = (165.0, 248.0)  # the leg dissolves between these distances from the knee
FADE_SHIN = (185.0, 285.0)


def srgb(c):
    return tuple((int(c.lstrip("#")[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4))


def link(ob):
    scn.collection.objects.link(ob)
    return ob


def smooth1d(a, k):
    w = np.hanning(k * 2 + 3)[1:-1]
    w /= w.sum()
    pad = np.pad(a, ((k, k),) + ((0, 0),) * (a.ndim - 1), mode="edge")
    return np.apply_along_axis(lambda m: np.convolve(m, w, "valid"), 0, pad)


# ================================================================ materials
def mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree, m.node_tree.nodes["Principled BSDF"]


def principled(name, color, rough, **kw):
    m, _, b = mat(name)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    for k, v in kw.items():
        b.inputs[k].default_value = v
    return m


def bump_noise(m, scale, strength, dist):
    nt = m.node_tree
    b = nt.nodes["Principled BSDF"]
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = scale
    nz.inputs["Detail"].default_value = 4
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = strength
    bp.inputs["Distance"].default_value = dist
    nt.links.new(nz.outputs["Fac"], bp.inputs["Height"])
    nt.links.new(bp.outputs["Normal"], b.inputs["Normal"])
    return m


M_SHELL = bump_noise(principled("Bead-blasted aluminium", (0.80, 0.80, 0.81), 0.36, Metallic=1.0), 26000, 0.35, 0.000003)
M_CHROME = principled("Polished bezel", (0.92, 0.92, 0.93), 0.06, Metallic=1.0)
M_BASE = bump_noise(principled("Puck base", (0.055, 0.056, 0.06), 0.55), 18000, 0.1, 0.000003)
M_MOUNT = bump_noise(principled("Mount", (0.012, 0.012, 0.013), 0.42), 18000, 0.06, 0.000003)


def face_material():
    m, nt, b = mat("Black glass face")
    L = nt.links.new
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    w = 12.6 * MM
    mp.inputs["Location"].default_value = (0.5, 0.5, 0)
    mp.inputs["Scale"].default_value = (1 / w, 1 / (w * 910 / 3000), 1)
    L(tc.outputs["Object"], mp.inputs["Vector"])
    img = nt.nodes.new("ShaderNodeTexImage")
    img.image = bpy.data.images.load(os.path.join(D, "wm_ceramic.png"))
    img.extension = "CLIP"
    img.interpolation = "Cubic"
    L(mp.outputs["Vector"], img.inputs["Vector"])
    mix = nt.nodes.new("ShaderNodeMix")
    mix.data_type = "RGBA"
    mix.inputs[6].default_value = (0.012, 0.012, 0.013, 1)
    L(img.outputs["Alpha"], mix.inputs[0])
    L(img.outputs["Color"], mix.inputs[7])
    L(mix.outputs[2], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = 0.5
    return m


M_FACE = face_material()
M_RING, _nt, RING_B = mat("Light ring")
RING_B.inputs["Base Color"].default_value = (*srgb("#cfeee5"), 1)
RING_B.inputs["Roughness"].default_value = 0.5
RING_B.inputs["Transmission Weight"].default_value = 0.4
RING_B.inputs["Emission Color"].default_value = (*srgb(TEAL), 1)
RING_B.inputs["Emission Strength"].default_value = 0.0


LAMP_K = 0.05


def ring_glow(s, color=TEAL):
    RING_B.inputs["Emission Strength"].default_value = s
    RING_B.inputs["Emission Color"].default_value = (*srgb(color), 1)
    if "RING_LAMP_DATA" in globals():
        RING_LAMP_DATA.energy = LAMP_K * s


def kt_tape():
    """Black cotton kinesiology tape: terry-like loops, fibre fuzz, velvety sheen, a teal pulse down the wires."""
    m, nt, b = mat("KT cotton black")
    L = nt.links.new
    b.inputs["Roughness"].default_value = 1.0
    b.inputs["Specular IOR Level"].default_value = 0.02
    b.inputs["Sheen Weight"].default_value = 1.0
    b.inputs["Sheen Roughness"].default_value = 0.32
    b.inputs["Sheen Tint"].default_value = (0.42, 0.42, 0.43, 1)
    uv = nt.nodes.new("ShaderNodeUVMap")
    uv.uv_map = "mm"
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    L(uv.outputs["UV"], sep.inputs["Vector"])

    def op(o, x, y=None, v=None):
        n = nt.nodes.new("ShaderNodeMath")
        n.operation = o
        L(x, n.inputs[0])
        if y is not None:
            L(y, n.inputs[1])
        if v is not None:
            n.inputs[1].default_value = v
        return n.outputs[0]

    cmb = nt.nodes.new("ShaderNodeCombineXYZ")
    L(sep.outputs["X"], cmb.inputs["X"])
    L(op("MULTIPLY", sep.outputs["Y"], None, 1.6), cmb.inputs["Y"])
    loops = nt.nodes.new("ShaderNodeTexVoronoi")
    loops.inputs["Scale"].default_value = 2.7
    loops.inputs["Randomness"].default_value = 0.85
    L(cmb.outputs["Vector"], loops.inputs["Vector"])
    lr = nt.nodes.new("ShaderNodeMapRange")
    lr.inputs["From Min"].default_value = 0.0
    lr.inputs["From Max"].default_value = 0.55
    lr.inputs["To Min"].default_value = 1.0
    lr.inputs["To Max"].default_value = 0.0
    lr.interpolation_type = "SMOOTHSTEP"
    L(loops.outputs["Distance"], lr.inputs["Value"])
    fuzz = nt.nodes.new("ShaderNodeTexNoise")
    fuzz.inputs["Scale"].default_value = 22
    fuzz.inputs["Detail"].default_value = 15
    L(uv.outputs["UV"], fuzz.inputs["Vector"])
    clump = nt.nodes.new("ShaderNodeTexNoise")
    clump.inputs["Scale"].default_value = 0.9
    clump.inputs["Detail"].default_value = 6
    L(cmb.outputs["Vector"], clump.inputs["Vector"])
    h = op("ADD", op("MULTIPLY", lr.outputs["Result"], None, 0.6), op("MULTIPLY", fuzz.outputs["Fac"], None, 0.45))
    h = op("ADD", h, op("MULTIPLY", clump.outputs["Fac"], None, 0.25))
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 1.0
    bp.inputs["Distance"].default_value = 0.00017
    L(h, bp.inputs["Height"])
    L(bp.outputs["Normal"], b.inputs["Normal"])
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.25
    ramp.color_ramp.elements[0].color = (0.0025, 0.0025, 0.0028, 1)
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = (0.020, 0.020, 0.022, 1)
    L(h, ramp.inputs["Fac"])
    L(ramp.outputs["Color"], b.inputs["Base Color"])

    uvr = nt.nodes.new("ShaderNodeUVMap")
    uvr.uv_map = "ridge"
    im = nt.nodes.new("ShaderNodeTexImage")
    im.image = bpy.data.images.load(os.path.join(D, "ridge_height.png"))
    im.image.colorspace_settings.name = "Non-Color"
    L(uvr.outputs["UV"], im.inputs["Vector"])
    pos = nt.nodes.new("ShaderNodeValue")
    pos.outputs[0].default_value = 999
    d = op("DIVIDE", op("SUBTRACT", sep.outputs["X"], pos.outputs[0]), None, 9.0)
    g = op("EXPONENT", op("MULTIPLY", op("MULTIPLY", d, d), None, -1.0))
    wire = op("POWER", op("MAXIMUM", op("SUBTRACT", op("MULTIPLY", im.outputs["Color"], None, 1.25), None, 0.25), None, 0.0), None, 1.5)
    b.inputs["Emission Color"].default_value = (*srgb(TEAL), 1)
    L(op("MULTIPLY", op("MULTIPLY", g, None, 70.0), wire), b.inputs["Emission Strength"])
    return m, pos


M_TAPE, PULSE = kt_tape()


def skin():
    """Warm mid-tone skin with subsurface, fine pores, soft blotching and a slower colour drift.
    The leg fades to transparent toward both ends (attribute 'fade'), for camera rays only."""
    m, nt, b = mat("Skin")
    L = nt.links.new
    b.inputs["Roughness"].default_value = 0.5
    b.inputs["Subsurface Weight"].default_value = 0.85
    b.inputs["Subsurface Radius"].default_value = (1.0, 0.38, 0.2)
    b.inputs["Subsurface Scale"].default_value = 0.009
    b.inputs["Specular IOR Level"].default_value = 0.42
    b.inputs["Coat Weight"].default_value = 0.05
    b.inputs["Coat Roughness"].default_value = 0.4
    tc = nt.nodes.new("ShaderNodeTexCoord")
    pores = nt.nodes.new("ShaderNodeTexVoronoi")
    pores.inputs["Scale"].default_value = 3000
    L(tc.outputs["Object"], pores.inputs["Vector"])
    fine = nt.nodes.new("ShaderNodeTexNoise")
    fine.inputs["Scale"].default_value = 1100
    fine.inputs["Detail"].default_value = 8
    L(tc.outputs["Object"], fine.inputs["Vector"])
    add = nt.nodes.new("ShaderNodeMath")
    add.operation = "ADD"
    L(pores.outputs["Distance"], add.inputs[0])
    L(fine.outputs["Fac"], add.inputs[1])
    bp = nt.nodes.new("ShaderNodeBump")
    bp.inputs["Strength"].default_value = 0.22
    bp.inputs["Distance"].default_value = 0.00007
    L(add.outputs[0], bp.inputs["Height"])
    L(bp.outputs["Normal"], b.inputs["Normal"])
    blot = nt.nodes.new("ShaderNodeTexNoise")
    blot.inputs["Scale"].default_value = 28
    blot.inputs["Detail"].default_value = 6
    L(tc.outputs["Object"], blot.inputs["Vector"])
    cr = nt.nodes.new("ShaderNodeValToRGB")
    cr.color_ramp.elements[0].position = 0.3
    cr.color_ramp.elements[0].color = (*srgb("#a07c68"), 1)
    cr.color_ramp.elements[1].position = 0.72
    cr.color_ramp.elements[1].color = (*srgb("#a98672"), 1)
    L(blot.outputs["Fac"], cr.inputs["Fac"])
    L(cr.outputs["Color"], b.inputs["Base Color"])
    # fade: transparent for camera rays, so frames need no crop
    at = nt.nodes.new("ShaderNodeVertexColor")
    at.layer_name = "fade"
    lp = nt.nodes.new("ShaderNodeLightPath")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mx = nt.nodes.new("ShaderNodeMixShader")
    gt = nt.nodes.new("ShaderNodeMath")
    gt.operation = "MULTIPLY"
    L(at.outputs["Color"], gt.inputs[0])
    L(lp.outputs["Is Camera Ray"], gt.inputs[1])
    L(gt.outputs[0], mx.inputs[0])
    L(b.outputs[0], mx.inputs[1])
    L(tr.outputs[0], mx.inputs[2])
    L(mx.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    return m


M_SKIN = skin()


# ================================================================ puck (v7, D34 x 8)
def lathe(name, prof, m, parent=None, steps=256):
    bm = bmesh.new()
    vs = [bm.verts.new((r * MM, 0, z * MM)) for r, z in prof]
    es = [bm.edges.new((vs[i], vs[i + 1])) for i in range(len(vs) - 1)]
    bmesh.ops.spin(bm, geom=vs + es, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=steps, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = link(bpy.data.objects.new(name, me))
    ob.data.materials.append(m)
    if parent:
        ob.parent = parent
    return ob


def arc(cx, cz, r, a0, a1, n=16):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)), cz + r * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]


def build_puck():
    root = link(bpy.data.objects.new("Puck", None))
    lathe("Base", [(0, 0.35), (11.6, 0.35), (12.2, 0.05), (15.8, 0.05)] + arc(15.8, 0.75, 0.7, -90, 0, 6)[1:] + [(16.6, 2.0), (16.85, 3.8)], M_BASE, root)
    lathe("Light ring", [(16.85, 3.8), (16.93, 3.86), (16.93, 4.06), (16.85, 4.12)], M_RING, root)
    lathe("Shell", [(16.85, 4.12), (16.98, 4.3), (17.0, 5.5)] + arc(14.5, 5.5, 2.5, 0, 90, 24)[1:] + [(11.25, 8.0)] + arc(11.25, 7.88, 0.12, 90, 160, 6)[1:], M_SHELL, root)
    lathe("Bezel", [(11.14, 7.92), (10.9, 7.86), (10.55, 7.74), (10.35, 7.70)], M_CHROME, root)
    face = lathe("Face", [(0, 7.62), (10.2, 7.62), (10.32, 7.56), (10.35, 7.40)], M_FACE, root)
    return root, face


def build_seat():
    """The twist-lock seat bonded to the mount: a graphite floor inside a polished ring."""
    root = link(bpy.data.objects.new("Seat", None))
    lathe("Seat floor", [(0, 0.05), (12.6, 0.05)], M_BASE, root)
    lathe("Seat ring", [(12.6, 0.05), (12.75, 0.75), (13.2, 0.95), (15.1, 0.95), (15.5, 0.0)], M_CHROME, root)
    return root


# ================================================================ tape sheet
O = json.load(open(os.path.join(D, "tape_outline.json")))
RM = json.load(open(os.path.join(D, "ridge_map.json")))
TAPE = Polygon(O["outer"]).difference(Polygon(O["window"]))
MOUNT_C = (108.0, 0.0)
MOUNT = Point(*MOUNT_C).buffer(18.0, 128)
RIDGE_IMG = bpy.data.images.load(os.path.join(D, "ridge_height.png"))
RIDGE_IMG.colorspace_settings.name = "Non-Color"
RIDGE_TEX = bpy.data.textures.new("Ridges", "IMAGE")
RIDGE_TEX.image = RIDGE_IMG
RIDGE_TEX.extension = "EXTEND"


def grid_mesh(shape, step):
    """Quad grid clipped to a polygon, rim vertices snapped onto the true outline."""
    minx, miny, maxx, maxy = shape.bounds
    us = np.arange(minx - step, maxx + step * 1.5, step)
    vs = np.arange(miny - step, maxy + step * 1.5, step)
    UU, VV = np.meshgrid(us, vs, indexing="ij")
    inside = shapely.contains_xy(shape, UU, VV)
    nv = len(vs)
    c = inside[:-1, :-1].astype(int) + inside[1:, :-1] + inside[1:, 1:] + inside[:-1, 1:]
    cu, cv = UU[:-1, :-1] + step / 2, VV[:-1, :-1] + step / 2
    keep = (c >= 2) | ((c == 1) & shapely.contains_xy(shape, cu, cv))
    I, J = np.nonzero(keep)
    quads = np.stack([I * nv + J, (I + 1) * nv + J, (I + 1) * nv + J + 1, I * nv + J + 1], 1)
    used, inv = np.unique(quads, return_inverse=True)
    P = np.stack([UU.ravel()[used], VV.ravel()[used]], 1)
    F = inv.reshape(-1, 4)
    e = np.sort(np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 3]], F[:, [3, 0]]]), 1)
    eu, cnt = np.unique(e, axis=0, return_counts=True)
    bverts = np.unique(eu[cnt == 1])
    sl = shapely.shortest_line(shapely.points(P[bverts]), shape.boundary)
    P[bverts] = shapely.get_coordinates(sl).reshape(-1, 2, 2)[:, 1]
    return P, F


def make_sheet(name, shape, step, thick, mtl, top, ridges=False):
    """A flat sheet in tape space (x = across, y = along). Keeps uv maps 'mm' and 'ridge'."""
    P, F = grid_mesh(shape, step)
    me = bpy.data.meshes.new(name)
    me.from_pydata(np.stack([P[:, 1] * MM, P[:, 0] * MM, np.full(len(P), top * MM)], 1).tolist(), [], F.tolist())
    me.update()
    bm = bmesh.new()
    bm.from_mesh(me)
    uvl = bm.loops.layers.uv.new("mm")
    uvr = bm.loops.layers.uv.new("ridge")
    for f_ in bm.faces:
        for lp_ in f_.loops:
            u_, v_ = P[lp_.vert.index]
            lp_[uvl].uv = (u_, v_)
            lp_[uvr].uv = ((u_ - RM["x0"]) / (RM["x1"] - RM["x0"]), (v_ - RM["y0"]) / (RM["y1"] - RM["y0"]))
    bm.to_mesh(me)
    bm.free()
    me.uv_layers.active = me.uv_layers["mm"]
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = link(bpy.data.objects.new(name, me))
    ob.data.materials.append(mtl)
    if ridges:
        dm = ob.modifiers.new("Wires under the knit", "DISPLACE")
        dm.texture = RIDGE_TEX
        dm.texture_coords = "UV"
        dm.uv_layer = "ridge"
        dm.direction = "NORMAL"
        dm.mid_level = 0.0
        dm.strength = 0.44 * MM
    so = ob.modifiers.new("Thickness", "SOLIDIFY")
    so.thickness = thick * MM
    so.offset = -1
    so.use_rim = True
    return ob, P


# ================================================================ leg
def load_leg():
    """Left leg of the MakeHuman CC0 base mesh, in leg space: knee centre at origin, thigh +Y, front +Z. mm."""
    Vs, grp, g = [], {}, None
    for ln in open(os.path.join(D, "base.obj")):
        if ln.startswith("v "):
            Vs.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith("g "):
            g = ln.split()[1]
        elif ln.startswith("f "):
            grp.setdefault(g, []).append([int(t.split("/")[0]) - 1 for t in ln.split()[1:]])
    V = np.array(Vs)
    j = lambda k: V[np.unique(np.concatenate(grp[k]))].mean(0)
    H, K, Ak = j("joint-l-upper-leg"), j("joint-l-knee"), j("joint-l-ankle")
    y = H - Ak
    y /= np.linalg.norm(y)
    z = np.array([0, 0, 1.0])
    z = z - z.dot(y) * y
    z /= np.linalg.norm(z)
    x = np.cross(y, z)
    R = np.stack([x, y, z])
    L = ((V - K) @ R.T) * 100.0  # MakeHuman unit = 1 dm
    keep = (V[:, 0] > 0.12) & (L[:, 1] < 400) & (L[:, 1] > -430)
    faces = [f for f in grp["body"] if all(keep[i] for i in f)]
    used = sorted({i for f in faces for i in f})
    remap = {o: n for n, o in enumerate(used)}
    me = bpy.data.meshes.new("Leg base")
    me.from_pydata([tuple(L[i] * MM) for i in used], [], [[remap[i] for i in f] for f in faces])
    me.update()
    ob = link(bpy.data.objects.new("Leg", me))
    ob.data.materials.append(M_SKIN)
    sub = ob.modifiers.new("S", "SUBSURF")
    sub.levels = sub.render_levels = 2
    dense = bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    ob.modifiers.clear()
    old = ob.data
    ob.data = dense
    bpy.data.meshes.remove(old)
    dense.polygons.foreach_set("use_smooth", [True] * len(dense.polygons))
    return ob


def leg_table(leg):
    """Tables of the front of the straight leg: for each height Y, a fan of rays around the limb axis,
    with arc length across the leg measured from a fixed meridian. Smoothed along Y so the tape edge stays clean."""
    co = np.array([v.co[:] for v in leg.data.vertices]) / MM
    bvh = BVHTree.FromObject(leg, bpy.context.evaluated_depsgraph_get())
    ys = np.arange(-190.0, 260.0, 2.0)
    al = np.radians(np.linspace(-120, 120, 241))
    cx, cz = [], []
    for Y in ys:
        sl = co[np.abs(co[:, 1] - Y) < 6.0]
        cx.append(sl[:, 0].mean())
        cz.append(sl[:, 2].mean())
    cx, cz = smooth1d(np.array(cx), 8), smooth1d(np.array(cz), 8)
    Ps, Ns = [], []
    for i, Y in enumerate(ys):
        org = Vector((cx[i], Y, cz[i])) * MM
        P, N = np.zeros((len(al), 3)), np.zeros((len(al), 3))
        for k, a in enumerate(al):
            d = Vector((math.sin(a), 0, math.cos(a)))
            # cast inward from outside so the first hit is the outer skin
            hit = bvh.ray_cast(org + d * 0.3, -d)
            P[k] = np.array(hit[0]) / MM if hit[0] else (P[k - 1] if k else org)
            N[k] = np.array(hit[1]) if hit[1] else (N[k - 1] if k else (0, 0, 1))
        Ps.append(P)
        Ns.append(N)
    Ps, Ns = smooth1d(np.array(Ps), 3), smooth1d(np.array(Ns), 3)
    mid = len(al) // 2
    seg = np.linalg.norm(np.diff(Ps, axis=1), axis=2)
    S = np.concatenate([np.zeros((len(ys), 1)), np.cumsum(seg, axis=1)], 1)
    S -= S[:, [mid]]
    return ys, S, Ps, Ns


def tape_on_leg(table, u, v, lift):
    """Flat tape coordinates to the straight leg's skin. u runs along the tape, v across."""
    ys, S, Ps, Ns = table
    Y = KNEECAP_Y + (u - WINDOW_U)
    fi = np.clip((Y - ys[0]) / (ys[1] - ys[0]), 0, len(ys) - 1.001)
    i0 = fi.astype(int)
    t = (fi - i0)[:, None]
    out, nrm = np.zeros((len(u), 3)), np.zeros((len(u), 3))
    for row in np.unique(i0):
        idx = np.nonzero(i0 == row)[0]
        pts = []
        nns = []
        for r in (row, row + 1):
            pts.append(np.stack([np.interp(-v[idx], S[r], Ps[r][:, q]) for q in range(3)], 1))
            nns.append(np.stack([np.interp(-v[idx], S[r], Ns[r][:, q]) for q in range(3)], 1))
        out[idx] = pts[0] * (1 - t[idx]) + pts[1] * t[idx]
        nrm[idx] = nns[0] * (1 - t[idx]) + nns[1] * t[idx]
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    out[:, 1] = Y
    return out + nrm * lift, nrm


# Knee bend: rotation about a hinge behind and above the joint centre, blended over a soft band.
HINGE_Y, HINGE_Z = 4.0, -14.0
BAND = (-38.0, 34.0)


def bend_weight(Y):
    t = np.clip((Y - BAND[0]) / (BAND[1] - BAND[0]), 0, 1)
    t = t * t * t * (t * (t * 6 - 15) + 10)
    return 1 - t  # 1 on the shin, 0 on the thigh


def bend(P, phi):
    """P in mm. The shin swings back (toward -Z). Keeps the thigh still."""
    y0, z0 = P[:, 1] - HINGE_Y, P[:, 2] - HINGE_Z
    # weight by the height at the skin, measured about the hinge, so the back of the knee folds rather than pinches
    a = phi * bend_weight(P[:, 1])
    c, s = np.cos(a), np.sin(a)
    out = P.copy()
    out[:, 1] = y0 * c - z0 * s + HINGE_Y
    out[:, 2] = y0 * s + z0 * c + HINGE_Z
    return out


# ================================================================ scene
world = bpy.data.worlds.new("W")
scn.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (*srgb("#f2f1ec"), 1)
bg.inputs["Strength"].default_value = 0.012
scn.render.engine = "CYCLES"
scn.cycles.samples = SAMPLES
scn.cycles.use_denoising = True
scn.cycles.max_bounces = 8
scn.cycles.transparent_max_bounces = 8
if sys.platform == "darwin":
    cp = bpy.context.preferences.addons["cycles"].preferences
    cp.compute_device_type = "METAL"
    cp.get_devices()
    for d in cp.devices:
        d.use = True
    scn.cycles.device = "GPU"
scn.render.resolution_x, scn.render.resolution_y = 1600, 1000
scn.render.resolution_percentage = PCT
scn.view_settings.view_transform = "AgX"
scn.view_settings.look = "AgX - Medium High Contrast"
scn.render.film_transparent = True
scn.render.image_settings.file_format = "PNG"
scn.render.image_settings.color_mode = "RGBA"


def aim(ob, loc, tgt):
    ob.location = loc
    ob.rotation_euler = (Vector(tgt) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()


def area(name, loc, tgt, sx, sy, power, col=(1, 1, 1)):
    ld = bpy.data.lights.new(name, "AREA")
    ld.shape = "RECTANGLE"
    ld.size, ld.size_y, ld.energy, ld.color = sx, sy, power, col
    ob = link(bpy.data.objects.new(name, ld))
    aim(ob, loc, tgt)
    return ob


# strips of light on black: long highlights down the limb and the metal, nothing flat
LIGHTS = {
    "top": area("Strip top", (0.30, 0.04, 0.62), (0, 0.0, 0.0), 1.5, 0.05, 1.5, (1.0, 0.98, 0.96)),
    "back": area("Strip back", (-0.55, 0.0, -0.10), (0, 0.0, 0.0), 1.6, 0.05, 5.0, (0.9, 0.95, 1.0)),
    "under": area("Strip under", (0.55, -0.05, -0.42), (0, 0.0, -0.02), 1.4, 0.04, 2.2, (1.0, 0.98, 0.95)),
    "fill": area("Fill", (0.3, 0.1, 0.9), (0, 0, 0), 1.6, 1.6, 0.0, (1.0, 0.97, 0.94)),
}
LIGHTS["top"].data.spread = math.radians(55)
BASE = {k: v.data.energy for k, v in LIGHTS.items()}
SWEEP = area("The visit", (0.0, 0.0, 0.6), (0, 0, 0), 0.9, 0.05, 0.0, (1.0, 0.98, 0.96))


def lights(k=1.0, **each):
    for n, ob in LIGHTS.items():
        ob.data.energy = BASE[n] * each.get(n, k)


# the ring lights the skin around it
RING_LAMP_DATA = bpy.data.lights.new("Ring glow", "POINT")
RING_LAMP_DATA.shadow_soft_size = 0.012
RING_LAMP_DATA.color = srgb(TEAL)
RING_LAMP = link(bpy.data.objects.new("Ring glow", RING_LAMP_DATA))

cd = bpy.data.cameras.new("Cam")
cd.sensor_width = 36
cd.clip_start = 0.002
cam = link(bpy.data.objects.new("Cam", cd))
scn.camera = cam
cd.dof.use_dof = True
foc = link(bpy.data.objects.new("Focus", None))
cd.dof.focus_object = foc


def camera(loc, tgt, lens, fstop, focus=None):
    aim(cam, Vector(loc), Vector(tgt))
    cd.lens = lens
    foc.location = Vector(focus or tgt)
    cd.dof.aperture_fstop = fstop


STEP = int(os.environ.get("RECO_STEP", "1"))   # render every Nth frame first; finished frames are always skipped


def shot(path):
    digits = "".join(c for c in os.path.basename(path) if c.isdigit())
    if os.path.exists(path) or (MODE != "test" and digits and (int(digits) - 1) % STEP):
        return
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("SAVED", path, flush=True)


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return t * t * (3 - 2 * t)


# build
leg = load_leg()
LEG_REST = np.array([v.co[:] for v in leg.data.vertices]) / MM
TABLE = leg_table(leg)
fade = np.clip((LEG_REST[:, 1] - FADE_THIGH[0]) / (FADE_THIGH[1] - FADE_THIGH[0]), 0, 1)
fade = np.maximum(fade, np.clip((-LEG_REST[:, 1] - FADE_SHIN[0]) / (FADE_SHIN[1] - FADE_SHIN[0]), 0, 1))
fade = fade * fade * (3 - 2 * fade)
vc = leg.data.color_attributes.new("fade", "FLOAT_COLOR", "POINT")
vc.data.foreach_set("color", np.stack([fade, fade, fade, np.ones_like(fade)], 1).ravel().astype(np.float32))

STEP = 0.25
tape, TP = make_sheet("Tape", TAPE, STEP, 0.5, M_TAPE, 0.0, ridges=True)
mount, MP = make_sheet("Mount", MOUNT, 0.4, 0.5, M_MOUNT, 0.0)
puck, face = build_puck()
seat = build_seat()
KNEE_X = 96.0   # mm, the knee's distance from the body midline on this mesh
other = link(bpy.data.objects.new("Other leg", leg.data.copy()))
ox = LEG_REST.copy()
ox[:, 0] = -ox[:, 0] - 2 * KNEE_X
other.data.vertices.foreach_set("co", (ox * MM).ravel())
other.data.update()
other.data.flip_normals()
other.hide_render = True

TAPE_LIFT, MOUNT_LIFT = 0.65, 1.2
T_ON, T_N = tape_on_leg(TABLE, TP[:, 0], TP[:, 1], TAPE_LIFT)
M_ON, M_N = tape_on_leg(TABLE, MP[:, 0], MP[:, 1], MOUNT_LIFT)
pc_, pn_ = tape_on_leg(TABLE, np.array([MOUNT_C[0]]), np.array([0.0]), MOUNT_LIFT + 0.5)
pc2_, _ = tape_on_leg(TABLE, np.array([MOUNT_C[0] + 3.0]), np.array([0.0]), MOUNT_LIFT + 0.5)
PUCK_POS, PUCK_N = pc_[0], pn_[0]
PUCK_TAN = (pc2_[0] - pc_[0]) / np.linalg.norm(pc2_[0] - pc_[0])


SEAT_POS = None


def set_verts(ob, X):
    ob.data.vertices.foreach_set("co", (X * MM).ravel())
    ob.data.update()


def place_puck(pos, nrm, tang, lift=0.0, yaw=0.0, tilt=0.0):
    z = Vector(nrm).normalized()
    y = Vector(tang)
    y = (y - y.dot(z) * z).normalized()
    x = y.cross(z)
    M = Matrix((x, y, z)).transposed().to_4x4()
    M = M @ Matrix.Rotation(math.radians(tilt), 4, "X") @ Matrix.Rotation(math.radians(yaw), 4, "Z")
    M.translation = Vector(pos) * MM + z * lift * MM
    puck.matrix_world = M
    S = Matrix((x, y, z)).transposed().to_4x4()
    S.translation = Vector(SEAT_POS if SEAT_POS is not None else pos) * MM
    seat.matrix_world = S
    RING_LAMP.location = M.translation + z * (4.0 * MM) + y * (19.0 * MM)
    bpy.context.view_layer.update()


def worn(phi=0.0, lift=0.0, yaw=0.0):
    """Everything on the leg at knee angle phi (radians)."""
    set_verts(leg, bend(LEG_REST, phi))
    set_verts(tape, bend(T_ON, phi))
    set_verts(mount, bend(M_ON, phi))
    global SEAT_POS
    bp = bend(np.array([PUCK_POS]), phi)[0]
    tp = bend(np.array([PUCK_POS + PUCK_TAN * 3.0]), phi)[0]
    nn = bend(np.array([PUCK_POS + PUCK_N * 3.0]), phi)[0]
    SEAT_POS = bp
    for o_ in [seat] + list(seat.children):
        o_.hide_render = False
    place_puck(bp, nn - bp, tp - bp, lift=lift, yaw=yaw)


def flat_tape_pose():
    """Where the tape floats before it goes on: flat and clear of the knee, in front of it."""
    org = np.array([0.0, KNEECAP_Y, 95.0])
    def fl(P):
        return np.stack([-P[:, 1], P[:, 0] - WINDOW_U, np.full(len(P), 0.0)], 1) + org
    return fl(TP), fl(MP)


T_FLAT, M_FLAT = flat_tape_pose()


def on_pose(t):
    """t 0..1. The tape floats in (0-.18), smooths on from the kneecap outward (.12-.62),
    the puck drops and twists in (.6-.86), the ring lights and a pulse runs down the wires (.82-1)."""
    set_verts(leg, LEG_REST)
    arrive = ease(t / 0.18)
    wave = (t - 0.12) / 0.5          # adhesion front, 0 at the window centre, 1 at the far end
    def blend(flat, on, P):
        d = np.abs(P[:, 0] - WINDOW_U) / 145.0
        k = np.clip((wave * 1.5 - d) / 0.5, 0, 1)
        k = k * k * (3 - 2 * k)
        drift = (1 - arrive) * np.array([0.0, 40.0, 150.0])
        return (flat + drift) * (1 - k[:, None]) + on * k[:, None]
    set_verts(tape, blend(T_FLAT, T_ON, TP))
    set_verts(mount, blend(M_FLAT, M_ON, MP))
    global SEAT_POS
    SEAT_POS = PUCK_POS
    for o_ in [seat] + list(seat.children):
        o_.hide_render = t < 0.5
    drop = ease((t - 0.60) / 0.16)
    twist = ease((t - 0.72) / 0.13)
    place_puck(PUCK_POS, PUCK_N, PUCK_TAN, lift=46 * (1 - drop), yaw=-60 + 60 * twist)
    for o_ in [puck] + list(puck.children):
        o_.hide_render = t < 0.58
    lit = ease((t - 0.84) / 0.05)
    ring_glow(0.4 + 5.0 * lit)
    PULSE.outputs[0].default_value = 150 - 300 * ease((t - 0.84) / 0.16) if t > 0.84 else 999


# cameras: leg space, mm/1000. Thigh +Y, front +Z, the outside of this left leg is +X
def roll(deg):
    cam.rotation_euler.rotate_axis("Z", math.radians(deg))


def cam_on(t=1.0):
    e = ease(t)
    a = Vector((0.16, 0.10, 0.72))
    b = Vector((0.33, -0.08, 0.62))
    camera(a.lerp(b, e), (0, 0.03, 0.03), 56, 11, focus=(0.02, 0.06, 0.05))


def bend_view(u):
    e = ease(u)
    return (0.74 + 0.20 * e, -0.05, 0.60 + 0.06 * e), (0, -0.02 + 0.03 * e, -0.015 - 0.095 * e), 66, 16, (0.05, 0.0, 0.03)


def press_view():
    p = Vector(PUCK_POS) * MM
    t = p + Vector((0, -0.012, 0))
    return p + Vector((0.075, -0.075, 0.105)), t, 70, 5.6, t


def coin_view():
    """Nose against the middle of the coin's black face, looking straight down at it."""
    n = Vector(PUCK_N).normalized()
    f = Vector(PUCK_POS) * MM + n * (7.62 * MM)
    return f + n * 0.007, f, 70, 11, f


def cam_bend(u):
    camera(*bend_view(u))


def cam_press():
    camera(*press_view())


def fly(a, b, e):
    """Between two views. The distance changes evenly in ratio, so a long push doesn't all land at the end."""
    ta, tb, da, db = Vector(a[1]), Vector(b[1]), Vector(a[0]) - Vector(a[1]), Vector(b[0]) - Vector(b[1])
    t = ta.lerp(tb, e)
    d = da.normalized().lerp(db.normalized(), e).normalized() * da.length ** (1 - e) * db.length ** e
    camera(t + d, t, a[2] + (b[2] - a[2]) * e, a[3] ** (1 - e) * b[3] ** e, Vector(a[4]).lerp(Vector(b[4]), e))


def cam_turn(u):
    """Both legs standing, thigh up in the frame. Walks from front-outside round to the outside."""
    a = math.radians(14 + 58 * ease(u))
    loc = Vector((1.05 * math.sin(a) - 0.05, 0.02, 1.05 * math.cos(a)))
    camera(loc, (-0.05, 0.02, 0.0), 58, 16, focus=(0.03, 0.03, 0.05))
    roll(-90)


def bare_knee(phi=0.0):
    """Just the leg: no tape, no puck."""
    set_verts(leg, bend(LEG_REST, phi))
    for o_ in [tape, mount, puck, seat] + list(puck.children) + list(seat.children):
        o_.hide_render = True
    ring_glow(0.0)


def dark_pose(u):
    """Almost black. A bar of light travels up the leg (0.18-0.5) and is gone."""
    bare_knee(math.radians(12))
    t = (u - 0.14) / 0.42
    on = 0.0 if t <= 0 or t >= 1 else math.sin(t * math.pi) ** 0.5
    y = -0.40 + 0.80 * ease(t)
    aim(SWEEP, (0.10, y, 0.42), (0.0, y, 0.0))
    SWEEP.data.energy = 0.62 * on
    SWEEP.data.size, SWEEP.data.size_y = 0.05, 0.7
    SWEEP.data.color = (1.0, 0.99, 0.97)
    M_SKIN.node_tree.nodes["Principled BSDF"].inputs["Subsurface Scale"].default_value = 0.0015
    SWEEP.data.spread = math.radians(7)
    lights(0.0, back=0.3, under=0.2, fill=0.0, top=0.0)


def cam_dark(u):
    camera((0.40 - 0.05 * u, -0.08, 0.72), (0, 0.0, 0.015), 58, 11, focus=(0.03, 0.03, 0.05))


def build_phone():
    """A plain dark phone with the real app screen as a lit panel. 72 x 150 x 8 mm."""
    W, H, T, R_ = 72.0, 150.0, 8.0, 12.0
    from shapely.geometry import box as sbox
    rr = sbox(-W / 2 + R_, -H / 2 + R_, W / 2 - R_, H / 2 - R_).buffer(R_, 48)
    pts = list(rr.exterior.coords)[:-1]
    bm = bmesh.new()
    top = [bm.verts.new((x * MM, y * MM, T / 2 * MM)) for x, y in pts]
    bot = [bm.verts.new((x * MM, y * MM, -T / 2 * MM)) for x, y in pts]
    bm.faces.new(top)
    bm.faces.new(list(reversed(bot)))
    n = len(pts)
    for i in range(n):
        bm.faces.new((top[i], bot[i], bot[(i + 1) % n], top[(i + 1) % n]))
    me = bpy.data.meshes.new("Phone")
    bm.to_mesh(me)
    bm.free()
    root = link(bpy.data.objects.new("Phone", me))
    me.materials.append(principled("Phone body", (0.03, 0.03, 0.033), 0.32, Metallic=1.0))
    bev = root.modifiers.new("B", "BEVEL")
    bev.width = 1.1 * MM
    bev.segments = 6
    bev.limit_method = "ANGLE"
    me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    root.modifiers.new("N", "WEIGHTED_NORMAL")
    # screen
    sw, sh = W - 4.6, H - 4.6
    rs = sbox(-sw / 2 + 9.5, -sh / 2 + 9.5, sw / 2 - 9.5, sh / 2 - 9.5).buffer(9.5, 32)
    sp = list(rs.exterior.coords)[:-1]
    bs = bmesh.new()
    vs = [bs.verts.new((x * MM, y * MM, (T / 2 + 0.06) * MM)) for x, y in sp]
    f = bs.faces.new(vs)
    uv = bs.loops.layers.uv.new("UVMap")
    for lp in f.loops:
        x, y = lp.vert.co.x / MM, lp.vert.co.y / MM
        lp[uv].uv = (x / sw + 0.5, y / sh + 0.5)
    ms = bpy.data.meshes.new("Screen")
    bs.to_mesh(ms)
    bs.free()
    scr = link(bpy.data.objects.new("Screen", ms))
    scr.parent = root
    m, nt, b = mat("App screen")
    nt.nodes.remove(b)
    em = nt.nodes.new("ShaderNodeEmission")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.interpolation = "Cubic"
    nt.links.new(tex.outputs["Color"], em.inputs["Color"])
    em.inputs["Strength"].default_value = 1.25
    glossy = nt.nodes.new("ShaderNodeBsdfGlossy")
    glossy.inputs["Roughness"].default_value = 0.04
    glossy.inputs["Color"].default_value = (0.05, 0.05, 0.05, 1)
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(em.outputs[0], add.inputs[0])
    nt.links.new(glossy.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], nt.nodes["Material Output"].inputs["Surface"])
    ms.materials.append(m)
    return root, tex


PHONE_Y, CAM_ROLL = 0.018, 0.0


def phone_scene():
    for o_ in [leg, other, tape, mount, puck, seat] + list(puck.children) + list(seat.children):
        o_.hide_render = True
    ring_glow(0.0)
    lights(0.0, top=0.25, back=0.5, under=0.0, fill=0.0)
    scn.render.resolution_x, scn.render.resolution_y = 1600, 1000
    root, tex = build_phone()
    screens = [bpy.data.images.load(os.path.join(D, f"app_{n}.png")) for n in ("today", "insights", "report")]
    return root, tex, screens


def phone_pose(root, u):
    a = math.radians(-34 + 62 * ease(u))
    root.rotation_euler = (math.radians(-6), a, math.radians(5 - 9 * u))
    root.location = (0, PHONE_Y, 0)
    camera((0, 0, 0.56), (0, 0, 0), 60, 8, focus=(0, PHONE_Y, 0.004))
    roll(CAM_ROLL)


def screen_glow(s):
    bpy.data.materials["App screen"].node_tree.nodes["Emission"].inputs["Strength"].default_value = s


def portrait():
    scn.render.resolution_x, scn.render.resolution_y = 1200, 1500
    other.hide_render = False


if MODE == "test":
    dark_pose(0.34); cam_dark(0.34); shot(os.path.join(OUT, "t_dark_vis.png"))
    dark_pose(0.8); cam_dark(0.8); shot(os.path.join(OUT, "t_dark_after.png"))
    for o_ in [tape, mount, puck, seat] + list(puck.children) + list(seat.children):
        o_.hide_render = False
    lights(1.0); SWEEP.data.energy = 0
    on_pose(0.4); cam_on(0.4); shot(os.path.join(OUT, "t_on_40.png"))
    on_pose(1.0); cam_on(1.0); shot(os.path.join(OUT, "t_on_100.png"))
    ring_glow(4.0); PULSE.outputs[0].default_value = 30
    worn(math.radians(20)); cam_bend(.2); shot(os.path.join(OUT, "t_bend_20.png"))
    worn(math.radians(110)); cam_bend(.8); shot(os.path.join(OUT, "t_bend_110.png"))
    worn(0.0); PULSE.outputs[0].default_value = 90; ring_glow(8.0); cam_press(); shot(os.path.join(OUT, "t_press.png"))
    ring_glow(4.0); PULSE.outputs[0].default_value = 999
    portrait(); worn(0.0); cam_turn(0.5); shot(os.path.join(OUT, "t_turn.png"))
elif MODE == "dark":
    for f in range(F0, F1):
        u = f / (NF - 1)
        dark_pose(u); cam_dark(u)
        shot(os.path.join(OUT, f"d_{f + 1:03d}.png"))
elif MODE == "phone":
    root, tex, screens = phone_scene()
    for f in range(F0, F1):
        u = f / (NF - 1)
        tex.image = screens[0 if u < 0.36 else 1 if u < 0.7 else 2]
        phone_pose(root, u)
        shot(os.path.join(OUT, f"f_{f + 1:03d}.png"))
elif MODE == "on":
    for f in range(F0, F1):
        u = f / (NF - 1)
        on_pose(u); cam_on(u)
        shot(os.path.join(OUT, f"o_{f + 1:03d}.png"))
elif MODE == "bend":
    ring_glow(4.0)
    for f in range(F0, F1):
        u = f / (NF - 1)
        worn(math.radians(130 * ease(u))); cam_bend(u)
        PULSE.outputs[0].default_value = 150 - 300 * ((u * 3) % 1)
        shot(os.path.join(OUT, f"b_{f + 1:03d}.png"))
elif MODE == "press":
    LAMP_K = 0.008
    cam_press()
    for f in range(F0, F1):
        u = f / (NF - 1)
        dip = math.sin(min(1.0, u / 0.4) * math.pi)      # clicks down and back
        worn(0.0, lift=-0.9 * dip)
        ring_glow(1.0 + 8.0 * ease((u - 0.1) / 0.2) * (1 - 0.6 * ease((u - 0.55) / 0.45)))
        PULSE.outputs[0].default_value = 150 - 300 * ease((u - 0.15) / 0.7) if u > 0.15 else 999
        shot(os.path.join(OUT, f"p_{f + 1:03d}.png"))
elif MODE == "turn":
    ring_glow(4.0); portrait(); worn(0.0)
    for f in range(F0, F1):
        cam_turn(f / (NF - 1))
        shot(os.path.join(OUT, f"t_{f + 1:03d}.png"))
elif MODE == "link_press":
    PULSE.outputs[0].default_value = 999
    for f in range(F0, F1):
        u = f / (NF - 1)
        e = ease((u - 0.1) / 0.9)
        worn(math.radians(130 * (1 - ease(u / 0.7))))
        fly(bend_view(1), press_view(), e)
        LAMP_K = 0.05 + (0.008 - 0.05) * e
        ring_glow(4.0 - 3.0 * e)
        shot(os.path.join(OUT, f"a_{f + 1:03d}.png"))
elif MODE == "link_phone":
    COIN_N = 24
    LAMP_K = 0.008
    PULSE.outputs[0].default_value = -150
    root = None
    for f in range(F0, F1):
        if f < COIN_N:
            u = f / (COIN_N - 1)
            worn(0.0)
            fly(press_view(), coin_view(), ease(u))
            ring_glow(4.2 * (1 - ease(u / 0.75)))
            k = 1 - ease((u - 0.3) / 0.65)
            lights(k)
            bg.inputs["Strength"].default_value = 0.012 * k
        else:
            if root is None:
                root, tex, screens = phone_scene()
                tex.image = screens[0]
            u = (f - COIN_N) / (NF - COIN_N - 1)
            e = ease(u)
            phone_pose(root, 0.0)
            rx, ry, rz = root.rotation_euler
            root.rotation_euler = (rx * e, ry * e, rz * e)
            y = PHONE_Y * (1 - e)
            camera((0, y, 0.095 ** (1 - e) * 0.56 ** e), (0, y, 0), 60, 8, focus=(0, PHONE_Y, 0.004))
            screen_glow(1.25 * ease(u / 0.5))
            lights(0.0, top=0.25 * e, back=0.5 * e, under=0.0, fill=0.0)
            bg.inputs["Strength"].default_value = 0.012 * e
        shot(os.path.join(OUT, f"c_{f + 1:03d}.png"))
elif MODE == "link_away":
    root, tex, screens = phone_scene()
    tex.image = screens[2]
    for f in range(F0, F1):
        u = f / (NF - 1)
        phone_pose(root, 1.0)
        rx, ry, rz = root.rotation_euler
        root.rotation_euler = (rx, ry + math.radians(64) * ease(u), rz)
        screen_glow(1.25 * (1 - ease((u - 0.2) / 0.7)))
        k = 1 - ease(u)
        lights(0.0, top=0.25 * k, back=0.5 * k, under=0.0, fill=0.0)
        bg.inputs["Strength"].default_value = 0.012 * k
        shot(os.path.join(OUT, f"e_{f + 1:03d}.png"))
elif MODE == "link_legs":
    portrait(); worn(0.0)
    for f in range(F0, F1):
        u = f / (NF - 1)
        ring_glow(4.0 * ease(u / 0.35))
        k = ease((u - 0.2) / 0.8)
        lights(k)
        bg.inputs["Strength"].default_value = 0.012 * k
        cam_turn(0.0)
        cam.location = cam.location * (1.22 - 0.22 * ease(u))
        shot(os.path.join(OUT, f"g_{f + 1:03d}.png"))
elif MODE == "still":
    ring_glow(4.0)
    worn(0.0); cam_press(); shot(os.path.join(OUT, "worn_puck.png"))
print("RECO worn done", MODE, flush=True)
