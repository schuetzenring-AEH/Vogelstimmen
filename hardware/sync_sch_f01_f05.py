"""Patch vogelstimmen_v2.4.kicad_sch for F-01…F-05 net/part sync."""
from __future__ import annotations

import re
import uuid
from pathlib import Path

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_sch")


def uid() -> str:
    return str(uuid.uuid4())


def label(name: str, x: float, y: float, rot: int = 0) -> str:
    return f"""\t(label "{name}"
\t\t(at {x} {y} {rot})
\t\t(effects (font (size 1.27 1.27)))
\t\t(uuid "{uid()}")
\t)
"""


def symbol_r(ref: str, value: str, x: float, y: float, rot: int = 0) -> str:
    return f"""\t(symbol
\t\t(lib_id "Device:R")
\t\t(at {x} {y} {rot})
\t\t(unit 1)
\t\t(body_style 1)
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(dnp no)
\t\t(uuid "{uid()}")
\t\t(property "Reference" "{ref}"
\t\t\t(at {x + 2.54} {y} 0)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Value" "{value}"
\t\t\t(at {x + 2.54} {y + 2.54} 0)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Footprint" "Resistor_SMD:R_0402_1005Metric"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Description" "Resistor"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(pin "1" (uuid "{uid()}"))
\t\t(pin "2" (uuid "{uid()}"))
\t\t(instances
\t\t\t(project "vogelstimmen_v2.4"
\t\t\t\t(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
\t\t\t\t\t(reference "{ref}")
\t\t\t\t\t(unit 1)
\t\t\t\t)
\t\t\t)
\t\t)
\t)
"""


def symbol_c(ref: str, value: str, x: float, y: float, rot: int = 0) -> str:
    return f"""\t(symbol
\t\t(lib_id "Device:C")
\t\t(at {x} {y} {rot})
\t\t(unit 1)
\t\t(body_style 1)
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(dnp no)
\t\t(uuid "{uid()}")
\t\t(property "Reference" "{ref}"
\t\t\t(at {x + 2.54} {y} 0)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Value" "{value}"
\t\t\t(at {x + 2.54} {y + 2.54} 0)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Footprint" "Capacitor_SMD:C_0805_2012Metric"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Description" "Unpolarized capacitor"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(pin "1" (uuid "{uid()}"))
\t\t(pin "2" (uuid "{uid()}"))
\t\t(instances
\t\t\t(project "vogelstimmen_v2.4"
\t\t\t\t(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
\t\t\t\t\t(reference "{ref}")
\t\t\t\t\t(unit 1)
\t\t\t\t)
\t\t\t)
\t\t)
\t)
"""


def symbol_d(ref: str, x: float, y: float, rot: int = 0) -> str:
    return f"""\t(symbol
\t\t(lib_id "Device:D")
\t\t(at {x} {y} {rot})
\t\t(unit 1)
\t\t(body_style 1)
\t\t(exclude_from_sim no)
\t\t(in_bom yes)
\t\t(on_board yes)
\t\t(in_pos_files yes)
\t\t(dnp no)
\t\t(uuid "{uid()}")
\t\t(property "Reference" "{ref}"
\t\t\t(at {x} {y - 2.54} 0)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Value" "1N4148WS"
\t\t\t(at {x} {y + 2.54} 0)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Footprint" "Diode_SMD:D_SOD-323"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "LCSC" "C118873"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Description" "Series diode U2 IOx_M -> IOx (F-01)"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Sim.Device" "D"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(property "Sim.Pins" "1=K 2=A"
\t\t\t(at {x} {y} 0)
\t\t\t(hide yes)
\t\t\t(effects (font (size 1.27 1.27)))
\t\t)
\t\t(pin "2" (uuid "{uid()}"))
\t\t(pin "1" (uuid "{uid()}"))
\t\t(instances
\t\t\t(project "vogelstimmen_v2.4"
\t\t\t\t(path "/e63e39d7-6ac0-4ffd-8aa3-1841a4541b55"
\t\t\t\t\t(reference "{ref}")
\t\t\t\t\t(unit 1)
\t\t\t\t)
\t\t\t)
\t\t)
\t)
"""


def main():
    text = SCH.read_text(encoding="utf-8")
    if "D15" in text and 'Reference" "R12"' in text.replace("\n", " "):
        # idempotent-ish
        pass
    if "R12" in text and "IO0_M" in text and 'Value" "0R"' in text:
        print("Already patched?")
        # still allow re-run of label-only if needed

    # F-02: R5 value (unique uuid block)
    text2, n = re.subn(
        r'(property "Reference" "R5"[\s\S]*?property "Value" ")100k(")',
        r"\g<1>0R\2",
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit(f"R5 value replace failed ({n})")
    text = text2
    print("F-02 R5→0R")

    # F-03: BUSY label on Q3 gate → Q3_GATE
    text2, n = re.subn(
        r'\(label "BUSY"\s*\n\s*\(at 154\.94 60\.96 0\)',
        '(label "Q3_GATE"\n\t\t(at 154.94 60.96 0)',
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit(f"Q3_GATE label replace failed ({n})")
    text = text2
    print("F-03 Q3 gate label")

    # F-04: J6 feed label 12V_SW → 12V_LED
    text2, n = re.subn(
        r'\(label "12V_SW"\s*\n\s*\(at 340\.36 114\.3 0\)',
        '(label "12V_LED"\n\t\t(at 340.36 114.3 0)',
        text,
        count=1,
    )
    if n != 1:
        raise SystemExit(f"12V_LED label replace failed ({n})")
    text = text2
    print("F-04 J6 label")

    # F-01: U2-side IO labels at x=48.26 → IOx_M
    for i in range(8):
        y = 167.64 + i * 2.54
        y_pat = f"{y:.2f}".rstrip("0").rstrip(".")
        text2, n = re.subn(
            rf'\(label "IO{i}"\s*\n\s*\(at 48\.26 {re.escape(y_pat)} 0\)',
            f'(label "IO{i}_M"\n\t\t(at 48.26 {y_pat} 0)',
            text,
            count=1,
        )
        if n != 1:
            raise SystemExit(f"IO{i}_M label replace failed ({n}) y={y_pat}")
        text = text2
    print("F-01 U2 IO labels → IOx_M")

    # Append new parts if missing
    if "(reference \"R12\")" not in text:
        blocks = []
        blocks.append(
            '\t(text "Respin F-01…F-05"\n'
            "\t\t(exclude_from_sim no)\n"
            "\t\t(at 380 40 0)\n"
            "\t\t(effects\n"
            "\t\t\t(font\n"
            "\t\t\t\t(size 2.54 2.54)\n"
            "\t\t\t\t(bold yes)\n"
            "\t\t\t)\n"
            "\t\t)\n"
            f'\t\t(uuid "{uid()}")\n'
            "\t)\n"
        )

        # R13 + C4 blanking near annotation area (labels connect nets)
        # Device:R @0°: pin1 at (0,0), pin2 at (0,3.81) in lib — place vertical
        rx, ry = 380.0, 55.0
        blocks.append(symbol_r("R13", "100k", rx, ry, 0))
        # pin1 (top/at) = BUSY, pin2 = Q3_GATE for vertical R
        blocks.append(label("BUSY", rx, ry, 0))
        blocks.append(label("Q3_GATE", rx, ry + 3.81, 0))

        cx, cy = 390.0, 55.0
        blocks.append(symbol_c("C4", "4.7u/16V", cx, cy, 0))
        blocks.append(label("Q3_GATE", cx, cy, 0))
        blocks.append(label("GND", cx, cy + 3.81, 0))

        # R12 LED series
        r12x, r12y = 380.0, 75.0
        blocks.append(symbol_r("R12", "10", r12x, r12y, 0))
        blocks.append(label("12V_SW", r12x, r12y, 0))
        blocks.append(label("12V_LED", r12x, r12y + 3.81, 0))

        # D15–D22: A(left)=IOx_M, K(right)=IOx  — Device:D pin2 A @ -3.81, pin1 K @ +3.81
        for i in range(8):
            dx, dy = 380.0, 95.0 + i * 7.62
            ref = f"D{15+i}"
            blocks.append(symbol_d(ref, dx, dy, 0))
            blocks.append(label(f"IO{i}_M", dx - 3.81, dy, 0))
            blocks.append(label(f"IO{i}", dx + 3.81, dy, 0))

        insert = "".join(blocks)
        if not text.rstrip().endswith(")"):
            raise SystemExit("unexpected sch ending")
        # insert before final closing paren of root
        text = text.rstrip()
        assert text.endswith(")")
        text = text[:-1] + "\n" + insert + "\n)\n"
        print("Appended R12/R13/C4/D15-D22")
    else:
        print("Parts already present, skip append")

    SCH.write_text(text, encoding="utf-8")
    print("Saved", SCH)


if __name__ == "__main__":
    main()
