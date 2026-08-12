"""Restore diode/RC positions after failed courtyard refresh; reconnect pads; strip courtyard again."""
from __future__ import annotations

import pcbnew

BOARD = r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb"

# Positions from board state when user reported lib_footprint_mismatch warnings
POS = {
    "D15": (127.5, 91.2, -90),
    "D16": (131.0, 91.2, -90),
    "D17": (134.5, 91.2, -90),
    "D18": (137.96, 91.2, -90),
    "D19": (141.5, 91.2, -90),
    "D20": (145.0, 91.2, -90),
    "D21": (148.5, 91.2, -90),
    "D22": (152.0, 91.5, -90),
    "R13": (157.0, 105.0, 90),
    "C4": (163.0, 103.0, 0),
    "R12": (173.0, 114.5, 0),
}


def mm(x):
    return int(pcbnew.FromMM(x))


def find_fp(board, ref):
    for fp in board.GetFootprints():
        if fp.GetReference() == ref:
            return fp
    raise KeyError(ref)


def strip_courtyard(fp):
    for g in list(fp.GraphicalItems()):
        if g.GetLayer() in (pcbnew.F_CrtYd, pcbnew.B_CrtYd):
            fp.Remove(g)


def ensure_net(board, name):
    n = board.FindNet(name)
    if n is not None:
        return n
    n = pcbnew.NETINFO_ITEM(board, name)
    board.Add(n)
    return n


def track(board, x1, y1, x2, y2, w, netname):
    t = pcbnew.PCB_TRACK(board)
    t.SetStart(pcbnew.VECTOR2I(mm(x1), mm(y1)))
    t.SetEnd(pcbnew.VECTOR2I(mm(x2), mm(y2)))
    t.SetWidth(mm(w))
    t.SetLayer(pcbnew.F_Cu)
    t.SetNet(ensure_net(board, netname))
    board.Add(t)


def nearest_track_end(board, netname, x, y, max_dist=3.0):
    best = None
    best_d = max_dist * max_dist
    for t in board.GetTracks():
        if t.Type() != pcbnew.PCB_TRACE_T or t.GetNetname() != netname:
            continue
        for pt in (t.GetStart(), t.GetEnd()):
            px, py = pcbnew.ToMM(pt.x), pcbnew.ToMM(pt.y)
            d = (px - x) ** 2 + (py - y) ** 2
            if d < best_d:
                best_d = d
                best = (px, py)
    return best


def main():
    board = pcbnew.LoadBoard(BOARD)
    for ref, (x, y, rot) in POS.items():
        fp = find_fp(board, ref)
        fp.SetPosition(pcbnew.VECTOR2I(mm(x), mm(y)))
        fp.SetOrientation(pcbnew.EDA_ANGLE(rot, pcbnew.DEGREES_T))
        strip_courtyard(fp)
        # reconnect each pad to nearest same-net copper if gap
        for p in fp.Pads():
            px, py = pcbnew.ToMM(p.GetX()), pcbnew.ToMM(p.GetY())
            net = p.GetNetname()
            if not net or net.startswith("unconnected"):
                continue
            end = nearest_track_end(board, net, px, py, 4.0)
            if end is None:
                print(ref, "pad", p.GetNumber(), net, "NO track nearby")
                continue
            ex, ey = end
            if (ex - px) ** 2 + (ey - py) ** 2 > 0.01:
                track(board, px, py, ex, ey, 0.3, net)
                print(ref, "pad", p.GetNumber(), "->", net, "link")
            else:
                print(ref, "pad", p.GetNumber(), net, "ok")

    board.BuildConnectivity()
    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    board.Save(BOARD)
    print("Saved")


if __name__ == "__main__":
    main()
