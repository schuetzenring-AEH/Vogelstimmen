# Pflichtenheft (Implementierungs-Baseline) — Rev 3.0

**Beziehung:** Konkretisiert das Lastenheft `anforderungen.md` in umsetzbare Vorgaben.  
**Status:** abgeleitet aus Lastenheft + ADRs + Schaltplan **V3.0** (`entscheidungen_v30.md`).

---

## 1. Systemlösung (Soll)

| Aspekt | Vorgabe |
|--------|---------|
| Audio | DY-SV17F, Mode 0, 8× IO-Trigger, Class-D SPK |
| Energie | 12 V Batterie → Latch → Buck 5 V; Idle ≈12 µA (R6) |
| Zähler | **Hengstler 0.635.128** (12 V) + One-Shot an `12V_SW` (E-CNT-03/04); nicht an 5 V |
| Klemmen | Phoenix MPT 0,5 (J1–J4, J6) |
| Fertigung | JLCPCB 2L 1,6 mm SMD 0603; THT/Modul/Zähler manuell |
| Domain-Trennung | D15–D22 Serie U2↔IOx (F-01) |
| VOS | R5 = 0 Ω (F-02) |
| BUSY-Release | R13 + C4 Blanking (F-03) |
| LED | R12 10 Ω → 12V_LED (F-04) |

---

## 2. Abgeleitete Systemanforderungen (SYS)

| SYS-ID | Aussage | Quelle |
|--------|---------|--------|
| SYS-01 | Platine speist sich ausschließlich aus 12 V DC an J1 | E01 |
| SYS-02 | Im Idle ist 12V_SW und 5V abgetrennt (Latch AUS) | E02, E05 |
| SYS-03 | Tastendruck setzt Latch auch ohne 5 V (Kaltstart Q6) | E04, E-LATCH-02 |
| SYS-04 | Nach Track-Ende löst BUSY den Latch (mit RC-Blanking) | E05, F-03 |
| SYS-05 | Modul-IOs sehen kein 12-V-OR-Netz | F-01, adversarial |
| SYS-06 | Pro Latch-ON genau ein Zählimpuls (~80 ms) an Hengstler; Idle Spulenstrom 0 | E-CNT-03/04 |
| SYS-07 | SPK-Leiterbahnen ≥ 0,4 mm (Haupt 0,8 mm) | F-05 |
| SYS-08 | USB-Programmierung nur ohne Board-5V / Modul abgezogen | F-09 |

---

## 3. Nicht-Ziele

- Kein Mikrocontroller / keine eigene Firmware
- Kein Bluetooth/WLAN
- Kein Business-/Marketing-Dokumentensatz
- Keine vollständige CE-Akte in diesem Repo (nur Hinweise)

---

## 4. Abnahme (gegen Lastenheft §11)

Siehe `vv_testplan.md` — Mapping Abnahmekriterien → Testfälle. Proto-Messungen vor Serie verpflichtend (Freigabe mit Auflagen).
