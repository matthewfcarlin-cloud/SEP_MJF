import json, math
from shapely.geometry import LineString, Polygon, Point, box
from shapely.ops import unary_union
from shapely import affinity

def smooth(s, convex=8, concave=2.5):
    s = s.buffer(-convex, join_style=1).buffer(convex, join_style=1)
    return s.buffer(concave, join_style=1).buffer(-concave, join_style=1)

def serp(path_pts, amp=1.1, wl=4.0, width=0.55, step=0.25):
    """serpentine trace following a polyline"""
    line = LineString(path_pts); L = line.length; pts = []
    d = 0.0
    while d <= L:
        p = line.interpolate(d); p2 = line.interpolate(min(L, d + 0.5))
        dx, dy = p2.x - p.x, p2.y - p.y; n = math.hypot(dx, dy) or 1
        nx, ny = -dy / n, dx / n
        off = amp * math.sin(2 * math.pi * d / wl)
        pts.append((p.x + nx * off, p.y + ny * off)); d += step
    return LineString(pts).buffer(width / 2, cap_style=1).simplify(0.04)

def offset_path(path_pts, off):
    return list(LineString(path_pts).offset_curve(off).coords)

def poly_out(p):
    p = p.simplify(0.08)
    return {'ext': [list(c) for c in p.exterior.coords[:-1]], 'holes': [[list(c) for c in h.coords[:-1]] for h in p.interiors]}

def serp_line(path_pts, amp=0.7, wl=3.6, step=0.2):
    line = LineString(path_pts); L = line.length; pts = []; d = 0.0
    while d <= L:
        p = line.interpolate(d); p2 = line.interpolate(min(L, d + 0.5))
        dx, dy = p2.x - p.x, p2.y - p.y; n = math.hypot(dx, dy) or 1
        off = amp * math.sin(2 * math.pi * d / wl)
        pts.append((p.x - dy / n * off, p.y + dx / n * off)); d += step
    return LineString(pts)

def traces_for(paths, sep=1.9):
    polys = []
    for path in paths:
        c = serp_line(path)
        for s in (-sep / 2, sep / 2):
            polys.append(c.offset_curve(s, join_style=1).buffer(0.2, cap_style=1).simplify(0.03))
        # end pads
        end = path[-1]
        polys.append(Point(end).buffer(1.3))
    u = unary_union(polys)
    geoms = list(u.geoms) if hasattr(u, 'geoms') else [u]
    return [poly_out(g) for g in geoms]

out = {}
# ---- I strip (back) 50 x 250
I = smooth(box(-25, -125, 25, 125), 10)
out['I'] = dict(shape=poly_out(I), dock=[0, 95], traces=traces_for([[(0, 80), (0, -110)]]),
                logo=[0, -112, 90])

# ---- Y strip (shoulder) 50 wide, 260 long
def ystrip(W, top, split, bottom, spread, cv=10):
    base = box(-W / 2, split - 5, W / 2, top)
    tw = W * 0.46
    tl = LineString([(-W / 4, split), (-W / 4 - spread, bottom)]).buffer(tw / 2, cap_style=1)
    tr = LineString([(W / 4, split), (W / 4 + spread, bottom)]).buffer(tw / 2, cap_style=1)
    return smooth(unary_union([base, tl, tr]), cv, 3)
Y = ystrip(50, 130, 50, -120, 26)
out['Y'] = dict(shape=poly_out(Y), dock=[0, 98],
                traces=traces_for([[(-4, 84), (-12.5, 50), (-12.5 - 24, -104)], [(4, 84), (12.5, 50), (12.5 + 24, -104)]]),
                logo=[12.5 + 21, -88, 90 - math.degrees(math.atan2(26, 170))])
# ---- elbow Y (smaller)
E = ystrip(42, 100, 40, -95, 18, 6)
out['E'] = dict(shape=poly_out(E), dock=[0, 72],
                traces=traces_for([[(-3.5, 59), (-10.5, 40), (-10.5 - 16, -80)], [(3.5, 59), (10.5, 40), (10.5 + 16, -80)]]),
                logo=[10.5 + 14, -66, 90 - math.degrees(math.atan2(18, 135))])
# ---- knee: body with patella hole + 4 tails
body = box(-38, -52, 38, 56)
arms = []
for sx in (-1, 1):
    for sy in (-1, 1):
        a0 = (sx * 22, sy * 40); a1 = (sx * 50, sy * 122)
        arms.append(LineString([a0, a1]).buffer(14, cap_style=1))
K = smooth(unary_union([body] + arms), 9, 4)
hole = affinity.scale(Point(0, -6).buffer(1), 15, 20)
K = K.difference(hole)
kpaths = []
for sx in (-1, 1):
    pts = []
    for i in range(0, 41):
        t = i / 40; ang = math.pi / 2 - math.pi * t
        pts.append((sx * 23 * math.cos(ang) * (0.6 + 0.4 * math.cos(ang)) + sx * 3, -6 + 28 * math.sin(ang)))
    pts = [(sx * 4, 40)] + pts + [(sx * 28, -42), (sx * 46, -108)]
    kpaths.append(pts)
out['K'] = dict(shape=poly_out(K), dock=[0, 42], traces=traces_for(kpaths, 1.9),
                logo=[-44, 104, 90 + math.degrees(math.atan2(28, 82))])
json.dump(out, open('shapes.json', 'w'))
print({k: (len(v['shape']['ext']), len(v['traces'])) for k, v in out.items()})
print(len(open('shapes.json').read()))
