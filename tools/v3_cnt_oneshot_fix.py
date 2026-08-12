#!/usr/bin/env python3
"""Fix E-CNT-03 routing: remove bad tracks, re-place cluster, route cleanly."""
from __future__ import annotations

from pathlib import Path

import pcbnew

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
PCB = ROOT / "hardware" / "V3.0" / "vogelstimmen_v3.0.kicad_pcb"
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


def pad(fp, num: str):
    for p in fp.Pads():
        if p.GetNumber() == num:
            return p
    raise KeyError(num)


def xy(fp, num: str):
    p = pad(fp, num)
    return p.GetPosition().x / MM, p.GetPosition().y / MM


def load_fp(lib: Path, name: str):
    fp = pcbnew.FootprintLoad(str(lib), name)
    if fp is None:
        raise RuntimeError(name)
    return fp


def add_track(board, x1, y1, x2, y2, netinfo, width=0.3, layer=None):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(int(x1 * MM), int(y1 * MM)))
    t.SetEnd(pcbnew.VECTOR2I(int(x2 * MM), int(y2 * MM)))
    t.SetWidth(int(width * MM))
    t.SetLayer(pcbnew.F_Cu if layer is None else layer)
    t.SetNet(netinfo)
    board.Add(t)
    return t


def add_via(board, x, y, netinfo, drill=0.3, size=0.6):
    v = pcbnew.PCB_VIA(board)
    v.SetPosition(pcbnew.VECTOR2I(int(x * MM), int(y * MM)))
    v.SetDrill(int(drill * MM))
    v.SetWidth(int(size * MM))
    v.SetNet(netinfo)
    # KiCad 10 via layer pair
    v.SetLayerPair(pcbnew.F_Cu, pcbnew.B_Cu)
    board.Add(v)
    return v


def near(ax, ay, bx, by, tol=0.05):
    return abs(ax - bx) <= tol and abs(ay - by) <= tol


def main():
    board = pcbnew.LoadBoard(str(PCB))

    n_12v = net(board, "/12V_SW")
    n_gnd = net(board, "/GND")
    n_lo = net(board, "/CNT_LO")
    n_pulse = net(board, "/CNT_PULSE")
    n_gate = net(board, "/CNT_GATE")
    n_5v = net(board, "/5V")

    # --- remove one-shot footprints ---
    for ref in ("Q7", "C20", "R20", "R21", "D23"):
        for f in list(board.GetFootprints()):
            if f.GetReference() == ref:
                board.Remove(f)

    # --- remove tracks on CNT_* and my bad 12V stubs / leftover 5V to J5 ---
    doomed = []
    for t in board.GetTracks():
        if t.GetClass() != "PCB_TRACK":
            continue
        n = t.GetNetname()
        sx, sy = t.GetStart().x / MM, t.GetStart().y / MM
        ex, ey = t.GetEnd().x / MM, t.GetEnd().y / MM
        if n in ("/CNT_LO", "/CNT_PULSE", "/CNT_GATE"):
            doomed.append(t)
            continue
        # leftover 5V stubs into J5 pad1 area
        if n == "/5V" and (
            near(sx, sy, 189.86, 108.98, 0.2)
            or near(ex, ey, 189.86, 108.98, 0.2)
            or near(sx, sy, 189.86, 107.86, 0.2)
            or near(ex, ey, 189.86, 107.86, 0.2)
        ):
            doomed.append(t)
            continue
        # my 12V_SW highways (horizontal/vertical through crowded zone)
        if n == "/12V_SW":
            pts = [(sx, sy), (ex, ey)]
            # vertical from D10 down to 108.98
            if any(near(x, y, 172.95, 87.5, 0.15) for x, y in pts) and any(
                abs(y - 108.98) < 0.15 for _, y in pts
            ):
                doomed.append(t)
                continue
            if any(abs(y - 108.98) < 0.05 and x > 170 for x, y in pts):
                doomed.append(t)
                continue
            if any(abs(y - 97.0) < 0.05 and 168 < x < 185 for x, y in pts):
                doomed.append(t)
                continue
            if any(near(x, y, 170.18, 97.0, 0.15) for x, y in pts) and any(
                near(x, y, 170.18, 112.0, 0.15) for x, y in pts
            ):
                doomed.append(t)
                continue
            if any(near(x, y, 182.22, 97.0, 0.2) for x, y in pts):
                doomed.append(t)
                continue

    for t in doomed:
        board.Remove(t)
    print("removed tracks", len(doomed))

    # --- ensure J5 is CNT_12V ---
    j5 = next(f for f in board.GetFootprints() if f.GetReference() == "J5")
    if "CNT_5V" in j5.GetFPIDAsString() or j5.GetValue() != "CNT_12V":
        new = load_fp(LOCAL, "CNT_12V_WIRE")
        new.SetPosition(j5.GetPosition())
        new.SetOrientation(j5.GetOrientation())
        new.SetReference("J5")
        new.SetValue("CNT_12V")
        board.Remove(j5)
        board.Add(new)
        j5 = new
    pad(j5, "1").SetNet(n_12v)
    pad(j5, "2").SetNet(n_lo)

    # --- move D10 next to J5 pads (between + and −, just above pads) ---
    d10 = next(f for f in board.GetFootprints() if f.GetReference() == "D10")
    # Place at midpoint of pads, slightly above (smaller Y from courtyard)
    d10.SetPosition(pcbnew.VECTOR2I(int(197.48 * MM), int(106.2 * MM)))
    d10.SetOrientation(pcbnew.EDA_ANGLE(0, pcbnew.DEGREES_T))
    pad(d10, "1").SetNet(n_12v)  # K
    pad(d10, "2").SetNet(n_lo)  # A

    def place(lib, name, ref, value, x, y, rot=0, lcsc=None):
        fp = load_fp(lib, name)
        fp.SetReference(ref)
        fp.SetValue(value)
        fp.SetPosition(pcbnew.VECTOR2I(int(x * MM), int(y * MM)))
        if rot:
            fp.SetOrientation(pcbnew.EDA_ANGLE(rot, pcbnew.DEGREES_T))
        board.Add(fp)
        return fp

    # Cluster in open pocket above J5 (x~193–201, y~90–100)
    c20 = place(KFP / "Capacitor_SMD.pretty", "C_0603_1608Metric", "C20", "1u/25V", 193.5, 92.0, 0)
    r20 = place(KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R20", "100k", 197.0, 92.0, 0)
    d23 = place(KFP / "Diode_SMD.pretty", "D_SOD-323", "D23", "1N4148WS", 200.5, 92.0, 0)
    r21 = place(KFP / "Resistor_SMD.pretty", "R_0603_1608Metric", "R21", "100R", 197.0, 95.5, 0)
    q7 = place(KFP / "Package_TO_SOT_SMD.pretty", "SOT-23", "Q7", "AO3400", 197.0, 99.0, 0)

    # Nets: AO3400 SOT-23 pad1=G pad2=S pad3=D
    pad(q7, "1").SetNet(n_gate)
    pad(q7, "2").SetNet(n_gnd)
    pad(q7, "3").SetNet(n_lo)

    pad(c20, "1").SetNet(n_12v)
    pad(c20, "2").SetNet(n_pulse)
    pad(r20, "1").SetNet(n_pulse)
    pad(r20, "2").SetNet(n_gnd)
    # D23: K=1 to pulse, A=2 to GND
    pad(d23, "1").SetNet(n_pulse)
    pad(d23, "2").SetNet(n_gnd)
    pad(r21, "1").SetNet(n_pulse)
    pad(r21, "2").SetNet(n_gate)

    # --- local routing in pocket (short, no crossings) ---
    # C20: left=12V, right=pulse (0603 at 193.5)
    c1, c2 = xy(c20, "1"), xy(c20, "2")
    r20p, r20g = xy(r20, "1"), xy(r20, "2")
    d23k, d23a = xy(d23, "1"), xy(d23, "2")
    r21p, r21g = xy(r21, "1"), xy(r21, "2")
    qg, qs, qd = xy(q7, "1"), xy(q7, "2"), xy(q7, "3")
    j5p, j5n = xy(j5, "1"), xy(j5, "2")
    d10k, d10a = xy(d10, "1"), xy(d10, "2")

    # Pulse star along y=92: C20.2 — R20.1 — and down to R21 / D23
    add_track(board, c2[0], c2[1], r20p[0], r20p[1], n_pulse, 0.25)
    # R20.1 down to R21.1
    add_track(board, r20p[0], r20p[1], r20p[0], r21p[1], n_pulse, 0.25)
    add_track(board, r20p[0], r21p[1], r21p[0], r21p[1], n_pulse, 0.25)
    # D23 K from pulse: from C20-R20 line to D23
    add_track(board, r20p[0], r20p[1], d23k[0], d23k[1], n_pulse, 0.25)

    # Gate: R21.2 to Q7.G
    add_track(board, r21g[0], r21g[1], r21g[0], qg[1], n_gate, 0.25)
    add_track(board, r21g[0], qg[1], qg[0], qg[1], n_gate, 0.25)

    # CNT_LO: Q7.D to J5− ; D10 A to J5−
    # Q7 drain typically pad3 — route right then down to J5−
    add_track(board, qd[0], qd[1], j5n[0], qd[1], n_lo, 0.4)
    add_track(board, j5n[0], qd[1], j5n[0], j5n[1], n_lo, 0.4)
    add_track(board, d10a[0], d10a[1], j5n[0], d10a[1], n_lo, 0.3)
    add_track(board, j5n[0], d10a[1], j5n[0], j5n[1], n_lo, 0.3)

    # 12V_SW: J5+ to D10 K (short)
    add_track(board, j5p[0], j5p[1], j5p[0], d10k[1], n_12v, 0.4)
    add_track(board, j5p[0], d10k[1], d10k[0], d10k[1], n_12v, 0.4)
    # C20.1 to J5+ via vertical then horizontal above courtyard
    add_track(board, c1[0], c1[1], c1[0], 90.0, n_12v, 0.35)
    add_track(board, c1[0], 90.0, j5p[0], 90.0, n_12v, 0.35)
    add_track(board, j5p[0], 90.0, j5p[0], j5p[1], n_12v, 0.4)

    # Feed 12V_SW from R12 pad1 via B.Cu to avoid F.Cu mess
    r12 = next(f for f in board.GetFootprints() if f.GetReference() == "R12")
    r12p = xy(r12, "1")
    # via near R12, B.Cu to via near J5+
    add_via(board, r12p[0], r12p[1] - 1.5, n_12v)
    add_track(board, r12p[0], r12p[1], r12p[0], r12p[1] - 1.5, n_12v, 0.4)
    add_via(board, j5p[0] - 1.5, j5p[1] - 1.5, n_12v)
    add_track(
        board,
        r12p[0],
        r12p[1] - 1.5,
        j5p[0] - 1.5,
        j5p[1] - 1.5,
        n_12v,
        0.5,
        layer=pcbnew.B_Cu,
    )
    add_track(board, j5p[0] - 1.5, j5p[1] - 1.5, j5p[0], j5p[1], n_12v, 0.4)

    # GND stubs into pour (short)
    add_track(board, r20g[0], r20g[1], r20g[0], r20g[1] - 1.0, n_gnd, 0.3)
    add_track(board, d23a[0], d23a[1], d23a[0], d23a[1] - 1.0, n_gnd, 0.3)
    add_track(board, qs[0], qs[1], qs[0] - 1.2, qs[1], n_gnd, 0.35)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(PCB), board)

    for ref in ("J5", "D10", "Q7", "C20", "R20", "R21", "D23"):
        fp = next(f for f in board.GetFootprints() if f.GetReference() == ref)
        print(ref, [(p.GetNumber(), p.GetNetname()) for p in fp.Pads()],
              round(fp.GetPosition().x / MM, 2), round(fp.GetPosition().y / MM, 2))


if __name__ == "__main__":
    main()
