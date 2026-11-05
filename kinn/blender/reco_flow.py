"""The how-it-works film, shot on an empty stage: only the tape and coin, on a transparent ground, so the page can
lay them over the hero photograph. Exec'd by reco_worn.py (mode flow); RECO_SHOT picks the shot, RECO_CAMS the solved cameras."""
import json as J
SEATED = 70.0                                    # degrees: the knee in the hero photograph
leg.hide_render = True; other.hide_render = True
SHOT = os.environ.get("RECO_SHOT", "dump")


def matte_tape():
    """Matte charcoal with fine grain and dark grooves, as in the photograph."""
    m, nt, b = mat("Matte tape")
    L = nt.links.new
    b.inputs["Roughness"].default_value = 0.62
    b.inputs["Specular IOR Level"].default_value = 0.35
    b.inputs["Sheen Weight"].default_value = 0.25
    b.inputs["Sheen Roughness"].default_value = 0.5
    uvr = nt.nodes.new("ShaderNodeUVMap"); uvr.uv_map = "ridge"
    im = nt.nodes.new("ShaderNodeTexImage"); im.image = RIDGE_IMG; L(uvr.outputs["UV"], im.inputs["Vector"])
    r = nt.nodes.new("ShaderNodeValToRGB")
    r.color_ramp.elements[0].position, r.color_ramp.elements[1].position = 0.02, 0.6
    r.color_ramp.elements[0].color = (*srgb("#46484b"), 1); r.color_ramp.elements[1].color = (*srgb("#1a1b1d"), 1)
    L(im.outputs["Color"], r.inputs["Fac"]); L(r.outputs["Color"], b.inputs["Base Color"])
    tc = nt.nodes.new("ShaderNodeUVMap"); tc.uv_map = "mm"
    n = nt.nodes.new("ShaderNodeTexNoise"); n.inputs["Scale"].default_value = 9.0; n.inputs["Detail"].default_value = 7; L(tc.outputs["UV"], n.inputs["Vector"])
    bp = nt.nodes.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.3; bp.inputs["Distance"].default_value = 0.00012
    L(n.outputs["Fac"], bp.inputs["Height"]); L(bp.outputs["Normal"], b.inputs["Normal"])
    return m


tape.data.materials[0] = matte_tape()
tape.modifiers["Wires under the knit"].strength = 1.25 * MM
mount.data.materials[0] = tape.data.materials[0]

PHI = math.radians(SEATED)
worn(PHI)


def _on(u, v):
    p, _ = tape_on_leg(TABLE, np.array([float(u)]), np.array([float(v)]), TAPE_LIFT)
    return p[0]


_o = np.array(PUCK_POS, float); _tan = np.array(PUCK_TAN, float); _n = np.array(PUCK_N, float) / np.linalg.norm(PUCK_N)
_s = _on(MOUNT_C[0], 8) - _on(MOUNT_C[0], -8); _s /= np.linalg.norm(_s)
_tan = _tan - _tan.dot(_n) * _n; _tan /= np.linalg.norm(_tan)


def flat_of(P):
    """The strip lying flat through the coin, tangent to the thigh at the mount."""
    return _o - _n * (MOUNT_LIFT + 0.5 - TAPE_LIFT) + np.outer(P[:, 0] - MOUNT_C[0], _tan) + np.outer(P[:, 1], _s)


T_FLAT_, M_FLAT_ = flat_of(TP), flat_of(MP)
T_BENT, M_BENT = bend(T_ON, PHI), bend(M_ON, PHI)


# the tape's centre line on the knee, for rolling it on
_us = np.linspace(-150.0, MOUNT_C[0], 260)
_c = bend(np.array([_on(u, 0) for u in _us]), PHI)
_s2 = bend(np.array([_on(u, 8) for u in _us]), PHI) - bend(np.array([_on(u, -8) for u in _us]), PHI)
_s2 /= np.linalg.norm(_s2, axis=1, keepdims=True)
_t = np.gradient(_c, _us, axis=0); _t /= np.linalg.norm(_t, axis=1, keepdims=True)
_iU = lambda u, A: np.stack([np.interp(u, _us, A[:, q]) for q in range(3)], -1)


def roll_on(P, bent, front):
    """Down to u = front the tape lies on the knee. Beyond that it runs on straight from the point of contact."""
    c, t, s_ = _iU(front, _c), _iU(front, _t), _iU(front, _s2)
    free = c + np.outer(P[:, 0] - front, t) + np.outer(P[:, 1], s_)
    k = np.clip((P[:, 0] - (front - 34.0)) / 34.0, 0, 1); k = (k * k * (3 - 2 * k))[:, None]
    return free * (1 - k) + bent * k


def wrap_pose(e):
    """e 0..1. The strip rolls onto the invisible knee from the coin down towards the shin. The coin never moves."""
    front = MOUNT_C[0] - 8.0 - e * 250.0
    set_verts(tape, roll_on(TP, T_BENT, front))
    set_verts(mount, roll_on(MP, M_BENT, front))


outer = Polygon(O["outer"]); wnd = Polygon(O["window"])
from shapely.geometry import LineString
def edge(g, u):
    b_ = g.intersection(LineString([(u, -99), (u, 99)])).bounds
    return b_[1], b_[3]
CP = {}
for u in (-113, -80, -43, -5, 33, 70):
    a_, b_ = edge(outer, u); CP[f"r{u}"] = (u, a_); CP[f"l{u}"] = (u, b_)
CP["wa"], CP["wb"] = (wnd.bounds[0], 0), (wnd.bounds[2], 0)
CP["ws1"], CP["ws2"] = (WINDOW_U, wnd.bounds[1]), (WINDOW_U, wnd.bounds[3])
CP["tip"] = (134, 0)

if SHOT == "dump":
    out = {k: (flat_of(np.array([v]))[0] * MM).tolist() for k, v in CP.items()}
    M_ = puck.matrix_world
    out["coin"] = (M_.translation + (M_.to_3x3() @ Vector((0, 0, 7.6 * MM)))).to_tuple()
    J.dump(out, open(os.environ["RECO_OUT"], "w")); print("DUMPED", flush=True)
else:
    cams = J.load(open(os.environ["RECO_CAMS"]))
    def set_cam(c):
        fw, up = Vector(c["fwd"]).normalized(), Vector(c["up"]).normalized(); rt = fw.cross(up).normalized(); up2 = rt.cross(fw)
        cam.matrix_world = Matrix((rt, up2, -fw)).transposed().to_4x4(); cam.location = Vector(c["cam"]); cd.lens = c["lens"]
    PIVOT = Vector((0.0, 0.02, 0.03))     # the middle of the tape stays framed through the move
    def view(c):
        fw, up = Vector(c["fwd"]).normalized(), Vector(c["up"]).normalized(); rt = fw.cross(up).normalized(); up2 = rt.cross(fw)
        R = Matrix((rt, up2, -fw)).transposed()
        p = R.transposed() @ (PIVOT - Vector(c["cam"]))
        f = c["lens"]; d = -p.z
        return dict(q=R.to_quaternion(), f=f, k=f / d, sx=f * p.x / d, sy=f * p.y / d)
    def mix_cam(a, b, e):
        A, B = view(a), view(b)
        q = A["q"].slerp(B["q"], e); f = A["f"] ** (1 - e) * B["f"] ** e; k = A["k"] ** (1 - e) * B["k"] ** e
        sx, sy = A["sx"] + (B["sx"] - A["sx"]) * e, A["sy"] + (B["sy"] - A["sy"]) * e
        d = f / k
        cam.rotation_mode = "QUATERNION"; cam.rotation_quaternion = q; cd.lens = f
        cam.location = PIVOT - q.to_matrix() @ Vector((sx * d / f, sy * d / f, -d))
    cd.dof.use_dof = False; cd.clip_end = 50
    scn.render.resolution_x, scn.render.resolution_y = 1536, 1024
    scn.render.film_transparent = True
    lights(1.0, top=0.5, back=0.0, under=0.0, fill=0.0)
    KEY = area("Key", (-1.5, -0.9, 0.75), (0, 0, 0), 1.0, 1.4, 62.0, (1.0, 0.97, 0.93))
    SOFT = area("Soft", (0.9, -1.4, 1.5), (0, 0, 0), 2.0, 2.0, 14.0, (1.0, 0.98, 0.96))
    bg.inputs["Color"].default_value = (1, 1, 1, 1)
    def tone(e):
        """From the film's dark tape to the photograph's lighter one."""
        KEY.data.energy = 26.0 + 36.0 * e; SOFT.data.energy = 5.0 + 9.0 * e
        bg.inputs["Strength"].default_value = 0.2 + 0.16 * e
    LAMP_K = 0.003
    ring_glow(1.6); RING_LAMP_DATA.energy = 0.0
    if SHOT == "wrap":
        for f in range(F0, F1):
            u = f / (NF - 1)
            wrap_pose(ease(u))
            mix_cam(cams["start"], cams["end"], ease(u))
            tone(ease(u))
            shot(os.path.join(OUT, f"a_{f + 1:03d}.png"))
