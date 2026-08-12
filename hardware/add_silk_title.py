"""Add 3-line silkscreen title above Kübler (J5)."""
from __future__ import annotations

from pathlib import Path

import pcbnew

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb")

LINES = [
    "Soundplatine Waldlehrpfad",
    "Kolping Alteglofsheim",
    "Konrad Senn 2026",
]

# Above J5 (Kübler ~194.5 / 80 top) — board top edge y≈69.45
CX_MM = 194.5
Y0_MM = 72.2
DY_MM = 1.9
SIZE_MM = 1.1
THICK_MM = 0.15
MARKER = "SILK_TITLE_WALDLEHRPFAD"  # first line used as idempotency check


def main() -> None:
    board = pcbnew.LoadBoard(str(PCB))

    # Remove previous run
    for d in list(board.GetDrawings()):
        if d.GetClass() != "PCB_TEXT":
            continue
        t = d.GetText()
        if t in LINES or t.startswith("Soundplatine Waldlehrpfad"):
            board.Remove(d)

    for i, line in enumerate(LINES):
        txt = pcbnew.PCB_TEXT(board)
        txt.SetText(line)
        txt.SetLayer(pcbnew.F_SilkS)
        txt.SetPosition(
            pcbnew.VECTOR2I(pcbnew.FromMM(CX_MM), pcbnew.FromMM(Y0_MM + i * DY_MM))
        )
        txt.SetTextSize(
            pcbnew.VECTOR2I(pcbnew.FromMM(SIZE_MM), pcbnew.FromMM(SIZE_MM))
        )
        txt.SetTextThickness(pcbnew.FromMM(THICK_MM))
        txt.SetHorizJustify(pcbnew.GR_TEXT_H_ALIGN_CENTER)
        txt.SetVertJustify(pcbnew.GR_TEXT_V_ALIGN_CENTER)
        board.Add(txt)
        print(f"F.SilkS: '{line}' @ ({CX_MM}, {Y0_MM + i * DY_MM})")

    board.Save(str(PCB))
    print("saved", PCB)


if __name__ == "__main__":
    main()
