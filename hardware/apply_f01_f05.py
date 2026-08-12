"""Apply F-01…F-05 to vogelstimmen_v2.4 PCB (from clean 2.final baseline)."""
from __future__ import annotations

import shutil

import pcbnew

BOARD = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb"
BASE = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\2.final\vogelstimmen_v2.4.kicad_pcb"


def mm(x: float) -> int:
    return int(pcbnew.FromMM(x))


def find_fp(board, ref: str):
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    raise KeyError(ref)


def ensure_net(board, name: str):
    n = board.FindNet(name)
    if n is not None:
        return n
    n = pcbnew.NETINFO_ITEM(board, name)
    board.Add(n)
    return n


def add_clone(board, src, ref, value, x, y, rot, strip_courtyard=False):
    fp = pcbnew.FOOTPRINT(src)
    board.Add(fp)
    fp.SetReference(ref)
    fp.SetValue(value)
    fp.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
    fp.SetOrientation(pcbnew.EDA_ANGLE(rot, pcbnew.DEGREES_T))
    if strip_courtyard:
        for g in list(fp.GraphicalItems()):
            if g.GetLayer() in (pcbnew.F_CrtYd, pcbnew.B_CrtYd):
                fp.Remove(g)
    return fp


def fp_pads(fp):
    return [fp.Pads()[i] for i in range(len(fp.Pads()))]


def pad_by_num(fp, num: str):
    for p in fp_pads(fp):
        if p.GetNumber() == num:
            return p
    raise KeyError(num)


def xy(pad):
    return pcbnew.ToMM(pad.GetX()), pcbnew.ToMM(pad.GetY())


def d2(ax, ay, bx, by):
    return (ax - bx) ** 2 + (ay - by) ** 2


def delete_tracks(board, tracks):
    for t in tracks:
        board.Delete(t)


def tracks_matching(board, pred):
    out = []
    for t in board.GetTracks():
        if t.Type() != pcbnew.PCB_TRACE_T:
            continue
        if pred(t):
            out.append(t)
    return out


def near_point(t, x, y, tol):
    for pt in (t.GetStart(), t.GetEnd()):
        if d2(pcbnew.ToMM(pt.x), pcbnew.ToMM(pt.y), x, y) <= tol * tol:
            return True
    return False


def seg_near(t, x1, y1, x2, y2, tol=0.15):
    """True if track endpoints match segment (either direction)."""
    a = (pcbnew.ToMM(t.GetStart().x), pcbnew.ToMM(t.GetStart().y))
    b = (pcbnew.ToMM(t.GetEnd().x), pcbnew.ToMM(t.GetEnd().y))
    p1, p2 = (x1, y1), (x2, y2)
    return (d2(*a, *p1) <= tol * tol and d2(*b, *p2) <= tol * tol) or (
        d2(*a, *p2) <= tol * tol and d2(*b, *p1) <= tol * tol
    )


def track(board, x1, y1, x2, y2, w, net):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(mm(x1), mm(y1)))
    t.SetEnd(pcbnew.VECTOR2I(mm(x2), mm(y2)))
    t.SetWidth(mm(w))
    t.SetLayer(pcbnew.F_Cu)
    t.SetNet(ensure_net(board, net))
    board.Add(t)
    return t


def main():
    shutil.copyfile(BASE, BOARD)
    board = pcbnew.LoadBoard(BOARD)
    d1 = find_fp(board, "D1")
    r3 = find_fp(board, "R3")
    c3 = find_fp(board, "C3")

    # F-02: VOS sense resistor → 0R
    find_fp(board, "R5").SetValue("0R")
    print("F-02")

    # F-05: SPK width ≥ 0.4 mm
    n = 0
    for t in board.GetTracks():
        if t.Type() == pcbnew.PCB_TRACE_T and "SPK" in t.GetNetname():
            if pcbnew.ToMM(t.GetWidth()) < 0.399:
                t.SetWidth(mm(0.4))
                n += 1
    print("F-05", n)

    # F-04: 10Ω in series into J6 LED+
    j6 = find_fp(board, "J6")
    j6p1 = pad_by_num(j6, "1")
    jx, jy = xy(j6p1)
    # remove feed into J6+ (long diagonal + pad stubs)
    del_j6 = tracks_matching(
        board,
        lambda t: t.GetNetname() == "/12V_SW"
        and (
            near_point(t, jx, jy, 0.6)
            or seg_near(t, 175.04, 114.50, 184.73, 124.19)
            or near_point(t, 184.69, 123.69, 0.3)
        ),
    )
    delete_tracks(board, del_j6)
    net_led = ensure_net(board, "/12V_LED")
    net_sw = ensure_net(board, "/12V_SW")
    j6p1.SetNet(net_led)
    # place R12 on the old feed path, clear of D9 @ (172,120)
    r12 = add_clone(board, r3, "R12", "10", 179.5, 119.5, -45)
    a, b = fp_pads(r12)[0], fp_pads(r12)[1]
    # pad closer to J6 → LED, other → 12V_SW
    if d2(*xy(a), jx, jy) < d2(*xy(b), jx, jy):
        a.SetNet(net_led)
        b.SetNet(net_sw)
        led_p, sw_p = a, b
    else:
        b.SetNet(net_led)
        a.SetNet(net_sw)
        led_p, sw_p = b, a
    track(board, *xy(led_p), jx, jy, 0.5, "/12V_LED")
    track(board, *xy(sw_p), 175.04, 114.50, 0.5, "/12V_SW")
    print("F-04")

    # F-03: Q3 gate blanking RC (R13 + C4)
    q3 = find_fp(board, "Q3")
    q3g = pad_by_num(q3, "1")
    q3s = pad_by_num(q3, "2")  # GND
    gx, gy = xy(q3g)
    sx, sy = xy(q3s)
    # cut direct BUSY → gate (stubs + diagonal from U2)
    del_busy = tracks_matching(
        board,
        lambda t: t.GetNetname() == "/BUSY"
        and (
            near_point(t, gx, gy, 0.35)
            or seg_near(t, 146.08, 116.16, 158.19, 104.05)
            or seg_near(t, 158.19, 104.05, 159.05, 104.05)
            or seg_near(t, 159.05, 104.05, 158.45, 104.05)
        ),
    )
    delete_tracks(board, del_busy)
    net_qg = ensure_net(board, "/Q3_GATE")
    net_busy = ensure_net(board, "/BUSY")
    net_gnd = ensure_net(board, "/GND")
    q3g.SetNet(net_qg)

    # reconnect U2 BUSY to R3 pulldown node (kept tracks around 157.51,105.51)
    track(board, 146.08, 116.16, 157.12, 105.12, 0.3, "/BUSY")

    # R13 series: BUSY ↔ Q3_GATE, left of Q3 gate (clear of R9 @ y=101)
    r13 = add_clone(board, r3, "R13", "100k", 157.2, 104.05, 0, strip_courtyard=True)
    ra, rb = fp_pads(r13)[0], fp_pads(r13)[1]
    if xy(ra)[0] < xy(rb)[0]:
        left, right = ra, rb
    else:
        left, right = rb, ra
    left.SetNet(net_busy)
    right.SetNet(net_qg)
    track(board, *xy(left), 157.51, 105.51, 0.25, "/BUSY")
    track(board, *xy(right), gx, gy, 0.25, "/Q3_GATE")

    # C4: Q3_GATE → GND via, above-right of Q3 (clear of LATCH_SET / R1 / BUSY)
    c4 = add_clone(board, c3, "C4", "4.7u/16V", 162.2, 102.6, 0, strip_courtyard=True)
    ca, cb = fp_pads(c4)[0], fp_pads(c4)[1]
    if d2(*xy(ca), gx, gy) < d2(*xy(cb), gx, gy):
        cg, cgnd = ca, cb
    else:
        cg, cgnd = cb, ca
    cg.SetNet(net_qg)
    cgnd.SetNet(net_gnd)
    track(board, *xy(cg), gx, gy, 0.25, "/Q3_GATE")
    # stitch GND pad to plane
    via = pcbnew.PCB_VIA(board)
    via.SetPosition(pcbnew.VECTOR2I(mm(xy(cgnd)[0]), mm(xy(cgnd)[1])))
    via.SetViaType(pcbnew.VIATYPE_THROUGH)
    via.SetDrill(mm(0.3))
    via.SetWidth(mm(0.6))
    via.SetNet(net_gnd)
    board.Add(via)
    print("F-03")

    # F-01: series diodes U2 IOx_M → IOx (anode @ module)
    u2 = find_fp(board, "U2")
    for i in range(8):
        pad = pad_by_num(u2, str(i + 1))
        old = pad.GetNetname()
        mod = f"/IO{i}_M"
        ux, uy = xy(pad)
        # detach pad from old IO track stubs
        del_io = tracks_matching(
            board,
            lambda t, net=old, x=ux, y=uy: t.GetNetname() == net and near_point(t, x, y, 0.45),
        )
        delete_tracks(board, del_io)
        pad.SetNet(ensure_net(board, mod))
        # north of U2 courtyard (top ~93.97); strip courtyard to allow dense fit
        d = add_clone(board, d1, f"D{15+i}", "1N4148WS", ux, 91.2, -90, strip_courtyard=True)
        k = pad_by_num(d, "1")  # cathode
        a = pad_by_num(d, "2")  # anode
        # want anode toward U2 (larger y), cathode toward header (smaller y)
        if xy(a)[1] >= xy(k)[1]:
            a.SetNet(ensure_net(board, mod))
            k.SetNet(ensure_net(board, old))
            ap, kp = a, k
        else:
            k.SetNet(ensure_net(board, mod))
            a.SetNet(ensure_net(board, old))
            ap, kp = k, a
        track(board, ux, uy, *xy(ap), 0.3, mod)
        # stub north to pick up existing IO copper toward J3
        track(board, *xy(kp), ux, 89.0, 0.3, old)
        print("F-01", f"D{15+i}", old)

    board.BuildConnectivity()
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    board.Save(BOARD)
    print("Saved")


if __name__ == "__main__":
    main()
