# Zwischenstand: Vogelstimmenkasten Rev 2

**Datum:** 3. August 2026  
**Status:** **F-01…F-09 geschlossen** (Respin + Restrisiko dokumentiert) — DRC/ERC/Parität OK; **Proto + Gerber-Export** vor Serie  
**Reviewer:** [`reviewer_handoff.md`](reviewer_handoff.md) · [`adversarial_review_v24.md`](adversarial_review_v24.md) · [`review_checkliste_m04.md`](review_checkliste_m04.md)

---

## Erledigte Meilensteine

| # | Meilenstein | Dokument |
|---|-------------|----------|
| 1 | Lastenheft Rev 2 | `docs/anforderungen.md` |
| 2 | Systemarchitektur (BDD/IBD/Zustandsdiagramm) | `docs/systemarchitektur.md` |
| 3 | Schaltplan Rev 2 (Block B1–B8) | `docs/schaltplan.md` |
| 4 | BOM-Verfügbarkeit bei LCSC geprüft | `docs/bom_verfuegbarkeit.md` |
| 5 | Traceability-Matrix + Verifikationsplan | `docs/traceability.md` |
| 6 | Digitaler Zwilling (System→Block→Bauteil) | `docs/digitaler_zwilling.md` |
| 7 | Rev-1-Dateien archiviert | `rev1_archiv/` |
| 8 | KiCad-Schaltplan (+ VGS-Teile D11/D12/R7/R8) | `hardware/vogelstimmen_v2.4.kicad_sch` |
| 9 | PCB-Platzierung Rev 2.2 | `hardware/vogelstimmen_v2.2.kicad_pcb` |
| 10 | PCB Rev 2.3 VGS-Zeners platziert | `hardware/vogelstimmen_v2.3.kicad_pcb` |
| 11 | PCB Rev 2.4 Latch Kaltstart ≈0 µA | `hardware/vogelstimmen_v2.4.kicad_pcb` |
| 12 | PCB Rev 2.4 Routing + DRC | `hardware/DRC_v2.4_check.rpt` — 0 Fehler, 0 unverbunden; 1 Footprint-Warnung U2 |
| 13 | Layout-Feinschliff + Sim-Export | `simulation/pcb_layout.json`, `pcb_tracks.json` (01.08.2026) |
| 14 | Steckverbinder → Phoenix MPT 0,5 (E-CONN-01) | J3/J4 = 8-pol; J1/J2/J6 = 2-pol |
| 15 | J3 Klemme 180° (Kabel oben), übrige von unten | Netze XY unverändert |
| 16 | Schaltplan als `vogelstimmen_v2.4.kicad_sch` | passt zu `.kicad_pro` / PCB 2.4 |
| 17 | Fertigungspaket `hardware/2.final/` | Gerber, BOM, CPL, Schaltplan/PCB PDF |
| 19 | **Respin F-01…F-05** (Adversarial Review) | D15–D22, R5=0R, R13/C4, R12, SPK≥0,4 mm |
| 20 | DRC/ERC/Parität nach Respin | `DRC_v2.5_f01f05.rpt`, `ERC_v2.5_f01f05.rpt` |
| 21 | **F-06…F-09 Restrisiko dispositioniert** | Einsatz ≤30 cm Schrank; F-07/08/09 akzeptiert — `adversarial_review_v24.md` |

## Getroffene Entscheidungen

### Audio-Modul: DY-SV17F (statt WT588D)
- 8 IO-Trigger, 5W Class-D Verstärker eingebaut, USB Drag&Drop
- Mode 0 (Flanken-Trigger) — Sound spielt nach kurzem Druck komplett durch
- Kein separater Verstärker, kein Programmer nötig

### Power-Management: Hardware-Latch (≈0 µA Standby)
- SI2301 (P-FET) + 2N7002 als Selbsthaltung — **E-LATCH-01**
- **VGS-Schutz:** BZX84C6V2 an Q5/Q1/Q6 + Serie-R — LCSC C179522
- **Kaltstart v2.4 (E-LATCH-02):** Active-Low-OR → **Q6 P-FET-SET** (nicht N-Inverter) → Latch-Idle ≈0 µA
- **R6 = 470 kΩ (E-RPP-01):** Q5-Gate-Idle ≈12 µA → E02 erfüllt
- **Simulation:** `simulation/` — HTML5 + Verhaltensmodell; Start: `python simulation/serve.py`
- **Release:** Q3.Drain an LATCH_SET
- Entscheidungstabelle: `docs/entscheidungen.md`

### Impulszähler: Kübler K07.90
- **Bestellnummer:** `1.130.900.008` (4,5 V DC / 10 Hz Typ 0) an 5 V-Rail
- Datenblatt Typ 0: **−10 % / +20 %** → 4,05…**5,4 V**; 5,0 V = +11 % → **im Spec** (E-CNT-01)
- Alternative: `1.130.900.012` (12 V) an 12V_SW
- Zählt Sessions; Anzeige oben; Footprint `vogelstimmen:K07.90`

### Batterie / E03
- Herkömmliche 12 V-Autobatterie (~30 Ah Blei)
- **Real case ≥ 1 Jahr** (siehe `traceability.md` §3); Idle-Elektronik ~12 µA vernachlässigbar

### Stromversorgung: TPS62163 (12V → 5V)
- Einzige Spannungsebene: 5V für DY-SV17F + Zähler
- Verpolungsschutz: SI2301+D11, TVS: SMAJ15A, PTC: 1A/24V

### Taster-LEDs
- 6–24V LEDs an `12V_LED` über **R12 = 10 Ω** von `12V_SW` (F-04)
- Alle leuchten gemeinsam während Wiedergabe

## Layout-Constraints

- **DY-SV17F:** Am Platinenrand, Micro-USB nach außen zugänglich
- **Kübler K07.90:** Anzeige oben zum Gehäuse-Sichtfenster (H06); Footprint `vogelstimmen:K07.90`
- **4× M3 Montagelöcher** in den Ecken
- **Testpunkte:** TP_12V, TP_5V, TP_GND, TP_BUSY, TP_AUDIO

## ERC / DRC / Simulation / Fertigung (Stand 02.08.2026)

| Check | Ergebnis |
|-------|----------|
| **DRC** PCB (Respin F-01…F-05) | **0 Fehler, 0 unverbunden** (`DRC_v2.5_f01f05.rpt`); Parität Schaltplan OK |
| **ERC** Schaltplan | **0 Fehler**; 1 Warnung: Label `SET_DRV` (`isolated_pin_label`) |
| **Respin** | D15–D22 Serie U2; R5=0R; R13+C4 BUSY-Blanking; R12=10Ω J6; SPK≥0,4 mm (Haupt 0,8 mm) |
| **F-01…F-09** | Behoben oder akzeptiert — siehe `adversarial_review_v24.md` Dispositionstabelle |
| **Fertigung** | `hardware/2.final/` — **noch auf Pre-Respin**; Gerber/CPL/PDF neu erzeugen vor Order |

Details: `docs/pcb_v2.4.md`, `docs/bom_verfuegbarkeit.md`, `hardware/2.final/README.md`.

## Nächste Schritte

1. Gerber/CPL/PDF neu aus Working-PCB → `2.final/` aktualisieren + ZIP
2. Proto: optional F-03 Oszi; F-04 LED-Strom/R12-Temp.; F-08 5 V unter Last
3. M04 → Bestellung

## Projektdateien

| Datei | Inhalt |
|-------|--------|
| `docs/digitaler_zwilling.md` | System→Block→Bauteil (VGS-Schutz dokumentiert) |
| `docs/anforderungen.md` | Lastenheft Rev 2 (+ H07) |
| `docs/systemarchitektur.md` | Systemarchitektur (BDD, IBD, Timing) |
| `docs/schaltplan.md` | Schaltplan Rev 2 (Blöcke, Netzliste, BOM) |
| `docs/bom_verfuegbarkeit.md` | LCSC-Verfügbarkeit inkl. BZX84C6V2 |
| `docs/traceability.md` | Traceability + Verifikationsplan |
| `docs/kicad_anleitung.md` | KiCad + VGS-Verdrahtung |
| `docs/pcb_v2.2.md` | PCB Rev 2.2 Platzierung |
| `docs/entscheidungen.md` | Designentscheidungen (E-LATCH-01/02, …) |
| `docs/pcb_v2.3.md` | PCB Rev 2.3 Zeners |
| `docs/pcb_v2.4.md` | PCB Rev 2.4 — Routing + Feinschliff |
| `hardware/vogelstimmen_v2.4.kicad_pro` | **KiCad-Projekt öffnen** |
| `hardware/vogelstimmen_v2.4.kicad_sch` | Schaltplan Rev 2.4 |
| `hardware/vogelstimmen_v2.4.kicad_pcb` | PCB Rev 2.4 |
| `hardware/vogelstimmen_v2.kicad_sch` | älterer Schaltplan-Name (durch v2.4 ersetzt) |
| `hardware/vogelstimmen_v2.3.kicad_pcb` | PCB Rev 2.3 (Inverter-Kaltstart verworfen) |
| `hardware/DRC_v2.4_check.rpt` | DRC-Lauf |
| `hardware/ERC_v2_check.rpt` | ERC-Lauf |
| `hardware/2.final/` | **Fertigungspaket** (Gerber, BOM, CPL, PDFs) |
| `hardware/2.final.zip` | Gesamtarchiv Fertigung |
| `docs/reviewer_handoff.md` | **Einstieg Reviewer** vor Bestellung |
| `docs/review_checkliste_m04.md` | M04 Checkliste + Signatur |
| `simulation/pcb_layout.json` | Footprint-Positionen (Export) |
| `simulation/pcb_tracks.json` | Leiterbahnen (Export) |
| `rev1_archiv/` | Alle Rev-1-Dateien |
