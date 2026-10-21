"""Generates the KiCad schematic from design.PARTS.

Every pin gets a net label at its end point (no wires), so connectivity is
exactly the netlist in design.py. Unused signal pins get no-connect flags.
"""
import copy
import uuid

from design import PARTS, PWR_FLAGS, PROJECT
from sexp import Sym, dump, find, find1, parse

SYMDIR = "C:/Program Files/KiCad/10.0/share/kicad/symbols/"
# symbol alias -> (library file, symbol in that file)
FLATTEN = {"Transistor_FET:AO3401A": ("Transistor_FET", "TP0610T")}

_lib_cache = {}


def _lib(name):
    if name not in _lib_cache:
        with open(SYMDIR + name + ".kicad_sym", encoding="utf-8") as f:
            _lib_cache[name] = parse(f.read())
    return _lib_cache[name]


def lib_symbol(lib_id):
    lib, name = FLATTEN.get(lib_id, lib_id.split(":"))
    node = next(s for s in find(_lib(lib), "symbol") if s[1] == name)
    node = copy.deepcopy(node)
    assert not find(node, "extends"), lib_id
    new = lib_id.split(":")[1]
    node[1] = lib_id
    for sub in find(node, "symbol"):
        sub[1] = sub[1].replace(name, new, 1)
    if lib_id in FLATTEN:
        for p in find(node, "property"):
            if p[1] == "Value":
                p[2] = new
            if p[1] == "Footprint":
                p[2] = "Package_TO_SOT_SMD:SOT-23"
    return node


def pins_of(sym):
    out = []

    def walk(n):
        for c in n:
            if isinstance(c, list) and c:
                if c[0] == "pin":
                    at = find1(c, "at")
                    out.append(dict(num=find1(c, "number")[1], type=str(c[1]),
                                    x=float(at[1]), y=float(at[2]), ang=int(float(at[3]))))
                elif c[0] == "symbol":
                    # only unit 0 (common) and unit 1, body style 1
                    parts = c[1].rsplit("_", 2)
                    if parts[-2] in ("0", "1") and parts[-1] in ("0", "1"):
                        walk(c)
                else:
                    walk(c)
    walk(sym)
    return out


def _uid():
    return str(uuid.uuid4())


def _snap(v):
    return round(v / 1.27) * 1.27


def build(path, root_uuid, sym_uuids):
    used = sorted({p["lib"] for p in PARTS} | {"power:PWR_FLAG"})
    libsyms = {lid: lib_symbol(lid) for lid in used}
    items = []

    def place(lib_id, ref, value, x, y, fields, pins_net, in_bom=True, dnp=False, uid=None):
        sym = libsyms[lib_id]
        uid = uid or _uid()
        props = {p[1]: p for p in find(sym, "property")}
        node = [Sym("symbol"), [Sym("lib_id"), lib_id], [Sym("at"), x, y, 0], [Sym("unit"), 1],
                [Sym("exclude_from_sim"), Sym("no")], [Sym("in_bom"), Sym("yes" if in_bom else "no")],
                [Sym("on_board"), Sym("yes")], [Sym("dnp"), Sym("yes" if dnp else "no")],
                [Sym("uuid"), uid]]
        vals = {"Reference": ref, "Value": value, **fields}
        for i, (k, v) in enumerate(vals.items()):
            lp = props.get(k)
            if lp is not None:
                at = find1(lp, "at")
                px, py = x + float(at[1]), y - float(at[2])
                pang = float(at[3]) if len(at) > 3 else 0
                hidden = any(isinstance(e, list) and e and e[0] == "hide" for e in (find1(lp, "effects") or [])) \
                    or k not in ("Reference", "Value")
            else:
                px, py, hidden, pang = x, y + 2.54 * (i + 1), True, 0
            eff = [Sym("effects"), [Sym("font"), [Sym("size"), 1.27, 1.27]]]
            if hidden:
                eff.append([Sym("hide"), Sym("yes")])
            node.append([Sym("property"), k, v, [Sym("at"), px, py, pang], eff])
        for pin in pins_of(sym):
            node.append([Sym("pin"), pin["num"], [Sym("uuid"), _uid()]])
        node.append([Sym("instances"), [Sym("project"), PROJECT,
                                        [Sym("path"), "/" + root_uuid, [Sym("reference"), ref], [Sym("unit"), 1]]]])
        items.append(node)

        # labels / no-connects at pin ends
        seen = {}
        for pin in pins_of(sym):
            px, py = round(x + pin["x"], 2), round(y - pin["y"], 2)
            net = pins_net.get(pin["num"])
            if (px, py) in seen:
                assert seen[(px, py)] == net, f"{ref} stacked pins disagree"
                continue
            seen[(px, py)] = net
            if net is None:
                if pin["type"] != "no_connect":
                    items.append([Sym("no_connect"), [Sym("at"), px, py], [Sym("uuid"), _uid()]])
                continue
            ang = (pin["ang"] + 180) % 360
            just = "left" if ang in (0, 90) else "right"
            items.append([Sym("global_label"), net, [Sym("shape"), Sym("passive")],
                          [Sym("at"), px, py, ang], [Sym("fields_autoplaced"), Sym("yes")],
                          [Sym("effects"), [Sym("font"), [Sym("size"), 1.0, 1.0]], [Sym("justify"), Sym(just)]],
                          [Sym("uuid"), _uid()],
                          [Sym("property"), "Intersheetrefs", "${INTERSHEET_REFS}", [Sym("at"), px, py, 0],
                           [Sym("effects"), [Sym("font"), [Sym("size"), 1.0, 1.0]], [Sym("hide"), Sym("yes")]]]])

    # --- layout: groups in columns, parts stacked ---
    groups = []
    for p in PARTS:
        if p["group"] not in groups:
            groups.append(p["group"])
    # group -> (x of first column, y of title, column pitch); parts wrap into new columns
    col = {"MCU": (50.8, 45.72, 27.94), "RF": (175.26, 45.72, 25.4), "Power": (205.74, 45.72, 25.4),
           "Sensor": (259.08, 45.72, 25.4), "UI": (312.42, 45.72, 25.4),
           "Tape contacts": (365.76, 45.72, 25.4), "Programming": (355.6, 132.08, 20.32)}
    y_max = 245.0

    def label_len(net):
        return 0.8 * len(net) + 3.0 if net else 0.0

    for g in groups:
        x0, y0, pitch = col[g]
        x, y = x0, y0 + 10.16
        items.append([Sym("text"), g.upper(), [Sym("at"), x0 - 10.16, y0, 0],
                      [Sym("effects"), [Sym("font"), [Sym("size"), 2.0, 2.0], [Sym("bold"), Sym("yes")]],
                       [Sym("justify"), Sym("left"), Sym("bottom")]], [Sym("uuid"), _uid()]])
        for p in [p for p in PARTS if p["group"] == g]:
            sym = libsyms[p["lib"]]
            pins = pins_of(sym)
            ys = [q["y"] for q in pins] or [0]
            top, bot = max(ys), min(ys)
            up = max([label_len(p["pins"].get(q["num"])) for q in pins if q["ang"] == 270] or [0])
            down = max([label_len(p["pins"].get(q["num"])) for q in pins if q["ang"] == 90] or [0])
            height = top - bot + up + down + 7.62
            if y + height > y_max and y > y0 + 10.16:
                x, y = x + pitch, y0 + 10.16
            yy = _snap(y + top + up + 2.54)
            fields = {"Footprint": p["fp"], "Datasheet": "", "LCSC": p["lcsc"]}
            place(p["lib"], p["ref"], p["value"], _snap(x), yy, fields, p["pins"],
                  in_bom=p.get("bom", True), dnp=p.get("dnp", False), uid=sym_uuids[p["ref"]])
            y = yy - bot + down + 5.08
            if p["ref"] == "U1":   # decoupling etc. go in the columns right of the MCU
                x, y = x + 63.5, y0 + 10.16

    # power flags
    for i, net in enumerate(PWR_FLAGS, 1):
        place("power:PWR_FLAG", f"#FLG0{i}", "PWR_FLAG", _snap(205.74 + 25.4 * (i - 1)), 266.7,
              {"Footprint": "", "Datasheet": ""}, {"1": net}, in_bom=False)

    sch = [Sym("kicad_sch"), [Sym("version"), 20231120], [Sym("generator"), "kinetape_gen"],
           [Sym("generator_version"), "1.0"], [Sym("uuid"), root_uuid], [Sym("paper"), "A3"],
           [Sym("title_block"), [Sym("title"), "KineTape puck (Ø25.4 mm)"], [Sym("rev"), "A"],
            [Sym("comment"), 1, "ESP32-PICO-V3-02 + printed IFA, battery & FSR in the tape"],
            [Sym("comment"), 2, "Generated by hardware/scripts/build.py - edit design.py, not this file"]],
           [Sym("lib_symbols"), *libsyms.values()], *items,
           [Sym("sheet_instances"), [Sym("path"), "/", [Sym("page"), "1"]]]]
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(dump(sch) + "\n")
