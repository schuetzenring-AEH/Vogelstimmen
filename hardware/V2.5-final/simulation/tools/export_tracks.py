"""Export PCB tracks (+ vias) for the HTML simulation."""
from __future__ import annotations

import json
import pathlib
import sys

sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew  # noqa: E402

PCB = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.4.kicad_pcb")
OUT = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\simulation\pcb_tracks.json")


def main() -> None:
    board = pcbnew.LoadBoard(str(PCB))
    bb = board.GetBoardEdgesBoundingBox()
    tracks = []
    for t in board.GetTracks():
        net = t.GetNetname() or ""
        # PCB_VIA
        if t.GetClass() == "PCB_VIA" or t.Type() == pcbnew.PCB_VIA_T:
            tracks.append(
                {
                    "type": "via",
                    "net": net,
                    "x": round(pcbnew.ToMM(t.GetX()), 3),
                    "y": round(pcbnew.ToMM(t.GetY()), 3),
                    "d": 0.6,
                }
            )
            continue
        # PCB_TRACK / ARC
        try:
            w = pcbnew.ToMM(t.GetWidth())
        except Exception:
            w = 0.3
        tracks.append(
            {
                "type": "seg",
                "net": net,
                "layer": board.GetLayerName(t.GetLayer()),
                "x1": round(pcbnew.ToMM(t.GetStart().x), 3),
                "y1": round(pcbnew.ToMM(t.GetStart().y), 3),
                "x2": round(pcbnew.ToMM(t.GetEnd().x), 3),
                "y2": round(pcbnew.ToMM(t.GetEnd().y), 3),
                "w": round(w, 3),
            }
        )

    out = {
        "origin_mm": [round(pcbnew.ToMM(bb.GetX()), 2), round(pcbnew.ToMM(bb.GetY()), 2)],
        "size_mm": [round(pcbnew.ToMM(bb.GetWidth()), 2), round(pcbnew.ToMM(bb.GetHeight()), 2)],
        "tracks": tracks,
    }
    OUT.write_text(json.dumps(out, separators=(",", ":")), encoding="utf-8")
    segs = sum(1 for t in tracks if t["type"] == "seg")
    vias = sum(1 for t in tracks if t["type"] == "via")
    nets = sorted({t["net"] for t in tracks if t["net"]})
    print(f"wrote {OUT.name}: {segs} segs, {vias} vias, {len(nets)} nets, {OUT.stat().st_size/1024:.1f} KB")
    print("nets:", ", ".join(nets))


if __name__ == "__main__":
    main()
