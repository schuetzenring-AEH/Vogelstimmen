#!/usr/bin/env python3
"""Clean E-CNT-03 finish from V2.5 + 0603 + CNT_12V, careful placement."""
from __future__ import annotations

import shutil
from pathlib import Path

import pcbnew

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
SRC = ROOT / "hardware" / "V2.5-final" / "vogelstimmen_v2.5.kicad_pcb"
PCB = ROOT / "hardware" / "V3.0" / "vogelstimmen_v3.0.kicad_pcb"
LOCAL = ROOT / "hardware" / "footprints" / "vogelstimmen.pretty"
R_LIB = Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Resistor_SMD.pretty")
KFP = Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints")
MM = 1_000_000


def net(board, name):
    n = board.FindNet(name)
    if n is None:
        n = pcbnew.NETINFO_ITEM(board, name)
        board.Add(n)
    return n


def replace_fp(board, old_fp, lib, name, value=None):
    new_fp = pcbnew.FootprintLoad(str(lib), name)
    new_fp.SetPosition(old_fp.GetPosition())
    new_fp.SetOrientation(old_fp.GetOrientation())
    new_fp.SetReference(old_fp.GetReference())
    new_fp.SetValue(value if value is not None else old_fp.GetValue())
    old_pads = {p.GetNumber(): p for p in old_fp.Pads()}
    for p in new_fp.Pads():
        if p.GetNumber() in old_pads:
            p.SetNet(old_pads[p.GetNumber()].GetNet())
    board.Remove(old_fp)
    board.Add(new_fp)


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


def sx(t):
    return t.GetStart().x / MM, t.GetStart().y / MM


def ex(t):
    return t.GetEnd().x / MM, t.GetEnd().y / MM


def near(x1, y1, x2, y2, tol=0.35):
    return abs(x1 - x2) <= tol and abs(y1 - y2) <= tol


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


def place(board, lib, name, ref, value, x, y, rot=0):
    f = pcbnew.FootprintLoad(str(lib), name)
    f.SetReference(ref)
    f.SetValue(value)
    f.SetPosition(pcbnew.VECTOR2I(int(round(x * MM)), int(round(y * MM))))
    if rot:
        f.SetOrientation(pcbnew.EDA_ANGLE(rot, pcbnew.DEGREES_T))
    board.Add(f)
    return f


def main():
    shutil.copy2(SRC, PCB)
    board = pcbnew.LoadBoard(str(PCB))

    to_r = [
        f
        for f in list(board.GetFootprints())
        if f.GetReference().startswith("R") and "0402" in f.GetFPIDAsString()
    ]
    for f in to_r:
        replace_fp(board, f, R_LIB, "R_0603_1608Metric")
    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))

    j5 = fp(board, "J5")
    replace_fp(board, j5, LOCAL, "CNT_12V_WIRE", "CNT_12V")
    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))

    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")

    j5 = fp(board, "J5")
    d10 = fp(board, "D10")
    j5p0, j5n0 = xy(j5, "1"), xy(j5, "2")
    d10a0, d10b0 = xy(d10, "1"), xy(d10, "2")

    doomed = []
    for t in list(board.GetTracks()):
        if t.GetClass() != "PCB_TRACK":
            continue
        if t.GetNetname() not in ("/5V", "/GND"):
            continue
        s = (t.GetStartX() / MM, t.GetStartY() / MM)
        e = (t.GetEndX() / MM, t.GetEndY() / MM)
        # any 5V approaching J5 column OR dangling stubs left of old D10 feed
        if t.GetNetname() == "/5V" and (
            any(abs(x - j5p0[0]) < 1.0 and y > 100 for x, y in (s, e))
            or any(abs(x - 175.0) < 0.5 and abs(y - 93.0) < 0.5 for x, y in (s, e))
        ):
            doomed.append(t)
            continue
        if any(near(*s, *pt) or near(*e, *pt) for pt in (j5p0, j5n0, d10a0, d10b0)):
            doomed.append(t)
    for t in doomed:
        board.Remove(t)
    print("cleared stubs", len(doomed))

    # D10 between J5 pads, slightly below pad centers to clear courtyard text
    d10.SetPosition(pcbnew.VECTOR2I(int(197.48 * MM), int(107.3 * MM)))
    d10.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))
    pad(j5, "1").SetNet(n_12v)
    pad(j5, "2").SetNet(n_lo)
    pad(d10, "1").SetNet(n_12v)
    pad(d10, "2").SetNet(n_lo)

    # Placement — open pocket above J5
    # C20: 12V left, pulse right
    c20 = place(board, KFP / "Capacitor_SMD.pretty", "C_0603_1608Metric", "C20", "1u/25V", 193.0, 89.0)
    # R20: pulse left, GND right — pulse node stays on LEFT of R20
    r20 = place(board, KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R20", "100k", 197.5, 89.0)
    # D23 ABOVE pulse node (K down to pulse, A into pour above)
    d23 = place(board, KFP / "Diode_SMD.pretty", "D_SOD-323", "D23", "1N4148WS", 195.2, 86.5, 90)
    # R21 below pulse, left of Q7: pulse top pad / gate bottom — use vertical
    r21 = place(board, KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R21", "100R", 194.5, 93.0, 90)
    # Q7 rot0: G left-top, S left-bot, D right
    q7 = place(board, KFP / "Package_TO_SOT_SMD.pretty", "SOT-23", "Q7", "AO3400", 198.5, 96.5, 0)

    pad(c20, "1").SetNet(n_12v)
    pad(c20, "2").SetNet(n_pulse)
    pad(r20, "1").SetNet(n_pulse)
    pad(r20, "2").SetNet(n_gnd)
    # D23 rot90: check pad positions
    pad(d23, "1").SetNet(n_pulse)  # K
    pad(d23, "2").SetNet(n_gnd)  # A
    # R21 rot90: pad1 and pad2 — assign after seeing coords
    pad(r21, "1").SetNet(n_pulse)
    pad(r21, "2").SetNet(n_gate)
    pad(q7, "1").SetNet(n_gate)
    pad(q7, "2").SetNet(n_gnd)
    pad(q7, "3").SetNet(n_lo)

    j5p, j5n = xy(j5, "1"), xy(j5, "2")
    d10k, d10a = xy(d10, "1"), xy(d10, "2")
    c1, c2 = xy(c20, "1"), xy(c20, "2")
    r20p, r20g = xy(r20, "1"), xy(r20, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    r21a, r21b = xy(r21, "1"), xy(r21, "2")
    qg, qs, qd = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")

    # Ensure R21: pulse pad is the one closer to y=89, gate closer to Q7
    if abs(r21a[1] - 89.0) > abs(r21b[1] - 89.0):
        # pad1 is farther from pulse bus — swap nets
        pad(r21, "1").SetNet(n_gate)
        pad(r21, "2").SetNet(n_pulse)
        r21p, r21g = r21b, r21a
    else:
        r21p, r21g = r21a, r21b

    # Ensure D23: K closer to pulse bus y=89
    if abs(d23k[1] - 89.0) > abs(d23a[1] - 89.0):
        pad(d23, "1").SetNet(n_gnd)
        pad(d23, "2").SetNet(n_pulse)
        d23k, d23a = d23a, d23k

    print("C20", c1, c2)
    print("R20", r20p, r20g)
    print("D23 K/A", d23k, d23a)
    print("R21 P/G", r21p, r21g)
    print("Q7 G/S/D", qg, qs, qd)

    # --- Pulse: only left-side node, never across R20 body ---
    # C20.2 -- R20.1 along y=89
    add_track(board, c2[0], c2[1], r20p[0], r20p[1], n_pulse, 0.25)
    # drop to R21 pulse pad
    add_track(board, r20p[0], r20p[1], r21p[0], r20p[1], n_pulse, 0.25)
    add_track(board, r21p[0], r20p[1], r21p[0], r21p[1], n_pulse, 0.25)
    # D23 K to pulse node
    add_track(board, d23k[0], d23k[1], r20p[0], d23k[1], n_pulse, 0.25)
    add_track(board, r20p[0], d23k[1], r20p[0], r20p[1], n_pulse, 0.25)

    # --- Gate: R21g to Q7.G (both left side) ---
    add_track(board, r21g[0], r21g[1], qg[0], r21g[1], n_gate, 0.25)
    add_track(board, qg[0], r21g[1], qg[0], qg[1], n_gate, 0.25)

    # --- CNT_LO: Q7.D right to J5− ---
    add_track(board, qd[0], qd[1], j5n[0], qd[1], n_lo, 0.4)
    add_track(board, j5n[0], qd[1], j5n[0], j5n[1], n_lo, 0.4)
    add_track(board, d10a[0], d10a[1], j5n[0], d10a[1], n_lo, 0.35)
    add_track(board, j5n[0], d10a[1], j5n[0], j5n[1], n_lo, 0.35)

    # --- 12V: D10 K / C20 / J5+ (bus at y=84, clear of pulse @87.55) ---
    add_track(board, d10k[0], d10k[1], j5p[0], d10k[1], n_12v, 0.35)
    add_track(board, j5p[0], d10k[1], j5p[0], j5p[1], n_12v, 0.4)
    add_track(board, c1[0], c1[1], c1[0], 84.0, n_12v, 0.3)
    add_track(board, c1[0], 84.0, j5p[0], 84.0, n_12v, 0.35)
    add_track(board, j5p[0], 84.0, j5p[0], j5p[1], n_12v, 0.4)

    # 12V feed: B.Cu @ y=111 between GND via@109 and LATCH@112, then north into pocket
    add_track(board, 168.0, 108.5, 168.0, 111.0, n_12v, 0.4, layer=pcbnew.B_Cu)
    add_track(board, 168.0, 111.0, 188.36, 111.0, n_12v, 0.4, layer=pcbnew.B_Cu)
    add_track(board, 188.36, 111.0, 188.36, 84.0, n_12v, 0.5, layer=pcbnew.B_Cu)
    add_via(board, 188.36, 84.0, n_12v)
    add_track(board, 188.36, 84.0, j5p[0], 84.0, n_12v, 0.4)

    # Repair 5V gap left by removing old J5/D10 stubs (L1/C3 island)
    n_5v = net(board, "/5V")
    add_track(board, 170.575, 90.975, 173.0, 93.05, n_5v, 0.5)

    # GND: R20 right pad UP; D23 A RIGHT (away from y=84 12V bus); Q7 S DOWN
    add_track(board, r20g[0], r20g[1], r20g[0], r20g[1] - 1.5, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0] + 1.5, d23a[1], n_gnd, 0.3)
    add_track(board, qs[0], qs[1], qs[0], qs[1] + 1.5, n_gnd, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("OK", PCB)


if __name__ == "__main__":
    main()
