#!/usr/bin/env python3
"""Clean V3.0 finalize: 0603 + CNT pads + zone fill, no position nudges."""
from __future__ import annotations

import shutil
from pathlib import Path

import pcbnew

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
SRC = ROOT / "hardware" / "V2.5-final"
DST = ROOT / "hardware" / "V3.0"
FP_LIB = Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints\Resistor_SMD.pretty")
LOCAL = ROOT / "hardware" / "footprints" / "vogelstimmen.pretty"


def replace_fp(board, old_fp, lib_dir: str, fp_name: str, value: str | None = None):
    new_fp = pcbnew.FootprintLoad(lib_dir, fp_name)
    if new_fp is None:
        raise RuntimeError(f"load fail {fp_name}")
    new_fp.SetPosition(old_fp.GetPosition())
    new_fp.SetOrientation(old_fp.GetOrientation())
    new_fp.SetReference(old_fp.GetReference())
    new_fp.SetValue(value if value is not None else old_fp.GetValue())
    old_pads = {p.GetNumber(): p for p in old_fp.Pads()}
    for pad in new_fp.Pads():
        if pad.GetNumber() in old_pads:
            pad.SetNet(old_pads[pad.GetNumber()].GetNet())
    board.Remove(old_fp)
    board.Add(new_fp)


def main() -> None:
    # rebuild PCB from V2.5 only (keep BOM/docs/README already written)
    shutil.copy2(SRC / "vogelstimmen_v2.5.kicad_pcb", DST / "vogelstimmen_v3.0.kicad_pcb")
    shutil.copy2(SRC / "vogelstimmen_v2.5.kicad_sch", DST / "vogelstimmen_v3.0.kicad_sch")

    # schematic text patches
    sch = DST / "vogelstimmen_v3.0.kicad_sch"
    t = sch.read_text(encoding="utf-8")
    t = t.replace("Resistor_SMD:R_0402_1005Metric", "Resistor_SMD:R_0603_1608Metric")
    t = t.replace("R_0402_1005Metric", "R_0603_1608Metric")
    t = t.replace('(property "Value" "K07.90"', '(property "Value" "CNT_5V"')
    t = t.replace(
        '(property "Footprint" "vogelstimmen:K07.90"',
        '(property "Footprint" "vogelstimmen:CNT_5V_WIRE"',
    )
    t = t.replace(
        '(property "Description" "Kübler K07.90; Bestellnr 1.130.900.008 (4.5V DC 10Hz) an 5V; Alt 1.130.900.012 (12V)"',
        '(property "Description" "5V EM-Impulszähler Litzen an J5 (+/GND); Hengstler 0 635 132 / Trumeter E660 5V"',
    )
    sch.write_text(t, encoding="utf-8")

    (DST / "fp-lib-table").write_text(
        """(fp_lib_table
  (version 7)
  (lib (name "vogelstimmen")(type "KiCad")(uri "${KIPRJMOD}/../footprints/vogelstimmen.pretty")(options "")(descr "Vogelstimmen"))
)
""",
        encoding="utf-8",
    )

    board = pcbnew.LoadBoard(str(DST / "vogelstimmen_v3.0.kicad_pcb"))
    done = []
    for fp in list(board.GetFootprints()):
        ref = fp.GetReference()
        fpid = fp.GetFPIDAsString()
        if ref.startswith("R") and "0402" in fpid:
            replace_fp(board, fp, str(FP_LIB), "R_0603_1608Metric")
            done.append(ref)
        elif ref == "J5":
            replace_fp(board, fp, str(LOCAL), "CNT_5V_WIRE", "CNT_5V")
            done.append(ref)

    filler = pcbnew.ZONE_FILLER(board)
    filler.Fill(board.Zones())
    pcbnew.SaveBoard(str(DST / "vogelstimmen_v3.0.kicad_pcb"), board)
    print("updated", sorted(done))


if __name__ == "__main__":
    main()
