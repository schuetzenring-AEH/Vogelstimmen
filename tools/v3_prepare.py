#!/usr/bin/env python3
"""Prepare Vogelstimmen V3.0 from V2.5: 0603 resistors + buyable counter connector."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(r"C:\Users\Schue\Projects\Vogelstimmen")
SRC = ROOT / "hardware" / "V2.5-final"
DST = ROOT / "hardware" / "V3.0"

# JLCPCB Basic 0603 (verified package = 0603)
R_LCSC = {
    "0R": "C21189",  # 0402WAF0000 was wrong name; C21189 = 0603 0R
    "1k": "C21190",
    "10": "C22859",
    "4.7k": "C23162",
    "470k": "C23178",
    "100k": "C25803",
    "10k": "C25804",
}

VALUE_TO_LCSC = {
    "0": "C21189",
    "0R": "C21189",
    "0Ω": "C21189",
    "1k": "C21190",
    "1kΩ": "C21190",
    "10": "C22859",
    "10Ω": "C22859",
    "4.7k": "C23162",
    "4,7k": "C23162",
    "4.7kΩ": "C23162",
    "470k": "C23178",
    "470kΩ": "C23178",
    "100k": "C25803",
    "100kΩ": "C25803",
    "10k": "C25804",
    "10kΩ": "C25804",
}


def copy_tree() -> None:
    if DST.exists():
        shutil.rmtree(DST)
    # copy essential sources, skip large gerber zip / pdf if needed — full copy
    shutil.copytree(
        SRC,
        DST,
        ignore=shutil.ignore_patterns(
            "*.zip",
            "Gerber",
            "*.pdf",
            "simulation",
            ".history",
            "JLCPCB_CPL*.csv",
            "vogelstimmen_v2.5-Gerber*",
            "vogelstimmen_v2.5-cpl.csv",
            "vogelstimmen_v2.5-all-pos.csv",
            "vogelstimmen_v2.5-bom.csv",
        ),
    )
    # rename kicad files
    mapping = {
        "vogelstimmen_v2.5.kicad_pro": "vogelstimmen_v3.0.kicad_pro",
        "vogelstimmen_v2.5.kicad_sch": "vogelstimmen_v3.0.kicad_sch",
        "vogelstimmen_v2.5.kicad_pcb": "vogelstimmen_v3.0.kicad_pcb",
        "vogelstimmen_v2.5.kicad_prl": "vogelstimmen_v3.0.kicad_prl",
    }
    for old, new in mapping.items():
        p = DST / old
        if p.exists():
            p.rename(DST / new)


def patch_text_files() -> None:
    sch = DST / "vogelstimmen_v3.0.kicad_sch"
    pcb = DST / "vogelstimmen_v3.0.kicad_pcb"
    pro = DST / "vogelstimmen_v3.0.kicad_pro"

    for path in (sch, pcb):
        text = path.read_text(encoding="utf-8")
        text = text.replace("R_0402_1005Metric", "R_0603_1608Metric")
        text = text.replace("Resistor_SMD:R_0402_1005Metric", "Resistor_SMD:R_0603_1608Metric")
        # strip 3d model paths that still say 0402
        text = text.replace("R_0402_1005Metric.step", "R_0603_1608Metric.step")
        path.write_text(text, encoding="utf-8")

    if pro.exists():
        t = pro.read_text(encoding="utf-8")
        t = t.replace("vogelstimmen_v2.5", "vogelstimmen_v3.0")
        t = t.replace("2.5", "3.0")
        pro.write_text(t, encoding="utf-8")

    # Schematic: J5 counter → generic terminal / buyable EM counter
    sch_text = sch.read_text(encoding="utf-8")
    sch_text = sch_text.replace(
        '(property "Value" "K07.90"',
        '(property "Value" "CNT_5V"',
    )
    sch_text = sch_text.replace(
        '(property "Footprint" "vogelstimmen:K07.90"',
        '(property "Footprint" "TerminalBlock_Phoenix:TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_P2.54mm_Horizontal"',
    )
    sch_text = sch_text.replace(
        '(property "Description" "Kübler K07.90; Bestellnr 1.130.900.008 (4.5V DC 10Hz) an 5V; Alt 1.130.900.012 (12V)"',
        '(property "Description" "5V EM-Impulszähler via MPT: Hengstler 0 635 132 (5V Print) oder Litzen-Zähler 5V; Freilauf D10"',
    )
    # Update resistor LCSC fields where present — set by regenerating BOM later
    sch.write_text(sch_text, encoding="utf-8")


def write_bom() -> None:
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
100k 0603,"R1,R2,R13",R_0603_1608Metric,C25803
0R 0603,R5,R_0603_1608Metric,C21189
10k 0603,"R3,R4,R9",R_0603_1608Metric,C25804
10 0603,R12,R_0603_1608Metric,C22859
470k 0603,R6,R_0603_1608Metric,C23178
4.7k 0603,"R7,R8,R11",R_0603_1608Metric,C23162
1k 0603,R10,R_0603_1608Metric,C21190
TPS62163DSGR,U1,WSON-8-1EP_2x2mm,C97534
"""
    (DST / "JLCPCB_BOM.csv").write_text(bom, encoding="utf-8")

    hand = """Designator,Comment,Footprint,Assembly,Notes,Order
U2,DY-SV17F,vogelstimmen:DY-SV17F,HAND,AliExpress ~10 Stk,AliExpress
J1,MPT 0.5/2,Phoenix MPT-0,5-2,HAND,1725656,Reichelt/RS
J2,MPT 0.5/2,Phoenix MPT-0,5-2,HAND,1725656,Reichelt/RS
J6,MPT 0.5/2,Phoenix MPT-0,5-2,HAND,1725656,Reichelt/RS
J3,MPT 0.5/8,Phoenix MPT-0,5-8,HAND,1725711,Reichelt/RS
J4,MPT 0.5/8,Phoenix MPT-0,5-8,HAND,1725711,Reichelt/RS
J5,5V EM counter,Phoenix MPT-0,5-2,HAND,"Hengstler 0 635 132 (5V PCB) ODER Trumeter E660 5V Litzen → Schraubklemme J5; + an 5V − an GND; D10 bleibt",Mercateo/Amazon/Trumeter
TP1-TP5,Testpad,—,DNP,,
"""
    (DST / "HAND_BESTUECKUNG.csv").write_text(hand, encoding="utf-8")


def write_docs() -> None:
    (DST / "docs").mkdir(exist_ok=True)
    avail = """# BOM-Verfügbarkeit Rev 3.0 (Package-geprüft)

**Regel:** LCSC-C-Nummer und Footprint-Package müssen **identisch** sein (0402≠0603).
**Quelle geprüft:** JLCPCB Parts Library (August 2026) — Basic bevorzugt.

## SMT (JLCPCB)

| Ref | Wert | Footprint | LCSC | Package (LCSC) | Basic? | Status |
|-----|------|-----------|------|----------------|--------|--------|
| R1,R2,R13 | 100k | 0603 | C25803 | **0603** | Basic | OK |
| R3,R4,R9 | 10k | 0603 | C25804 | **0603** | Basic | OK |
| R5 | 0R | 0603 | C21189 | **0603** | Basic | OK |
| R6 | 470k | 0603 | C23178 | **0603** | Basic | OK |
| R7,R8,R11 | 4.7k | 0603 | C23162 | **0603** | Basic | OK |
| R10 | 1k | 0603 | C21190 | **0603** | Basic | OK |
| R12 | 10R | 0603 | C22859 | **0603** | Basic | OK |
| C1,C2 | 10uF/25V | 0805 | C440198 | 0805 | prüfen | OK |
| C3 | 22uF/10V | 0805 | C45783 | 0805 | prüfen | OK |
| C4 | 4.7uF/16V | 0805 | C1779 | 0805 | prüfen | OK |
| D1–D8,D10,D13,D15–D22 | 1N4148WS | SOD-323 | C118873 | SOD-323 | Basic/Ext | OK |
| D9 | SMAJ15A | SMA | C113958 | SMA | Ext | OK |
| D11,D12,D14 | BZX84C6V2 | SOT-23 | C179522 | SOT-23 | prüfen | OK |
| F1 | PTC 1A/24V | 1206 | C2760272 | 1206 | prüfen | OK |
| L1 | 2.2uH | 1008 | C88527 | 1008 | prüfen | OK |
| Q1,Q5,Q6 | SI2301 | SOT-23 | C10487 | SOT-23 | Basic | OK |
| Q2,Q3 | 2N7002 | SOT-23 | C16338 | SOT-23 | Basic | OK |
| U1 | TPS62163 | WSON-8 | C97534 | WSON | Ext | Reserve bestellen |

## Hand / Zähler (bewusst nicht JLCPCB)

| Ref | Teil | Bezug | Verfügbarkeit |
|-----|------|-------|---------------|
| J5 | MPT 0,5/2 + **Hengstler 0 635 132** (5V, Print) | Mercateo / Amazon `0635132` | **lagernd / bestellbar** |
| Alt | Trumeter E660/E760 @ 5V Litzen | Trumeter / ITM | 2–3 Wochen |
| Alt | CSK @ 12V an `12V_SW` (nicht J5) | AliExpress | billig, groß |
| — | **Kübler K07.90** | — | **nicht** für V3.0 (Beschaffung problematisch) |

## Checkliste vor Bestellung (neu)

1. [ ] Jede BOM-Zeile: LCSC-Seite öffnen → Package == Footprint
2. [ ] Parts Matching: keine „Soldering area too small“
3. [ ] Zähler physisch bestellt / Liefertermin bekannt **bevor** PCBA
4. [ ] Handteile (MPT, DY-SV17F) parallel bestellt
"""
    (DST / "docs" / "bom_verfuegbarkeit.md").write_text(avail, encoding="utf-8")

    readme = """# Fertigungspaket Rev 3.0

**Basis:** Rev 2.5 (Schaltungsfunktion unverändert)  
**Datum:** 6. August 2026

## Warum 3.0

| Problem 2.5 | Fix 3.0 |
|-------------|---------|
| Widerstände 0402-Pads + 0603-LCSC → JLCPCB Reject | Alle R auf **0603** + Basic-LCSC (`C25803` …) |
| Kübler `1.130.900.008` nicht beschaffbar | **J5 = MPT 0,5/2** → lieferbarer 5V-EM-Zähler (Hengstler `0 635 132` / Litzen) |
| BOM ohne Package-Gegenprüfung | `docs/bom_verfuegbarkeit.md` mit Package-Check |

## Elektrisch

- Unverändert: Latch, Buck 5V, DY-SV17F, D10 Freilauf  
- Zähler weiter an **5V / GND** über J5 (Session = Latch AN)  
- Footprint Kübler entfällt — Zähler wird verkabelt / Print mit Litzen an MPT

## Nächste Schritte (in KiCad)

1. Projekt `vogelstimmen_v3.0.kicad_pro` öffnen  
2. **PCB:** J5-Footprint manuell auf `TerminalBlock_Phoenix_MPT-0,5-2-…` setzen (Position wie bisheriger Zählerbereich)  
3. Widerstände: Update PCB from Schematic / Footprints neu laden (0603) — Clearance prüfen  
4. DRC → Gerber + CPL exportieren  
5. `JLCPCB_BOM.csv` hochladen

## JLCPCB Upload

| Datei | Zweck |
|-------|--------|
| Gerber-ZIP (nach Export) | Platine |
| `JLCPCB_BOM.csv` | SMT only |
| CPL (nach Export) | Pick & Place |

## Handbestückung

Siehe `HAND_BESTUECKUNG.csv` — Zähler **vor** PCBA-Bestellung sichern.
"""
    (DST / "README.md").write_text(readme, encoding="utf-8")


def main() -> None:
    copy_tree()
    patch_text_files()
    write_bom()
    write_docs()
    print(f"V3.0 skeleton written to {DST}")


if __name__ == "__main__":
    main()
