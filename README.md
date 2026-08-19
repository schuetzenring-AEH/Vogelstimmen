# Vogelstimmenkasten – Waldlehrpfad (Rev 2)

Neubau der Elektronik eines Vogelstimmenkastens für den Waldlehrpfad der Kolpingfamilie.

## Überblick

Besucher können per Knopfdruck (8 beleuchtete Taster) verschiedene Vogelstimmen anhören. Die Elektronik ist auf **null Ruhestrom** optimiert (Hardware-Latch) und wird über eine 12-V-Autobatterie betrieben.

**Architektur:** DY-SV17F (IO-Trigger, integrierter Class-D-Verstärker) + Hardware-Latch (MOSFET-Selbsthaltung)

## Projektstatus

| Phase | Status |
|-------|--------|
| Anforderungen | ✅ fertig |
| Systemarchitektur (BDD/IBD) | ✅ fertig |
| Schaltplan-Dokumentation Rev 2 | ✅ fertig |
| BOM-Verfügbarkeit (LCSC/JLCPCB) | ✅ geprüft |
| Digitaler Zwilling (Bauteilebene) | ✅ `docs/digitaler_zwilling.md` |
| KiCad-Schaltplan (+ VGS-Zener D11/D12) | ✅ verdrahtet |
| PCB Rev 2.4 + Respin F-01…F-05 | ✅ Working-PCB DRC/ERC 0 Fehler |
| Gerber / BOM / CPL | ✅ `hardware/V2.5-final/` (FREIGABE MIT AUFLAGEN) |
| M04-Review / Adversarial | ✅ F-01…F-09 dispositioniert; Proto-Auflagen |
| Fertigung & Inbetriebnahme | ▶️ JLCPCB bestellbar; Proto messen vor Serie |
| MBSE-Showcase (USB) | ✅ `showcase/` + `dist/Vogelstimmen-MBSE-USB.zip` |

**Reviewer-Einstieg:** [docs/reviewer_handoff.md](docs/reviewer_handoff.md) · Checkliste [docs/review_checkliste_m04.md](docs/review_checkliste_m04.md)  
Details: **[docs/zwischenstand.md](docs/zwischenstand.md)**

## Projektstruktur

| Ordner | Inhalt |
|--------|--------|
| `docs/` | Lastenheft, Architektur, ADRs, Traceability, Zwilling, Zwischenstand |
| `hardware/V2.5-final/` | Fertigungspaket Rev 2.5 (Gerber, BOM, CPL, KiCad, PDFs) |
| `simulation/` | Interaktive Platinen-Simulation (HTML5) |
| `showcase/` | **MBSE-Präsentation** (offline Website) — `START_SHOWCASE.bat` |
| `mbse-app/` | Impact-Analyse, Audit, SysML/JSON-Export — Pages `/mbse/` |
| `dist/` | USB-ZIP nach `tools/package_mbse_usb.ps1` |
| `rev1_archiv/` | Rev-1-Archiv (Lessons Learned) |

## Technische Eckdaten

- **Audio-Modul:** DY-SV17F (8× IO-Trigger, Mode 0, 5W Class-D, USB-Upload)
- **Versorgung:** 12V Bleiakku → TPS62163 Buck → 5V
- **Stromsparen:** Hardware-Latch — Idle ≈12 µA (R6=470 kΩ, E-RPP-01)
- **Schutz:** Verpolung SI2301+**D11 Zener 6,2 V**, Latch Q1+**D12**, TVS SMAJ15A, PTC 1A/24V
- **Zähler:** Kübler K07.90 (5V DC, elektromechanisch, Anzeige oben, zählt Aufweck-Events)
- **Taster-LEDs:** 8× beleuchtete Taster (6–24V LEDs über 12V_SW Rail)
- **Audioformat:** MP3/WAV direkt per USB auf DY-SV17F laden
- **Digitaler Zwilling:** [docs/digitaler_zwilling.md](docs/digitaler_zwilling.md)

## Rev 1 → Rev 2: Lessons Learned

Rev 1 hatte Probleme mit Spannungsfestigkeit (U4/U5 Burnout bei 12V), Bauteil-Verfügbarkeit und fehlendem Verifikationsansatz. Rev 2 verwendet:
- MBSE / V-Modell mit Traceability
- Durchgängige Spannungsprüfung aller Bauteile
- BOM-Verfügbarkeit vorab bei LCSC geprüft
- Digitaler Zwilling zur Logikverifikation

## Voraussetzungen (Entwicklung)

- [KiCad 10](https://www.kicad.org/) – Schaltplan/PCB
- Python 3 – lokale Simulation (`python simulation/serve.py`) oder `START_SHOWCASE.bat` / `START_MBSE.bat`
- [LTspice](https://www.analog.com/en/resources/design-tools-and-calculators/ltspice-simulator.html) – analoge Teilschaltungen (optional)

## Lizenz

Dieses Projekt ist für den internen Gebrauch der Kolpingfamilie bestimmt.
