"""Builds the KineTape puck KiCad project from design.py.

Run with KiCad's Python:
  "C:/Program Files/KiCad/10.0/bin/python.exe" scripts/build.py
Outputs (in hardware/): kinetape_puck.kicad_pro/.kicad_sch/.kicad_pcb, KineTape.pretty/, fp-lib-table
Then: scripts/route.py (autoroute) and scripts/export.py (fab outputs).
"""
import json
import math
import os
import subprocess
import sys
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import pcbnew  # noqa: E402

import fanout  # noqa: E402
import footprints  # noqa: E402
import schematic  # noqa: E402
from design import BOARD_R, GROUND_EDGE_Y, PARTS, PROJECT  # noqa: E402
from sexp import find, find1, parse  # noqa: E402

OUT = os.path.dirname(HERE)
FPDIR = "C:/Program Files/KiCad/10.0/share/kicad/footprints/"
CX, CY = 100.0, 100.0
KICAD_CLI = "C:/Program Files/KiCad/10.0/bin/kicad-cli.exe"


def schematic_netlist(sch_path):
    """{(ref, pin): net} as KiCad itself resolves the schematic."""
    out = sch_path.replace(".kicad_sch", ".net")
    subprocess.run([KICAD_CLI, "sch", "export", "netlist", "--format", "kicadsexpr", "-o", out, sch_path],
                   check=True, capture_output=True)
    with open(out, encoding="utf-8") as f:
        root = parse(f.read())
    os.remove(out)
    pin_net = {}
    for n in find(find1(root, "nets"), "net"):
        name = find1(n, "name")[1]
        for node in find(n, "node"):
            pin_net[(find1(node, "ref")[1], find1(node, "pin")[1])] = name
    return pin_net
MM = pcbnew.FromMM


def P(x, y):
    """math coords (mm, +y up, board centre origin) -> KiCad VECTOR2I"""
    return pcbnew.VECTOR2I(MM(CX + x), MM(CY - y))


def circle_poly(r, n=96, cx=0.0, cy=0.0):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def antenna_region():
    """Circle segment above the ground edge."""
    a0 = math.asin(GROUND_EDGE_Y / (BOARD_R + 0.5))
    pts = [((BOARD_R + 0.5) * math.cos(a), (BOARD_R + 0.5) * math.sin(a))
           for a in [a0 + (math.pi - 2 * a0) * i / 48 for i in range(49)]]
    return pts


def convex_hull(pts):
    pts = sorted(set(pts))

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(hi) >= 2 and cross(hi[-2], hi[-1], p) <= 0:
            hi.pop()
        hi.append(p)
    return lo[:-1] + hi[:-1]


def _seg_dist_math(p, a, b):
    vx, vy = b[0] - a[0], b[1] - a[1]
    L = vx * vx + vy * vy
    t = max(0, min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L)) if L else 0
    return math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vy)


def add_zone(board, layer, net, pts, priority=0, name=""):
    z = pcbnew.ZONE(board)
    z.SetLayer(layer)
    if net is not None:
        z.SetNet(net)
    ol = z.Outline()
    ol.NewOutline()
    for x, y in pts:
        ol.Append(P(x, y))
    z.SetAssignedPriority(priority)
    z.SetLocalClearance(MM(0.2))
    z.SetMinThickness(MM(0.15))
    z.SetPadConnection(pcbnew.ZONE_CONNECTION_THERMAL)
    z.SetThermalReliefGap(MM(0.2))
    z.SetThermalReliefSpokeWidth(MM(0.25))
    z.SetZoneName(name)
    board.Add(z)
    return z


def add_keepout(board, layers, pts, name, tracks=True, vias=True, pours=True):
    z = pcbnew.ZONE(board)
    z.SetIsRuleArea(True)
    ls = pcbnew.LSET()
    for l in layers:
        ls.AddLayer(l)
    z.SetLayerSet(ls)
    ol = z.Outline()
    ol.NewOutline()
    for x, y in pts:
        ol.Append(P(x, y))
    z.SetDoNotAllowTracks(tracks)
    z.SetDoNotAllowVias(vias)
    z.SetDoNotAllowZoneFills(pours)
    z.SetDoNotAllowPads(False)
    z.SetDoNotAllowFootprints(False)
    z.SetZoneName(name)
    board.Add(z)


def track(board, net, a, b, w, layer=pcbnew.F_Cu):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(a)
    t.SetEnd(b)
    t.SetWidth(MM(w))
    t.SetLayer(layer)
    t.SetNet(net)
    t.SetLocked(True)
    board.Add(t)


def via(board, net, x, y, d=0.5, drill=0.3):
    v = pcbnew.PCB_VIA(board)
    v.SetPosition(P(x, y))
    v.SetWidth(MM(d))
    v.SetDrill(MM(drill))
    v.SetNet(net)
    v.SetLocked(True)
    board.Add(v)


def write_project():
    pro = {
        "board": {
            "design_settings": {
                "defaults": {"board_outline_line_width": 0.1, "copper_line_width": 0.2},
                "rules": {
                    "min_clearance": 0.1, "min_track_width": 0.1, "min_via_annular_width": 0.1,
                    "min_via_diameter": 0.45, "min_through_hole_diameter": 0.2,
                    "min_hole_to_hole": 0.25, "min_hole_clearance": 0.2,
                    "min_copper_edge_clearance": 0.25, "min_microvia_diameter": 0.2,
                    "min_microvia_drill": 0.1, "min_silk_clearance": 0.0,
                    "min_text_height": 0.6, "min_text_thickness": 0.08,
                },
                "track_widths": [0.0, 0.15, 0.2, 0.3, 0.4],
                "via_dimensions": [{"diameter": 0.0, "drill": 0.0}, {"diameter": 0.5, "drill": 0.3}],
                "rule_severities": {"silk_over_copper": "ignore", "silk_overlap": "ignore",
                                    "lib_footprint_mismatch": "ignore", "lib_footprint_issues": "ignore",
                                    "text_height": "ignore", "silk_edge_clearance": "ignore"},
            }
        },
        "net_settings": {
            "classes": [
                {"name": "Default", "clearance": 0.15, "track_width": 0.15, "via_diameter": 0.5,
                 "via_drill": 0.3, "microvia_diameter": 0.3, "microvia_drill": 0.1,
                 "diff_pair_gap": 0.25, "diff_pair_width": 0.2, "diff_pair_via_gap": 0.25,
                 "wire_width": 6, "bus_width": 12, "line_style": 0, "pcb_color": "rgba(0, 0, 0, 0.000)",
                 "schematic_color": "rgba(0, 0, 0, 0.000)", "priority": 2147483647},
                {"name": "Power", "clearance": 0.15, "track_width": 0.3, "via_diameter": 0.5,
                 "via_drill": 0.3, "priority": 0},
                {"name": "RF", "clearance": 0.2, "track_width": 0.2, "via_diameter": 0.5,
                 "via_drill": 0.3, "priority": 1},
            ],
            "meta": {"version": 4},
            "netclass_patterns": [
                *[{"netclass": "Power", "pattern": n} for n in ("GND", "+3V3", "VBAT", "VBAT_IN")],
                *[{"netclass": "RF", "pattern": n} for n in ("RF_IN", "ANT_FEED")],
            ],
        },
        "meta": {"filename": PROJECT + ".kicad_pro", "version": 3},
    }
    with open(os.path.join(OUT, PROJECT + ".kicad_pro"), "w", encoding="utf-8") as f:
        json.dump(pro, f, indent=2)
    with open(os.path.join(OUT, "fp-lib-table"), "w", encoding="utf-8", newline="\n") as f:
        f.write('(fp_lib_table\n\t(version 7)\n\t(lib (name "KineTape") (type "KiCad") '
                '(uri "${KIPRJMOD}/KineTape.pretty") (options "") (descr "KineTape custom footprints"))\n)\n')


def main():
    footprints.write_all(os.path.join(OUT, "KineTape.pretty"))

    root_uuid = str(uuid.uuid4())
    sym_uuids = {p["ref"]: str(uuid.uuid4()) for p in PARTS}
    sch_path = os.path.join(OUT, PROJECT + ".kicad_sch")
    schematic.build(sch_path, root_uuid, sym_uuids)
    pin_net = schematic_netlist(sch_path)
    for p in PARTS:  # the schematic must say exactly what design.py says
        for pin, n in p["pins"].items():
            assert pin_net.get((p["ref"], pin)) == n, (p["ref"], pin, n, pin_net.get((p["ref"], pin)))

    board = pcbnew.BOARD()
    board.SetCopperLayerCount(4)
    # inner layers are planes only (In1 GND, In2 +3V3): signals route on F.Cu / B.Cu
    board.SetLayerType(pcbnew.In1_Cu, pcbnew.LT_POWER)
    board.SetLayerType(pcbnew.In2_Cu, pcbnew.LT_POWER)
    board.GetDesignSettings().SetBoardThickness(MM(1.0))
    nets = {}

    def net(name):
        if name not in nets:
            n = pcbnew.NETINFO_ITEM(board, name)
            board.Add(n)
            nets[name] = n
        return nets[name]

    for p in PARTS:
        lib, name = p["fp"].split(":")
        path = os.path.join(OUT, "KineTape.pretty") if lib == "KineTape" else FPDIR + lib + ".pretty"
        fp = pcbnew.FootprintLoad(path, name)
        assert fp is not None, p["fp"]
        fp.SetFPID(pcbnew.LIB_ID(lib, name))
        fp.SetReference(p["ref"])
        fp.SetValue(p["value"])
        fp.SetPath(pcbnew.KIID_PATH("/" + sym_uuids[p["ref"]]))
        fp.SetSheetfile(PROJECT + ".kicad_sch")
        fp.SetSheetname("")
        fp.SetField("LCSC", p["lcsc"])
        fp.GetField("LCSC").SetVisible(False)
        if p.get("dnp"):
            fp.SetDNP(True)
        if not p.get("bom", True):
            fp.SetExcludedFromBOM(True)
        board.Add(fp)
        fp.SetPosition(P(*p["pos"]))
        fp.SetOrientationDegrees(p["rot"])
        if p.get("side") == "B":
            fp.Flip(fp.GetPosition(), pcbnew.FLIP_DIRECTION_LEFT_RIGHT)
        for pad in fp.Pads():
            n = pin_net.get((p["ref"], pad.GetNumber()))
            if n:
                pad.SetNet(net(n))
        fp.Reference().SetTextSize(pcbnew.VECTOR2I(MM(0.5), MM(0.5)))
        fp.Reference().SetTextThickness(MM(0.08))
        fp.Reference().SetVisible(False)  # too dense for silk refs; see assembly drawing
        fp.Value().SetVisible(False)

    # board outline
    c = pcbnew.PCB_SHAPE(board, pcbnew.SHAPE_T_CIRCLE)
    c.SetCenter(P(0, 0))
    c.SetEnd(P(BOARD_R, 0))
    c.SetLayer(pcbnew.Edge_Cuts)
    c.SetWidth(MM(0.1))
    board.Add(c)

    # pours: GND on F/In1/B, +3V3 on In2
    outline = circle_poly(BOARD_R - 0.1)
    # solid pad connections on the top pour: 0402 decoupling caps are too crowded for 2-spoke reliefs
    add_zone(board, pcbnew.F_Cu, net("GND"), outline, name="GND_top").SetPadConnection(pcbnew.ZONE_CONNECTION_FULL)
    add_zone(board, pcbnew.In1_Cu, net("GND"), outline, name="GND_in1")
    add_zone(board, pcbnew.In2_Cu, net("+3V3"), outline, name="3V3_in2")
    add_zone(board, pcbnew.B_Cu, net("GND"), outline, name="GND_bot")

    cu = [pcbnew.F_Cu, pcbnew.In1_Cu, pcbnew.In2_Cu, pcbnew.B_Cu]
    add_keepout(board, cu, antenna_region(), "antenna_keepout")
    tp = next(p for p in PARTS if p["ref"] == "TS1")["pos"]
    add_keepout(board, cu[1:], circle_poly(4.2, 48, *tp), "touch_keepout")
    # top layer: keep routing 0.5 mm off the electrode and its tail (pour still allowed)
    tx, ty = footprints.touch_tail()
    hull = convex_hull(circle_poly(3.8, 48, *tp) + circle_poly(0.75, 16, tp[0] + tx, tp[1] + ty))
    add_keepout(board, [pcbnew.F_Cu], hull, "touch_route_keepout", pours=False)

    # silkscreen label
    t = pcbnew.PCB_TEXT(board)
    t.SetText("KineTape")
    t.SetPosition(P(0, -2.0))
    t.SetLayer(pcbnew.B_SilkS)
    t.SetMirrored(True)
    t.SetTextSize(pcbnew.VECTOR2I(MM(1.0), MM(1.0)))
    t.SetTextThickness(MM(0.15))
    board.Add(t)
    t2 = pcbnew.PCB_TEXT(board)
    t2.SetText("rev A")
    t2.SetPosition(P(0, -3.6))
    t2.SetLayer(pcbnew.B_SilkS)
    t2.SetMirrored(True)
    t2.SetTextSize(pcbnew.VECTOR2I(MM(0.7), MM(0.7)))
    t2.SetTextThickness(MM(0.12))
    board.Add(t2)

    # ---- RF pre-route (locked): U1.2 -> C11 / R10 -> C12 -> antenna feed ----
    fps = {f.GetReference(): f for f in board.GetFootprints()}

    def pad(ref, num):
        return next(p for p in fps[ref].Pads() if p.GetNumber() == num).GetPosition()

    rf, feed, gnd = net("RF_IN"), net("ANT_FEED"), net("GND")
    u1p2, c11, r10a, r10b = pad("U1", "2"), pad("C11", "2"), pad("R10", "1"), pad("R10", "2")
    c12, ant = pad("C12", "2"), pad("AE1", "1")
    corner = pcbnew.VECTOR2I(r10a.x, u1p2.y)
    track(board, rf, u1p2, corner, 0.2)
    track(board, rf, corner, pcbnew.VECTOR2I(c11.x, u1p2.y), 0.2)
    track(board, rf, corner, r10a, 0.2)
    track(board, feed, r10b, ant, 0.2)
    track(board, feed, c12, pcbnew.VECTOR2I(r10b.x, c12.y), 0.2)
    # ground stitching around the RF section and along the antenna ground edge
    for x, y in ((-7.6, 3.05), (-7.5, 4.9), (-4.6, 6.1), (-2.3, 6.1), (1.95, 6.1),
                 (4.0, 6.1), (6.5, 5.5), (8.5, 5.0), (-9.5, 4.2)):
        via(board, gnd, x, y)

    # ---- power fanout vias to the inner planes ----
    def via_ok(kx, ky):
        x, y = kx - CX, CY - ky
        if math.hypot(x, y) > BOARD_R - 0.6 or y > GROUND_EDGE_Y - 0.6:
            return False
        if math.hypot(x - tp[0], y - tp[1]) < 4.5:
            return False
        return _seg_dist_math((x, y), tp, (tp[0] + tx, tp[1] + ty)) > 0.9

    placed, failed = fanout.run(board, P, via_ok)
    print(f"fanout vias: {placed} placed, no room at: {', '.join(failed) or '-'}")
    # escape vias for MCU signals the autorouter can't get out of the 0.5 mm-pitch land pattern
    placed, failed = fanout.run(board, P, via_ok, nets=("SENSE_ADC", "VBAT_SENSE", "LED_DRV", "RXD", "TXD", "IO0"),
                                only_refs=("U1",), width=0.15)
    print(f"escape vias: {placed} placed, no room at: {', '.join(failed) or '-'}")

    pcbnew.SaveBoard(os.path.join(OUT, PROJECT + ".kicad_pcb"), board)
    write_project()
    print("antenna arm+stub length: %.1f mm" % footprints.ifa_length())
    print("parts:", len(PARTS), "nets:", len(nets))


if __name__ == "__main__":
    main()
