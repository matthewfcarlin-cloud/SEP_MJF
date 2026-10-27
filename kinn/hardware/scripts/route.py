"""Autoroutes kinetape_puck.kicad_pcb with Freerouting (tools/freerouting.jar),
then removes dangling stubs, adds GND stitching vias wherever they fit, and
refills the pours.

Run with KiCad's Python after build.py:
  "C:/Program Files/KiCad/10.0/bin/python.exe" scripts/route.py [passes]
Freerouting 1.9 needs a display: a window opens briefly while it routes.
"""
import math
import os
import subprocess
import sys

import pcbnew

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from design import BOARD_R, GROUND_EDGE_Y, PARTS  # noqa: E402
from fanout import _rect_dist, _seg_dist  # noqa: E402
import finish  # noqa: E402

OUT = os.path.dirname(HERE)
PCB = os.path.join(OUT, "kinetape_puck.kicad_pcb")
DSN = os.path.join(OUT, "kinetape_puck.dsn")
SES = os.path.join(OUT, "kinetape_puck.ses")
JAR = os.path.join(OUT, "tools", "freerouting.jar")
CX, CY = 100.0, 100.0
mm = pcbnew.ToMM


def remove_dangling(board):
    """Drop dangling track stubs and unused vias (Freerouting / escape leftovers)."""
    removed = 0
    while True:
        board.BuildConnectivity()
        conn = board.GetConnectivity()
        victims = []
        for t in list(board.Tracks()):
            if t.GetNetname() in ("RF_IN", "ANT_FEED"):
                continue
            if t.GetClass() == "PCB_VIA":
                if t.GetNetname() == "GND":
                    continue  # stitching / plane vias are fine
                layers = sum(conn.IsConnectedOnLayer(t, l) for l in (pcbnew.F_Cu, pcbnew.B_Cu))
                if layers < 2 and t.GetNetname() not in ("+3V3",):
                    victims.append(t)
            elif conn.TestTrackEndpointDangling(t, False):
                victims.append(t)
        if not victims:
            return removed
        for t in victims:
            # an escape via may own a stub: remove it together with the via
            board.Delete(t)
            removed += 1


def stitch(board, pitch=1.2):
    """GND vias on a grid wherever they clear everything else by >= 0.2 mm."""
    gnd = board.FindNet("GND")
    tp = next(p for p in PARTS if p["ref"] == "TS1")["pos"]
    pads = []
    for fp in board.GetFootprints():
        for p in fp.Pads():
            if fp.GetReference() == "AE1":
                continue
            bb = p.GetBoundingBox()
            pads.append((mm(bb.GetLeft()), mm(bb.GetTop()), mm(bb.GetRight()), mm(bb.GetBottom())))
    segs, vias = [], []
    for t in board.GetTracks():
        if t.GetClass() == "PCB_VIA":
            vias.append((mm(t.GetPosition().x), mm(t.GetPosition().y)))
        else:
            segs.append(((mm(t.GetStart().x), mm(t.GetStart().y)), (mm(t.GetEnd().x), mm(t.GetEnd().y)),
                         mm(t.GetWidth()) / 2))
    n = 0
    steps = int(BOARD_R / pitch) + 1
    for i in range(-steps, steps + 1):
        for j in range(-steps, steps + 1):
            x, y = i * pitch, j * pitch + (pitch / 2 if i % 2 else 0)
            if math.hypot(x, y) > BOARD_R - 0.7 or y > GROUND_EDGE_Y - 0.6:
                continue
            if math.hypot(x - tp[0], y - tp[1]) < 4.6:
                continue
            kx, ky = CX + x, CY - y
            if any(_rect_dist(kx, ky, b) < 0.25 + 0.2 for b in pads):
                continue
            if any(_seg_dist(kx, ky, a, b) < 0.25 + w + 0.2 for a, b, w in segs):
                continue
            if any(math.hypot(kx - vx, ky - vy) < 0.9 for vx, vy in vias):
                continue
            v = pcbnew.PCB_VIA(board)
            v.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(kx), pcbnew.FromMM(ky)))
            v.SetWidth(pcbnew.FromMM(0.5))
            v.SetDrill(pcbnew.FromMM(0.3))
            v.SetNet(gnd)
            board.Add(v)
            vias.append((kx, ky))
            n += 1
    return n


def main():
    passes = sys.argv[1] if len(sys.argv) > 1 else "40"
    board = pcbnew.LoadBoard(PCB)
    assert pcbnew.ExportSpecctraDSN(board, DSN), "DSN export failed"
    if os.path.exists(SES):
        os.remove(SES)
    subprocess.run(["java", "-jar", JAR, "-de", DSN, "-do", SES,
                    "-mp", passes, "-mt", "1"], check=True, cwd=OUT)
    assert os.path.exists(SES), "Freerouting produced no session"
    assert pcbnew.ImportSpecctraSES(board, SES), "SES import failed"
    pcbnew.SaveBoard(PCB, board, True)
    board = pcbnew.LoadBoard(PCB)  # SWIG track list is unusable right after the SES import
    print("dangling stubs removed:", remove_dangling(board))
    pcbnew.SaveBoard(PCB, board, True)
    print("unconnected after finishing router:", finish.run(PCB))
    board = pcbnew.LoadBoard(PCB)
    print("stitching vias added:", stitch(board))
    pcbnew.ZONE_FILLER(board).Fill(board.Zones())
    pcbnew.SaveBoard(PCB, board, True)
    print("routed:", len(board.GetTracks()), "track/via items")


if __name__ == "__main__":
    main()
