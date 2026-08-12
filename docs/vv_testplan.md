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
| TC-S01 | System | Idle I_BAT real | <100 µA | **OFFEN Proto** |
| TC-S02 | System | Taste halten → Play | Audio <0,5 s nach Boot | **OFFEN** |
| TC-S03 | System | BUSY/Q3_GATE Oszi | Release verzögert, kein Sofort-Kill Boot | **OFFEN A-03** |
| TC-S04 | System | R12 Temp / I_LED | unkritisch heiß | **OFFEN A-02** |
| TC-S05 | System | 5 V unter Play+LED | 5,0±0,25 V | **OFFEN F-08** |
| TC-S06 | System | Retrigger UC-02 | neue Stimme ersetzt alte | **OFFEN** |
| TC-S07 | System | Zähler +1 pro Session | mechanisch sichtbar | **OFFEN** |
| TC-A01 | Abnahme | Lastenheft §11.1–4 | Betreiber OK | **OFFEN** |
| TC-A02 | Abnahme | USB-Audio UC-04 | Dateien abspielbar | **OFFEN** |

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
