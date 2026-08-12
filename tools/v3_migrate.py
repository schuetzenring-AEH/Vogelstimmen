#!/usr/bin/env python3
"""Migrate Vogelstimmen V2.5 → V3.0 (0603 resistors, buyable counter docs)."""
from __future__ import annotations

import os
import re
import shutil
import sys
from pathlib import Path

# Prefer KiCad python when run via that interpreter
ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
SRC = ROOT / "hardware" / "V2.5-final"
DST = ROOT / "hardware" / "V3.0"
FP_LIB = Path(r"C:\Program Files\KiCad\10.0\share\kicad\footprints")

R_LCSC_BY_REF = {
    "R1": ("100k", "C25803"),
    "R2": ("100k", "C25803"),
    "R13": ("100k", "C25803"),
    "R3": ("10k", "C25804"),
    "R4": ("10k", "C25804"),
    "R9": ("10k", "C25804"),
    "R5": ("0R", "C21189"),
    "R6": ("470k", "C23178"),
    "R7": ("4.7k", "C23162"),
    "R8": ("4.7k", "C23162"),
    "R11": ("4.7k", "C23162"),
    "R10": ("1k", "C21190"),
    "R12": ("10", "C22859"),
}


def copy_sources() -> None:
    if DST.exists():
        shutil.rmtree(DST)
    DST.mkdir(parents=True)
    for name in (
        "vogelstimmen_v2.5.kicad_pro",
        "vogelstimmen_v2.5.kicad_sch",
        "vogelstimmen_v2.5.kicad_pcb",
        "vogelstimmen_v2.5.kicad_prl",
        "HAND_BESTUECKUNG.csv",
        "JLCPCB_BOM.csv",
    ):
        src = SRC / name
        if src.exists():
            shutil.copy2(src, DST / name.replace("v2.5", "v3.0").replace("V2.5", "V3.0"))

    # fix accidental rename of HAND/JLCPCB
    for p in list(DST.glob("*")):
        if "v3.0" in p.name:
            continue
        if p.name.startswith("vogelstimmen_v2.5"):
            p.rename(DST / p.name.replace("v2.5", "v3.0"))

    # Ensure names
    mapping = {
        "vogelstimmen_v2.5.kicad_pro": "vogelstimmen_v3.0.kicad_pro",
        "vogelstimmen_v2.5.kicad_sch": "vogelstimmen_v3.0.kicad_sch",
        "vogelstimmen_v2.5.kicad_pcb": "vogelstimmen_v3.0.kicad_pcb",
        "vogelstimmen_v2.5.kicad_prl": "vogelstimmen_v3.0.kicad_prl",
    }
    for old, new in mapping.items():
        op, np = DST / old, DST / new
        if op.exists() and not np.exists():
            op.rename(np)

    docs = DST / "docs"
    docs.mkdir(exist_ok=True)
    # copy key docs
    for doc in ("schaltplan.md", "entscheidungen.md"):
        s = SRC / "docs" / doc
        if s.exists():
            shutil.copy2(s, docs / doc)


def patch_schematic() -> None:
    sch = DST / "vogelstimmen_v3.0.kicad_sch"
    text = sch.read_text(encoding="utf-8")
    text = text.replace("Resistor_SMD:R_0402_1005Metric", "Resistor_SMD:R_0603_1608Metric")
    text = text.replace("R_0402_1005Metric", "R_0603_1608Metric")

    # J5: keep 2-pin electrical idea, change identity (footprint stays custom pads on PCB)
    text = text.replace('(property "Value" "K07.90"', '(property "Value" "CNT_5V"')
    text = text.replace(
        '(property "Description" "Kübler K07.90; Bestellnr 1.130.900.008 (4.5V DC 10Hz) an 5V; Alt 1.130.900.012 (12V)"',
        '(property "Description" "5V EM-Impulszähler Litzen/Print an J5 Pads (+5V / GND); Primär Hengstler 0 635 132; Alt Trumeter E660 5V; D10 Freilauf"',
    )
    # Keep footprint lib name but we'll replace PCB silk; use generic name in sch
    text = text.replace(
        '(property "Footprint" "vogelstimmen:K07.90"',
        '(property "Footprint" "vogelstimmen:CNT_5V_WIRE"',
    )
    text = text.replace(
        '(property "Datasheet" "docs/datasheets/Kuebler_K04-K07_AK07.pdf"',
        '(property "Datasheet" "https://www.hengstler.com/products/counters/totalizing-counters/type-634-635"',
    )

    # Inject / update LCSC on resistors — simple property replace per known wrong 0603-as-0402 numbers
    for old, new in (
        ("C25803", "C25803"),  # already 0603 — keep once footprints match
    ):
        pass

    sch.write_text(text, encoding="utf-8")

    pro = DST / "vogelstimmen_v3.0.kicad_pro"
    if pro.exists():
        t = pro.read_text(encoding="utf-8")
        t = t.replace("vogelstimmen_v2.5", "vogelstimmen_v3.0")
        pro.write_text(t, encoding="utf-8")


def make_counter_footprint() -> None:
    """Wire-pad footprint: same pad positions as K07.90 pad1/2, no Kübler body."""
    pretty = ROOT / "hardware" / "footprints" / "vogelstimmen.pretty"
    pretty.mkdir(parents=True, exist_ok=True)
    mod = pretty / "CNT_5V_WIRE.kicad_mod"
    mod.write_text(
        """(footprint "CNT_5V_WIRE"
	(version 20260206)
	(generator "pcbnew")
	(generator_version "10.0")
	(layer "F.Cu")
	(descr "2-Pin THT wire pads for 5V electromechanical counter (pitch 15.24). Compatible with flying leads; was Kübler K07.90 pad1/2 positions.")
	(tags "counter 5V THT wire Hengstler Trumeter")
	(property "Reference" "REF**"
		(at 0 -4 0)
		(layer "F.SilkS")
		(effects (font (size 1 1) (thickness 0.15)))
	)
	(property "Value" "CNT_5V"
		(at 0 14 0)
		(layer "F.Fab")
		(effects (font (size 1 1) (thickness 0.15)))
	)
	(attr through_hole)
	(fp_text user "+"
		(at -4.64 8.2 0)
		(layer "F.SilkS")
		(effects (font (size 0.8 0.8) (thickness 0.12)))
	)
	(fp_text user "-"
		(at 10.6 8.2 0)
		(layer "F.SilkS")
		(effects (font (size 0.8 0.8) (thickness 0.12)))
	)
	(fp_text user "5V EM CNT"
		(at 3 13.5 0)
		(layer "F.SilkS")
		(effects (font (size 0.7 0.7) (thickness 0.1)))
	)
	(fp_rect
		(start -7 7.5)
		(end 13.5 13.5)
		(stroke (width 0.12) (type solid))
		(fill no)
		(layer "F.SilkS")
	)
	(fp_rect
		(start -7.5 7)
		(end 14 14)
		(stroke (width 0.05) (type solid))
		(fill no)
		(layer "F.CrtYd")
	)
	(pad "1" thru_hole rect
		(at -4.64 10.48)
		(size 2.2 2.2)
		(drill 1.6)
		(layers "*.Cu" "*.Mask")
	)
	(pad "2" thru_hole oval
		(at 10.6 10.48)
		(size 2.2 2.2)
		(drill 1.6)
		(layers "*.Cu" "*.Mask")
	)
)
""",
        encoding="utf-8",
    )


def replace_fp(board, old_fp, lib_dir: str, fp_name: str):
    import pcbnew

    new_fp = pcbnew.FootprintLoad(lib_dir, fp_name)
    if new_fp is None:
        raise RuntimeError(f"Cannot load {lib_dir} / {fp_name}")

    new_fp.SetPosition(old_fp.GetPosition())
    new_fp.SetOrientation(old_fp.GetOrientation())
    new_fp.SetReference(old_fp.GetReference())
    new_fp.SetValue(old_fp.GetValue())
    new_fp.SetLayer(old_fp.GetLayer())
    if hasattr(old_fp, "IsLocked") and old_fp.IsLocked():
        new_fp.SetLocked(True)

    # Transfer nets by pad number
    old_pads = {p.GetNumber(): p for p in old_fp.Pads()}
    for pad in new_fp.Pads():
        num = pad.GetNumber()
        if num in old_pads:
            pad.SetNet(old_pads[num].GetNet())

    board.Remove(old_fp)
    board.Add(new_fp)
    return new_fp


def patch_pcb() -> None:
    import pcbnew

    pcb_path = str(DST / "vogelstimmen_v3.0.kicad_pcb")
    board = pcbnew.LoadBoard(pcb_path)

    r_lib = str(FP_LIB / "Resistor_SMD.pretty")
    local_pretty = str(ROOT / "hardware" / "footprints" / "vogelstimmen.pretty")

    # Ensure project can find vogelstimmen lib — footprints loaded by path
    refs_done = []
    for fp in list(board.GetFootprints()):
        ref = fp.GetReference()
        fpid = fp.GetFPIDAsString()
        if ref.startswith("R") and ("0402" in fpid or "1005Metric" in fpid):
            val = fp.GetValue()
            replace_fp(board, fp, r_lib, "R_0603_1608Metric")
            for f2 in board.GetFootprints():
                if f2.GetReference() == ref:
                    f2.SetValue(val)
                    break
            refs_done.append(ref)
        elif ref == "J5" and "CNT_5V_WIRE" not in fpid:
            replace_fp(board, fp, local_pretty, "CNT_5V_WIRE")
            for f2 in board.GetFootprints():
                if f2.GetReference() == "J5":
                    f2.SetValue("CNT_5V")
                    break
            refs_done.append("J5")

    pcbnew.SaveBoard(pcb_path, board)
    print("PCB updated:", ", ".join(sorted(refs_done)))


def write_bom_docs() -> None:
    bom = """Comment,Designator,Footprint,LCSC Part #
10uF/25V 0805,"C1,C2",C_0805_2012Metric,C440198
22uF/10V 0805,C3,C_0805_2012Metric,C45783
4.7uF/16V 0805,C4,C_0805_2012Metric,C1779
1N4148WS,"D1,D2,D3,D4,D5,D6,D7,D8,D10,D13,D15,D16,D17,D18,D19,D20,D21,D22",D_SOD-323,C118873
SMAJ15A,D9,D_SMA,C113958
BZX84C6V2,"D11,D12,D14",SOT-23,C179522
PTC 1A/24V 1206,F1,Fuse_1206_3216Metric,C2760272
2.2uH 1008,L1,L_1008_2520Metric,C88527
SI2301CDS,"Q1,Q5,Q6",SOT-23,C10487
2N7002LT1G,"Q2,Q3",SOT-23,C16338
100k 0603 Basic,"R1,R2,R13",R_0603_1608Metric,C25803
0R 0603 Basic,R5,R_0603_1608Metric,C21189
10k 0603 Basic,"R3,R4,R9",R_0603_1608Metric,C25804
10R 0603 Basic,R12,R_0603_1608Metric,C22859
470k 0603 Basic,R6,R_0603_1608Metric,C23178
4.7k 0603 Basic,"R7,R8,R11",R_0603_1608Metric,C23162
1k 0603 Basic,R10,R_0603_1608Metric,C21190
TPS62163DSGR,U1,WSON-8-1EP_2x2mm,C97534
"""
    (DST / "JLCPCB_BOM.csv").write_text(bom, encoding="utf-8")

    hand = """Designator,Comment,Footprint,Assembly,Notes,Order / Link
U2,DY-SV17F,vogelstimmen:DY-SV17F,HAND,Modul stecken/löten; ~10 Stk,AliExpress
J1,MPT 0.5/2 1725656,Phoenix MPT,HAND,2-pol,Reichelt/RS/Phoenix
J2,MPT 0.5/2 1725656,Phoenix MPT,HAND,2-pol,Reichelt/RS/Phoenix
J6,MPT 0.5/2 1725656,Phoenix MPT,HAND,2-pol LED,Reichelt/RS/Phoenix
J3,MPT 0.5/8 1725711,Phoenix MPT,HAND,8-pol Taster,Reichelt/RS/Phoenix
J4,MPT 0.5/8 1725711,Phoenix MPT,HAND,8-pol Taster,Reichelt/RS/Phoenix
J5,"5V EM Counter + Litzen",vogelstimmen:CNT_5V_WIRE,HAND,"Pads +/ − = 5V/GND. Primär: Hengstler 0 635 132 (5V). Alt: Trumeter E660 5V Litzen. NICHT Kübler.",Mercateo Unite / Amazon 0635132 / Trumeter
TP1-TP5,Testpad,—,DNP,,
"""
    (DST / "HAND_BESTUECKUNG.csv").write_text(hand, encoding="utf-8")

    (DST / "docs" / "bom_verfuegbarkeit.md").write_text(
        """# BOM-Verfügbarkeit Rev 3.0 — Package-geprüft

**Härte-Regel vor Bestellung:** Auf der LCSC/JLCPCB-Seite muss **Package** exakt dem Footprint entsprechen.

## SMT — JLCPCB Basic Widerstände (0603)

| Ref | Wert | Footprint | LCSC | Package | Library |
|-----|------|-----------|------|---------|---------|
| R1,R2,R13 | 100k | 0603 | **C25803** | 0603 | Basic |
| R3,R4,R9 | 10k | 0603 | **C25804** | 0603 | Basic |
| R5 | 0R | 0603 | **C21189** | 0603 | Basic |
| R6 | 470k | 0603 | **C23178** | 0603 | Basic |
| R7,R8,R11 | 4.7k | 0603 | **C23162** | 0603 | Basic |
| R10 | 1k | 0603 | **C21190** | 0603 | Basic |
| R12 | 10R | 0603 | **C22859** | 0603 | Basic |

> Das sind bewusst dieselben C-Nummern, die JLCPCB bei 2.5 vorgeschlagen hat — damals passten die **Pads** nicht. Jetzt schon.

## Zähler (Hand) — lieferbar

| Priorität | Teil | Spannung | Bezug |
|-----------|------|----------|-------|
| 1 | **Hengstler 0 635 132** | 5V | Mercateo/Unite, Amazon `0635132` |
| 2 | Trumeter E660/E760 5V | 5V Litzen | Trumeter / ITM |
| 3 | CSK DC12V | 12V → an `12V_SW` (nicht J5) | AliExpress |
| — | Kübler K07.90 | — | **gestrichen** (nicht beschaffbar) |

J5 = zwei THT-Lötpads Pitch 15,24 mm (+ / −). Litzen anlöten.

## Checkliste M04+

- [ ] Jede LCSC-Seite: Package == Footprint
- [ ] Parts Matching: 0× „Soldering area too small“
- [ ] Hengstler/Trumeter **bestellt** bevor PCBA
- [ ] MPT + DY-SV17F parallel bestellt
- [ ] DRC 0 nach 0603-Wechsel
""",
        encoding="utf-8",
    )

    (DST / "README.md").write_text(
        """# Fertigungspaket Rev 3.0

**Basis:** Rev 2.5 (Funktion Latch / Buck / Audio unverändert)  
**Stand:** 6. August 2026

## Änderungen gegenüber 2.5

| Thema | 2.5 | 3.0 |
|-------|-----|-----|
| Widerstände | Footprint 0402, LCSC oft 0603 → Reject | **0603 Pads + 0603 Basic LCSC** |
| Zähler J5 | Kübler K07.90 (nicht lieferbar) | **Litzen-Pads CNT_5V** → Hengstler `0 635 132` / Trumeter 5V |
| BOM-Prozess | Verfügbarkeit ohne Package-Check | `docs/bom_verfuegbarkeit.md` Package-geprüft |

## Dateien

| Datei | Zweck |
|-------|--------|
| `vogelstimmen_v3.0.kicad_*` | KiCad-Quellen |
| `JLCPCB_BOM.csv` | SMT Upload |
| `HAND_BESTUECKUNG.csv` | Handteile inkl. Zähler |
| `docs/bom_verfuegbarkeit.md` | Package-Checkliste |

## Noch in KiCad prüfen

1. Projekt öffnen (`hardware/V3.0/vogelstimmen_v3.0.kicad_pro`)
2. PCB: Footprint-Lib `vogelstimmen` muss `CNT_5V_WIRE` finden (Pfad `hardware/footprints`)
3. **DRC** laufen lassen (0603 etwas größer)
4. Gerber + CPL neu exportieren
5. JLCPCB: BOM hochladen — Package-Spalte muss 0603 zeigen

## Elektrik Zähler

Unverändert: J5 Pin1 → 5V, Pin2 → GND, D10 Freilauf. Zählt 1× pro Session (Latch AN).
""",
        encoding="utf-8",
    )


def main() -> None:
    print("Copy…")
    copy_sources()
    print("Counter footprint…")
    make_counter_footprint()
    print("Schematic…")
    patch_schematic()
    print("BOM/docs…")
    write_bom_docs()
    print("PCB via pcbnew…")
    patch_pcb()
    print("DONE →", DST)


if __name__ == "__main__":
    main()
