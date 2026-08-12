# M04 — Review-Checkliste vor Bestellung

**Anforderung:** M04 (`anforderungen.md`)  
**Bezug:** D10 in `traceability.md`  
**Stand Vorlage:** 1. August 2026 · Rev **2.4**  
**Fertigungsdaten:** `hardware/2.final/`

> Reviewer: Kästchen abhaken. Offene Punkte in die Spalte „Notiz“. Am Ende Signatur.  
> **Adversarial Review:** F-01…F-09 geschlossen (03.08.2026) — Respin F-01…F-05 + F-06…F-09 dispositioniert; siehe [`adversarial_review_v24.md`](adversarial_review_v24.md). Vor FREIGABE: Gerber neu exportieren; Proto optional (F-03/F-04/F-08).

---

## A · Dokumente & Scope

| # | Prüfpunkt | OK | Notiz |
|---|-----------|:--:|-------|
| A1 | Lastenheft Rev 2 gelesen (`anforderungen.md`) | ☐ | |
| A2 | Designentscheidungen E-LATCH-01/02, E-RPP-01, E-VGS-01, E-CNT-01, E-CONN-01 akzeptiert | ☐ | |
| A3 | Traceability Phase-1 (D01–D09) nachvollziehbar | ☐ | |
| A4 | Reviewer-Handoff (`reviewer_handoff.md`) als Einstieg genutzt | ☐ | |

## B · Architektur & Sicherheit

| # | Prüfpunkt | OK | Notiz |
|---|-----------|:--:|-------|
| B1 | Idle: Latch aus, Buck/Modul tot; Idle-Pfad ~R6 ≈12 µA &lt; 100 µA (E02) | ☐ | |
| B2 | Kaltstart: Active-Low → BTN_OR → **Q6 P-FET** → SET (nicht N-Inverter) | ☐ | |
| B3 | Release: BUSY → Q3 zieht LATCH_SET; R10 begrenzt Konflikt vs. Q6 | ☐ | |
| B4 | VGS-Clamp BZX84C6V2 an Q5, Q1, Q6 + 4,7 kΩ Serie (H07 / E-VGS-01) | ☐ | |
| B5 | Verpolung Q5 + TVS SMAJ15A + PTC **24 V**-Typ (nicht 6 V) | ☐ | |
| B6 | Kübler `1.130.900.008` an 5 V: Datenblatt −10/+20 % → bis 5,4 V OK (E-CNT-01) | ☐ | |
| B7 | E03 Real-case-Analyse ≥1 Jahr nachvollzogen; Worst-case-Sensitivität bekannt | ☐ | |

## C · Schaltplan / PCB

| # | Prüfpunkt | OK | Notiz |
|---|-----------|:--:|-------|
| C1 | KiCad-Projekt `vogelstimmen_v2.4.kicad_pro` öffnet Schaltplan + PCB | ☐ | |
| C2 | ERC: 0 Fehler; Warnung `SET_DRV` bewertet (akzeptiert / nachziehen) | ☐ | |
| C3 | DRC: 0 unverbunden; U2 Footprint-Warnung bewertet | ☐ | |
| C4 | MPT-Klemmen: J3 180° (Kabel oben), übrige von unten — sinnvoll | ☐ | |
| C5 | DY-SV17F USB / Kübler Anzeige oben / M3-Löcher / Testpunkte vorhanden | ☐ | |
| C6 | Silkscreen-Titel / Polarität Zeners / Pin-1-Markierungen plausibel | ☐ | |

## D · BOM & Beschaffung

| # | Prüfpunkt | OK | Notiz |
|---|-----------|:--:|-------|
| D1 | LCSC-Kernteile laut `bom_verfuegbarkeit.md` (01.08.2026) akzeptiert | ☐ | |
| D2 | TPS62163: begrenzter Bestand → Reserve geplant | ☐ | |
| D3 | Manuelle Teile: DY-SV17F, Kübler, MPT 8×2 + 2×3, optional Sockel U2 | ☐ | |
| D4 | `JLCPCB_BOM.csv` vs. Schaltplan stimmig (Q6/D13 LCSC ergänzt) | ☐ | |

## E · Fertigungsdaten

| # | Prüfpunkt | OK | Notiz |
|---|-----------|:--:|-------|
| E1 | Gerber-ZIP vorhanden und Lagen vollständig (Cu, Mask, Silk, Paste, Edge, Drill) | ☐ | |
| E2 | CPL / Pos für SMD vorhanden | ☐ | |
| E3 | Schaltplan-PDF + PCB-PDF im Paket | ☐ | |
| E4 | Bestellparameter 2-layer / 1,6 mm akzeptiert (Finish nach Wahl) | ☐ | |

## F · Simulation & Rest-Risiken

| # | Prüfpunkt | OK | Notiz |
|---|-----------|:--:|-------|
| F1 | HTML-Sim / digitaler Zwilling für Phasen Idle→Play→Release verstanden | ☐ | |
| F2 | Grenzen der Sim akzeptiert (kein SPICE-Ripple, keine Faults) | ☐ | |
| F3 | M03 LTspice: **entweder** als Auflage nachziehen **oder** bewusst verschieben | ☐ | |
| F4 | Feld O1–O7: nicht PCB-blockierend; Parallelplan OK | ☐ | |

## G · Freigabe-Entscheidungen (explizit)

| # | Entscheidung | Wahl | Notiz |
|---|--------------|------|-------|
| G1 | E03: Real case ≥1 Jahr als Planungsbasis | ☐ akzeptiert / ☐ Nacharbeit | |
| G2 | Kübler 4,5 V-Typ an 5 V-Rail | ☐ akzeptiert / ☐ auf 12 V-Typ wechseln | |
| G3 | ERC/DRC-Warnungen | ☐ akzeptiert / ☐ vor Bestellung fixen | |
| G4 | LTspice M03 | ☐ vor Bestellung / ☐ parallel Prototyp / ☐ entfallen mit Begründung | |

---

## Signatur

| | |
|--|--|
| Reviewer (Name) | |
| Datum | |
| Rolle | (z. B. Elektronik / Projektleitung) |
| **Ergebnis** | ☐ **FREIGABE** · ☐ **FREIGABE MIT AUFLAGEN** · ☐ **SPERRE** |

### Auflagen / Sperrgründe

```
(frei formulieren)




```

### Nächster Schritt nach Freigabe

1. JLCPCB: `hardware/2.final/vogelstimmen_v2.4-Gerber.zip` (+ optional BOM/CPL)  
2. LCSC / manuelle Teile laut `bom_verfuegbarkeit.md`  
3. Bring-up nach Traceability Phase 2/3 (`A01`…)
