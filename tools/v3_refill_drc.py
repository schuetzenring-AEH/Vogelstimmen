#!/usr/bin/env python3
import pcbnew
from pathlib import Path

pcb = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
board = pcbnew.LoadBoard(str(pcb))
filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())
pcbnew.SaveBoard(str(pcb), board)
print("Zones refilled")
