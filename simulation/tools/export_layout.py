"""Export footprint positions + bounding boxes for the HTML simulation."""
from __future__ import annotations

import json
import pathlib
import sys

sys.path.insert(0, r"C:\Program Files\KiCad\10.0\bin\Lib\site-packages")
import pcbnew  # noqa: E402

PCB = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\hardware\V3.0\vogelstimmen_v3.0.kicad_pcb")
OUT = pathlib.Path(r"C:\Users\Schue\Projects\Vogelstimmen\simulation\pcb_layout.json")


def main() -> None:
    board = pcbnew.LoadBoard(str(PCB))
    bb = board.GetBoardEdgesBoundingBox()
    parts = []
    for fp in board.GetFootprints():
        pos = fp.GetPosition()
        box = fp.GetBoundingBox(False, False)
        parts.append(
            {
                "ref": fp.GetReference(),
                "val": fp.GetValue(),
                "x": round(pcbnew.ToMM(pos.x), 3),
                "y": round(pcbnew.ToMM(pos.y), 3),
                "rot": round(fp.GetOrientationDegrees(), 1),
                "layer": "B" if fp.IsFlipped() else "F",
                "w": round(pcbnew.ToMM(box.GetWidth()), 3),
                "h": round(pcbnew.ToMM(box.GetHeight()), 3),
                "bx": round(pcbnew.ToMM(box.GetX()), 3),
                "by": round(pcbnew.ToMM(box.GetY()), 3),
            }
        )
    parts.sort(key=lambda p: p["ref"])
    out = {
        "origin_mm": [round(pcbnew.ToMM(bb.GetX()), 2), round(pcbnew.ToMM(bb.GetY()), 2)],
        "size_mm": [round(pcbnew.ToMM(bb.GetWidth()), 2), round(pcbnew.ToMM(bb.GetHeight()), 2)],
        "parts": parts,
    }
    OUT.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print(f"wrote {OUT.name}: {len(parts)} parts, board {out['size_mm'][0]}×{out['size_mm'][1]} mm")
    for p in parts:
        if p["ref"][0] in "UJ" or p["ref"] in ("L1",):
            print(f"  {p['ref']:4} {p['w']:6.2f}×{p['h']:5.2f} mm  rot={p['rot']:6.1f}  {p['val']}")


if __name__ == "__main__":
    main()
