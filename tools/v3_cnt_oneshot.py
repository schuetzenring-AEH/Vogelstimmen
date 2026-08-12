#!/usr/bin/env python3
"""V3.0: One-Shot + 12V counter pads (E-CNT-03)."""
from __future__ import annotations

from pathlib import Path

import pcbnew

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
DST = ROOT / "hardware" / "V3.0"
PCB = DST / "vogelstimmen_v3.0.kicad_pcb"
SCH = DST / "vogelstimmen_v3.0.kicad_sch"
LOCAL = ROOT / "hardware" / "footprints" / "vogelstimmen.pretty"
KFP = Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints")

MM = 1_000_000


def net(board, name: str):
    n = board.FindNet(name)
    if n is not None:
        return n
    n = pcbnew.NETINFO_ITEM(board, name)
    board.Add(n)
    return n


def pad_by_num(fp, num: str):
    for p in fp.Pads():
        if p.GetNumber() == num:
            return p
    raise KeyError(num)


def add_track(board, x1, y1, x2, y2, netinfo, width=0.35):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(int(x1 * MM), int(y1 * MM)))
    t.SetEnd(pcbnew.VECTOR2I(int(x2 * MM), int(y2 * MM)))
    t.SetWidth(int(width * MM))
    t.SetLayer(pcbnew.F_Cu)
    t.SetNet(netinfo)
    board.Add(t)
    return t


def load_fp(lib_dir: Path, name: str):
    fp = pcbnew.FootprintLoad(str(lib_dir), name)
    if fp is None:
        raise RuntimeError(f"cannot load {lib_dir}/{name}")
    return fp


def replace_j5(board):
    old = next(f for f in board.GetFootprints() if f.GetReference() == "J5")
    new = load_fp(LOCAL, "CNT_12V_WIRE")
    new.SetPosition(old.GetPosition())
    new.SetOrientation(old.GetOrientation())
    new.SetReference("J5")
    new.SetValue("CNT_12V")
    board.Remove(old)
    board.Add(new)
    return new


def remove_tracks_to_point(board, x, y, netname, tol_mm=0.15):
    """Remove F.Cu tracks that start/end near a pad of given net (disconnect old routing)."""
    tx, ty = x * MM, y * MM
    tol = int(tol_mm * MM)
    doomed = []
    for t in board.GetTracks():
        if t.GetClass() != "PCB_TRACK":
            continue
        if t.GetNetname() != netname:
            continue
        for pt in (t.GetStart(), t.GetEnd()):
            if abs(pt.x - tx) <= tol and abs(pt.y - ty) <= tol:
                doomed.append(t)
                break
    for t in doomed:
        board.Remove(t)
    return len(doomed)


def place(board, lib, name, ref, value, x, y, rot_deg=0, lcsc=None):
    fp = load_fp(lib, name)
    fp.SetReference(ref)
    fp.SetValue(value)
    fp.SetPosition(pcbnew.VECTOR2I(int(x * MM), int(y * MM)))
    if rot_deg:
        fp.SetOrientation(pcbnew.EDA_ANGLE(rot_deg, pcbnew.DEGREES_T))
    if lcsc:
        fp.SetField("LCSC", lcsc)
    board.Add(fp)
    return fp


def patch_schematic():
    t = SCH.read_text(encoding="utf-8")
    t = t.replace('(property "Value" "CNT_5V"', '(property "Value" "CNT_12V"')
    t = t.replace(
        '(property "Footprint" "vogelstimmen:CNT_5V_WIRE"',
        '(property "Footprint" "vogelstimmen:CNT_12V_WIRE"',
    )
    t = t.replace(
        '(property "Description" "5V EM-Impulszähler Litzen an J5 (+/GND); Hengstler 0 635 132 / Trumeter E660 5V"',
        '(property "Description" "12V EM-Zähler Litzen; One-Shot ~80ms an 12V_SW (E-CNT-03); CSK6/875 DC12V"',
    )
    # Labels at J5/D10 area: 5V -> 12V_SW (session supply to counter +)
    t = t.replace(
        '(label "5V"\n\t\t(at 190.5 162.56 0)',
        '(label "12V_SW"\n\t\t(at 190.5 162.56 0)',
    )
    t = t.replace(
        '(label "5V"\n\t\t(at 187.96 166.37 90)',
        '(label "12V_SW"\n\t\t(at 187.96 166.37 90)',
    )

    # Schematic note (full symbol wiring: tidy in KiCad if desired; PCB is authoritative)
    note = '''\t(text "E-CNT-03 One-Shot: 12V_SW→C20(1u)→R21(100R)→Q7.G; R20(100k)+D23 clamp→GND; Q7=AO3400 D=CNT_LO=J5−; J5+=12V_SW; D10 Freilauf. BOM: C20 C23630, R20 C25803, R21 C25796, D23 C118873, Q7 C20917"
\t\t(exclude_from_sim no)
\t\t(at 210.82 152.4 0)
\t\t(effects
\t\t\t(font
\t\t\t\t(size 1.016 1.016)
\t\t\t)
\t\t\t(justify left)
\t\t)
\t\t(uuid "c1000000-0000-4000-8000-00000000c103")
\t)
'''
    if "E-CNT-03 One-Shot" not in t:
        t = t.rstrip()
        if t.endswith(")"):
            t = t[:-1] + note + ")\n"

    SCH.write_text(t, encoding="utf-8")


def patch_pcb():
    board = pcbnew.LoadBoard(str(PCB))

    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")

    # Disconnect old J5 pad1 from 5V track stub
    j5_old = next(f for f in board.GetFootprints() if f.GetReference() == "J5")
    p1 = pad_by_num(j5_old, "1")
    removed = remove_tracks_to_point(
        board, p1.GetPosition().x / MM, p1.GetPosition().y / MM, "/5V"
    )
    print("removed 5V stubs at J5+", removed)

    j5 = replace_j5(board)
    pad_by_num(j5, "1").SetNet(n_12v)
    pad_by_num(j5, "2").SetNet(n_lo)

    d10 = next(f for f in board.GetFootprints() if f.GetReference() == "D10")
    # K=1 -> 12V_SW, A=2 -> CNT_LO
    pad_by_num(d10, "1").SetNet(n_12v)
    pad_by_num(d10, "2").SetNet(n_lo)
    # Drop old D10 5V/GND local stubs if any
    for pn, nname in (("1", "/5V"), ("2", "/GND")):
        p = pad_by_num(d10, pn)
        remove_tracks_to_point(board, p.GetPosition().x / MM, p.GetPosition().y / MM, nname)

    # Place one-shot cluster left of J5 (board crowded; use pocket ~183–191, 97–104)
    q7 = place(
        board,
        KFP / "Package_TO_SOT_SMD.pretty",
        "SOT-23",
        "Q7",
        "AO3400",
        186.5,
        101.0,
        rot_deg=-90,
        lcsc="C20917",
    )
    c20 = place(
        board,
        KFP / "Capacitor_SMD.pretty",
        "C_0603_1608Metric",
        "C20",
        "1u/25V",
        183.0,
        97.0,
        rot_deg=0,
        lcsc="C23630",
    )
    r20 = place(
        board,
        KFP / "Resistor_SMD.pretty",
        "R_0603_1608Metric",
        "R20",
        "100k",
        186.5,
        97.0,
        rot_deg=0,
        lcsc="C25803",
    )
    r21 = place(
        board,
        KFP / "Resistor_SMD.pretty",
        "R_0603_1608Metric",
        "R21",
        "100R",
        189.5,
        99.5,
        rot_deg=90,
        lcsc="C25796",
    )
    d23 = place(
        board,
        KFP / "Diode_SMD.pretty",
        "D_SOD-323",
        "D23",
        "1N4148WS",
        183.0,
        99.5,
        rot_deg=90,
        lcsc="C118873",
    )

    # AO3400 / 2N7002 SOT-23: 1=G, 2=S, 3=D (confirm KiCad SOT-23 pin numbers)
    # KiCad Transistor_FET SOT-23 typically: pad1=G, pad2=S, pad3=D
    pad_by_num(q7, "1").SetNet(n_gate)  # G
    pad_by_num(q7, "2").SetNet(n_gnd)  # S
    pad_by_num(q7, "3").SetNet(n_lo)  # D

    # C20: 1 = 12V_SW, 2 = CNT_PULSE
    pad_by_num(c20, "1").SetNet(n_12v)
    pad_by_num(c20, "2").SetNet(n_pulse)

    # R20: 1 = CNT_PULSE, 2 = GND
    pad_by_num(r20, "1").SetNet(n_pulse)
    pad_by_num(r20, "2").SetNet(n_gnd)

    # R21: 1 = CNT_PULSE, 2 = CNT_GATE
    pad_by_num(r21, "1").SetNet(n_pulse)
    pad_by_num(r21, "2").SetNet(n_gate)

    # D23: K=1 cathode -> CNT_PULSE, A=2 anode -> GND (negative clamp)
    pad_by_num(d23, "1").SetNet(n_pulse)
    pad_by_num(d23, "2").SetNet(n_gnd)

    def xy(fp, num):
        p = pad_by_num(fp, num)
        return p.GetPosition().x / MM, p.GetPosition().y / MM

    # --- Routing ---
    # C20 between 12V_SW and pulse: pick 12V from nearby R4 pad1
    r4 = next(f for f in board.GetFootprints() if f.GetReference() == "R4")
    r4_12 = xy(r4, "1")
    c20_a, c20_b = xy(c20, "1"), xy(c20, "2")
    add_track(board, r4_12[0], r4_12[1], r4_12[0], 97.0, n_12v, 0.4)
    add_track(board, r4_12[0], 97.0, c20_a[0], c20_a[1], n_12v, 0.4)

    # J5+ to 12V_SW: from C20 pin1 / shared node
    j5p = xy(j5, "1")
    add_track(board, c20_a[0], c20_a[1], c20_a[0], 108.98, n_12v, 0.5)
    add_track(board, c20_a[0], 108.98, j5p[0], j5p[1], n_12v, 0.5)

    # D10 cathode (K) to 12V: connect to J5+
    d10k = xy(d10, "1")
    add_track(board, d10k[0], d10k[1], d10k[0], 108.98, n_12v, 0.35)
    add_track(board, d10k[0], 108.98, j5p[0], j5p[1], n_12v, 0.35)

    # Pulse net star
    r20a, r20b = xy(r20, "1"), xy(r20, "2")
    r21a, r21b = xy(r21, "1"), xy(r21, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    add_track(board, c20_b[0], c20_b[1], r20a[0], r20a[1], n_pulse, 0.3)
    add_track(board, r20a[0], r20a[1], r21a[0], r21a[1], n_pulse, 0.3)
    add_track(board, r20a[0], r20a[1], d23k[0], d23k[1], n_pulse, 0.3)

    # Gate
    q7g, q7s, q7d = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")
    add_track(board, r21b[0], r21b[1], q7g[0], q7g[1], n_gate, 0.25)

    # CNT_LO: J5-, D10 A, Q7 D
    j5n = xy(j5, "2")
    d10a = xy(d10, "2")
    add_track(board, q7d[0], q7d[1], q7d[0], 108.98, n_lo, 0.5)
    add_track(board, q7d[0], 108.98, j5n[0], j5n[1], n_lo, 0.5)
    add_track(board, d10a[0], d10a[1], d10a[0], 108.5, n_lo, 0.35)
    add_track(board, d10a[0], 108.5, j5n[0], j5n[1], n_lo, 0.35)

    # GND ties for R20, D23, Q7 source — rely on GND zone where possible;
    # add short tracks into zone copper
    add_track(board, r20b[0], r20b[1], r20b[0], r20b[1] + 1.2, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0] - 1.2, d23a[1], n_gnd, 0.3)
    add_track(board, q7s[0], q7s[1], q7s[0] - 1.2, q7s[1], n_gnd, 0.4)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())

    # Connectivity / DRC summary
    drc = pcbnew.DRC(board) if hasattr(pcbnew, "DRC") else None
    settings = board.GetDesignSettings()
    # Unconnected pads report
    conn = board.GetConnectivity()
    unconn = 0
    for fp in board.GetFootprints():
        if fp.GetReference() in ("Q7", "C20", "R20", "R21", "D23", "J5", "D10"):
            for p in fp.Pads():
                if p.GetNetCode() == 0:
                    print("NO NET", fp.GetReference(), p.GetNumber())
                    unconn += 1
                else:
                    # cluster size
                    pass
    print("pads without net on new cluster:", unconn)

    pcbnew.SaveBoard(str(PCB), board)
    print("saved", PCB)

    # Verify nets
    board2 = pcbnew.LoadBoard(str(PCB))
    for ref in ("J5", "D10", "Q7", "C20", "R20", "R21", "D23"):
        fp = next(f for f in board2.GetFootprints() if f.GetReference() == ref)
        nets = [(p.GetNumber(), p.GetNetname()) for p in fp.Pads()]
        print(ref, nets)


def main():
    patch_schematic()
    print("schematic patched")
    patch_pcb()


if __name__ == "__main__":
    main()
