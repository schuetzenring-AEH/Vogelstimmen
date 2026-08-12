"""Append One-Shot symbols C20/R20/R21/D23/Q7 to vogelstimmen_v3.0.kicad_sch."""
from pathlib import Path
import re
import uuid as uuidlib

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_sch")
PROJECT = "vogelstimmen_v2.5"
SHEET = "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"


def uid(suffix: str) -> str:
    return str(uuidlib.uuid5(uuidlib.NAMESPACE_URL, f"vogelstimmen-oneshot-{suffix}"))


def prop(name: str, value: str, x: float, y: float, hide: bool = False) -> str:
    hide_line = "\n\t\t\t(hide yes)" if hide else ""
    return f"""\t\t(property "{name}" "{value}"
\t\t\t(at {x} {y} 0){hide_line}
\t\t\t(show_name no)
\t\t\t(do_not_autoplace no)
\t\t\t(effects
\t\t\t\t(font
\t\t\t\t\t(size 1.27 1.27)
\t\t\t\t)
\t\t\t)
\t\t)"""


def symbol_block(
    lib_id: str,
    x: float,
    y: float,
    angle: int,
    ref: str,
    value: str,
    footprint: str,
    pins: list[str],
    extra_props: list[tuple[str, str]] | None = None,
) -> str:
    u = uid(ref)
    # label offset to the right of symbol
    rx, ry = x + 5.08, y
    vx, vy = x + 5.08, y + 2.54
    pin_uuids = "\n".join(
        f'\t\t(pin "{p}"\n\t\t\t(uuid "{uid(f"{ref}-pin-{p}")}")\n\t\t)' for p in pins
    )
    extras = ""
    if extra_props:
        for n, v in extra_props:
            extras += "\n" + prop(n, v, x, y, hide=True)
    return f"""\t(symbol
\t\t(lib_id "{lib_id}")
\t\t(at {x} {y} {angle})
\t\t(unit 1)
\t\t(body_style 1)
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(dnp no)
\t\t(uuid "{u}")
{prop("Reference", ref, rx, ry)}
{prop("Value", value, vx, vy)}
{prop("Footprint", footprint, x, y, hide=True)}
{prop("Datasheet", "", x, y, hide=True)}
{prop("Description", "", x, y, hide=True)}{extras}
{pin_uuids}
\t\t(instances
\t\t\t(project "{PROJECT}"
\t\t\t\t(path "{SHEET}"
\t\t\t\t\t(reference "{ref}")
\t\t\t\t\t(unit 1)
\t\t\t\t)
\t\t\t)
\t\t)
\t)"""


def label(name: str, x: float, y: float, angle: int = 0) -> str:
    return f"""\t(label "{name}"
\t\t(at {x} {y} {angle})
\t\t(effects
\t\t\t(font
\t\t\t\t(size 1.27 1.27)
\t\t\t)
\t\t)
\t\t(uuid "{uid(f"lbl-{name}-{x}-{y}")}")
\t)"""


def wire(x1: float, y1: float, x2: float, y2: float, key: str) -> str:
    return f"""\t(wire
\t\t(pts
\t\t\t(xy {x1} {y1}) (xy {x2} {y2})
\t\t)
\t\t(stroke
\t\t\t(width 0)
\t\t\t(type default)
\t\t)
\t\t(uuid "{uid(f"wire-{key}")}")
\t)"""


def junction(x: float, y: float, key: str) -> str:
    return f"""\t(junction
\t\t(at {x} {y})
\t\t(diameter 0)
\t\t(color 0 0 0 0)
\t\t(uuid "{uid(f"junc-{key}")}")
\t)"""


raw = SCH.read_text(encoding="utf-8")
if '(property "Reference" "C20"' in raw:
    print("C20 already present — abort")
    raise SystemExit(1)

parts: list[str] = []

parts.append(
    '\t(text "One-Shot E-CNT-03"\n'
    "\t\t(exclude_from_sim no)\n"
    "\t\t(at 210.82 124.46 0)\n"
    "\t\t(effects\n"
    "\t\t\t(font\n"
    "\t\t\t\t(size 1.27 1.27)\n"
    "\t\t\t)\n"
    "\t\t\t(justify left)\n"
    "\t\t)\n"
    f'\t\t(uuid "{uid("title")}")\n'
    "\t)"
)

# C20 @ 215.90, 133.35 — pin1 top 129.54 = 12V_SW, pin2 bot 137.16 = CNT_PULSE
parts.append(
    symbol_block(
        "Device:C",
        215.9,
        133.35,
        0,
        "C20",
        "1u/25V",
        "Capacitor_SMD:C_0603_1608Metric",
        ["1", "2"],
        [("LCSC", "C23630")],
    )
)
# R20 @ 228.60, 140.97 — pin1 137.16 CNT_PULSE, pin2 144.78 GND
parts.append(
    symbol_block(
        "Device:R",
        228.6,
        140.97,
        0,
        "R20",
        "100k",
        "Resistor_SMD:R_0603_1608Metric",
        ["1", "2"],
        [("LCSC", "C25803")],
    )
)
# D23 @ 215.90, 140.97 rot 270 — K up CNT_PULSE, A down GND
parts.append(
    symbol_block(
        "Device:D",
        215.9,
        140.97,
        270,
        "D23",
        "1N4148WS",
        "Diode_SMD:D_SOD-323",
        ["1", "2"],
        [("LCSC", "C118873"), ("Sim.Device", "D"), ("Sim.Pins", "1=K 2=A")],
    )
)
# R21 @ 241.30, 137.16 rot 90 — left CNT_PULSE, right CNT_GATE / Q7.G
parts.append(
    symbol_block(
        "Device:R",
        241.3,
        137.16,
        90,
        "R21",
        "100R",
        "Resistor_SMD:R_0603_1608Metric",
        ["1", "2"],
        [("LCSC", "C25796")],
    )
)
# Q7 @ 250.19, 137.16 — G=245.11, D=252.73/132.08, S=252.73/142.24
parts.append(
    symbol_block(
        "Transistor_FET:2N7002",
        250.19,
        137.16,
        0,
        "Q7",
        "AO3400",
        "Package_TO_SOT_SMD:SOT-23",
        ["1", "2", "3"],
        [("LCSC", "C20917"), ("Description", "30V N-MOS AO3400 SOT-23")],
    )
)

parts.append(label("12V_SW", 215.9, 129.54, 90))
parts.append(label("CNT_PULSE", 222.25, 137.16, 0))
parts.append(label("GND", 228.6, 144.78, 0))
parts.append(label("GND", 215.9, 144.78, 0))
parts.append(label("CNT_GATE", 245.11, 134.62, 0))
parts.append(label("CNT_LO", 252.73, 132.08, 90))
parts.append(label("GND", 252.73, 142.24, 0))

parts.append(wire(215.9, 137.16, 228.6, 137.16, "c20-r20"))
parts.append(wire(228.6, 137.16, 237.49, 137.16, "r20-r21"))
parts.append(junction(215.9, 137.16, "c20"))
parts.append(junction(228.6, 137.16, "r20"))

block = "\n".join(parts)

# Shorten old E-CNT-03 text note
raw2, n = re.subn(
    r'\t\(text "E-CNT-03: Hengstler[\s\S]*?\n\t\)',
    (
        '\t(text "E-CNT-03: see One-Shot symbols C20/R20/R21/D23/Q7; '
        'J5+=12V_SW J5-=CNT_LO; D10 Freilauf"\n'
        "\t\t(exclude_from_sim no)\n"
        "\t\t(at 210.82 152.4 0)\n"
        "\t\t(effects\n"
        "\t\t\t(font\n"
        "\t\t\t\t(size 1.016 1.016)\n"
        "\t\t\t)\n"
        "\t\t\t(justify left)\n"
        "\t\t)\n"
        f'\t\t(uuid "{uid("note-short")}")\n'
        "\t)"
    ),
    raw,
    count=1,
)
if n != 1:
    print(f"warning: note replace count={n}")
    raw2 = raw

stripped = raw2.rstrip()
if not stripped.endswith(")"):
    raise SystemExit("unexpected file end")
body = stripped[:-1].rstrip() + "\n\n" + block + "\n)\n"
SCH.write_text(body, encoding="utf-8")

ok = all(f'(property "Reference" "{r}"' in body for r in ["C20", "R20", "R21", "D23", "Q7"])
print("OK appended" if ok else "FAIL missing refs")
for net in ["12V_SW", "CNT_PULSE", "CNT_GATE", "CNT_LO", "GND"]:
    print(f"  label {net}:", body.count(f'(label "{net}"'))
