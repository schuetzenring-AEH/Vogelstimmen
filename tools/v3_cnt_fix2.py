#!/usr/bin/env python3
"""Fix remaining E-CNT-03 DRC shorts."""
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


def fp(board, ref):
    for f in list(board.GetFootprints()):
        if f.GetReference() == ref:
            return f
    raise KeyError(ref)


def pad(f, num):
    for p in f.Pads():
        if p.GetNumber() == num:
            return p
    raise KeyError(num)


def xy(f, num):
    p = pad(f, num)
    return p.GetPosition().x / MM, p.GetPosition().y / MM


def add_track(board, x1, y1, x2, y2, netinfo, width=0.3, layer=None):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(int(round(x1 * MM)), int(round(y1 * MM))))
    t.SetEnd(pcbnew.VECTOR2I(int(round(x2 * MM)), int(round(y2 * MM))))
    t.SetWidth(int(width * MM))
    t.SetLayer(pcbnew.F_Cu if layer is None else layer)
    t.SetNet(netinfo)
    board.Add(t)


def add_via(board, x, y, netinfo):
    v = pcbnew.PCB_VIA(board)
    v.SetPosition(pcbnew.VECTOR2I(int(round(x * MM)), int(round(y * MM))))
    v.SetDrill(int(0.3 * MM))
    v.SetWidth(int(0.6 * MM))
    v.SetNet(netinfo)
    v.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
    board.Add(v)


def main():
    board = pcbnew.LoadBoard(str(PCB))
    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")

    j5 = fp(board, "J5")
    j5p = xy(j5, "1")

    # 1) Delete leftover /5V track near J5+
    doomed = []
    for t in list(board.GetTracks()):
        if t.GetClass() != "PCB_TRACK":
            continue
        if t.GetNetname() != "/5V":
            continue
        for pt in (t.GetStart(), t.GetEnd()):
            if abs(pt.x / MM - j5p[0]) < 0.5 and 100 < pt.y / MM < 112:
                doomed.append(t)
                break
    for t in doomed:
        board.Remove(t)
    print("removed 5V near J5", len(doomed))

    # 2) Remove bad one-shot local tracks + R12 via feed (rebuild cleanly)
    doomed = []
    for t in list(board.GetTracks()):
        n = t.GetNetname()
        cls = t.GetClass()
        if cls == "PCB_VIA" and n == "/12V_SW":
            x, y = t.GetPosition().x / MM, t.GetPosition().y / MM
            # vias we added near R12 (~173) or near J5 (~188, 88.5)
            if (170 < x < 176 and 112 < y < 116) or (abs(y - 88.5) < 0.2 and 185 < x < 192):
                doomed.append(t)
            continue
        if cls != "PCB_TRACK":
            continue
        if n in ("/CNT_PULSE", "/CNT_GATE", "/CNT_LO"):
            doomed.append(t)
            continue
        if n == "/12V_SW":
            sx, sy = t.GetStart().x / MM, t.GetStart().y / MM
            ex, ey = t.GetEnd().x / MM, t.GetEnd().y / MM
            # R12 stub to via
            if (abs(sy - 114.5) < 0.2 and 171 < sx < 175) or (abs(ey - 114.5) < 0.2 and 171 < ex < 175):
                doomed.append(t)
                continue
            # B.Cu feed
            if t.GetLayer() == pcbnew.B_Cu:
                doomed.append(t)
                continue
            # top feed y=88.5 and verticals from C20/J5 for 12V in pocket — keep freilauf locals
            if abs(sy - 88.5) < 0.05 or abs(ey - 88.5) < 0.05:
                doomed.append(t)
                continue
            if (abs(sx - j5p[0]) < 0.05 and sy < 110 and ey < 110) or (
                abs(ex - j5p[0]) < 0.05 and sy < 110 and ey < 110
            ):
                # vertical on J5+ column above pads — remove to redo
                if max(sy, ey) <= 109:
                    doomed.append(t)
                    continue
        if n == "/GND":
            # short stubs we added at R20/D23/Q7 (length ~1.2)
            length = ((t.GetStart().x - t.GetEnd().x) ** 2 + (t.GetStart().y - t.GetEnd().y) ** 2) ** 0.5 / MM
            sx, sy = t.GetStart().x / MM, t.GetStart().y / MM
            if length < 1.5 and sx > 192 and sy < 100:
                doomed.append(t)
    for t in doomed:
        board.Remove(t)
    print("removed rebuild targets", len(doomed))

    c20, r20, d23, r21, q7 = fp(board, "C20"), fp(board, "R20"), fp(board, "D23"), fp(board, "R21"), fp(board, "Q7")
    d10 = fp(board, "D10")

    # Nudge D10 down a bit to ease courtyard with J5 silk box
    d10.SetPosition(pcbnew.VECTOR2I(int(197.48 * MM), int(107.2 * MM)))

    # Re-orient R20 so GND pad is UP (away from pulse bus): rotate 180
    # Currently pad1 pulse left, pad2 gnd right — route pulse ABOVE body instead
    c1, c2 = xy(c20, "1"), xy(c20, "2")
    r20p, r20g = xy(r20, "1"), xy(r20, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    r21p, r21g = xy(r21, "1"), xy(r21, "2")
    qg, qs, qd = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")
    j5p, j5n = xy(j5, "1"), xy(j5, "2")
    d10k, d10a = xy(d10, "1"), xy(d10, "2")

    # Pulse bus ABOVE parts at y=89.2 (avoid R20 GND pad)
    py = 89.2
    add_track(board, c2[0], c2[1], c2[0], py, n_pulse, 0.25)
    add_track(board, c2[0], py, d23k[0], py, n_pulse, 0.25)
    add_track(board, d23k[0], py, d23k[0], d23k[1], n_pulse, 0.25)
    add_track(board, r20p[0], py, r20p[0], r20p[1], n_pulse, 0.25)  # drop to R20 pulse pad
    add_track(board, r20p[0], py, r20p[0], r21p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r21p[1], r21p[0], r21p[1], n_pulse, 0.25)

    # Gate: go LEFT of Q7 (x=195.2) to avoid Source pad on x=197.94
    gx = 195.2
    add_track(board, r21g[0], r21g[1], gx, r21g[1], n_gate, 0.25)
    add_track(board, gx, r21g[1], gx, qg[1], n_gate, 0.25)
    add_track(board, gx, qg[1], qg[0], qg[1], n_gate, 0.25)

    # Freilauf refresh (D10 moved)
    add_track(board, d10k[0], d10k[1], j5p[0], d10k[1], n_12v, 0.35)
    add_track(board, j5p[0], d10k[1], j5p[0], j5p[1], n_12v, 0.4)
    add_track(board, d10a[0], d10a[1], j5n[0], d10a[1], n_lo, 0.35)
    add_track(board, j5n[0], d10a[1], j5n[0], j5n[1], n_lo, 0.4)
    # Q7 drain to J5−
    add_track(board, qd[0], qd[1], j5n[0], qd[1], n_lo, 0.4)
    add_track(board, j5n[0], qd[1], j5n[0], j5n[1], n_lo, 0.4)

    # C20/J5 12V along y=88.0 (above pulse bus)
    add_track(board, c1[0], c1[1], c1[0], 88.0, n_12v, 0.3)
    add_track(board, c1[0], 88.0, j5p[0], 88.0, n_12v, 0.35)
    add_track(board, j5p[0], 88.0, j5p[0], j5p[1], n_12v, 0.4)

    # 12V feed from R12 pad1 LEFT side via B.Cu
    r12 = fp(board, "R12")
    rx, ry = xy(r12, "1")
    vx1, vy1 = rx - 1.5, ry  # left of 12V_SW pad, clear of LED pad
    vx2, vy2 = j5p[0] - 2.0, 88.0
    add_track(board, rx, ry, vx1, vy1, n_12v, 0.4)
    add_via(board, vx1, vy1, n_12v)
    add_via(board, vx2, vy2, n_12v)
    add_track(board, vx1, vy1, vx2, vy2, n_12v, 0.5, layer=pcbnew.B_Cu)
    add_track(board, vx2, vy2, j5p[0], 88.0, n_12v, 0.35)

    # GND stubs: go UP from GND pads (smaller y) into pour — R20 gnd is right pad
    add_track(board, r20g[0], r20g[1], r20g[0], r20g[1] - 1.5, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0], d23a[1] - 1.5, n_gnd, 0.3)
    # Q7 source: go right away from gate route
    add_track(board, qs[0], qs[1], qs[0] + 1.5, qs[1], n_gnd, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("fixed and saved")


if __name__ == "__main__":
    main()
