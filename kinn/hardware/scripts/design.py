"""KineTape puck: single source of truth for the circuit and placement.

Coordinates for PCB placement are in mm, math orientation (+y up), relative to
the board centre. Board is a 25.4 mm (1 in) circle.
"""

BOARD_R = 12.7
GROUND_EDGE_Y = 6.5          # ground stops here; antenna lives above it
PROJECT = "kinetape_puck"

# LCSC numbers (verify in the JLCPCB BOM tool before ordering)
LCSC = {
    "R10k": "C25744", "R1k": "C11702", "R100": "C25076", "R470": "C25117",
    "R1M": "C26083", "R0": "C17168", "C100n": "C1525", "C1u": "C52923",
    "C10u": "C15525", "LED": "C72043", "LDO": "C82942", "PFET": "C15127",
    "ESD": "C2763588", "PICO": "C908392", "SPRING": "C17702549",
}

R0402 = "Resistor_SMD:R_0402_1005Metric"
C0402 = "Capacitor_SMD:C_0402_1005Metric"


def R(ref, val, lcsc, a, b, pos, rot=0, group="", dnp=False):
    return dict(ref=ref, lib="Device:R", value=val, fp=R0402, lcsc=lcsc,
                pins={"1": a, "2": b}, pos=pos, rot=rot, group=group, dnp=dnp)


def C(ref, val, lcsc, a, b, pos, rot=0, group="", dnp=False):
    return dict(ref=ref, lib="Device:C", value=val, fp=C0402, lcsc=lcsc,
                pins={"1": a, "2": b}, pos=pos, rot=rot, group=group, dnp=dnp)


# ESP32-PICO-V3-02 pin -> net (unlisted pins are left unconnected / NC)
U1_PINS = {
    "1": "+3V3", "2": "RF_IN", "3": "+3V3", "4": "+3V3",
    "9": "EN", "10": "SENSE_ADC", "11": "VBAT_SENSE",
    "19": "+3V3", "20": "TOUCH_IO", "22": "LED_DRV", "23": "IO0",
    "37": "+3V3", "40": "RXD", "41": "TXD", "43": "+3V3", "46": "+3V3",
    "49": "GND",
}

PARTS = [
    # ---- MCU -------------------------------------------------------------
    dict(ref="U1", lib="MCU_Espressif:ESP32-PICO-V3-02", value="ESP32-PICO-V3-02",
         fp="KineTape:ESP32-PICO-V3-02_LGA48_7x7mm", lcsc=LCSC["PICO"],
         pins=U1_PINS, pos=(0, 0.8), rot=0, group="MCU"),
    C("C5", "10uF", LCSC["C10u"], "+3V3", "GND", (4.6, 3.6), 90, "MCU"),
    C("C6", "100nF", LCSC["C100n"], "+3V3", "GND", (-3.9, 5.3), 0, "MCU"),
    C("C2", "100nF", LCSC["C100n"], "+3V3", "GND", (-1.0, 5.3), 0, "MCU"),
    C("C7", "100nF", LCSC["C100n"], "+3V3", "GND", (2.95, 5.3), 0, "MCU"),
    C("C8", "100nF", LCSC["C100n"], "+3V3", "GND", (-0.8, -3.9), 0, "MCU"),
    R("R3", "10k", LCSC["R10k"], "+3V3", "EN", (-4.9, 0.4), 90, "MCU"),
    C("C9", "1uF", LCSC["C1u"], "EN", "GND", (-6.0, 0.4), 90, "MCU"),
    R("R4", "10k", LCSC["R10k"], "+3V3", "IO0", (4.85, 5.3), 0, "MCU"),

    # ---- RF: pi network (C11/C12 DNP until tuned with a VNA) + printed IFA --
    C("C11", "DNP", "", "GND", "RF_IN", (-6.3, 3.05), 0, "RF", dnp=True),
    R("R10", "0R", LCSC["R0"], "RF_IN", "ANT_FEED", (-5.3, 4.6), 90, "RF"),
    C("C12", "DNP", "", "GND", "ANT_FEED", (-6.75, 5.6), 0, "RF", dnp=True),
    dict(ref="AE1", lib="Device:Antenna_Shield", value="IFA 2.4GHz",
         fp="KineTape:Antenna_IFA_2G4_Puck", lcsc="", pins={"1": "ANT_FEED", "2": "GND"},
         pos=(0, 0), rot=0, group="RF", bom=False),

    # ---- Power: battery from tape -> reverse protection -> LDO ------------
    dict(ref="Q1", lib="Transistor_FET:AO3401A", value="AO3401A",
         fp="Package_TO_SOT_SMD:SOT-23", lcsc=LCSC["PFET"],
         pins={"1": "GND", "2": "VBAT", "3": "VBAT_IN"}, pos=(7.0, -2.6), rot=0, group="Power"),
    dict(ref="D1", lib="Device:D_TVS", value="ESD 7V", fp="Diode_SMD:D_0402_1005Metric",
         lcsc=LCSC["ESD"], pins={"1": "VBAT_IN", "2": "GND"}, pos=(9.7, -2.6), rot=90, group="Power"),
    C("C1", "10uF", LCSC["C10u"], "VBAT", "GND", (10.1, 1.2), 90, "Power"),
    dict(ref="U2", lib="Regulator_Linear:ME6211C33M5", value="ME6211C33M5G-N",
         fp="Package_TO_SOT_SMD:SOT-23-5", lcsc=LCSC["LDO"],
         pins={"1": "VBAT", "2": "GND", "3": "VBAT", "5": "+3V3"}, pos=(7.4, 1.2), rot=0, group="Power"),
    C("C3", "10uF", LCSC["C10u"], "+3V3", "GND", (4.6, 1.2), 90, "Power"),
    R("R1", "1M", LCSC["R1M"], "VBAT", "VBAT_SENSE", (-7.0, 1.4), 90, "Power"),
    R("R2", "1M", LCSC["R1M"], "VBAT_SENSE", "GND", (-8.3, 1.4), 90, "Power"),
    C("C4", "100nF", LCSC["C100n"], "VBAT_SENSE", "GND", (-9.6, 1.4), 90, "Power"),

    # ---- Sensor interface (thin-film FSR in the tape) ---------------------
    R("R7", "100R", LCSC["R100"], "+3V3", "SENS_A", (-7.0, -0.9), 90, "Sensor"),
    dict(ref="D2", lib="Device:D_TVS", value="ESD 7V", fp="Diode_SMD:D_0402_1005Metric",
         lcsc=LCSC["ESD"], pins={"1": "SENS_A", "2": "GND"}, pos=(-9.6, -0.9), rot=90, group="Sensor"),
    R("R8", "10k", LCSC["R10k"], "SENS_B", "GND", (-7.0, -3.2), 90, "Sensor"),
    dict(ref="D3", lib="Device:D_TVS", value="ESD 7V", fp="Diode_SMD:D_0402_1005Metric",
         lcsc=LCSC["ESD"], pins={"1": "SENS_B", "2": "GND"}, pos=(-9.6, -3.2), rot=90, group="Sensor"),
    R("R9", "1k", LCSC["R1k"], "SENS_B", "SENSE_ADC", (-4.9, -2.6), 90, "Sensor"),
    C("C10", "100nF", LCSC["C100n"], "SENSE_ADC", "GND", (-6.0, -2.6), 90, "Sensor"),

    # ---- UI: status LED + capacitive touch pad ----------------------------
    R("R5", "470R", LCSC["R470"], "LED_DRV", "LED_A", (4.6, -4.6), 90, "UI"),
    dict(ref="LED1", lib="Device:LED", value="Green", fp="LED_SMD:LED_0603_1608Metric",
         lcsc=LCSC["LED"], pins={"1": "GND", "2": "LED_A"}, pos=(5.3, -7.25), rot=90, group="UI"),
    R("R6", "470R", LCSC["R470"], "TOUCH_IO", "TOUCH", (0.9, -4.1), 270, "UI"),
    dict(ref="TS1", lib="Connector:TestPoint", value="Touch",
         fp="KineTape:TouchPad_D6.5mm", lcsc="", pins={"1": "TOUCH"},
         pos=(0, -8.5), rot=0, group="UI", bom=False),

    # ---- Bottom: spring contacts to the tape ------------------------------
    *[dict(ref=f"J{i}", lib="Connector_Generic:Conn_01x01", value=v,
           fp="KineTape:SpringContact_Harwin_P70-1000045R", lcsc=LCSC["SPRING"],
           pins={"1": n}, pos=p, rot=0, side="B", group="Tape contacts", bom_value="P70-1000045R")
      for i, (v, n, p) in enumerate([
          ("VBAT", "VBAT_IN", (8.8, 1.5)), ("GND", "GND", (6.5, -7.2)),
          ("SENS_A", "SENS_A", (-8.8, 1.5)), ("SENS_B", "SENS_B", (-6.5, -7.2))], 1)],

    # ---- Bottom: programming / debug test pads (pogo jig) -----------------
    *[dict(ref=f"TP{i}", lib="Connector:TestPoint", value=v,
           fp="TestPoint:TestPoint_Pad_D1.0mm", lcsc="", pins={"1": n}, pos=p,
           rot=0, side="B", group="Programming", bom=False)
      for i, (v, n, p) in enumerate([
          ("3V3", "+3V3", (8.5, -1.0)), ("GND", "GND", (8.5, -3.0)), ("TXD", "TXD", (4.5, -1.0)),
          ("RXD", "RXD", (6.5, -1.0)), ("EN", "EN", (4.5, -3.0)), ("IO0", "IO0", (6.5, -3.0))], 1)],
]

# Schematic-only power flags
PWR_FLAGS = ["GND", "VBAT", "VBAT_IN"]
