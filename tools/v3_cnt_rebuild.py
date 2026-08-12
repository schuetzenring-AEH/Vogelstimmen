#!/usr/bin/env python3
"""Rebuild V3.0 PCB from V2.5: 0603 + CNT_12V One-Shot (clean routing)."""
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


def net(board, name: str):
    n = board.FindNet(name)
    if n is not None:
        return n
    n = pcbnew.NETINFO_ITEM(board, name)
    board.Add(n)
    return n


def pad(fp, num: str):
    for p in list(fp.Pads()):
        if p.GetNumber() == num:
            return p
    raise KeyError(f"{fp.GetReference()}.{num}")


def xy(fp, num: str):
    p = pad(fp, num)
    return p.GetPosition().x / MM, p.GetPosition().y / MM


def load_fp(lib: Path, name: str):
    fp = pcbnew.FootprintLoad(str(lib), name)
    if fp is None:
        raise RuntimeError(f"load {lib}/{name}")
    return fp


def replace_fp(board, old_fp, lib: Path, name: str, value=None):
    new_fp = load_fp(lib, name)
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
    return new_fp


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
    fp = load_fp(lib, name)
    fp.SetReference(ref)
    fp.SetValue(value)
    fp.SetPosition(pcbnew.VECTOR2I(int(round(x * MM)), int(round(y * MM))))
    if rot:
        fp.SetOrientation(pcbnew.EDA_ANGLE(rot, pcbnew.DEGREES_T))
    board.Add(fp)
    return fp


def near_pt(t, x, y, tol=0.25):
    for pt in (t.GetStart(), t.GetEnd()):
        if abs(pt.x / MM - x) <= tol and abs(pt.y / MM - y) <= tol:
            return True
    return False


def main():
    shutil.copy2(SRC, PCB)
    board = pcbnew.LoadBoard(str(PCB))

    # 1) all R -> 0603 (collect first — Remove invalidates iterators)
    to_r = [
        fp
        for fp in list(board.GetFootprints())
        if fp.GetReference().startswith("R") and "0402" in fp.GetFPIDAsString()
    ]
    for fp in to_r:
        replace_fp(board, fp, R_LIB, "R_0603_1608Metric")

    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))

    # 2) J5 -> CNT_12V
    j5 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "J5")
    replace_fp(board, j5, LOCAL, "CNT_12V_WIRE", "CNT_12V")
    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))
    j5 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "J5")

    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")

    # 3) Disconnect old J5 from 5V: remove tracks touching J5 pads on /5V or /GND
    j5p = xy(j5, "1")
    j5n = xy(j5, "2")
    doomed = []
    for t in list(board.GetTracks()):
        if t.GetClass() != "PCB_TRACK":
            continue
        if t.GetNetname() not in ("/5V", "/GND"):
            continue
        if near_pt(t, j5p[0], j5p[1]) or near_pt(t, j5n[0], j5n[1]):
            doomed.append(t)
    for t in doomed:
        board.Remove(t)
    print("removed J5 stubs", len(doomed))

    # Also disconnect D10 from 5V/GND tracks (will reassign nets)
    d10 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "D10")
    d10_old = (xy(d10, "1"), xy(d10, "2"))
    doomed = []
    for t in list(board.GetTracks()):
        if t.GetClass() != "PCB_TRACK":
            continue
        if t.GetNetname() not in ("/5V", "/GND"):
            continue
        if near_pt(t, d10_old[0][0], d10_old[0][1]) or near_pt(t, d10_old[1][0], d10_old[1][1]):
            doomed.append(t)
    for t in doomed:
        board.Remove(t)
    print("removed D10 stubs", len(doomed))

    # Move D10 between J5 pads, above pad centers
    d10.SetPosition(pcbnew.VECTOR2I(int(197.48 * MM), int(106.0 * MM)))
    d10.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))

    pad(j5, "1").SetNet(n_12v)
    pad(j5, "2").SetNet(n_lo)
    pad(d10, "1").SetNet(n_12v)  # K
    pad(d10, "2").SetNet(n_lo)  # A

    pcbnew.SaveBoard(str(PCB), board)
    board = pcbnew.LoadBoard(str(PCB))
    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")
    j5 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "J5")
    d10 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "D10")
    # re-assert nets after reload
    pad(j5, "1").SetNet(n_12v)
    pad(j5, "2").SetNet(n_lo)
    pad(d10, "1").SetNet(n_12v)
    pad(d10, "2").SetNet(n_lo)

    # 4) Place one-shot in clear pocket (193–201, 88–100)
    c20 = place(board, KFP / "Capacitor_SMD.pretty", "C_0603_1608Metric", "C20", "1u/25V", 193.5, 90.5)
    r20 = place(board, KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R20", "100k", 197.0, 90.5)
    d23 = place(board, KFP / "Diode_SMD.pretty", "D_SOD-323", "D23", "1N4148WS", 200.5, 90.5)
    r21 = place(board, KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R21", "100R", 197.0, 94.0)
    q7 = place(board, KFP / "Package_TO_SOT_SMD.pretty", "SOT-23", "Q7", "AO3400", 197.0, 98.0, 180)

    # With rot 180: pad positions flip — still assign by pad number (G=1,S=2,D=3)
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

    j5p, j5n = xy(j5, "1"), xy(j5, "2")
    d10k, d10a = xy(d10, "1"), xy(d10, "2")
    c1, c2 = xy(c20, "1"), xy(c20, "2")
    r20p, r20g = xy(r20, "1"), xy(r20, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    r21p, r21g = xy(r21, "1"), xy(r21, "2")
    qg, qs, qd = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")

    print("pads Q7", qg, qs, qd)
    print("J5", j5p, j5n)
    print("D10", d10k, d10a)

    # --- Local F.Cu routes (stay in x>192, y<108) ---
    # Pulse bus y~90.5
    add_track(board, c2[0], c2[1], r20p[0], r20p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r20p[1], d23k[0], d23k[1], n_pulse, 0.25)
    add_track(board, r20p[0], r20p[1], r20p[0], r21p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r21p[1], r21p[0], r21p[1], n_pulse, 0.25)

    # Gate
    add_track(board, r21g[0], r21g[1], qg[0], r21g[1], n_gate, 0.25)
    add_track(board, qg[0], r21g[1], qg[0], qg[1], n_gate, 0.25)

    # Freilauf + coil terminals
    add_track(board, d10k[0], d10k[1], j5p[0], d10k[1], n_12v, 0.35)
    add_track(board, j5p[0], d10k[1], j5p[0], j5p[1], n_12v, 0.4)
    add_track(board, d10a[0], d10a[1], j5n[0], d10a[1], n_lo, 0.35)
    add_track(board, j5n[0], d10a[1], j5n[0], j5n[1], n_lo, 0.4)

    # Q7 drain to J5− : stay right side
    add_track(board, qd[0], qd[1], j5n[0], qd[1], n_lo, 0.4)
    add_track(board, j5n[0], qd[1], j5n[0], j5n[1], n_lo, 0.4)

    # C20 12V to J5+ along top (y=88.5) then down pad1
    add_track(board, c1[0], c1[1], c1[0], 88.5, n_12v, 0.3)
    add_track(board, c1[0], 88.5, j5p[0], 88.5, n_12v, 0.35)
    add_track(board, j5p[0], 88.5, j5p[0], j5p[1], n_12v, 0.4)

    # 12V_SW feed from R12 via B.Cu (avoid F.Cu dense area)
    r12 = next(f for f in list(board.GetFootprints()) if f.GetReference() == "R12")
    rx, ry = xy(r12, "1")
    vx1, vy1 = rx + 1.2, ry
    vx2, vy2 = j5p[0] - 2.0, 88.5
    add_track(board, rx, ry, vx1, vy1, n_12v, 0.4)
    add_via(board, vx1, vy1, n_12v)
    add_via(board, vx2, vy2, n_12v)
    add_track(board, vx1, vy1, vx2, vy2, n_12v, 0.5, layer=pcbnew.B_Cu)
    add_track(board, vx2, vy2, j5p[0], 88.5, n_12v, 0.35)

    # GND stubs into pour
    add_track(board, r20g[0], r20g[1], r20g[0], r20g[1] - 1.2, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0], d23a[1] - 1.2, n_gnd, 0.3)
    add_track(board, qs[0], qs[1], qs[0], qs[1] - 1.2, n_gnd, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)
    print("saved", PCB)


if __name__ == "__main__":
    main()
