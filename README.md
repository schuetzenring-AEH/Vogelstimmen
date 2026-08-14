# Vogelstimmenkasten – Waldlehrpfad (Rev 3.0)

Neubau der Elektronik eines Vogelstimmenkastens für den Waldlehrpfad der Kolpingfamilie.

## Überblick

Besucher können per Knopfdruck (8 beleuchtete Taster) verschiedene Vogelstimmen anhören. Die Elektronik ist auf **null Ruhestrom** optimiert (Hardware-Latch) und wird über eine 12-V-Autobatterie betrieben.

**Architektur:** DY-SV17F (IO-Trigger, integrierter Class-D-Verstärker) + Hardware-Latch + **Hengstler 0.635.128 One-Shot**

## Projektstatus

| Phase | Status |
|-------|--------|
| Anforderungen | ✅ fertig |
| Systemarchitektur (BDD/IBD) | ✅ fertig |
| Schaltplan-Dokumentation Rev 3.0 | ✅ `hardware/V3.0/docs/schaltplan.md` |
| BOM-Verfügbarkeit (LCSC/JLCPCB) | ✅ 0603 Basic LCSC |
| Digitaler Zwilling (Bauteilebene) | ✅ `docs/digitaler_zwilling.md` + `simulation/` |
| KiCad-Schaltplan / PCB Rev 3.0 | ✅ `hardware/V3.0/` · DRC 0 Fehler |
| Gerber / BOM / CPL | ✅ `hardware/V3.0/vogelstimmen_v3.0-Gerber.zip` |
| M04-Review / Adversarial | ✅ F-01…F-09 dispositioniert; R-01 Schaltplan-Symbole nachgezogen |
| Fertigung & Inbetriebnahme | ▶️ JLCPCB bestellbar; Proto messen vor Serie |
| MBSE-Showcase | ✅ `showcase/` · live: GitHub Pages |

**Reviewer-Einstieg:** [docs/reviewer_handoff.md](docs/reviewer_handoff.md) · Checkliste [docs/review_checkliste_m04.md](docs/review_checkliste_m04.md)  
Details: **[docs/zwischenstand.md](docs/zwischenstand.md)**

## Projektstruktur

| Ordner | Inhalt |
|--------|--------|
| `docs/` | Lastenheft, Architektur, ADRs, Traceability, Zwilling, Zwischenstand |
| **`hardware/V3.0/`** | **Aktuelles Fertigungspaket** (Gerber, BOM, CPL, KiCad, PDFs) |
| `hardware/V2.5-final/` | Archiv (Kübler-Ära, eingefroren) |
| `simulation/` | Interaktive Platinen-Simulation Rev 3.0 |
| `showcase/` | **MBSE-Präsentation** |
| `rev1_archiv/` | Rev-1-Archiv (Lessons Learned) |

## Technische Eckdaten

- **Audio-Modul:** DY-SV17F auf Sockel (Mode 0, 5W Class-D); USB nur Werkstatt (E-AUDIO-04)
- **Versorgung:** 12V Bleiakku → Latch → TPS62163 → 5V **nur Audio**; kein UVLO-IC (E-UVLO-01)
- **Stromsparen:** Hardware-Latch — Idle ≈12 µA (R6=470 kΩ, E-RPP-01)
- **Schutz:** Verpolung SI2301+**D11 Zener 6,2 V**, Latch Q1+**D12**, TVS SMAJ15A, PTC 1A/24V
- **Zähler:** Hengstler **0.635.128** (12 V PCB) + One-Shot ~80 ms an `12V_SW` (E-CNT-03/04)
- **Widerstände:** alle **0603** (E-R0603)
- **Taster-LEDs:** 8× beleuchtete Taster über `12V_LED` / R12
- **Digitaler Zwilling:** [docs/digitaler_zwilling.md](docs/digitaler_zwilling.md)

## Rev 1 → Rev 2 → Rev 3.0

Rev 1: Spannungsfestigkeit / Verfügbarkeit. Rev 2: Latch, DY-SV17F, Traceability. **Rev 3.0:** 0603-Pads, Hengstler statt Kübler, One-Shot statt Dauer-ON.

## Voraussetzungen (Entwicklung)

- [KiCad 10](https://www.kicad.org/) – Schaltplan/PCB
- Python 3 – lokale Simulation (`python simulation/serve.py`)

## Lizenz

Dieses Projekt ist für den internen Gebrauch der Kolpingfamilie bestimmt.
