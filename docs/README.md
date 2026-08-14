# Dokumentation – Vogelstimmenkasten Rev 3.0

Stand: **13. August 2026** · Hardware-Baseline: **`hardware/V3.0/`**

## Showcase / Team-Demo

| Dokument / Ort | Inhalt |
|----------------|--------|
| **[../showcase/](../showcase/)** | Interaktive V-Modell-/MBSE-Website |
| **[mbse_reise.md](mbse_reise.md)** | Abdeckungskarte: vorhanden / teilweise / weggelassen / offen |

## V-Modell — Spezifikation (links)

| Dokument | Inhalt |
|----------|--------|
| [stakeholder.md](stakeholder.md) | Stakeholder, Needs → Requirements |
| [anforderungen.md](anforderungen.md) | Lastenheft F/E/U/H/M |
| [pflichtenheft.md](pflichtenheft.md) | Implementierungs-Baseline, SYS-* |
| [use_cases.md](use_cases.md) | UC-01…05, Szenarien |
| [funktionsstruktur.md](funktionsstruktur.md) | Blackbox, Funktionsbaum |
| [systemarchitektur.md](systemarchitektur.md) | Blöcke B1–B8, Domänen, Zustände |
| [mbse_sysml.md](mbse_sysml.md) | SysML-Diagrammrollen (Mermaid/Tabellen) |
| [pbs_icd.md](pbs_icd.md) | Product Breakdown + Interface Control |
| [entscheidungen.md](entscheidungen.md) | ADRs Latch, Audio, Buck, USB, VGS, Respin |
| [../hardware/V3.0/docs/entscheidungen_v30.md](../hardware/V3.0/docs/entscheidungen_v30.md) | **ADRs Rev 3.0** (0603, Hengstler, One-Shot, BOM-Gate) |
| [risiko_fmea.md](risiko_fmea.md) | Risiko / Design-FMEA light |

## Design, Twin, Trace (Mitte / Thread)

| Dokument | Inhalt |
|----------|--------|
| [../hardware/V3.0/docs/schaltplan.md](../hardware/V3.0/docs/schaltplan.md) | **Schaltplan Rev 3.0** |
| [schaltplan.md](schaltplan.md) | Historisch Rev 2.4 (Kübler) |
| [pcb_v3.0.md](pcb_v3.0.md) | **Topview + JLCPCB-BOM** (Downloads 13.08.2026) |
| [bom_jlcpcb.md](bom_jlcpcb.md) | SMT-BOM wie bei JLCPCB hochgeladen |
| [bom_verfuegbarkeit.md](bom_verfuegbarkeit.md) | LCSC / BOM-Gate |
| [datasheets/](datasheets/) | Datenblätter aller Teile Rev 3.0 |
| [digitaler_zwilling.md](digitaler_zwilling.md) | Verhaltens-Twin + Topview-Simulation |
| [traceability.md](traceability.md) | RTM Req → Funktion → Physikalisch → V |
| [digital_thread.md](digital_thread.md) | End-to-End-Verknüpfungskette |
| [kicad_anleitung.md](kicad_anleitung.md) | KiCad 10 Arbeitsfluss |

## V&V, Freigabe, Fertigung (rechts)

| Dokument | Inhalt |
|----------|--------|
| [vv_testplan.md](vv_testplan.md) | Teststrategie, TC-U/I/T/S/A |
| [reviewer_handoff.md](reviewer_handoff.md) | Einstieg Reviewer |
| [review_checkliste_m04.md](review_checkliste_m04.md) | M04-Checkliste |
| [../hardware/V2.5-final/docs/adversarial_review_v25.md](../hardware/V2.5-final/docs/adversarial_review_v25.md) | Adversarial Review Rev 2.5 (Archiv) |
| [montage_ibn.md](montage_ibn.md) | Montage & Inbetriebnahme |
| [service_betrieb.md](service_betrieb.md) | Service, Wartung, Constraints |
| [konfiguration_baseline.md](konfiguration_baseline.md) | CM / Baseline light |
| **[../hardware/V3.0/](../hardware/V3.0/)** | **Gerber, BOM, CPL, PDFs, KiCad (aktuell)** |
| [../hardware/V2.5-final/](../hardware/V2.5-final/) | Archiv Rev 2.5 |

## Weitere / Historie

| Dokument | Inhalt |
|----------|--------|
| [zwischenstand.md](zwischenstand.md) | Projektstand |
| [pcb_v2.4.md](pcb_v2.4.md) u. a. | Ältere PCB-Stände |
| [datasheets/](datasheets/) | Datenblätter aller Rev-3.0-Teile |
| `../rev1_archiv/docs/` | Rev‑1-Archiv |

**Bewusst weggelassen:** Business Case/Markt/ROI, APQP/PPAP, CE-Vollakte, CAD/FEM (Gehäuse Bestand), App-SRS (Modul-Firmware).
