# Reviewer-Handoff — vor Fertigung (Rev 2.5)

**Datum:** 3. August 2026  
**Projekt:** Soundplatine Waldlehrpfad · Kolping Alteglofsheim · Konrad Senn  
**Ziel dieses Pakets:** Design-Review und Freigabe **vor** JLCPCB-/Teilebestellung (Anforderung **M04**).

---

## 1. Auftrag an den Reviewer

Bitte prüfen und mit Signatur in [`review_checkliste_m04.md`](review_checkliste_m04.md) abschließen:

1. Architektur und Strompfade (Latch Idle ≈0 µA, Kaltstart Q6, BUSY-Release)
2. Spannungsfestigkeit / VGS-Schutz / Kübler an 5 V
3. BOM + Verfügbarkeit + manuelle Teile
4. PCB/DRC/ERC und Fertigungsdaten in **diesem Paket** (`V2.5-final/`)
5. Offene Risiken akzeptieren oder Nacharbeit fordern

**Gewünschtes Ergebnis:** Freigabe „Bestellung erlaubt“ **oder** Liste blockierender Nacharbeiten.

> **Adversarial Review:** [`adversarial_review_v25.md`](adversarial_review_v25.md) — **F-01…F-09 geschlossen** (03.08.2026): Respin F-01…F-05 + F-06…F-09 dispositioniert. Proto optional (F-03/F-04/F-08).  
> **Fertigung:** Export **03.08.2026** — Gerber/BOM/CPL/PDF in diesem Ordner.

---

## 2. Lesereihenfolge (ca. 45–90 min)

| # | Dokument / Artefakt | Warum |
|---|---------------------|--------|
| 1 | **Dieses Dokument** | Überblick + Scope |
| 2 | Cursor-Canvas **fertigung-readiness-v25** (neben Chat öffnen) | Gate-Status, Risiken, Sign-off-Überblick |
| 3 | [`zwischenstand.md`](zwischenstand.md) | Aktueller Projektstatus |
| 4 | [`anforderungen.md`](anforderungen.md) | Lastenheft F/E/H/U/M |
| 5 | [`entscheidungen.md`](entscheidungen.md) | E-LATCH-01/02, E-RPP-01, E-VGS-01, E-CNT-01, E-CONN-01 |
| 6 | [`systemarchitektur.md`](systemarchitektur.md) | BDD / IBD / Timing |
| 7 | [`schaltplan.md`](schaltplan.md) + `vogelstimmen_v2.5-schematic.pdf` | Blöcke B1–B8 |
| 8 | [`pcb_v2.5.md`](pcb_v2.5.md) + PCB-PDF | Layout-Constraints |
| 9 | [`bom_verfuegbarkeit.md`](bom_verfuegbarkeit.md) | LCSC Stand 01.08.2026 |
| 10 | [`traceability.md`](traceability.md) | Req→Block→Verifikation; E03-Analyse |
| 11 | [`digitaler_zwilling.md`](digitaler_zwilling.md) + `simulation/` | Verhaltensmodell |
| 12 | [`review_checkliste_m04.md`](review_checkliste_m04.md) | Abhaken + Signatur |
| 13 | `Gerber/`, `JLCPCB_BOM.csv`, `docs/DRC_v2.5_final.rpt` | Fertigungsdaten + Checks |

KiCad öffnen: `vogelstimmen_v2.5.kicad_pro`  
Simulation: `python simulation/serve.py` → http://127.0.0.1:8765/

---

## 3. System in einem Satz

8 beleuchtete Taster → Hardware-Latch weckt 12 V-Schiene → Buck 5 V → DY-SV17F spielt Vogelstimme → BUSY schaltet Latch ab; Idle-Elektronik ~12 µA (R6); Kübler zählt Sessions.

---

## 4. Fertigungsartefakte

| Artefakt | Pfad |
|----------|------|
| Gerber-ZIP (Upload) | `vogelstimmen_v2.5-Gerber.zip` |
| SMD-BOM LCSC | `JLCPCB_BOM.csv` |
| CPL | `vogelstimmen_v2.5-cpl.csv` |
| Schaltplan/PCB PDF | `*-schematic.pdf`, `*-pcb.pdf` |
| Gesamtpaket | `../V2.5-final.zip` |
| Anleitung Paket | `README.md` |

### Manuell (nicht in `JLCPCB_BOM.csv` — siehe `HAND_BESTUECKUNG.csv`)

- DY-SV17F (+ optional 2×9 Sockel)
- Kübler **1.130.900.008**
- Phoenix MPT 0,5/8 ×2 (z. B. 1725711), MPT 0,5/2 ×3

---

## 5. Bekannte Restpunkte (nicht verschweigen)

| Punkt | Schwere | Empfehlung |
|-------|---------|------------|
| DRC: U2 Footprint vs. Lib-Mismatch | Warnung | Akzeptieren oder Lib synchronisieren — kein Open-Net |
| ERC: Label `SET_DRV` isolated | Warnung | Kosmetik; Netz ist verdrahtet |
| M03 LTspice D06/D07 | Prozess offen | HTML-Sim + Analyse vorhanden; LTspice optional vor/parallel Prototyp |
| Feld O1–O7 (Gehäuse, LS-Z, …) | System, nicht PCB | Parallel zur PCB-Bestellung klären |
| TPS62163 Bestand ~510 | Beschaffung | +1 Reserve |
| E03 Worst-case ~9 Monate | Sensitivität | Real case ≥1 Jahr dokumentiert; Worst case akzeptieren oder größere Batterie |

---

## 6. Was der Reviewer *nicht* leisten muss

- Bring-up / Idle-µA-Messung (erst nach Bestückung, Phase A/T in Traceability)
- Gehäuse-CAD oder Audio-Content laden
- Rev-1-Archiv bewerten (nur Historie unter `rev1_archiv/`)

---

## 7. Rückmeldung

Bitte Ergebnis in `review_checkliste_m04.md` § Signatur eintragen:

- **FREIGABE** — Bestellung Gerber + Teile erlaubt  
- **FREIGABE MIT AUFLAGEN** — Bestellung ja, Auflagen dokumentieren  
- **SPERRE** — blockierende Punkte auflisten  

Optional: kurzes Review-Protokoll (1 Seite) zusätzlich ablegen.
