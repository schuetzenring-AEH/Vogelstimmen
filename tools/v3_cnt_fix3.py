#!/usr/bin/env python3
"""Final DRC fix: kill leftover 5V stub; B.Cu 12V via board bottom."""
from __future__ import annotations

from pathlib import Path

import pcbnew

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
MM = 1_000_000


def net(board, name):
    n = board.FindNet(name)
    if n is None:
        n = pcbnew.NETINFO_ITEM(board, name)
        board.Add(n)
    return n


def main():
    board = pcbnew.LoadBoard(str(PCB))

    doomed = []
    for t in list(board.GetTracks()):
        if t.GetClass() != "PCB_TRACK":
            continue
        if t.GetNetname() != "/5V":
            continue
        coords = [
            (t.GetStartX() / MM, t.GetStartY() / MM),
            (t.GetEndX() / MM, t.GetEndY() / MM),
        ]
        if any(abs(x - 189.86) < 1.0 and y > 100 for x, y in coords):
            doomed.append(t)
    for t in doomed:
        print("rm5", t.GetStartX() / MM, t.GetStartY() / MM)
        board.Remove(t)

    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))
    n12 = net(board, "/12V_SW")

    doomed = []
    for t in list(board.GetTracks()):
        if t.GetNetname() != "/12V_SW":
            continue
        cls = t.GetClass()
        if cls == "PCB_VIA":
            x = t.GetPosition().x / MM
            y = t.GetPosition().y / MM
            if (x < 172 and 110 < y < 117) or (y < 90 and x > 185) or (abs(y - 122) < 1 and x > 180):
                doomed.append(t)
            continue
        if cls != "PCB_TRACK":
            continue
        if t.GetLayer() == pcbnew.B_Cu:
            doomed.append(t)
            continue
        sx, sy = t.GetStartX() / MM, t.GetStartY() / MM
        ex, ey = t.GetEndX() / MM, t.GetEndY() / MM
        if abs(sy - 114.5) < 0.4 and max(sx, ex) < 173:
            doomed.append(t)
        elif abs(ey - 114.5) < 0.4 and max(sx, ex) < 173:
            doomed.append(t)
    print("rm12", len(doomed))
    for t in doomed:
        board.Remove(t)

    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))
    n12 = net(board, "/12V_SW")

    def fp(ref):
        for f in list(board.GetFootprints()):
            if f.GetReference() == ref:
                return f
        raise KeyError(ref)

    def padxy(f, num):
        for p in f.Pads():
            if p.GetNumber() == num:
                return p.GetPosition().x / MM, p.GetPosition().y / MM
        raise KeyError(num)

    rx, ry = padxy(fp("R12"), "1")
    jx, jy = padxy(fp("J5"), "1")
    vx1, vy1 = rx - 1.8, ry
    vx2, vy2 = jx - 1.5, 122.0
    vx3, vy3 = jx - 1.5, 87.5

    def via(x, y):
        v = pcbnew.PCB_VIA(board)
        v.SetPosition(pcbnew.VECTOR2I(int(round(x * MM)), int(round(y * MM))))
        v.SetDrill(int(0.3 * MM))
        v.SetWidth(int(0.6 * MM))
        v.SetNet(n12)
        v.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
        board.Add(v)

    def tr(x1, y1, x2, y2, layer=None, w=0.4):
        t = pcbnew.PCB_TRACK(board)
        t.SetStart(pcbnew.VECTOR2I(int(round(x1 * MM)), int(round(y1 * MM))))
        t.SetEnd(pcbnew.VECTOR2I(int(round(x2 * MM)), int(round(y2 * MM))))
        t.SetWidth(int(w * MM))
        t.SetLayer(pcbnew.F_Cu if layer is None else layer)
        t.SetNet(n12)
        board.Add(t)

    tr(rx, ry, vx1, vy1)
    via(vx1, vy1)
    via(vx2, vy2)
    via(vx3, vy3)
    tr(vx1, vy1, vx1, vy2, pcbnew.B_Cu, 0.5)
    tr(vx1, vy2, vx2, vy2, pcbnew.B_Cu, 0.5)
    tr(vx2, vy2, vx3, vy3, pcbnew.B_Cu, 0.5)
    tr(vx3, vy3, jx, 87.5, w=0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("done")


if __name__ == "__main__":
    main()
