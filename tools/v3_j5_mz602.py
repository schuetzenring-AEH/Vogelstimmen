#!/usr/bin/env python3
"""Replace J5 wire pads with MZ-602 PCB-pin footprint; keep nets; refill."""
from __future__ import annotations

from pathlib import Path

import pcbnew

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
PCB = ROOT / "hardware" / "V3.0" / "vogelstimmen_v3.0.kicad_pcb"
LOCAL = ROOT / "hardware" / "footprints" / "vogelstimmen.pretty"
MM = 1_000_000


def main():
    board = pcbnew.LoadBoard(str(PCB))
    old = next(f for f in list(board.GetFootprints()) if f.GetReference() == "J5")
    n1 = None
    n2 = None
    for p in old.Pads():
        if p.GetNumber() == "1":
            n1 = p.GetNet()
        elif p.GetNumber() == "2":
            n2 = p.GetNet()

    new = pcbnew.FootprintLoad(str(LOCAL), "CNT_MZ602")
    if new is None:
        raise RuntimeError("CNT_MZ602 load failed")
    new.SetReference("J5")
    new.SetValue("CNT_MZ602")
    new.SetFPIDAsString("vogelstimmen:CNT_MZ602")
    # Pin row above body; body hangs toward board bottom / slightly off-edge for Gehäuse-Fenster
    new.SetPosition(pcbnew.VECTOR2I(int(197.48 * MM), int(100.0 * MM)))
    new.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))

    for p in new.Pads():
        if p.GetNumber() == "1" and n1 is not None:
            p.SetNet(n1)
        elif p.GetNumber() == "2" and n2 is not None:
            p.SetNet(n2)

    board.Remove(old)
    board.Add(new)

    # Move D10 freilauf left of pin1 (clear of MZ body)
    d10 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "D10")
    d10.SetPosition(pcbnew.VECTOR2I(int(185.0 * MM), int(100.0 * MM)))
    d10.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))
    pad_d = {p.GetNumber(): p for p in d10.Pads()}
    pad_d["1"].SetNet(n1)  # K to +
    pad_d["2"].SetNet(n2)  # A to -

    p1 = next(p for p in new.Pads() if p.GetNumber() == "1")
    p2 = next(p for p in new.Pads() if p.GetNumber() == "2")
    x1, y1 = p1.GetPosition().x / MM, p1.GetPosition().y / MM
    x2, y2 = p2.GetPosition().x / MM, p2.GetPosition().y / MM
    print("new pads", x1, y1, x2, y2, p1.GetNetname(), p2.GetNetname())

    def add_track(xa, ya, xb, yb, net, w=0.4):
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(pcbnew.VECTOR2I(int(round(xa * MM)), int(round(ya * MM))))
        t.SetEnd(pcbnew.VECTOR2I(int(round(xb * MM)), int(round(yb * MM))))
        t.SetWidth(int(w * MM))
        t.SetLayer(pcbnew.F_Cu)
        t.SetNet(net)
        board.Add(t)

    add_track(x1, y1, x1, 84.0, n1, 0.4)
    q7 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "Q7")
    qd = next(p for p in q7.Pads() if p.GetNumber() == "3")
    qx, qy = qd.GetPosition().x / MM, qd.GetPosition().y / MM
    add_track(qx, qy, x2, qy, n2, 0.4)
    add_track(x2, qy, x2, y2, n2, 0.4)

    dk = pad_d["1"]
    da = pad_d["2"]
    add_track(dk.GetPosition().x / MM, dk.GetPosition().y / MM, x1, dk.GetPosition().y / MM, n1, 0.35)
    add_track(x1, dk.GetPosition().y / MM, x1, y1, n1, 0.35)
    add_track(da.GetPosition().x / MM, da.GetPosition().y / MM, x2, da.GetPosition().y / MM, n2, 0.35)
    add_track(x2, da.GetPosition().y / MM, x2, y2, n2, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("J5 -> CNT_MZ602 saved")


if __name__ == "__main__":
    main()
