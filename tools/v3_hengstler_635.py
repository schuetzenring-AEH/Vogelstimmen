#!/usr/bin/env python3
"""Replace J5 wire pads with Hengstler 0.635.128 footprint and re-route E-CNT-03."""
from __future__ import annotations

from pathlib import Path

import pcbnew

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
PCB = ROOT / "hardware" / "V3.0" / "vogelstimmen_v3.0.kicad_pcb"
LOCAL = ROOT / "hardware" / "footprints" / "vogelstimmen.pretty"
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


def in_box(x, y, x0, y0, x1, y1, m=0.4):
    return (x0 - m) <= x <= (x1 + m) and (y0 - m) <= y <= (y1 + m)


def main():
    board = pcbnew.LoadBoard(str(PCB))
    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_gate = net(board, "/CNT_GATE")

    # Target placement: pin midpoint keeps body inside right edge (210.05)
    # body 25.2 x 14.6 → ±12.6 / ±7.3
    j5_x, j5_y = 196.5, 109.0  # origin = pin center
    # D10 north of body (body top ~101.7), south of Q7
    d10_x, d10_y = 196.5, 99.6

    old = fp(board, "J5")
    # Clear CNT-related tracks near old J5 / one-shot pocket (right side)
    doomed = []
    for t in list(board.GetTracks()):
        cls = t.GetClass()
        if cls not in ("PCB_TRACK", "PCB_VIA"):
            continue
        nn = t.GetNetname()
        if nn not in ("/12V_SW", "/CNT_LO", "/CNT_GATE", "/CNT_PULSE", "/GND"):
            continue
        if cls == "PCB_VIA":
            x, y = t.GetPosition().x / MM, t.GetPosition().y / MM
            # keep far-left 12V vias; only remove ones in CNT pocket
            if in_box(x, y, 185, 82, 210, 120) and nn == "/12V_SW":
                doomed.append(t)
            continue
        s = (t.GetStartX() / MM, t.GetStartY() / MM)
        e = (t.GetEndX() / MM, t.GetEndY() / MM)
        # anything touching the right CNT pocket
        if any(in_box(x, y, 185, 82, 210, 120) for x, y in (s, e)):
            # keep bulk 5V/other? already filtered by net
            if nn == "/GND":
                # only short stubs near one-shot / J5, not whole pour ties far away
                if any(in_box(x, y, 188, 84, 210, 118) for x, y in (s, e)):
                    doomed.append(t)
            else:
                doomed.append(t)
    for t in doomed:
        board.Remove(t)
    print("cleared", len(doomed))

    new = pcbnew.FootprintLoad(str(LOCAL), "CNT_HENGSTLER_635")
    new.SetReference("J5")
    new.SetValue("0.635.128")
    new.SetPosition(pcbnew.VECTOR2I(int(round(j5_x * MM)), int(round(j5_y * MM))))
    new.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))
    board.Remove(old)
    board.Add(new)

    d10 = fp(board, "D10")
    d10.SetPosition(pcbnew.VECTOR2I(int(round(d10_x * MM)), int(round(d10_y * MM))))
    d10.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))

    pad(new, "1").SetNet(n_12v)
    pad(new, "2").SetNet(n_lo)
    pad(d10, "1").SetNet(n_12v)  # K toward +
    pad(d10, "2").SetNet(n_lo)  # A toward -

    q7 = fp(board, "Q7")
    c20 = fp(board, "C20")
    r20 = fp(board, "R20")
    r21 = fp(board, "R21")
    d23 = fp(board, "D23")

    j5p, j5n = xy(new, "1"), xy(new, "2")
    d10k, d10a = xy(d10, "1"), xy(d10, "2")
    c1, c2 = xy(c20, "1"), xy(c20, "2")
    r20p, r20g = xy(r20, "1"), xy(r20, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    r21a, r21b = xy(r21, "1"), xy(r21, "2")
    qg, qs, qd = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")

    # R21: pulse closer to y=89
    if abs(r21a[1] - 89.0) > abs(r21b[1] - 89.0):
        pad(r21, "1").SetNet(n_gate)
        pad(r21, "2").SetNet(net(board, "/CNT_PULSE"))
        r21p, r21g = r21b, r21a
    else:
        pad(r21, "1").SetNet(net(board, "/CNT_PULSE"))
        pad(r21, "2").SetNet(n_gate)
        r21p, r21g = r21a, r21b

    n_pulse = net(board, "/CNT_PULSE")
    if abs(d23k[1] - 89.0) > abs(d23a[1] - 89.0):
        pad(d23, "1").SetNet(n_gnd)
        pad(d23, "2").SetNet(n_pulse)
        d23k, d23a = d23a, d23k
    else:
        pad(d23, "1").SetNet(n_pulse)
        pad(d23, "2").SetNet(n_gnd)

    print("J5+/-", j5p, j5n)
    print("D10", d10k, d10a)
    print("body X", j5_x - 12.6, j5_x + 12.6, "Y", j5_y - 7.3, j5_y + 7.3)

    # Pulse cluster (unchanged positions)
    add_track(board, c2[0], c2[1], r20p[0], r20p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r20p[1], r21p[0], r20p[1], n_pulse, 0.25)
    add_track(board, r21p[0], r20p[1], r21p[0], r21p[1], n_pulse, 0.25)
    add_track(board, d23k[0], d23k[1], r20p[0], d23k[1], n_pulse, 0.25)
    add_track(board, r20p[0], d23k[1], r20p[0], r20p[1], n_pulse, 0.25)

    # Gate
    add_track(board, r21g[0], r21g[1], qg[0], r21g[1], n_gate, 0.25)
    add_track(board, qg[0], r21g[1], qg[0], qg[1], n_gate, 0.25)

    # CNT_LO: Q7.D → bus → J5- and D10 A
    add_track(board, qd[0], qd[1], j5n[0], qd[1], n_lo, 0.4)
    add_track(board, j5n[0], qd[1], j5n[0], j5n[1], n_lo, 0.4)
    add_track(board, d10a[0], d10a[1], d10a[0], qd[1], n_lo, 0.35)
    add_track(board, d10a[0], qd[1], j5n[0], qd[1], n_lo, 0.35)

    # 12V: D10 K / C20 / J5+
    add_track(board, d10k[0], d10k[1], d10k[0], 97.5, n_12v, 0.35)
    add_track(board, d10k[0], 97.5, j5p[0], 97.5, n_12v, 0.35)
    add_track(board, j5p[0], 97.5, j5p[0], j5p[1], n_12v, 0.4)
    add_track(board, c1[0], c1[1], c1[0], 84.0, n_12v, 0.3)
    add_track(board, c1[0], 84.0, j5p[0], 84.0, n_12v, 0.35)
    add_track(board, j5p[0], 84.0, j5p[0], j5p[1], n_12v, 0.4)

    # 12V feed from left (same as clean script)
    add_track(board, 168.0, 108.5, 168.0, 111.0, n_12v, 0.4, layer=pcbnew.B_Cu)
    add_track(board, 168.0, 111.0, 188.36, 111.0, n_12v, 0.4, layer=pcbnew.B_Cu)
    # route under body on B.Cu then via north of body
    add_track(board, 188.36, 111.0, 188.36, 84.0, n_12v, 0.5, layer=pcbnew.B_Cu)
    add_via(board, 188.36, 84.0, n_12v)
    add_track(board, 188.36, 84.0, j5p[0], 84.0, n_12v, 0.4)

    # GND stubs
    add_track(board, r20g[0], r20g[1], r20g[0], r20g[1] - 1.5, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0] + 1.5, d23a[1], n_gnd, 0.3)
    add_track(board, qs[0], qs[1], qs[0], qs[1] + 1.2, n_gnd, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("OK", PCB)


if __name__ == "__main__":
    main()
