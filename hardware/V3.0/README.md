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

Datei: **`HAND_BESTUECKUNG.csv`** · RS-Warenkorb: **`docs/rs_bestellliste.md`**

| Ref | Teil | Assembly | RS |
|-----|------|----------|-----|
| **U2** | DY-SV17F | HAND | nicht bei RS |
| **J5** | Hengstler **0.635.128** (nicht 0.635.132) | HAND | **312-022** |
| **J1, J2, J6** | Phoenix MPT 0,5/2 **1725656** | HAND | **220-4260** |
| **J3, J4** | Phoenix MPT 0,5/8 **1725711** | HAND | **220-4327** |
| **TP1–TP5** | Testpads | DNP | — |

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
| R21 | 100R | R_0603_1608Metric | C25796 | 0603 Basic |

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
| `RS_SCHNELLBESTELLUNG.csv` | RS-Warenkorb 1 Platine |
| `docs/rs_bestellliste.md` | RS-Links, Warnungen, 10× |
| `vogelstimmen_v3.0-schematic.pdf` | Schaltplan |
| `vogelstimmen_v3.0-pcb.pdf` | Layout |
| `docs/` | ADRs, Schaltplan, BOM-Checkliste |
| `tools/export_fab.py` | Re-Export Gerber/CPL/PDF |

## Re-Export

```powershell
& "C:\Program Files\KiCad\10.0\bin\python.exe" hardware\V3.0\tools\export_fab.py
```

## Parallel bestellen

1. JLCPCB: Gerber.zip + BOM + CPL (SMD Assembly)
2. **RS** Schnellbestellung: `RS_SCHNELLBESTELLUNG.csv` (Hengstler 312-022 + MPT) — Zähler oft Wochen
3. DY-SV17F (AliExpress; nicht bei RS)
