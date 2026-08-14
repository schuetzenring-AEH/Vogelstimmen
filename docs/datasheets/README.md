# Datenblätter — Rev 3.0

Stand: **13. August 2026**. Quelle der SMT-Liste: JLCPCB-Export `docs/assets/bom_jlcpcb.xls` (identisch mit `hardware/V3.0/JLCPCB_BOM.csv`).  
Simulationsparameter: `simulation/js/parts.js`.

## Handteile (nicht in der SMT-BOM)

| Datei | Bauteil | Ref | Hinweis |
|-------|---------|-----|---------|
| [Hengstler_634_635.pdf](Hengstler_634_635.pdf) | Hengstler **0.635.128** (Typ 635.1, 12 V, 1860 Ω) | J5 | **nicht** 0.635.132 (5 V) |
| [DY-SV17F.pdf](DY-SV17F.pdf) | Audio-Modul DY-SV17F | U2 | Idle 14 mA / Betrieb ≤60 mA @5 V |
| [Phoenix_MPT_0.5_2_1725656.pdf](Phoenix_MPT_0.5_2_1725656.pdf) | Phoenix MPT 0,5/2-2,54 | J1, J2, J6 | BAT / SPK / LED |
| [Phoenix_MPT_0.5_8_1725711.pdf](Phoenix_MPT_0.5_8_1725711.pdf) | Phoenix MPT 0,5/8-2,54 | J3, J4 | Taster IO / GND |

## Aktive / Schalt-Halbleiter (SMT)

| Datei | Bauteil | Ref | LCSC |
|-------|---------|-----|------|
| [TPS62163.pdf](TPS62163.pdf) | TI TPS62163DSGR Buck 5 V | U1 | C97534 |
| [Si2301CDS.pdf](Si2301CDS.pdf) | Vishay SI2301CDS P-FET | Q1, Q5, Q6 | C10487 |
| [2N7002L.pdf](2N7002L.pdf) | onsemi 2N7002LT1G N-FET | Q2, Q3 | C16338 |
| [AO3400.pdf](AO3400.pdf) | Alpha & Omega AO3400 N-MOS | Q7 | C20917 |
| [BZX84C6V2_Nexperia.pdf](BZX84C6V2_Nexperia.pdf) | BZX84C6V2 6,2 V | D11, D12, D14 | C179522 |
| [1N4148WS.pdf](1N4148WS.pdf) | 1N4148WS SOD-323 | D1–D8, D10, D13, D15–D23 | C118873 |
| [SMAJ15A.pdf](SMAJ15A.pdf) | SMAJ15A TVS 15 V | D9 | C113958 |

## Passive SMT (JLCPCB Basic — Datenblatt = LCSC-Katalog)

Keine eigenen Hersteller-PDFs nötig; Package und Wert sind im BOM-Gate geprüft (`hardware/V3.0/tools/jlcpcb_gate.py`).

| Ref | Wert | Package | LCSC | [lcsc.com](https://www.lcsc.com) |
|-----|------|---------|------|------|
| C1, C2 | 10 µF/25 V | 0805 | C440198 | [C440198](https://www.lcsc.com/product-detail/C440198.html) |
| C3 | 22 µF/10 V | 0805 | C45783 | [C45783](https://www.lcsc.com/product-detail/C45783.html) |
| C4 | 4,7 µF/16 V | 0805 | C1779 | [C1779](https://www.lcsc.com/product-detail/C1779.html) |
| C20 | 1 µF/50 V | 0603 Basic | **C15849** | [C15849](https://www.lcsc.com/product-detail/C15849.html) |
| L1 | 2,2 µH | 1008 | C88527 | [C88527](https://www.lcsc.com/product-detail/C88527.html) |
| F1 | PTC 1 A/24 V | 1206 | C2760272 | [C2760272](https://www.lcsc.com/product-detail/C2760272.html) |
| R1, R2, R13, R20 | 100 kΩ | 0603 Basic | C25803 | [C25803](https://www.lcsc.com/product-detail/C25803.html) |
| R3, R4, R9 | 10 kΩ | 0603 Basic | C25804 | [C25804](https://www.lcsc.com/product-detail/C25804.html) |
| R5 | 0 Ω | 0603 Basic | C21189 | [C21189](https://www.lcsc.com/product-detail/C21189.html) |
| R6 | 470 kΩ | 0603 Basic | C23178 | [C23178](https://www.lcsc.com/product-detail/C23178.html) |
| R7, R8, R11 | 4,7 kΩ | 0603 Basic | C23162 | [C23162](https://www.lcsc.com/product-detail/C23162.html) |
| R10 | 1 kΩ | 0603 Basic | C21190 | [C21190](https://www.lcsc.com/product-detail/C21190.html) |
| R12 | 10 Ω | 0603 Basic | C22859 | [C22859](https://www.lcsc.com/product-detail/C22859.html) |
| R21 | 100 Ω | 0603 Basic | **C22775** | [C22775](https://www.lcsc.com/product-detail/C22775.html) |

## DY-SV17F — Strom

| | Wert | Quelle |
|--|------|--------|
| Idle | **14 mA** @5 V | Messung (Amp LTK5128 + Flash) |
| Betrieb | **≤60 mA** @5 V | Modul-Spec |
| V33 | max 80 mA | Modul-PDF (**Ausgang**, nicht Iq) |

## Archiv (nicht Rev 3.0)

| Datei | Warum archiv |
|-------|----------------|
| [Kuebler_K04-K07.pdf](Kuebler_K04-K07.pdf) | Kübler K07.90 — gestrichen E-CNT-02 |
| [Kuebler_K04-K07_AK07.pdf](Kuebler_K04-K07_AK07.pdf) | älterer Kübler-Stand |

Kübler wird **nicht** bestückt. Zähler ist ausschließlich Hengstler 0.635.128 an `12V_SW` (One-Shot).
