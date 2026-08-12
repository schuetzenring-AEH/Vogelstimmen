"""Orient MPT clamps: cable entry from board-bottom (+Y) for all except J3.

J3 is rotated 180° (entry toward board-top, away from U2) while keeping
the same nets on the same pad XY positions (short tracks). Schematic pin
numbers on J3 are swapped 1↔8 … 4↔5 so pad numbers still match the nets.
"""
from __future__ import annotations

import re
from pathlib import Path

import pcbnew

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb")
SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_sch")

# KiCad MPT horizontal: pin1 marker / wire face at local +Y → board bottom at rot=0
BOTTOM_ENTRY_ROT = 0.0
J3_ENTRY_AWAY_FROM_U2_ROT = 180.0


def signal_pads(fp):
    return [p for p in list(fp.Pads()) if p.GetNumber().isdigit()]


def rotate_keep_nets_by_xy(fp, new_rot_deg: float) -> None:
    """Rotate footprint; reassign nets so each world XY keeps its net."""
    pads = signal_pads(fp)
    before = []
    for p in pads:
        before.append(
            {
                "x": p.GetX(),
                "y": p.GetY(),
                "net": p.GetNet(),
                "name": p.GetNetname(),
            }
        )
    before.sort(key=lambda d: (d["x"], d["y"]))

    # Center of pad row (rotation pivot for placement restore)
    cx = sum(d["x"] for d in before) // len(before)
    cy = sum(d["y"] for d in before) // len(before)

    fp.SetOrientationDegrees(new_rot_deg)

    # After orientation change, pads moved around footprint origin.
    # Shift footprint so pad-row center returns to (cx, cy).
    pads = signal_pads(fp)
    ncx = sum(p.GetX() for p in pads) // len(pads)
    ncy = sum(p.GetY() for p in pads) // len(pads)
    pos = fp.GetPosition()
    fp.SetPosition(pcbnew.VECTOR2I(pos.x + (cx - ncx), pos.y + (cy - ncy)))

    # Assign nets by sorted X (same order as before)
    pads = sorted(signal_pads(fp), key=lambda p: (p.GetX(), p.GetY()))
    for p, old in zip(pads, before):
        p.SetNet(old["net"])
        print(
            f"  pos x={pcbnew.ToMM(p.GetX()):.2f} -> {old['name']} "
            f"(pad {p.GetNumber()})"
        )


def swap_j3_pin_numbers_in_schematic() -> None:
    """Swap pin numbers on J3 symbol instance: 1↔8, 2↔7, 3↔6, 4↔5."""
    text = SCH.read_text(encoding="utf-8")
    marker = '(property "Reference" "J3"'
    idx = text.find(marker)
    if idx < 0:
        raise SystemExit("J3 not found in schematic")
    # symbol block starts before Reference; find preceding "(symbol"
    start = text.rfind("\n\t(symbol\n", 0, idx)
    if start < 0:
        raise SystemExit("J3 symbol start not found")
    start += 1  # keep leading newline out
    end = text.find("\n\t(symbol\n", idx)
    if end < 0:
        end = text.find("\n\t(sheet_instances", idx)
    if end < 0:
        raise SystemExit("J3 symbol end not found")

    block = text[start:end]
    if "J_BTN_IO" not in block:
        raise SystemExit("J3 block sanity check failed")

    mapping = {"1": "8", "2": "7", "3": "6", "4": "5", "5": "4", "6": "3", "7": "2", "8": "1"}
    for a in mapping:
        block = block.replace(f'(pin "{a}"\n', f'(pin "TMP{a}"\n')
    for a, b in mapping.items():
        block = block.replace(f'(pin "TMP{a}"\n', f'(pin "{b}"\n')

    SCH.write_text(text[:start] + block + text[end:], encoding="utf-8")
    print("SCH J3: pin numbers swapped 1↔8 … 4↔5 (geometry/wires unchanged)")


def main() -> None:
    board = pcbnew.LoadBoard(str(PCB))
    fps = {f.GetReference(): f for f in board.GetFootprints()}

    for ref in ["J1", "J2", "J4", "J6"]:
        fp = fps[ref]
        print(f"{ref}: ensure rot={BOTTOM_ENTRY_ROT} (Kabel von unten / +Y)")
        if abs(fp.GetOrientationDegrees() - BOTTOM_ENTRY_ROT) > 0.1:
            rotate_keep_nets_by_xy(fp, BOTTOM_ENTRY_ROT)
        else:
            print("  already ok")

    fp = fps["J3"]
    print(f"J3: rot={J3_ENTRY_AWAY_FROM_U2_ROT} (Kabel nach oben, weg von U2), Netze XY fest")
    rotate_keep_nets_by_xy(fp, J3_ENTRY_AWAY_FROM_U2_ROT)

    board.Save(str(PCB))
    print("saved", PCB)

    swap_j3_pin_numbers_in_schematic()
    print("saved", SCH)


if __name__ == "__main__":
    main()
