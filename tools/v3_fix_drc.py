#!/usr/bin/env python3
"""Nudge overlapping 0603 parts and polish J5 silk for V3.0."""
from __future__ import annotations

from pathlib import Path

import pcbnew

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
FP_TABLE = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\fp-lib-table")

# mm deltas: (dx, dy)
NUDGE = {
    "R6": (0.0, -1.0),   # away from R7
    "R7": (0.0, 0.5),
    "R10": (-0.8, 0.0),  # away from D14/Q6
    "R1": (0.0, 0.8),    # away from D12
}


def main() -> None:
    FP_TABLE.write_text(
        """(fp_lib_table
  (version 7)
  (lib (name "vogelstimmen")(type "KiCad")(uri "${KIPRJMOD}/../footprints/vogelstimmen.pretty")(options "")(descr "Vogelstimmen footprints"))
)
""",
        encoding="utf-8",
    )

    board = pcbnew.LoadBoard(str(PCB))
    for fp in board.GetFootprints():
        ref = fp.GetReference()
        if ref in NUDGE:
            dx, dy = NUDGE[ref]
            pos = fp.GetPosition()
            # KiCad 10 uses nm internally via VECTOR2I in nm? GetX is nm
            fp.SetPosition(pcbnew.VECTOR2I(pos.x + int(dx * 1_000_000), pos.y + int(dy * 1_000_000)))
            print(f"nudge {ref} by {dx},{dy} mm")
        if ref == "J5":
            # shrink / fix silk texts if API allows
            for t in fp.GraphicalItems():
                try:
                    if hasattr(t, "GetText") and "5V EM" in (t.GetText() or ""):
                        t.SetTextSize(pcbnew.VECTOR2I(800000, 800000))
                        t.SetTextThickness(120000)
                except Exception:
                    pass

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("saved")


if __name__ == "__main__":
    main()
