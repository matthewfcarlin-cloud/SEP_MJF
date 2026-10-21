"""Grid A* "finisher": routes whatever connections Freerouting left open.

Reads the unconnected pairs from KiCad's own DRC (JSON), then routes each on
F.Cu/B.Cu over a 0.05 mm grid, keeping clearance to every other-net pad,
track and via, honouring the keepouts and board edge, and dropping vias only
where a via fits. Run with KiCad's Python (route.py calls it).
"""
import heapq
import json
import math
import os
import re
import subprocess
import sys

import numpy as np
import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from design import BOARD_R, GROUND_EDGE_Y, PARTS  # noqa: E402
import footprints  # noqa: E402

KICAD_CLI = "C:/Program Files/KiCad/10.0/bin/kicad-cli.exe"
CX, CY = 100.0, 100.0
RES = 0.05
N = int(2 * (BOARD_R + 0.5) / RES)
X0, Y0 = CX - N * RES / 2, CY - N * RES / 2
GX = X0 + (np.arange(N) + 0.5) * RES          # cell centre x (KiCad mm)
GY = Y0 + (np.arange(N) + 0.5) * RES
LAYERS = (pcbnew.F_Cu, pcbnew.B_Cu)
VIA_R, VIA_DRILL = 0.25, 0.3
POWER = ("GND", "+3V3", "VBAT", "VBAT_IN")
RF = ("RF_IN", "ANT_FEED")
mm = pcbnew.ToMM


def drc_unconnected(pcb_path):
    out = pcb_path + ".drc.json"
    subprocess.run([KICAD_CLI, "pcb", "drc", "--refill-zones", "--format", "json", "-o", out, pcb_path],
                   check=True, capture_output=True)
    with open(out, encoding="utf-8") as f:
        d = json.load(f)
    os.remove(out)
    pairs = []
    for u in d["unconnected_items"]:
        items = []
        for it in u["items"]:
            desc = it["description"]
            if desc.startswith("Zone"):
                break
            net = re.search(r"\[([^\]]+)\]", desc).group(1)
            lay = [l for l, name in ((pcbnew.F_Cu, "F.Cu"), (pcbnew.B_Cu, "B.Cu")) if name in desc]
            items.append(dict(net=net, x=it["pos"]["x"], y=it["pos"]["y"], layers=lay))
        if len(items) == 2:
            pairs.append(items)
    return pairs


class Shapes:
    """Copper shapes per layer: ('rect'|'circle'|'seg', geom, net, clearance)."""

    def __init__(self, board):
        self.by_layer = {l: [] for l in LAYERS}
        self.vias = []
        for fp in board.GetFootprints():
            ref = fp.GetReference()
            for pad in fp.Pads():
                net = pad.GetNetname()
                c = pad.GetPosition()
                cx, cy = mm(c.x), mm(c.y)
                for l in LAYERS:
                    if not pad.IsOnLayer(l):
                        continue
                    if ref == "AE1":
                        self.by_layer[l].append(("rect", (cx - 0.25, cy - 0.25, cx + 0.25, cy + 0.25), net, 0.2))
                    elif ref == "TS1":
                        tx, ty = footprints.touch_tail()
                        self.by_layer[l].append(("circle", (cx, cy, 3.25), net, 0.5))
                        self.by_layer[l].append(("seg", ((cx, cy), (cx + tx, cy - ty), 0.2), net, 0.5))
                    elif pad.GetShape() == pcbnew.PAD_SHAPE_CIRCLE:
                        self.by_layer[l].append(("circle", (cx, cy, mm(pad.GetSize(l).x) / 2), net, 0.15))
                    else:
                        bb = pad.GetBoundingBox()
                        self.by_layer[l].append(("rect", (mm(bb.GetLeft()), mm(bb.GetTop()),
                                                          mm(bb.GetRight()), mm(bb.GetBottom())), net, 0.15))
        for t in board.GetTracks():
            net = t.GetNetname()
            if t.GetClass() == "PCB_VIA":
                p = t.GetPosition()
                self.vias.append((mm(p.x), mm(p.y), net))
                for l in LAYERS:
                    self.by_layer[l].append(("circle", (mm(p.x), mm(p.y), mm(t.GetWidth(l)) / 2), net, 0.15))
            elif t.GetLayer() in LAYERS:
                self.by_layer[t.GetLayer()].append(
                    ("seg", ((mm(t.GetStart().x), mm(t.GetStart().y)), (mm(t.GetEnd().x), mm(t.GetEnd().y)),
                             mm(t.GetWidth()) / 2), net, 0.15))

    def add_track(self, layer, a, b, hw, net):
        self.by_layer[layer].append(("seg", (a, b, hw), net, 0.15))

    def add_via(self, x, y, net):
        self.vias.append((x, y, net))
        for l in LAYERS:
            self.by_layer[l].append(("circle", (x, y, VIA_R), net, 0.15))

    def blocked(self, layer, net, extra):
        """Cells whose centre is closer than (shape clearance + extra) to other-net copper."""
        m = np.zeros((N, N), bool)
        for kind, g, n, clr in self.by_layer[layer]:
            if n == net and n != "":
                continue
            c = max(clr, 0.2 if (net in RF or n in RF) else 0.15) + extra + 0.01
            if kind == "rect":
                x0, y0, x1, y1 = g
                bx0, by0, bx1, by1 = x0 - c, y0 - c, x1 + c, y1 + c
            elif kind == "circle":
                x, y, r = g
                bx0, by0, bx1, by1 = x - r - c, y - r - c, x + r + c, y + r + c
            else:
                (ax, ay), (bx, by), hw = g
                bx0, by0 = min(ax, bx) - hw - c, min(ay, by) - hw - c
                bx1, by1 = max(ax, bx) + hw + c, max(ay, by) + hw + c
            i0, i1 = max(int((bx0 - X0) / RES), 0), min(int((bx1 - X0) / RES) + 1, N)
            j0, j1 = max(int((by0 - Y0) / RES), 0), min(int((by1 - Y0) / RES) + 1, N)
            if i0 >= i1 or j0 >= j1:
                continue
            xs, ys = np.meshgrid(GX[i0:i1], GY[j0:j1], indexing="ij")
            if kind == "rect":
                d = np.hypot(np.maximum(np.maximum(x0 - xs, 0), xs - x1), np.maximum(np.maximum(y0 - ys, 0), ys - y1))
            elif kind == "circle":
                d = np.hypot(xs - x, ys - y) - r
            else:
                vx, vy = bx - ax, by - ay
                L = vx * vx + vy * vy
                t = np.clip(((xs - ax) * vx + (ys - ay) * vy) / L, 0, 1) if L else np.zeros_like(xs)
                d = np.hypot(xs - ax - t * vx, ys - ay - t * vy) - hw
            m[i0:i1, j0:j1] |= d < c
        return m


def static_masks():
    xs, ys = np.meshgrid(GX, GY, indexing="ij")
    mx, my = xs - CX, CY - ys
    r = np.hypot(mx, my)
    tp = next(p for p in PARTS if p["ref"] == "TS1")["pos"]
    tx, ty = footprints.touch_tail()
    # F.Cu routing keepout around the touch electrode (matches build.py hull, approx.)
    vx, vy = tx, ty
    L = vx * vx + vy * vy
    t = np.clip(((mx - tp[0]) * vx + (my - tp[1]) * vy) / L, 0, 1)
    tail_d = np.hypot(mx - tp[0] - t * vx, my - tp[1] - t * vy)
    touch_f = (np.hypot(mx - tp[0], my - tp[1]) < 3.85) | (tail_d < 0.8)
    edge = r > BOARD_R - 0.3
    ant = my > GROUND_EDGE_Y - 0.05
    touch_inner = np.hypot(mx - tp[0], my - tp[1]) < 4.2 + VIA_R + 0.05
    return dict(edge=edge, ant=ant, touch_f=touch_f, touch_inner=touch_inner, mx=mx, my=my)


def cell(x, y):
    return int((x - X0) / RES), int((y - Y0) / RES)


def astar(free, via_ok, starts, goals, gpt):
    gi, gj = cell(*gpt)
    open_, best, prev = [], {}, {}
    for s in starts:
        best[s] = 0.0
        heapq.heappush(open_, (0.0, 0.0, s))
    moves = [(1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0),
             (1, 1, 1.414), (1, -1, 1.414), (-1, 1, 1.414), (-1, -1, 1.414)]
    while open_:
        _, g, s = heapq.heappop(open_)
        if g > best.get(s, 1e18):
            continue
        if s in goals:
            path = [s]
            while path[-1] in prev:
                path.append(prev[path[-1]])
            return path[::-1]
        l, i, j = s
        nbrs = [((l, i + di, j + dj), c) for di, dj, c in moves]
        if via_ok[i, j]:
            nbrs.append(((1 - l, i, j), 40.0))
        for (nl, ni, nj), c in nbrs:
            if not (0 <= ni < N and 0 <= nj < N) or not free[nl][ni, nj]:
                continue
            ng = g + c
            ns = (nl, ni, nj)
            if ng < best.get(ns, 1e18):
                best[ns] = ng
                prev[ns] = s
                h = math.hypot(ni - gi, nj - gj)
                heapq.heappush(open_, (ng + h, ng, ns))
    return None


def route_pair(board, shapes, masks, a, b):
    net = a["net"]
    hw = 0.1 if net in POWER else 0.075
    lidx = {pcbnew.F_Cu: 0, pcbnew.B_Cu: 1}
    free = []
    for l in LAYERS:
        f = ~shapes.blocked(l, net, hw) & ~masks["edge"] & ~masks["ant"]
        if l == pcbnew.F_Cu:
            f &= ~masks["touch_f"]
        free.append(f)
    via_ok = ~shapes.blocked(pcbnew.F_Cu, net, VIA_R) & ~shapes.blocked(pcbnew.B_Cu, net, VIA_R)
    via_ok &= ~masks["edge"] & ~masks["ant"] & ~masks["touch_inner"] & ~masks["touch_f"]
    via_ok &= np.hypot(masks["mx"], masks["my"]) < BOARD_R - 0.6
    for (x, y, n) in shapes.vias:  # hole-to-hole spacing, any net
        i, j = cell(x, y)
        k = int(0.62 / RES) + 1
        sub = via_ok[max(i - k, 0):i + k + 1, max(j - k, 0):j + k + 1]
        xs, ys = np.meshgrid(GX[max(i - k, 0):i + k + 1], GY[max(j - k, 0):j + k + 1], indexing="ij")
        sub &= np.hypot(xs - x, ys - y) >= 0.62

    def endpoints(item, rad=0.12):
        cells = set()
        ci, cj = cell(item["x"], item["y"])
        k = int(rad / RES) + 1
        for l in item["layers"]:
            for i in range(ci - k, ci + k + 1):
                for j in range(cj - k, cj + k + 1):
                    if 0 <= i < N and 0 <= j < N:
                        free[lidx[l]][i, j] = True   # own copper: always enterable
                        cells.add((lidx[l], i, j))
        return cells

    starts, goals = endpoints(a), endpoints(b)
    path = astar(free, via_ok, starts, goals, (b["x"], b["y"]))
    if not path:
        return False
    netinfo = board.FindNet(net)

    def xy(s):
        return (X0 + (s[1] + 0.5) * RES, Y0 + (s[2] + 0.5) * RES)
    # start/end exactly on the item positions
    pts = [(path[0][0], (a["x"], a["y"]))] + [(s[0], xy(s)) for s in path[1:-1]] + [(path[-1][0], (b["x"], b["y"]))]
    # compress into segments, splitting at layer changes and direction changes
    segs, cur_l, run = [], pts[0][0], [pts[0][1]]
    for (l, p) in pts[1:]:
        if l != cur_l:
            segs.append((cur_l, run))
            shapes.add_via(p[0], p[1], net)
            v = pcbnew.PCB_VIA(board)
            v.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(p[0]), pcbnew.FromMM(p[1])))
            v.SetWidth(pcbnew.FromMM(2 * VIA_R))
            v.SetDrill(pcbnew.FromMM(VIA_DRILL))
            v.SetNet(netinfo)
            board.Add(v)
            cur_l, run = l, [p]
        else:
            run.append(p)
    segs.append((cur_l, run))
    for l, run in segs:
        simp = [run[0]]
        for k in range(1, len(run) - 1):
            d1 = (run[k][0] - simp[-1][0], run[k][1] - simp[-1][1])
            d2 = (run[k + 1][0] - run[k][0], run[k + 1][1] - run[k][1])
            if abs(d1[0] * d2[1] - d1[1] * d2[0]) > 1e-9:
                simp.append(run[k])
        simp.append(run[-1])
        for p, q in zip(simp, simp[1:]):
            if math.dist(p, q) < 1e-6:
                continue
            t = pcbnew.PCB_TRACK(board)
            t.SetStart(pcbnew.VECTOR2I(pcbnew.FromMM(p[0]), pcbnew.FromMM(p[1])))
            t.SetEnd(pcbnew.VECTOR2I(pcbnew.FromMM(q[0]), pcbnew.FromMM(q[1])))
            t.SetWidth(pcbnew.FromMM(2 * hw))
            t.SetLayer(LAYERS[l])
            t.SetNet(netinfo)
            board.Add(t)
            shapes.add_track(LAYERS[l], p, q, hw, net)
    return True


def run(pcb_path, rounds=4):
    masks = static_masks()
    for _ in range(rounds):
        pairs = drc_unconnected(pcb_path)
        if not pairs:
            return 0
        board = pcbnew.LoadBoard(pcb_path)
        shapes = Shapes(board)
        done = 0
        for a, b in pairs:
            ok = route_pair(board, shapes, masks, a, b)
            print(f"  finish {a['net']}: {'routed' if ok else 'NO PATH'}")
            done += ok
        pcbnew.SaveBoard(pcb_path, board, True)
        if not done:
            break
    return len(drc_unconnected(pcb_path))


if __name__ == "__main__":
    left = run(os.path.join(os.path.dirname(HERE), "kinetape_puck.kicad_pcb"))
    print("still unconnected:", left)
