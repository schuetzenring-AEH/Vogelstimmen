#!/usr/bin/env python3
"""Finish E-CNT-03 on already-migrated V3 PCB (0603 + CNT_12V present)."""
from __future__ import annotations

from pathlib import Path

import pcbnew

PCB = Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
KFP = Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints")
MM = 1_000_000


def net(board, name: str):
    n = board.FindNet(name)
    if n is not None:
        return n
    n = pcbnew.NETINFO_ITEM(board, name)
    board.Add(n)
    return n


def fp_by_ref(board, ref: str):
    for f in list(board.GetFootprints()):
        if f.GetReference() == ref:
            return f
    raise KeyError(ref)


def pad(fp, num: str):
    for p in fp.Pads():
        if p.GetNumber() == num:
            return p
    raise KeyError(num)


def xy(fp, num: str):
    p = pad(fp, num)
    return p.GetPosition().x / MM, p.GetPosition().y / MM


def near_pt(t, x, y, tol=0.3):
    for pt in (t.GetStart(), t.GetEnd()):
        if abs(pt.x / MM - x) <= tol and abs(pt.y / MM - y) <= tol:
            return True
    return False


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
    fp = pcbnew.FootprintLoad(str(lib), name)
    if fp is None:
        raise RuntimeError(name)
    fp.SetReference(ref)
    fp.SetValue(value)
    fp.SetPosition(pcbnew.VECTOR2I(int(round(x * MM)), int(round(y * MM))))
    if rot:
        fp.SetOrientation(pcbnew.EDA_ANGLE(rot, pcbnew.DEGREES_T))
    board.Add(fp)
    return fp


def main():
    board = pcbnew.LoadBoard(str(PCB))

    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")

    j5 = fp_by_ref(board, "J5")
    d10 = fp_by_ref(board, "D10")
    j5p, j5n = xy(j5, "1"), xy(j5, "2")
    d10_old = (xy(d10, "1"), xy(d10, "2"))

    # Remove any previous one-shot parts from failed runs
    for ref in ("Q7", "C20", "R20", "R21", "D23"):
        try:
            board.Remove(fp_by_ref(board, ref))
        except KeyError:
            pass

    # Remove CNT_* tracks and leftover stubs at J5/D10
    doomed = []
    for t in list(board.GetTracks()):
        cls = t.GetClass()
        if cls == "PCB_VIA":
            if t.GetNetname() in ("/CNT_LO", "/CNT_PULSE", "/CNT_GATE", "/12V_SW"):
                # only remove vias we may have added near J5/R12 later — skip for now
                pass
            continue
        if cls != "PCB_TRACK":
            continue
        n = t.GetNetname()
        if n in ("/CNT_LO", "/CNT_PULSE", "/CNT_GATE"):
            doomed.append(t)
            continue
        if n in ("/5V", "/GND") and (
            near_pt(t, j5p[0], j5p[1])
            or near_pt(t, j5n[0], j5n[1])
            or near_pt(t, d10_old[0][0], d10_old[0][1])
            or near_pt(t, d10_old[1][0], d10_old[1][1])
        ):
            doomed.append(t)
    for t in doomed:
        board.Remove(t)
    print("removed tracks", len(doomed))

    # Move D10 between J5 pads
    d10.SetPosition(pcbnew.VECTOR2I(int(197.48 * MM), int(106.0 * MM)))
    d10.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))

    pad(j5, "1").SetNet(n_12v)
    pad(j5, "2").SetNet(n_lo)
    pad(d10, "1").SetNet(n_12v)
    pad(d10, "2").SetNet(n_lo)

    # Place cluster
    c20 = place(board, KFP / "Capacitor_SMD.pretty", "C_0603_1608Metric", "C20", "1u/25V", 193.5, 90.5)
    r20 = place(board, KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R20", "100k", 197.0, 90.5)
    d23 = place(board, KFP / "Diode_SMD.pretty", "D_SOD-323", "D23", "1N4148WS", 200.5, 90.5)
    r21 = place(board, KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R21", "100R", 197.0, 94.0)
    q7 = place(board, KFP / "Package_TO_SOT_SMD.pretty", "SOT-23", "Q7", "AO3400", 197.0, 98.0, 180)

    pad(q7, "1").SetNet(n_gate)
    pad(q7, "2").SetNet(n_gnd)
    pad(q7, "3").SetNet(n_lo)
    pad(c20, "1").SetNet(n_12v)
    pad(c20, "2").SetNet(n_pulse)
    pad(r20, "1").SetNet(n_pulse)
    pad(r20, "2").SetNet(n_gnd)
    pad(d23, "1").SetNet(n_pulse)
    pad(d23, "2").SetNet(n_gnd)
    pad(r21, "1").SetNet(n_pulse)
    pad(r21, "2").SetNet(n_gate)

    # Refresh coords after place/move
    j5p, j5n = xy(j5, "1"), xy(j5, "2")
    d10k, d10a = xy(d10, "1"), xy(d10, "2")
    c1, c2 = xy(c20, "1"), xy(c20, "2")
    r20p, r20g = xy(r20, "1"), xy(r20, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    r21p, r21g = xy(r21, "1"), xy(r21, "2")
    qg, qs, qd = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")
    print("Q7 pads G/S/D", qg, qs, qd)

    # Pulse
    add_track(board, c2[0], c2[1], r20p[0], r20p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r20p[1], d23k[0], d23k[1], n_pulse, 0.25)
    add_track(board, r20p[0], r20p[1], r20p[0], r21p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r21p[1], r21p[0], r21p[1], n_pulse, 0.25)

    # Gate
    add_track(board, r21g[0], r21g[1], qg[0], r21g[1], n_gate, 0.25)
    add_track(board, qg[0], r21g[1], qg[0], qg[1], n_gate, 0.25)

    # Freilauf / coil
    add_track(board, d10k[0], d10k[1], j5p[0], d10k[1], n_12v, 0.35)
    add_track(board, j5p[0], d10k[1], j5p[0], j5p[1], n_12v, 0.4)
    add_track(board, d10a[0], d10a[1], j5n[0], d10a[1], n_lo, 0.35)
    add_track(board, j5n[0], d10a[1], j5n[0], j5n[1], n_lo, 0.4)
    add_track(board, qd[0], qd[1], j5n[0], qd[1], n_lo, 0.4)
    add_track(board, j5n[0], qd[1], j5n[0], j5n[1], n_lo, 0.4)

    # C20 to J5+ along y=88.5
    add_track(board, c1[0], c1[1], c1[0], 88.5, n_12v, 0.3)
    add_track(board, c1[0], 88.5, j5p[0], 88.5, n_12v, 0.35)
    add_track(board, j5p[0], 88.5, j5p[0], j5p[1], n_12v, 0.4)

    # 12V from R12 via B.Cu
    r12 = fp_by_ref(board, "R12")
    rx, ry = xy(r12, "1")
    vx1, vy1 = rx + 1.2, ry
    vx2, vy2 = j5p[0] - 2.0, 88.5
    add_track(board, rx, ry, vx1, vy1, n_12v, 0.4)
    add_via(board, vx1, vy1, n_12v)
    add_via(board, vx2, vy2, n_12v)
    add_track(board, vx1, vy1, vx2, vy2, n_12v, 0.5, layer=pcbnew.B_Cu)
    add_track(board, vx2, vy2, j5p[0], 88.5, n_12v, 0.35)

    # GND into pour
    add_track(board, r20g[0], r20g[1], r20g[0], r20g[1] - 1.2, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0], d23a[1] - 1.2, n_gnd, 0.3)
    add_track(board, qs[0], qs[1], qs[0], qs[1] - 1.2, n_gnd, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)

    board = pcbnew.LoadBoard(str(PCB))
    for ref in ("J5", "D10", "Q7", "C20", "R20", "R21", "D23"):
        f = fp_by_ref(board, ref)
        print(ref, [(p.GetNumber(), p.GetNetname()) for p in f.Pads()])


if __name__ == "__main__":
    main()
