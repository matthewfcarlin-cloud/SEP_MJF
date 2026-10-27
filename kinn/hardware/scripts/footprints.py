"""Generates the custom KineTape.pretty footprints."""
import math
import os

from design import BOARD_R, GROUND_EDGE_Y


def _hdr(name, descr, attr="smd", ref_y=-4.6):
    return [
        f'(footprint "{name}"',
        '\t(version 20240108)', '\t(generator "kinetape_gen")', '\t(layer "F.Cu")',
        f'\t(descr "{descr}")',
        f'\t(property "Reference" "REF**" (at 0 {ref_y} 0) (layer "F.SilkS") '
        '(effects (font (size 0.6 0.6) (thickness 0.1))))',
        f'\t(property "Value" "{name}" (at 0 {-ref_y} 0) (layer "F.Fab") '
        '(effects (font (size 0.6 0.6) (thickness 0.1))))',
        f'\t(attr {attr})',
    ]


def _rect(layer, x0, y0, x1, y1, w=0.1):
    return (f'\t(fp_rect (start {x0} {y0}) (end {x1} {y1}) (stroke (width {w}) (type solid)) '
            f'(fill none) (layer "{layer}"))')


def _circle(layer, r, w=0.05, x=0, y=0):
    return (f'\t(fp_circle (center {x} {y}) (end {x + r:.3f} {y}) (stroke (width {w}) (type solid)) '
            f'(fill none) (layer "{layer}"))')


# Stand-in 3D model: KiCad's 7x7 mm QFN-48 body (no official PICO-V3-02 model ships with KiCad),
# z-scaled from ~0.9 mm to the PICO's 1.11 mm nominal height.
PICO_MODEL_PATH = "${KICAD10_3DMODEL_DIR}/Package_DFN_QFN.3dshapes/QFN-48-1EP_7x7mm_P0.5mm_EP5.15x5.15mm.step"
PICO_MODEL = (f'(model "{PICO_MODEL_PATH}" (offset (xyz 0 0 0)) (scale (xyz 1 1 1.233)) '
              '(rotate (xyz 0 0 0)))')


def pico_lga48():
    """ESP32-PICO-V3-02, LGA-48 7x7 mm, per Espressif datasheet v1.4 fig. 16.

    Signal lands 0.68 x 0.25 mm (copper defined), pitch 0.5 mm, 6.73 mm between
    opposite land centres (inner land edge = package pad inner edge, 3.025 mm). Thermal pad: 4.5 mm copper, 4.0 mm mask-defined opening,
    4 paste windows, 5 x 0.25 mm GND vias.
    """
    L = _hdr("ESP32-PICO-V3-02_LGA48_7x7mm",
             "Espressif ESP32-PICO-V3-02 SiP, LGA-48 7x7mm P0.5mm, thermal pad")
    L += [_rect("F.Fab", -3.5, -3.5, 3.5, 3.5), _rect("F.CrtYd", -3.95, -3.95, 3.95, 3.95, 0.05)]
    # silk corner marks + pin 1 dot
    for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
        x, y = 3.85 * sx, 3.85 * sy
        L.append(f'\t(fp_line (start {x} {y}) (end {x - 0.6 * sx} {y}) (stroke (width 0.12) (type solid)) (layer "F.SilkS"))')
        L.append(f'\t(fp_line (start {x} {y}) (end {x} {y - 0.6 * sy}) (stroke (width 0.12) (type solid)) (layer "F.SilkS"))')
    L.append('\t(fp_circle (center -4.25 -3.6) (end -4.1 -3.6) (stroke (width 0.1) (type solid)) (fill solid) (layer "F.SilkS"))')

    c, p = 3.365, 0.5
    for i in range(12):
        off = -2.75 + i * p
        pads = [(1 + i, -c, off, 0.68, 0.25), (13 + i, off, c, 0.25, 0.68),
                (25 + i, c, -off, 0.68, 0.25), (37 + i, -off, -c, 0.25, 0.68)]
        for n, x, y, w, h in pads:
            L.append(f'\t(pad "{n}" smd roundrect (at {x:.3f} {y:.3f}) (size {w} {h}) '
                     '(layers "F.Cu" "F.Paste" "F.Mask") (roundrect_rratio 0.2))')
    L.append('\t(pad "49" smd rect (at 0 0) (size 4.5 4.5) (layers "F.Cu" "F.Mask") '
             '(solder_mask_margin -0.25) (zone_connect 2))')
    for sx in (-1, 1):
        for sy in (-1, 1):
            L.append(f'\t(pad "" smd rect (at {1.05 * sx} {1.05 * sy}) (size 1.5 1.5) (layers "F.Paste"))')
    for x, y in ((0, 0), (0, 1.05), (0, -1.05), (1.05, 0), (-1.05, 0)):
        L.append(f'\t(pad "49" thru_hole circle (at {x} {y}) (size 0.5 0.5) (drill 0.25) '
                 '(layers "*.Cu") (zone_connect 2))')
    L.append(f'\t{PICO_MODEL}')
    L.append(')')
    return "ESP32-PICO-V3-02_LGA48_7x7mm", L


def spring_contact():
    """Harwin P70-1000045R SMD spring contact, Ø2.0 mm body, 3.5 mm free height."""
    L = _hdr("SpringContact_Harwin_P70-1000045R",
             "Harwin P70-1000045R SMT spring contact, 3.5mm free / 2.9mm working height, "
             "Ø2.0mm body. Verify pad against Harwin drawing.", ref_y=-2.0)
    L += [_circle("F.Fab", 1.0, 0.1), _circle("F.CrtYd", 1.45), _circle("F.SilkS", 1.45, 0.12)]
    L.append('\t(pad "1" smd circle (at 0 0) (size 2.4 2.4) (layers "F.Cu" "F.Paste" "F.Mask"))')
    L.append(')')
    return "SpringContact_Harwin_P70-1000045R", L


def touch_tail():
    """Tail from the touch electrode centre to R6's TOUCH pad (math coords, relative)."""
    from design import PARTS
    r6 = next(p for p in PARTS if p["ref"] == "R6")["pos"]
    ts = next(p for p in PARTS if p["ref"] == "TS1")["pos"]
    return (r6[0] - ts[0], r6[1] - 0.65 - ts[1])  # R6 is vertical, TOUCH pad facing down


def touch_pad():
    L = _hdr("TouchPad_D6.5mm", "Capacitive touch electrode, Ø6.5mm, under solder mask, with feed tail",
             attr="smd exclude_from_pos_files exclude_from_bom", ref_y=-4.0)
    L += [_circle("F.CrtYd", 3.3), _circle("F.Fab", 3.25, 0.1)]
    tx, ty = touch_tail()
    L.append('\t(pad "1" smd custom (at 0 0) (size 6.5 6.5) (layers "F.Cu") (clearance 0.5) '
             '(options (clearance outline) (anchor circle)) '
             f'(primitives (gr_line (start 0 0) (end {tx:.3f} {-ty:.3f}) (width 0.4))))')
    L.append(')')
    return "TouchPad_D6.5mm", L


# Inverted-F antenna geometry (math coords, board centre origin)
IFA = dict(arm_y=9.3, short_x=-7.4, feed_x=-5.3, arc_r=11.95, end_y=7.8, w=0.5,
           feed_anchor_y=6.2, short_anchor_y=5.9)


def ifa_points():
    """Polyline of the radiating arm: short stub corner -> arm -> arc tail."""
    g = IFA
    x_end = math.sqrt(g["arc_r"] ** 2 - g["arm_y"] ** 2)
    a0 = math.atan2(g["arm_y"], x_end)
    a1 = math.asin(g["end_y"] / g["arc_r"])
    pts = [(g["short_x"], g["arm_y"]), (x_end, g["arm_y"])]
    n = 6
    for i in range(1, n + 1):
        a = a0 + (a1 - a0) * i / n
        pts.append((g["arc_r"] * math.cos(a), g["arc_r"] * math.sin(a)))
    return pts


def ifa_length():
    pts = ifa_points()
    arm = sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))
    return arm + (IFA["arm_y"] - GROUND_EDGE_Y)


def antenna():
    """Printed inverted-F antenna along the top of the puck.

    Footprint origin = board centre. Pad 1 = feed, pad 2 = short to ground.
    Both pads overlap in copper by design, so they form a net tie.
    """
    g = IFA
    L = _hdr("Antenna_IFA_2G4_Puck",
             f"Printed inverted-F antenna, 2.4 GHz, for 25.4 mm round board. Arm+stub length "
             f"{ifa_length():.1f} mm, intentionally long: trim open end while measuring S11.",
             attr="smd exclude_from_pos_files exclude_from_bom", ref_y=-8.0)
    L.insert(5, '\t(net_tie_pad_groups "1,2")')
    w = g["w"]
    fx, fy = g["feed_x"], -g["feed_anchor_y"]
    sx, sy = g["short_x"], -g["short_anchor_y"]
    arm = ifa_points()

    def prim_lines(ax, ay, segs):
        return ' '.join(f'(gr_line (start {x0 - ax:.3f} {-y0 - ay:.3f}) (end {x1 - ax:.3f} {-y1 - ay:.3f}) (width {w}))'
                        for (x0, y0), (x1, y1) in segs)

    feed_segs = [((fx, g["feed_anchor_y"]), (fx, g["arm_y"]))] + list(zip(arm, arm[1:]))
    short_segs = [((sx, g["short_anchor_y"]), (sx, g["arm_y"]))]
    L.append(f'\t(pad "1" smd custom (at {fx} {fy}) (size 0.4 0.4) (layers "F.Cu") '
             f'(options (clearance outline) (anchor rect)) (primitives {prim_lines(fx, fy, feed_segs)}))')
    L.append(f'\t(pad "2" smd custom (at {sx} {sy}) (size 0.5 0.5) (layers "F.Cu") (zone_connect 2) '
             f'(options (clearance outline) (anchor rect)) (primitives {prim_lines(sx, sy, short_segs)}))')
    L.append(f'\t(fp_text user "ANT" (at 0 {-(g["arm_y"] - 1.6)} 0) (layer "F.Fab") '
             '(effects (font (size 0.6 0.6) (thickness 0.1))))')
    L.append(')')
    return "Antenna_IFA_2G4_Puck", L


def write_all(pretty_dir):
    os.makedirs(pretty_dir, exist_ok=True)
    for gen in (pico_lga48, spring_contact, touch_pad, antenna):
        name, lines = gen()
        with open(os.path.join(pretty_dir, name + ".kicad_mod"), "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(lines) + "\n")
