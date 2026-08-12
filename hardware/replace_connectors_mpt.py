"""Replace J1/J2/J6 (1x02) and J3/J4 (1x08) pin headers with Phoenix MPT-0,5 clamps.

Keeps pad-1 position and net assignments. Does not route tracks.
Also updates footprint fields in the schematic.
"""
from __future__ import annotations

import re
from pathlib import Path

import pcbnew

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb")
SCH = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_sch")
LIB = r"C:\Program Files\KiCad\10.0\share\kicad\footprints\TerminalBlock_Phoenix.pretty"

MAP = {
    "J1": (
        "TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal",
        "MPT-0,5/2 BAT",
        "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal",
    ),
    "J2": (
        "TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal",
        "MPT-0,5/2 SPK",
        "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal",
    ),
    "J6": (
        "TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal",
        "MPT-0,5/2 LED",
        "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal",
    ),
    "J3": (
        "TerminalBlock_Phoenix_MPT-0,5-8-2.54_1x08_P2.54mm_Horizontal",
        "MPT-0,5/8 IO",
        "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MPT-0,5-8-2.54_1x08_P2.54mm_Horizontal",
    ),
    "J4": (
        "TerminalBlock_Phoenix_MPT-0,5-8-2.54_1x08_P2.54mm_Horizontal",
        "MPT-0,5/8 GND",
        "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MPT-0,5-8-2.54_1x08_P2.54mm_Horizontal",
    ),
}


def replace_pcb() -> None:
    board = pcbnew.LoadBoard(str(PCB))
    fps = {f.GetReference(): f for f in board.GetFootprints()}

    for ref, (fp_name, value, _) in MAP.items():
        old = fps.get(ref)
        if old is None:
            raise SystemExit(f"missing {ref}")

        nets = {}
        pad1 = None
        for p in list(old.Pads()):
            nets[p.GetNumber()] = p.GetNet()
            if p.GetNumber() == "1":
                pad1 = pcbnew.VECTOR2I(p.GetPosition())
        if pad1 is None:
            raise SystemExit(f"{ref}: no pad 1")

        new = pcbnew.FootprintLoad(LIB, fp_name)
        if new is None:
            raise SystemExit(f"could not load {fp_name}")

        new.SetReference(ref)
        new.SetValue(value)
        new.SetOrientationDegrees(0.0)
        new.SetLayer(old.GetLayer())
        new.SetPosition(pcbnew.VECTOR2I(0, 0))

        p1_local = None
        for p in list(new.Pads()):
            if p.GetNumber() == "1":
                p1_local = pcbnew.VECTOR2I(p.GetPosition())
                break
        if p1_local is None:
            raise SystemExit(f"{ref}: new fp has no pad 1")

        new.SetPosition(pcbnew.VECTOR2I(pad1.x - p1_local.x, pad1.y - p1_local.y))

        for p in list(new.Pads()):
            n = nets.get(p.GetNumber())
            if n is not None:
                p.SetNet(n)

        board.Remove(old)
        board.Add(new)
        print(
            f"PCB {ref}: {fp_name} @ "
            f"({pcbnew.ToMM(new.GetPosition().x):.2f},{pcbnew.ToMM(new.GetPosition().y):.2f})"
        )

    pcbnew.Refresh()
    board.Save(str(PCB))
    print("saved", PCB)


def replace_sch() -> None:
    text = SCH.read_text(encoding="utf-8")
    # Replace footprint property immediately after each J reference block by scanning symbols
    # Safer: replace known pinheader footprint strings only on J1/J2/J3/J4/J6 instances.
    # Pattern: (property "Reference" "Jx" ... ) ... (property "Footprint" "..." )
    for ref, (_, _, sch_fp) in MAP.items():
        pattern = re.compile(
            rf'(\(property "Reference" "{ref}"\s*\n(?:.*\n){{0,20}}?'
            rf'\(property "Footprint" ")([^"]+)(")',
            re.MULTILINE,
        )

        def repl(m: re.Match[str], fp: str = sch_fp) -> str:
            return m.group(1) + fp + m.group(3)

        text2, n = pattern.subn(repl, text, count=1)
        if n != 1:
            raise SystemExit(f"schematic: could not update footprint for {ref} (n={n})")
        text = text2
        print(f"SCH {ref}: {sch_fp}")

    SCH.write_text(text, encoding="utf-8")
    print("saved", SCH)


def main() -> None:
    replace_pcb()
    replace_sch()


if __name__ == "__main__":
    main()
