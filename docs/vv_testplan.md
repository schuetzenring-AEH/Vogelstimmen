# Verifikation & Validierung — Testplan Rev 2.5

**V-Modell rechts:** Unit → Integration → Teilsystem → System → Abnahme  
**Status:** Plan vollständig; viele Feld-/Labormessungen noch **offen** (Proto).

---

## 1. Teststrategie

| Ebene | Was | Artefakt / Methode | Status |
|-------|-----|--------------------|--------|
| **Unit** | Bauteil/Netz-Regeln | DRC/ERC, Footprint-Check, BOM-LCSC | größtenteils done |
| **Integration** | Blöcke B1–B8 zusammen | Schaltplan-Review, Simulation Phasen | done / Sim |
| **Teilsystem** | Latch+Buck+Modul-Logik | HTML-Twin, adversariales Review | done Design-V |
| **System** | Platine bestückt im Aufbau | Messprotokoll Proto | **offen** |
| **Abnahme** | Lastenheft §11 | Abnahmetest mit Betreiber | **offen** |

---

## 2. Verifikationsarten (aus Traceability)

| Code | Bedeutung |
|------|-----------|
| V-INS | Inspektion / Sicht |
| V-MES | Messung |
| V-FUN | Funktionstest |
| V-ANA | Analyse / Rechnung |
| V-REV | Review |
| V-SIM | Simulation |

---

## 3. Testfälle (Kern)

| TC | Ebene | Titel | Pass-Kriterium | Status |
|----|-------|-------|----------------|--------|
| TC-U01 | Unit | DRC PCB | 0 Fehler, 0 open nets | PASS (DRC_v2.5_final) |
| TC-U02 | Unit | ERC Schaltplan | 0 Fehler | PASS |
| TC-U03 | Unit | BOM↔CPL↔PCB Refs | 47/47 Match | PASS (Review) |
| TC-I01 | Integration | F-01 Netze IOx_M | U2 nur IOx_M; D15–D22 | PASS (pcbnew) |
| TC-I02 | Integration | F-02 R5=0R | Value+Netze | PASS |
| TC-I03 | Integration | Sim Idle-Strom | ~10–20 µA Latch aus | PASS (Sim) |
| TC-T01 | Teilsystem | Sim UC-01 Happy Path | SET→Play→Release | PASS (Sim) |
| TC-T02 | Teilsystem | Adversarial Disposition | F-01…F-09 geschlossen/akzeptiert | PASS Doku |
| TC-S01 | System | Idle I_BAT real | <100 µA | **OFFEN** (nach C4-Tausch) |
| TC-S02 | System | Taste halten → Play | Audio <0,5 s nach Boot | **PASS** (Proto 24.08.26, mit C4-Brücke; Retest nach C4=47µF) |
| TC-S03 | System | BUSY/Q3_GATE Oszi | Release verzögert, kein Sofort-Kill Boot | **FAIL → E-IBN-03** (C4=4,7µF zu kurz; Fix: 47µF) |
| TC-S04 | System | R12 Temp / I_LED | unkritisch heiß | **OFFEN** |
| TC-S05 | System | 5 V unter Play+LED | 5,0±0,25 V | **PASS** (Proto: TP2=4,82–4,9 V unter Play) |
| TC-S06 | System | Retrigger UC-02 | neue Stimme ersetzt alte | **PASS** (Proto 24.08.26, alle 8 Kanäle wechseln) |
| TC-S07 | System | Zähler +1 pro Session | mechanisch sichtbar | **OFFEN** |
| TC-S08 | System | D9 Polarität | TP1≈12V, F1 kalt | **FAIL → E-IBN-01** (JLCPCB 180° falsch; Fix: D9 drehen) |
| TC-S09 | System | U2 Steckrichtung | TP4 wechselt 0/5V | **FAIL → E-IBN-02** (Reihen vertauschbar; Doku ergänzt) |
| TC-A01 | Abnahme | Lastenheft §11.1–4 | Betreiber OK | **OFFEN** |
| TC-A02 | Abnahme | USB-Audio UC-04 | Dateien abspielbar | **PASS** (Proto: 8× Testtöne per USB geladen, spielen korrekt) |

---

## 4. Mapping Abnahmekriterien → TC

| Lastenheft §11 | TC |
|----------------|-----|
| 8 Taster korrekt | TC-S02, TC-A01 |
| <500 ms Start | TC-S02 |
| Idle <100 µA | TC-S01 |
| Lautstärke 2 m | TC-A01 (subjektiv/SPL optional) |
| Temperatur −10…+60 | V-ANA Datenblatt; Feld optional |
| 1000 Zyklen | Dauerlauf nach Proto |
| Retrigger | TC-S06 |
| Zähler | TC-S07 |

---

## 5. Abweichungsprozess (leicht)

1. Fund → Eintrag (Bug/Abweichung) mit TC-ID  
2. Schwere: Blocker / Major / Minor  
3. Fix → Retest TC  
4. Baseline nur bei PASS kritischer TC-S*

---

## 6. Ehrlichkeit

Design-Verifikation (links+Mitte V) ist stark. **Validierung am realen Kasten steht aus** — daher Fertigungsfreigabe „mit Auflagen“, nicht „serie-fertig ohne Proto“.

---

## 7. Proto-Testprotokoll (24. August 2026)

**Platine:** Rev 2.5, JLCPCB-Bestückung, 2 Exemplare.
**Versorgung:** Netzteil 12,4 V / 5 A.
**Audio:** 8× 10-s-Testtöne (440–1047 Hz) per USB auf DY-SV17F.

### Befunde

| # | Befund | Schwere | Fix | Errata |
|---|--------|---------|-----|--------|
| 1 | D9 (SMAJ15A) 180° falsch bestückt (beide Platinen). F1 heiß, 0,7 V hinter F1. | **Blocker** | D9 drehen | E-IBN-01 |
| 2 | U2 (DY-SV17F) Reihen vertauschbar (kein mech. Verpolschutz). Kein Ton, TP4≈2,5 V. | **Blocker** | Orientierungstabelle + Doku | E-IBN-02 |
| 3 | C4 = 4,7 µF: Blanking zu kurz. Latch oszilliert, Q3 killt Versorgung vor Play-Start. | **Blocker** | C4 → 47 µF (0805) | E-IBN-03 |

### Bestandene Tests (nach Fixes)

- TP1 = 12,3 V (Eingangsschutz B1) ✓
- TP2 = 4,82–4,9 V unter Last (Buck B3) ✓
- Alle 8 IO-Kanäle triggern korrekten Ton (B4/B6) ✓
- Retrigger: Stimme wechselt sofort (UC-02) ✓
- USB-Dateien abspielen korrekt (UC-04) ✓

### Offene Tests (nach C4-Tausch)

- TC-S01: Idle-Strom < 100 µA
- TC-S03: Retest BUSY/Blanking mit C4 = 47 µF
- TC-S04: R12 Temperatur / LED-Strom
- TC-S07: Zähler +1 pro Session (Hengstler nicht bestückt im Test)
