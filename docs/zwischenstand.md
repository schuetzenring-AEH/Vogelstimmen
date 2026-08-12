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

### Impulszähler: Hengstler 0.635.128 (Rev 3.0)
- **Bestellnummer:** `0.635.128` (Typ 635.1, **12 V**, 6 Stellen, Spule 1860 Ω ≈80 mW)
- **Ansteuerung:** One-Shot E-CNT-03 an `12V_SW` / `CNT_LO` (C20/R20/R21/D23/Q7/D10) — nicht dauerhaft an 5 V
- Kübler K07 gestrichen (E-CNT-02, nicht beschaffbar); 5 V-Typ 0.635.132 verworfen (Buck-Race)
- Footprint `vogelstimmen:CNT_HENGSTLER_635` (4 Pins 15,24×25,4 mm)

### Batterie / E03
- Herkömmliche 12 V-Autobatterie (~30 Ah Blei)
- **Real case ≥ 1 Jahr** (siehe `traceability.md` §3); Idle-Elektronik ~12 µA vernachlässigbar

### Stromversorgung: TPS62163 (12V → 5V)
- 5 V **nur** für DY-SV17F; Zähler an 12V_SW + One-Shot
- Verpolungsschutz: SI2301+D11, TVS: SMAJ15A, PTC: 1A/24V

### Taster-LEDs
- 6–24V LEDs an `12V_LED` über **R12 = 10 Ω** von `12V_SW` (F-04)
- Alle leuchten gemeinsam während Wiedergabe

## Layout-Constraints

- **DY-SV17F:** Am Platinenrand, Micro-USB nach außen zugänglich
- **Hengstler J5:** Anzeige zum Gehäuse-Sichtfenster (H06); Footprint `CNT_HENGSTLER_635`
- **4× M3 Montagelöcher** in den Ecken
- **Testpunkte:** TP_12V, TP_5V, TP_GND, TP_BUSY, TP_AUDIO

## Aktueller Hardware-Stand

| Rev | Pfad | Status |
|-----|------|--------|
| **3.0** | `hardware/V3.0/` | **fertig zum Ordern** — Gerber.zip + BOM + CPL; Widerstände alle 0603 |
| 2.5 | `hardware/V2.5-final/` | eingefroren (Kübler-Ära) |

Simulation: `simulation/` (Rev 3.0 Twin). Details Zähler: `docs/digitaler_zwilling.md` §B5.
