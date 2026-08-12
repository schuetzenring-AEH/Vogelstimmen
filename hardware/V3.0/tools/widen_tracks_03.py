"""Widen all PCB tracks to at least 0.3 mm and update design rules."""
from __future__ import annotations

import pathlib
import sys

sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew  # noqa: E402

PCB = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
MIN_W = 0.3  # mm


def main() -> None:
    board = pcbnew.LoadBoard(str(PCB))
    min_iu = pcbnew.FromMM(MIN_W)

    widened = 0
    for t in board.GetTracks():
        if t.Type() == pcbnew.PCB_VIA_T:
            continue
        if t.GetWidth() < min_iu:
            t.SetWidth(min_iu)
            widened += 1

    settings = board.GetDesignSettings()
    settings.m_TrackMinWidth = min_iu
    # Default custom track width used when drawing
    try:
        settings.SetCustomTrackWidth(min_iu)
    except Exception:
        pass

    # Netclass Default track width
    nc = board.GetNetClasses()
    try:
        default = nc.GetDefault()
        default.SetTrackWidth(min_iu)
        print(f"Default netclass track width -> {MIN_W} mm")
    except Exception as e:
        print(f"netclass note: {e}")

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())

    board.Save(str(PCB))
    print(f"Widened {widened} tracks to >= {MIN_W} mm")
    print(f"Saved {PCB}")


if __name__ == "__main__":
    main()
