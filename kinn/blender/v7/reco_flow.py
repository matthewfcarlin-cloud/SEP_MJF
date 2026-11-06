# The join between the bend film and the hero photo, in the same scene as the other films, so nothing changes appearance.
#   wrap    from the last frame of the bend film: the tape relaxes from the peak of the bend onto the knee as the camera moves to the photo's angle
# Frames are 1536x1024 at the same lens, so a 16:9 film frame is exactly this frame's middle.
import json as J
from bpy_extras.object_utils import world_to_camera_view as w2c
from shapely.geometry import LineString
SEATED = float(os.environ.get("RECO_PHI", "70"))
CAMS = os.path.join(D, "flow_cams.json")
scn.render.resolution_x, scn.render.resolution_y = 1536, 1024
outer_, wnd_ = Polygon(O["outer"]), Polygon(O["window"])
def edge_(g, u):
    b_ = g.intersection(LineString([(u, -99), (u, 99)])).bounds
    return b_[1], b_[3]
CP = {}
for u_ in (-113, -80, -43, -5, 33, 70):
    a_, b_ = edge_(outer_, u_); CP[f"r{u_}"] = (u_, a_); CP[f"l{u_}"] = (u_, b_)
CP.update({"wa": (wnd_.bounds[0], 0), "wb": (wnd_.bounds[2], 0)})
a_, b_ = edge_(wnd_, WINDOW_U if "WINDOW_U" in globals() else -5.0); CP["ws1"], CP["ws2"] = (-5.0, a_), (-5.0, b_)
a_, b_ = edge_(wnd_, -25); CP["w1a"], CP["w1b"] = (-25, a_), (-25, b_)
a_, b_ = edge_(wnd_, 17); CP["w2a"], CP["w2b"] = (17, a_), (17, b_)
def points(phi):
    out = {k: (knee_xyz(np.array([float(u)]), np.array([float(v)]), np.array([1.0]), phi)[0] * MM).tolist() for k, (u, v) in CP.items()}
    pose(phi); bpy.context.view_layer.update(); M_ = puck.matrix_world; Z_, Y_, X_ = M_.to_3x3() @ Vector((0, 0, 1)), M_.to_3x3() @ Vector((0, 1, 0)), M_.to_3x3() @ Vector((1, 0, 0)); T_ = M_.translation
    out["coin"] = list(T_ + Z_ * 7.6 * MM); out["coinF"] = list(T_ + Z_ * 5 * MM + X_ * 17 * MM); out["coinB"] = list(T_ + Z_ * 5 * MM - X_ * 17 * MM); out["coinU"] = list(T_ + Z_ * 5 * MM + Y_ * 17 * MM); out["coinD"] = list(T_ + Z_ * 5 * MM - Y_ * 17 * MM)
    return out
if MODE == "dump":
    J.dump({str(d): points(math.radians(d)) for d in (50, 60, 70, 80, 90)}, open(os.environ["RECO_OUT"], "w"))
    # where the coin ends up at the end of the bend film
    pose(math.radians(130)); flex_cam(); bpy.context.view_layer.update(); M_ = puck.matrix_world
    q = w2c(scn, cam, M_.translation + M_.to_3x3() @ Vector((0, 0, 6 * MM))); print("COIN_END", q.x * 1536, (1 - q.y) * 1024, flush=True)
else:
    C = J.load(open(CAMS))
    def bend_end_view():
        v = BEND_WHOLE; return dict(loc=Vector(v["loc"]), tgt=Vector(v["tgt"]), lens=v["lens"], fs=v["fs"], foc=Vector(v["foc"]), graze=v["graze"])
    def photo_view():
        loc = Vector(C["cam"]); return dict(loc=loc, tgt=loc + Vector(C["fwd"]), up=Vector(C["up"]), lens=C["lens"], fs=16.0, foc=Vector((0, 0.01, 0.0)), graze=13.0)
    PIVOT = Vector((0.0, 0.02, 0.0))
    def frame_of(v):
        fw = (Vector(v["tgt"]) - Vector(v["loc"])).normalized()
        if "up" in v:
            up = Vector(v["up"]).normalized()
        else:
            up = Vector((0, 0, 1))
        rt = fw.cross(up).normalized(); up2 = rt.cross(fw)
        R = Matrix((rt, up2, -fw)).transposed()
        p = R.transposed() @ (PIVOT - Vector(v["loc"])); d = -p.z
        return dict(q=R.to_quaternion(), f=v["lens"], k=v["lens"] / d, sx=v["lens"] * p.x / d, sy=v["lens"] * p.y / d)
    def go(a, b, e):
        A, B = frame_of(a), frame_of(b)
        q = A["q"].slerp(B["q"], e); f = A["f"] ** (1 - e) * B["f"] ** e; k = A["k"] ** (1 - e) * B["k"] ** e
        sx, sy = A["sx"] + (B["sx"] - A["sx"]) * e, A["sy"] + (B["sy"] - A["sy"]) * e; d = f / k
        cam.rotation_mode = "QUATERNION"; cam.rotation_quaternion = q; cd.lens = f
        cam.location = PIVOT - q.to_matrix() @ Vector((sx * d / f, sy * d / f, -d))
        foc.location = Vector(a["foc"]).lerp(Vector(b["foc"]), e); cd.dof.aperture_fstop = a["fs"] ** (1 - e) * b["fs"] ** e
        LIGHTS["Graze"].data.energy = a["graze"] + (b["graze"] - a["graze"]) * e
    PHI = math.radians(C["phi"])
    os.makedirs(OUT, exist_ok=True)
    PEAK = math.radians(BEND_PEAK)
    SEATS_BY = 0.92   # of the shot: on the knee a little before the camera arrives
    GLOW_FADES_BY, GLOW_PEAK, GLOW_REST = 0.3, 5.5, 1.5   # the ring is lit at the peak of the bend
    for f in range(F0, F1, STEP):
        u = f / (NF - 1); e = ease(u); s_ = ease(u / SEATS_BY)
        pose(PEAK + (PHI - PEAK) * s_, level=BEND_LEVEL + (1 - BEND_LEVEL) * s_); go(bend_end_view(), photo_view(), e)
        ring_glow(GLOW_REST + (GLOW_PEAK - GLOW_REST) * (1 - ease(u / GLOW_FADES_BY)))
        shot(os.path.join(OUT, f"a_{f + 1:03d}.png"))
    pose(PHI); ring_glow(GLOW_REST); go(bend_end_view(), photo_view(), 1.0); bpy.context.view_layer.update()
    res = {}
    for k, P in points(PHI).items():
        q = w2c(scn, cam, Vector(P)); res[k] = (q.x * 1536, (1 - q.y) * 1024)
    J.dump(res, open(os.path.join(OUT, "cp.json"), "w"))
