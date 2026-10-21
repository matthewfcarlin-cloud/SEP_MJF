"""Fabrication outputs for JLCPCB (run after build.py + route.py).

  "C:/Program Files/KiCad/10.0/bin/python.exe" scripts/export.py

Writes hardware/fab/:
  kinetape_puck_gerbers.zip   Gerbers + Excellon drill (upload to JLCPCB)
  kinetape_puck_bom.csv       JLCPCB BOM (Comment, Designator, Footprint, LCSC Part #)
  kinetape_puck_cpl.csv       JLCPCB pick-and-place (Designator, Mid X, Mid Y, Layer, Rotation)
  kinetape_puck_schematic.pdf
  kinetape_puck.step          3D model for the enclosure
"""
import csv
import os
import shutil
import subprocess
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from design import PARTS, PROJECT  # noqa: E402

CLI = "C:/Program Files/KiCad/10.0/bin/kicad-cli.exe"
OUT = os.path.dirname(HERE)
FAB = os.path.join(OUT, "fab")
PCB = os.path.join(OUT, PROJECT + ".kicad_pcb")
SCH = os.path.join(OUT, PROJECT + ".kicad_sch")
LAYERS = "F.Cu,In1.Cu,In2.Cu,B.Cu,F.Paste,B.Paste,F.Silkscreen,B.Silkscreen,F.Mask,B.Mask,Edge.Cuts"


def cli(*args):
    subprocess.run([CLI, *args], check=True, capture_output=True)


def main():
    shutil.rmtree(FAB, ignore_errors=True)
    gdir = os.path.join(FAB, "gerbers")
    os.makedirs(gdir)

    # refuse to export a board that fails DRC / parity
    rpt = os.path.join(FAB, "drc.rpt")
    cli("pcb", "drc", "--schematic-parity", "--refill-zones", "--severity-all", "-o", rpt, PCB)
    with open(rpt, encoding="utf-8") as f:
        txt = f.read()
    for line in ("Found 0 DRC violations", "Found 0 unconnected pads", "Found 0 Footprint errors"):
        assert line in txt, f"DRC not clean ({line!r} missing) - see {rpt}"

    cli("pcb", "export", "gerbers", "--layers", LAYERS, "--no-protel-ext", "--subtract-soldermask",
        "-o", gdir + "/", PCB)
    cli("pcb", "export", "drill", "--format", "excellon", "--drill-origin", "absolute",
        "--excellon-units", "mm", "-o", gdir + "/", PCB)
    zpath = os.path.join(FAB, PROJECT + "_gerbers.zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for fn in sorted(os.listdir(gdir)):
            z.write(os.path.join(gdir, fn), fn)

    # BOM (JLCPCB format), straight from design.py
    groups = {}
    for p in PARTS:
        if p.get("dnp") or not p.get("bom", True) or not p["lcsc"]:
            continue
        key = (p.get("bom_value", p["value"]), p["fp"].split(":")[1], p["lcsc"])
        groups.setdefault(key, []).append(p["ref"])
    with open(os.path.join(FAB, PROJECT + "_bom.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["Comment", "Designator", "Footprint", "LCSC Part #"])
        for (val, fp, lcsc), refs in sorted(groups.items(), key=lambda kv: kv[1][0]):
            w.writerow([val, ",".join(sorted(refs, key=lambda r: (r.rstrip("0123456789"), int(r[len(r.rstrip("0123456789")):])))), fp, lcsc])

    # CPL (JLCPCB format) from KiCad's position export
    pos = os.path.join(FAB, "pos.csv")
    cli("pcb", "export", "pos", "--format", "csv", "--units", "mm", "--side", "both",
        "--exclude-dnp", "-o", pos, PCB)
    placed = {p["ref"] for p in PARTS if p["lcsc"] and not p.get("dnp") and p.get("bom", True)}
    with open(pos, encoding="utf-8") as f, \
            open(os.path.join(FAB, PROJECT + "_cpl.csv"), "w", newline="", encoding="utf-8") as g:
        w = csv.writer(g)
        w.writerow(["Designator", "Mid X", "Mid Y", "Layer", "Rotation"])
        for row in csv.DictReader(f):
            if row["Ref"] not in placed:
                continue
            w.writerow([row["Ref"], f'{float(row["PosX"]):.4f}mm', f'{float(row["PosY"]):.4f}mm',
                        "Top" if row["Side"] == "top" else "Bottom", f'{float(row["Rot"]) % 360:.0f}'])
    os.remove(pos)

    cli("sch", "export", "pdf", "-o", os.path.join(FAB, PROJECT + "_schematic.pdf"), SCH)
    cli("pcb", "export", "step", "--subst-models", "--force", "-o", os.path.join(FAB, PROJECT + ".step"), PCB)
    print("fab outputs in", FAB)
    for fn in sorted(os.listdir(FAB)):
        print("  ", fn)


if __name__ == "__main__":
    main()
