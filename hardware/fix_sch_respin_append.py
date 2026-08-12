"""Remove broken respin append and re-add with correct pin/label wiring on 1.27 grid."""
from __future__ import annotations

import uuid
from pathlib import Path

SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_sch")


def uid() -> str:
    return str(uuid.uuid4())


def wire(x1, y1, x2, y2) -> str:
    return f"""\t(wire
\t\t(pts
\t\t\t(xy {x1} {y1}) (xy {x2} {y2})
\t\t)
\t\t(stroke
\t\t\t(width 0)
\t\t\t(type default)
\t\t)
\t\t(uuid "{uid()}")
\t)
"""


def label(name: str, x: float, y: float, rot: int = 0) -> str:
    return f"""\t(label "{name}"
\t\t(at {x} {y} {rot})
\t\t(effects
\t\t\t(font
\t\t\t\t(size 1.27 1.27)
\t\t\t)
\t\t)
\t\t(uuid "{uid()}")
\t)
"""


def symbol_r(ref: str, value: str, x: float, y: float) -> str:
    # Device:R: pin1 at (x, y-3.81), pin2 at (x, y+3.81) relative to 'at' center
    return f"""\t(symbol
\t\t(lib_id "Device:R")
\t\t(at {x} {y} 0)
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


def symbol_c(ref: str, value: str, x: float, y: float) -> str:
    return f"""\t(symbol
\t\t(lib_id "Device:C")
\t\t(at {x} {y} 0)
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


def symbol_d(ref: str, x: float, y: float) -> str:
    # Device:D @0°: pin2 A at (x+3.81,y), pin1 K at (x-3.81,y) per ERC on prior place
    return f"""\t(symbol
\t\t(lib_id "Device:D")
\t\t(at {x} {y} 0)
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
    t = SCH.read_text(encoding="utf-8")
    marker = '(text "Respin F-01'
    idx = t.find(marker)
    if idx >= 0:
        start = t.rfind("\n", 0, idx)
        t = t[:start].rstrip() + "\n)\n"
        print("stripped old append")
    else:
        print("no old append")

    # Ensure label renames still present
    assert "IO0_M" in t and 'Value" "0R"' in t or 'Value" "0R"' in t.replace("\n", "")
    if 'property "Value" "0R"' not in t:
        raise SystemExit("R5 not 0R — run sync_sch first")

    blocks: list[str] = []
    blocks.append(
        '\t(text "Respin F-01…F-05"\n'
        "\t\t(exclude_from_sim no)\n"
        "\t\t(at 381 40.64 0)\n"
        "\t\t(effects\n"
        "\t\t\t(font\n"
        "\t\t\t\t(size 2.54 2.54)\n"
        "\t\t\t\t(bold yes)\n"
        "\t\t\t)\n"
        "\t\t)\n"
        f'\t\t(uuid "{uid()}")\n'
        "\t)\n"
    )

    # R13: pin1 (top) BUSY, pin2 (bot) Q3_GATE — center 54.61 → pins 50.8 / 58.42
    rx, ry = 381.0, 54.61
    blocks.append(symbol_r("R13", "100k", rx, ry))
    blocks.append(wire(rx, ry - 3.81, rx - 5.08, ry - 3.81))
    blocks.append(label("BUSY", rx - 5.08, ry - 3.81, 0))
    blocks.append(wire(rx, ry + 3.81, rx - 5.08, ry + 3.81))
    blocks.append(label("Q3_GATE", rx - 5.08, ry + 3.81, 0))

    # C4: pin1 Q3_GATE, pin2 GND
    cx, cy = 391.16, 54.61
    blocks.append(symbol_c("C4", "4.7u/16V", cx, cy))
    blocks.append(wire(cx, cy - 3.81, cx + 5.08, cy - 3.81))
    blocks.append(label("Q3_GATE", cx + 5.08, cy - 3.81, 0))
    blocks.append(wire(cx, cy + 3.81, cx + 5.08, cy + 3.81))
    blocks.append(label("GND", cx + 5.08, cy + 3.81, 0))

    # R12: pin1 12V_SW, pin2 12V_LED
    r12x, r12y = 381.0, 71.12
    blocks.append(symbol_r("R12", "10", r12x, r12y))
    blocks.append(wire(r12x, r12y - 3.81, r12x - 5.08, r12y - 3.81))
    blocks.append(label("12V_SW", r12x - 5.08, r12y - 3.81, 0))
    blocks.append(wire(r12x, r12y + 3.81, r12x - 5.08, r12y + 3.81))
    blocks.append(label("12V_LED", r12x - 5.08, r12y + 3.81, 0))

    # Diodes: need A=IOx_M, K=IOx
    # Prior ERC: pin2 A at (x+3.81,y). Rotate 180° so A is left (module) if needed.
    # With rot 180: pins flip → A at x-3.81, K at x+3.81. Perfect.
    for i in range(8):
        dx, dy = 391.16, 91.44 + i * 7.62
        ref = f"D{15 + i}"
        # place with 180° rotation via symbol at ... 180
        sym = symbol_d(ref, dx, dy).replace(f"(at {dx} {dy} 0)", f"(at {dx} {dy} 180)")
        blocks.append(sym)
        # after 180°: A (pin2) at left x-3.81, K at right x+3.81
        ax, kx = dx - 3.81, dx + 3.81
        blocks.append(wire(ax, dy, ax - 5.08, dy))
        blocks.append(label(f"IO{i}_M", ax - 5.08, dy, 0))
        blocks.append(wire(kx, dy, kx + 5.08, dy))
        blocks.append(label(f"IO{i}", kx + 5.08, dy, 0))

    body = "".join(blocks)
    t = t.rstrip()
    assert t.endswith(")")
    t = t[:-1] + "\n" + body + "\n)\n"
    SCH.write_text(t, encoding="utf-8")
    print("rewrote append OK")


if __name__ == "__main__":
    main()
