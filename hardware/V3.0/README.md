# Fertigungspaket Rev 3.0

**Datum:** 11. August 2026  
**Projekt:** Soundplatine Waldlehrpfad · Kolping Alteglofsheim  
**KiCad:** 10.0.4 · `vogelstimmen_v3.0.kicad_*`

## Freigabe-Stand

| Check | Ergebnis |
|-------|----------|
| **DRC** | **0 Fehler**, 0 unverbunden — 1 Warnung U2 Footprint-Lib (`DRC_v3.0_final.rpt`) |
| **ERC** | siehe `ERC_v3.0_final.rpt` |
| **Widerstände** | alle **15×** `R_0603_1608Metric`, Pad-Pitch **1,65 mm** (kein 0402) |
| **Zähler** | Hengstler 0.635.128 + One-Shot (C20/R20/R21/D23/Q7/D10) |

## Vor jeder Bestellung

```bat
hardware\V3.0\CHECK_BEFORE_ORDER.bat
```

Das Skript holt zu jeder C-Nummer das **echte** JLCPCB-Teil (Package, Wert, Lager). Es vergleicht das mit BOM-Kommentar und Footprint — nicht mit README. Falsche Nummern wie C25796 (56 kΩ 0402 statt 100 Ω 0603) fallen hier durch.

## JLCPCB — Upload (nur SMD)

| Datei | Zweck |
|-------|--------|
| **`vogelstimmen_v3.0-Gerber.zip`** | Gerber + Drill (auch Ordner `Gerber/`) |
| **`JLCPCB_BOM.csv`** | SMT-BOM inkl. One-Shot + 0603 Basic LCSC |
| **`JLCPCB_CPL.csv`** | Pick-and-Place (52 SMT-Teile) — **diese** hochladen |
| `JLCPCB_CPL_minimal.csv` | Fallback (5 Spalten), falls volles Format scheitert |

**Nicht** an JLCPCB hochladen: `HAND_BESTUECKUNG.csv`, KiCad-Roh-CPL mit Handteilen.

**Platinen-Parameter (empfohlen):** 2 Layer · 1,6 mm · HASL oder ENIG · Clearance 0,2 mm · **Min. Bahnbreite 0,3 mm** · Via 0,6/0,3 mm.

## Handbestückung (nicht in JLCPCB-BOM)

Datei: **`HAND_BESTUECKUNG.csv`**

| Ref | Teil | Assembly |
|-----|------|----------|
| **U2** | DY-SV17F | HAND |
| **J5** | Hengstler **0.635.128** (nicht 0.635.132) | HAND |
| **J1, J2, J6** | Phoenix MPT 0,5/2 | HAND |
| **J3, J4** | Phoenix MPT 0,5/8 | HAND |
| **TP1–TP5** | Testpads | DNP |

## Widerstände — Package-Check (E-R0603)

| Refs | Wert | Footprint PCB | LCSC | Package |
|------|------|---------------|------|---------|
| R1,R2,R13,R20 | 100k | R_0603_1608Metric | C25803 | 0603 Basic |
| R3,R4,R9 | 10k | R_0603_1608Metric | C25804 | 0603 Basic |
| R5 | 0R | R_0603_1608Metric | C21189 | 0603 Basic |
| R6 | 470k | R_0603_1608Metric | C23178 | 0603 Basic |
| R7,R8,R11 | 4.7k | R_0603_1608Metric | C23162 | 0603 Basic |
| R10 | 1k | R_0603_1608Metric | C21190 | 0603 Basic |
| R12 | 10R | R_0603_1608Metric | C22859 | 0603 Basic |
| R21 | 100R | R_0603_1608Metric | C22775 | 0603 Basic |

Pads gemessen: **0,80×0,95 mm**, Mittenabstand **1,65 mm** → passt zu 0603 (0402 wäre ~1,0 mm).

## Änderungen gegenüber 2.5

| Thema | 2.5 | 3.0 |
|-------|-----|-----|
| Widerstände | Pads oft 0402 / LCSC 0603 → Reject | **0603 Pads + 0603 Basic LCSC** |
| Zähler J5 | Kübler K07.90 | **Hengstler 0.635.128** + One-Shot ~80 ms |
| Form | Panel / groß | Body **25,2×31 mm**, 4 Pins 15,24×25,4 mm |

## Paketinhalt

| Datei / Ordner | Inhalt |
|----------------|--------|
| `Gerber/` | Einzel-Gerber + PTH/NPTH Drill |
| `vogelstimmen_v3.0-Gerber.zip` | **Upload-Paket** |
| `JLCPCB_BOM.csv` / `JLCPCB_CPL.csv` | SMT Assembly |
| `HAND_BESTUECKUNG.csv` | Handteile |
| `vogelstimmen_v3.0-schematic.pdf` | Schaltplan |
| `vogelstimmen_v3.0-pcb.pdf` | Layout |
| `docs/` | ADRs, Schaltplan, BOM-Checkliste, **Topview**, Hengstler-/MPT-/DY-SV17F-PDFs |
| `../docs/datasheets/` | **Alle** Datenblätter Rev 3.0 (SMT + Hand) |
| `../docs/pcb_v3.0.md` | Topview + JLCPCB-BOM aus Downloads |
| `tools/export_fab.py` | Re-Export Gerber/CPL/PDF |
| `tools/jlcpcb_gate.py` · `CHECK_BEFORE_ORDER.bat` | Live-LCSC-Gate vor Upload |

## Re-Export

```powershell
& "C:\Program Files\KiCad\10.0\bin\python.exe" hardware\V3.0\tools\export_fab.py
```

## Parallel bestellen

1. JLCPCB: Gerber.zip + BOM + CPL (SMD Assembly)
2. Hengstler 0.635.128 (Mercateo/RS/Farnell) — Lieferzeit oft Wochen
3. DY-SV17F + **2×9-Sockel (Pflicht)** + Phoenix MPT-Klemmen

## Was beim Bestellen schiefgehen kann

| Fehler | Folge |
|--------|--------|
| Gerber aus `2.final/` oder V2.5 | alte Kübler-/0402-Platine |
| `HAND_BESTUECKUNG.csv` als BOM | JLC versucht Modul/Klemmen/Zähler zu setzen |
| KiCad-Pos statt `JLCPCB_CPL.csv` | Handteile in der SMT-Liste |
| Min. Bahn 0,2 mm im Warenkorb | Default, Board ist 0,3 mm |
| Finish „None“ (steht im Gerber-Job) | im Warenkorb HASL oder ENIG wählen |
| SMT Bottom statt nur Top | alle SMD liegen oben |
| JLC darf Teile substituieren | wieder falsches Package/Wert |
| PCB-Stück ≠ SMT-Stück | nackte Boards oder fehlende Bestückung |
| Hengstler **0.635.132** | 5 V-Typ, Buck-Race |
| Hengstler erst nach der PCB | Wochen Wartezeit |
| USB am Modul bei Latch AN / Board-5 V | Backfeed in den Buck (F-09 / E-AUDIO-04) |
| Modul ohne Sockel auflöten | Tausch/USB nur mit Löten; E-AUDIO-04 verletzt |
