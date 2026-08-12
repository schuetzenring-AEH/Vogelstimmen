# Fertigungspaket Rev 2.5 — `V2.5-final`

**Datum:** 3. August 2026  
**Projekt:** Soundplatine Waldlehrpfad · Kolping Alteglofsheim · Konrad Senn  
**KiCad:** 10.0.4 · Quelle: `vogelstimmen_v2.5.kicad_*` (Respin F-01…F-05 + GND-Vias)

## Freigabe-Stand

| Check | Ergebnis |
|-------|----------|
| **DRC** | **0 Fehler**, 0 unverbunden — 1 Warnung U2 Footprint-Lib (`DRC_v2.5_final.rpt`) |
| **ERC** | **0 Fehler** — 1 Warnung Label `SET_DRV` (`ERC_v2.5_final.rpt`) |
| **F-01…F-09** | Behoben / dispositioniert — `docs/adversarial_review_v25.md` |

## JLCPCB — Upload (nur SMD)

| Datei | Zweck |
|-------|--------|
| **`vogelstimmen_v2.5-Gerber.zip`** | Gerber + Drill (Ordner `Gerber/`) |
| **`JLCPCB_BOM.csv`** | **nur SMT** — Spalte `Mount=SMT` · kein Modul/Klemmen/Zähler |
| **`JLCPCB_CPL.csv`** | Pick-and-Place **JLCPCB-Format** (Designator/Mid X/Mid Y) — **diese** hochladen |
| `vogelstimmen_v2.5-cpl.csv` | KiCad-Roh-CPL (nicht für Upload — falsche Spaltennamen) |

**Nicht** an JLCPCB hochladen: `HAND_BESTUECKUNG.csv`, `vogelstimmen_v2.5-bom.csv` (KiCad-Voll-BOM mit THT).

**Platinen-Parameter (empfohlen):** 2 Layer · 1,6 mm · HASL oder ENIG · Design-Regeln wie im Projekt (0,2 mm Clearance, Via 0,6/0,3 mm).

## Handbestückung (nicht in JLCPCB-BOM)

Datei: **`HAND_BESTUECKUNG.csv`** — Spalte `Assembly=HAND` bzw. `DNP` (Testpads).

| Ref | Teil | Assembly |
|-----|------|----------|
| **U2** | DY-SV17F (optional 2×9-Pin-Sockel) | HAND |
| **J5** | Kübler `1.130.900.008` | HAND |
| **J1, J2, J6** | Phoenix MPT 0,5/2-2,54 (×3) | HAND |
| **J3, J4** | Phoenix MPT 0,5/8-2,54 (×2, z. B. 1725711) | HAND |
| **TP1–TP5** | Testpads | DNP (kein Bauteil) |

## Paketinhalt

| Datei / Ordner | Inhalt |
|----------------|--------|
| `Gerber/` | Einzel-Gerber + `.drl` + `.gbrjob` |
| `vogelstimmen_v2.5-Gerber.zip` | Upload-Paket |
| `JLCPCB_BOM.csv` | **SMT-only** für JLCPCB Assembly |
| `JLCPCB_CPL.csv` | **CPL Upload** (JLCPCB-Spaltennamen) |
| `JLCPCB_CPL_minimal.csv` | Fallback-CPL (nur 5 Spalten), falls volles Format scheitert |
| `HAND_BESTUECKUNG.csv` | **Handteile** + DNP-Testpads (nicht JLCPCB) |
| `vogelstimmen_v2.5-bom.csv` | KiCad-Voll-BOM (SMT+THT — nicht für SMT-Upload) |
| `vogelstimmen_v2.5-cpl.csv` | KiCad-Roh-CPL (nicht hochladen) |
| `vogelstimmen_v2.5-all-pos.csv` | Alle Positionen |
| `vogelstimmen_v2.5-schematic.pdf` | Schaltplan-PDF |
| `vogelstimmen_v2.5-pcb.pdf` | Layout-PDF |
| `vogelstimmen_v2.5.kicad_sch/pcb/pro` | KiCad-Quellen (Stand Export) |
| `docs/` | DRC/ERC, Review, Schaltplan-Doku |
| `simulation/` | HTML5-Platinen-Simulation Rev 2.5 (siehe unten) |

## Simulation

**Empfohlen:** Doppelklick auf `simulation/start_rev25.bat`  
→ **http://127.0.0.1:8766/** (eigener Port, umgeht Browser-Cache von :8765)

Alternativ: `python simulation/serve.py` → http://127.0.0.1:8765/

## Änderungen Rev 2.5 (gegenüber Erstlayout vor Respin, archiviert)

| ID | Änderung |
|----|----------|
| F-01 | D15–D22 Serie U2↔IOx |
| F-02 | R5 = 0 Ω |
| F-03 | R13 + C4 BUSY-Blanking |
| F-04 | R12 = 10 Ω → 12V_LED |
| F-05 | SPK ≥ 0,4 mm (Haupt 0,8 mm) |
| Layout | +13 GND-Vias (Stitching U1/C1–C4) |

## IBN-Hinweise

- **USB:** nur Modul abgezogen oder Latch aus (F-09)  
- **Proto optional:** F-03 Oszi, F-04 LED-Strom, F-08 5 V unter Last  

Review: `docs/reviewer_handoff.md` · Checkliste: `docs/review_checkliste_m04.md`
