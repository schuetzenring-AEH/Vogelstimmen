"""Compare KiCad footprints: pin header vs screw terminals."""
from __future__ import annotations

import json
import pathlib
import re

BASE = pathlib.Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints")
FILES = {
    "Stiftleiste 2.54 (aktuell J3/J4)": BASE
    / "Connector_PinHeader_2.54mm.pretty"
    / "PinHeader_1x08_P2.54mm_Vertical.kicad_mod",
    "Klemme Phoenix MPT-0,5 (Raster 2.54)": BASE
    / "TerminalBlock_Phoenix.pretty"
    / "TerminalBlock_Phoenix_MPT-0,5-8-2.54_1x08_P2.54mm_Horizontal.kicad_mod",
    "Klemme 3.5 mm Phoenix PT-1,5": BASE
    / "TerminalBlock_Phoenix.pretty"
    / "TerminalBlock_Phoenix_PT-1,5-8-3.5-H_1x08_P3.50mm_Horizontal.kicad_mod",
    "Klemme 5.0 mm Phoenix PT-1,5": BASE
    / "TerminalBlock_Phoenix.pretty"
    / "TerminalBlock_Phoenix_PT-1,5-8-5.0-H_1x08_P5.00mm_Horizontal.kicad_mod",
}


def parse(path: pathlib.Path) -> dict:
    t = path.read_text(encoding="utf-8", errors="replace")
    pads = []
    pad_re = re.compile(
        r'\(pad\s+"([^"]+)"\s+(\w+)\s+(\w+)\s+'
        r"\(at\s+([-\d.]+)\s+([-\d.]+)(?:\s+[-\d.]+)?\)\s+"
        r"\(size\s+([-\d.]+)\s+([-\d.]+)\)"
        r"(?:\s+\(drill\s+([-\d.]+)\))?"
    )
    for m in pad_re.finditer(t):
        pads.append(
            {
                "n": m.group(1),
                "type": m.group(2),
                "shape": m.group(3),
                "x": float(m.group(4)),
                "y": float(m.group(5)),
                "sx": float(m.group(6)),
                "sy": float(m.group(7)),
                "drill": float(m.group(8)) if m.group(8) else None,
            }
        )

    xs: list[float] = []
    ys: list[float] = []
    for m in re.finditer(
        r"\(fp_line\s+\(start\s+([-\d.]+)\s+([-\d.]+)\)\s+\(end\s+([-\d.]+)\s+([-\d.]+)\)([\s\S]*?)\)",
        t,
    ):
        chunk = m.group(0)
        if "F.CrtYd" not in chunk:
            continue
        xs += [float(m.group(1)), float(m.group(3))]
        ys += [float(m.group(2)), float(m.group(4))]

    fab = []
    for m in re.finditer(
        r"\(fp_line\s+\(start\s+([-\d.]+)\s+([-\d.]+)\)\s+\(end\s+([-\d.]+)\s+([-\d.]+)\)([\s\S]*?)\)",
        t,
    ):
        if "F.Fab" not in m.group(0):
            continue
        fab.append(
            (float(m.group(1)), float(m.group(2)), float(m.group(3)), float(m.group(4)))
        )

    if xs:
        crt = (min(xs), min(ys), max(xs), max(ys))
    else:
        px = [p["x"] for p in pads]
        py = [p["y"] for p in pads]
        crt = (min(px) - 2, min(py) - 2, max(px) + 2, max(py) + 2)

    signal = [p for p in pads if p["n"].isdigit()]
    signal.sort(key=lambda p: int(p["n"]))
    pitches = []
    for a, b in zip(signal, signal[1:]):
        dist = ((b["x"] - a["x"]) ** 2 + (b["y"] - a["y"]) ** 2) ** 0.5
        pitches.append(round(dist, 3))

    desc_m = re.search(r'\(descr\s+"([^"]*)"', t)
    return {
        "file": path.name,
        "pads": pads,
        "signal": signal,
        "crt": crt,
        "crt_w": round(crt[2] - crt[0], 2),
        "crt_h": round(crt[3] - crt[1], 2),
        "pitch": pitches[0] if pitches else None,
        "drill": signal[0]["drill"] if signal else None,
        "pad_size": [signal[0]["sx"], signal[0]["sy"]] if signal else None,
        "fab": fab,
        "desc": (desc_m.group(1) if desc_m else "")[:160],
        "for_two_rows_mm": None,
    }


def main() -> None:
    out = {}
    for name, path in FILES.items():
        d = parse(path)
        # Two identical 1x08 side-by-side for IO+GND (current J3+J4 concept)
        # assume placed with 2.54mm row spacing for headers, or body depth for terminals
        d["two_x08_courtyard_area_mm2"] = round(d["crt_w"] * d["crt_h"] * 2, 1)
        out[name] = {
            "file": d["file"],
            "pitch_mm": d["pitch"],
            "drill_mm": d["drill"],
            "pad_size_mm": d["pad_size"],
            "courtyard_w_mm": d["crt_w"],
            "courtyard_h_mm": d["crt_h"],
            "courtyard_bbox": [round(v, 2) for v in d["crt"]],
            "pads_signal": [
                {"n": p["n"], "x": p["x"], "y": p["y"], "drill": p["drill"]}
                for p in d["signal"]
            ],
            "fab_lines": d["fab"],
            "desc": d["desc"],
            "note_0_5": "MPT-0,5 = Querschnitt 0,5 mm² Ader, Raster bleibt 2,54 mm"
            if "MPT-0,5" in name
            else None,
        }
        print(f"=== {name}")
        print(f"  pitch={d['pitch']} mm  courtyard={d['crt_w']} x {d['crt_h']} mm")
        print(f"  drill={d['drill']}  pad={d['pad_size']}")
        print(f"  file={d['file']}")
        print()

    out_path = pathlib.Path(__file__).with_name("connector_compare.json")
    out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print("wrote", out_path)


if __name__ == "__main__":
    main()
