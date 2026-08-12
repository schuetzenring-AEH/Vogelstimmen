"""Fix 12V_PROT track vs GND via clearance after 0.3 mm widen."""
from __future__ import annotations

import math
import pathlib
import sys

sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew  # noqa: E402

PCB = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
CLEAR = 0.2  # mm


def dist_point_seg(px, py, ax, ay, bx, by):
    abx, aby = bx - ax, by - ay
    apx, apy = px - ax, py - ay
    ab2 = abx * abx + aby * aby
    if ab2 < 1e-18:
        return math.hypot(apx, apy)
    t = max(0.0, min(1.0, (apx * abx + apy * aby) / ab2))
    cx, cy = ax + t * abx, ay + t * aby
    return math.hypot(px - cx, py - cy)


def main() -> None:
    board = pcbnew.LoadBoard(str(PCB))
    # Find GND vias near (163, 101.5)
    vias = []
    for t in board.GetTracks():
        if t.Type() != pcbnew.PCB_VIA_T:
            continue
        if t.GetNetname() != "/GND":
            continue
        p = t.GetPosition()
        x, y = pcbnew.ToMM(p.x), pcbnew.ToMM(p.y)
        if abs(x - 163) < 2 and abs(y - 101.5) < 2:
            vias.append(t)
            print(f"via at {x:.3f},{y:.3f}")

    # Move offending via slightly away from 12V_PROT (down/left typically)
    # Required: distance(center, track) >= CLEAR + track_half + via_half
    # Via diameter default 0.6 → half 0.3; track 0.3 → half 0.15; need center-to-track >= 0.65
    moved = 0
    for via in vias:
        p = via.GetPosition()
        vx, vy = pcbnew.ToMM(p.x), pcbnew.ToMM(p.y)
        via_r = 0.3  # typical pad radius for 0.6 via
        worst = None
        for t in board.GetTracks():
            if t.Type() == pcbnew.PCB_VIA_T:
                continue
            if t.GetNetname() != "/12V_PROT":
                continue
            s, e = t.GetStart(), t.GetEnd()
            d = dist_point_seg(
                vx,
                vy,
                pcbnew.ToMM(s.x),
                pcbnew.ToMM(s.y),
                pcbnew.ToMM(e.x),
                pcbnew.ToMM(e.y),
            )
            need = CLEAR + pcbnew.ToMM(t.GetWidth()) / 2 + via_r
            gap = d - need
            if gap < -1e-4:
                print(f"  clash d={d:.4f} need={need:.4f} gap={gap:.4f} track w={pcbnew.ToMM(t.GetWidth()):.3f}")
                if worst is None or gap < worst[0]:
                    worst = (gap, t, d, need)
        if worst is None:
            continue
        # Nudge via perpendicular away from closest track
        gap, t, d, need = worst
        s, e = t.GetStart(), t.GetEnd()
        ax, ay = pcbnew.ToMM(s.x), pcbnew.ToMM(s.y)
        bx, by = pcbnew.ToMM(e.x), pcbnew.ToMM(e.y)
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1.0
        # unit along track
        ux, uy = dx / L, dy / L
        # vector via -> closest point approx via - start projected
        abx, aby = bx - ax, by - ay
        apx, apy = vx - ax, vy - ay
        tt = max(0.0, min(1.0, (apx * abx + apy * aby) / (abx * abx + aby * aby)))
        cx, cy = ax + tt * abx, ay + tt * aby
        nx, ny = vx - cx, vy - cy
        nL = math.hypot(nx, ny)
        if nL < 1e-6:
            # collinear — push perpendicular to track
            nx, ny = -uy, ux
            nL = 1.0
        nx, ny = nx / nL, ny / nL
        # move by enough to get +0.05 mm margin
        shift = (-gap) + 0.05
        nvx, nvy = vx + nx * shift, vy + ny * shift
        via.SetPosition(pcbnew.VECTOR2I(pcbnew.FromMM(nvx), pcbnew.FromMM(nvy)))
        print(f"  moved via {vx:.3f},{vy:.3f} -> {nvx:.3f},{nvy:.3f} (shift {shift:.3f})")
        moved += 1

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    board.Save(str(PCB))
    print(f"Moved {moved} vias; saved")


if __name__ == "__main__":
    main()
