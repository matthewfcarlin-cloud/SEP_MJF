"""Power fanout: drop a via next to every GND / +3V3 SMD pad so the inner planes
(In1 GND, In2 +3V3) carry power, and the autorouter only handles signals.

Each candidate via position is checked against every pad (both sides, since a
via goes through the board), existing vias and tracks, the keepouts, and the
board edge. Pads where nothing fits are left for the autorouter.
"""
import math

import pcbnew

TO_MM = pcbnew.ToMM
VIA_D, VIA_DRILL, CLR, FAN_W = 0.5, 0.3, 0.16, 0.25


def _rect_dist(px, py, box):
    x0, y0, x1, y1 = box
    dx = max(x0 - px, 0, px - x1)
    dy = max(y0 - py, 0, py - y1)
    return math.hypot(dx, dy)


def _seg_dist(px, py, a, b):
    (ax, ay), (bx, by) = a, b
    vx, vy = bx - ax, by - ay
    L = vx * vx + vy * vy
    t = 0 if L == 0 else max(0, min(1, ((px - ax) * vx + (py - ay) * vy) / L))
    return math.hypot(px - (ax + t * vx), py - (ay + t * vy))


def _seg_seg_dist(a, b, c, d):
    pts = [_seg_dist(a[0], a[1], c, d), _seg_dist(b[0], b[1], c, d),
           _seg_dist(c[0], c[1], a, b), _seg_dist(d[0], d[1], a, b)]

    def ccw(p, q, r):
        return (r[1] - p[1]) * (q[0] - p[0]) > (q[1] - p[1]) * (r[0] - p[0])
    if ccw(a, c, d) != ccw(b, c, d) and ccw(a, b, c) != ccw(a, b, d):
        return 0.0
    return min(pts)


def run(board, P, inside_ok, nets=("GND", "+3V3"), skip_refs=("AE1", "TS1"), only_refs=None, width=FAN_W):
    """P: math->VECTOR2I; inside_ok(x_kicad_mm, y_kicad_mm) -> allowed via spot."""
    pads = []
    for fp in board.GetFootprints():
        for pad in fp.Pads():
            bb = pad.GetBoundingBox()
            box = (TO_MM(bb.GetLeft()), TO_MM(bb.GetTop()), TO_MM(bb.GetRight()), TO_MM(bb.GetBottom()))
            if fp.GetReference() == "AE1":   # custom shapes: only the anchors sit near other parts
                c = pad.GetPosition()
                cx, cy = TO_MM(c.x), TO_MM(c.y)
                box = (cx - 0.25, cy - 0.25, cx + 0.25, cy + 0.25)
            pads.append(dict(pad=pad, fp=fp, box=box, net=pad.GetNetname(),
                             front=pad.IsOnLayer(pcbnew.F_Cu), back=pad.IsOnLayer(pcbnew.B_Cu)))
    vias, tracks = [], []
    for t in board.GetTracks():
        if t.GetClass() == "PCB_VIA":
            p = t.GetPosition()
            vias.append((TO_MM(p.x), TO_MM(p.y), t.GetNetname()))
        else:
            tracks.append(((TO_MM(t.GetStart().x), TO_MM(t.GetStart().y)),
                           (TO_MM(t.GetEnd().x), TO_MM(t.GetEnd().y)),
                           TO_MM(t.GetWidth()) / 2, t.GetNetname(), t.GetLayer()))

    placed, failed = 0, []
    for pd in pads:
        pad, fp = pd["pad"], pd["fp"]
        if pd["net"] not in nets or fp.GetReference() in skip_refs:
            continue
        if only_refs and fp.GetReference() not in only_refs:
            continue
        if pad.GetAttribute() == pcbnew.PAD_ATTRIB_PTH or pad.GetNumber() == "49":
            continue
        if pd["back"] and pd["net"] == "GND":
            continue  # bottom GND pads sit in the bottom GND pour
        layer = pcbnew.F_Cu if pd["front"] else pcbnew.B_Cu
        c = pad.GetPosition()
        cx, cy = TO_MM(c.x), TO_MM(c.y)
        fc = fp.GetPosition()
        ox, oy = cx - TO_MM(fc.x), cy - TO_MM(fc.y)
        if math.hypot(ox, oy) < 1e-6:
            ox, oy = 0.0, -1.0
        base = math.atan2(oy, ox)
        hw = max(pd["box"][2] - pd["box"][0], pd["box"][3] - pd["box"][1]) / 2
        # stub leaves from the pad's outer end (along the outward axis)
        along = abs(math.cos(base)) * (pd["box"][2] - pd["box"][0]) / 2 +             abs(math.sin(base)) * (pd["box"][3] - pd["box"][1]) / 2
        sx0 = cx + max(along - 0.1, 0) * math.cos(base)
        sy0 = cy + max(along - 0.1, 0) * math.sin(base)
        best = None
        for dang in (0, 45, -45, 90, -90, 135, -135, 180):
            a = base + math.radians(dang)
            for k in range(10):
                d = VIA_D / 2 + 0.15 + 0.1 * k
                vx, vy = sx0 + d * math.cos(a), sy0 + d * math.sin(a)
                if not inside_ok(vx, vy):
                    continue
                ok = True
                for q in pads:
                    if q["pad"] is pad:
                        continue
                    need = VIA_D / 2 + (0.05 if q["net"] == pd["net"] else 0.21 if q["net"] in ("RF_IN", "ANT_FEED") else CLR)
                    if _rect_dist(vx, vy, q["box"]) < need:
                        ok = False
                        break
                    # fanout stub (same layer as the pad) vs other-net pads
                    if q["net"] != pd["net"] and ((layer == pcbnew.F_Cu and q["front"]) or
                                                  (layer == pcbnew.B_Cu and q["back"])):
                        for s in (0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9):
                            sx, sy = sx0 + (vx - sx0) * s, sy0 + (vy - sy0) * s
                            if _rect_dist(sx, sy, q["box"]) < width / 2 + CLR:
                                ok = False
                                break
                        if not ok:
                            break
                if not ok:
                    continue
                for (x, y, n) in vias:
                    if math.hypot(vx - x, vy - y) < (0.6 if n == pd["net"] else VIA_D + CLR):
                        ok = False
                        break
                if not ok:
                    continue
                for (a0, b0, hwid, n, lay) in tracks:
                    if n != pd["net"] and _seg_dist(vx, vy, a0, b0) < VIA_D / 2 + hwid + 0.21:
                        ok = False
                        break
                    if n != pd["net"] and lay == layer and _seg_seg_dist((sx0, sy0), (vx, vy), a0, b0) < width / 2 + hwid + 0.21:
                        ok = False
                        break
                if ok:
                    for (x, y, n) in vias:
                        if n != pd["net"] and _seg_dist(x, y, (sx0, sy0), (vx, vy)) < VIA_D / 2 + width / 2 + CLR:
                            ok = False
                            break
                if ok:
                    best = (vx, vy)
                    break
            if best:
                break
        if not best:
            failed.append(f"{fp.GetReference()}.{pad.GetNumber()}")
            continue
        vx, vy = best
        v = pcbnew.PCB_VIA(board)
        v.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(vx), pcbnew.FromMM(vy)))
        v.SetWidth(pcbnew.FromMM(VIA_D))
        v.SetDrill(pcbnew.FromMM(VIA_DRILL))
        v.SetNet(pad.GetNet())
        v.SetLocked(True)
        board.Add(v)
        mid = pcbnew.VECTOR2I(pcbnew.FromMM(sx0), pcbnew.FromMM(sy0))
        if (mid.x, mid.y) != (c.x, c.y):
            t0 = pcbnew.PCB_TRACK(board)
            t0.SetStart(c)
            t0.SetEnd(mid)
            t0.SetWidth(pcbnew.FromMM(width))
            t0.SetLayer(layer)
            t0.SetNet(pad.GetNet())
            t0.SetLocked(True)
            board.Add(t0)
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(mid)
        t.SetEnd(v.GetPosition())
        t.SetWidth(pcbnew.FromMM(width))
        t.SetLayer(layer)
        t.SetNet(pad.GetNet())
        t.SetLocked(True)
        board.Add(t)
        vias.append((vx, vy, pd["net"]))
        tracks.append(((sx0, sy0), (vx, vy), width / 2, pd["net"], layer))
        placed += 1
    return placed, failed
