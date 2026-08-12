#!/usr/bin/env python3
import pcbnew
from pathlib import Path

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
LIB = str(Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\footprints\vogelstimmen.pretty"))

board = pcbnew.LoadBoard(str(PCB))
for fp in list(board.GetFootprints()):
    if fp.GetReference() != "J5":
        continue
    new_fp = pcbnew.FootprintLoad(LIB, "CNT_5V_WIRE")
    new_fp.SetPosition(fp.GetPosition())
    new_fp.SetOrientation(fp.GetOrientation())
    new_fp.SetReference("J5")
    new_fp.SetValue("CNT_5V")
    old_pads = {p.GetNumber(): p for p in fp.Pads()}
    for pad in new_fp.Pads():
        if pad.GetNumber() in old_pads:
            pad.SetNet(old_pads[pad.GetNumber()].GetNet())
    board.Remove(fp)
    board.Add(new_fp)
    print("J5 refreshed")

filler = pcbnew.ZONE_FILLER(board)
filler.Fill(board.Zones())
pcbnew.SaveBoard(str(PCB), board)
