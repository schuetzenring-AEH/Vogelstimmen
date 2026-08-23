# BOM-Verfügbarkeit Rev 3.0 — Package-geprüft

**Härte-Regel vor Bestellung:** Auf der LCSC/JLCPCB-Seite muss **Package** exakt dem Footprint entsprechen.

## SMT — JLCPCB Basic Widerstände (0603)

| Ref | Wert | Footprint | LCSC | Package | Library |
|-----|------|-----------|------|---------|---------|
| R1,R2,R13,R20 | 100k | 0603 | **C25803** | 0603 | Basic |
| R3,R4,R9 | 10k | 0603 | **C25804** | 0603 | Basic |
| R5 | 0R | 0603 | **C21189** | 0603 | Basic |
| R6 | 470k | 0603 | **C23178** | 0603 | Basic |
| R7,R8,R11 | 4.7k | 0603 | **C23162** | 0603 | Basic |
| R10 | 1k | 0603 | **C21190** | 0603 | Basic |
| R12 | 10R | 0603 | **C22859** | 0603 | Basic |
| R21 | 100R | 0603 | **C25796** | 0603 | Basic |

## SMT — One-Shot Zähler (E-CNT-03)

| Ref | Teil | Footprint | LCSC | Package |
|-----|------|-----------|------|---------|
| C20 | 1 µF/25 V | 0603 | **C23630** | 0603 Basic |
| Q7 | AO3400 N-MOS | SOT-23 | **C20917** | SOT-23 Basic |
| D23 | 1N4148WS | SOD-323 | **C118873** | (wie D10) |

## Zähler + Klemmen (Hand) — alles bei **RS**

Liste + Schnellbestellung: **`docs/rs_bestellliste.md`**, CSV `../RS_SCHNELLBESTELLUNG.csv`.

| Ref | Teil | RS-Best.-Nr. | Link |
|-----|------|--------------|------|
| J5 | **Hengstler 0.635.128** (Typ 635.1, 12 V PCB) | **312-022** | [RS](https://de.rs-online.com/web/p/zahler-ic/0312022) |
| J1, J2, J6 | Phoenix MPT 0,5/2-2,54 **1725656** | **220-4260** | [RS](https://de.rs-online.com/web/p/leiterplattensteckverbinder/2204260) |
| J3, J4 | Phoenix MPT 0,5/8-2,54 **1725711** | **220-4327** | [RS](https://de.rs-online.com/web/p/leiterplattensteckverbinder/2204327) |
| — | 0.635.132 (5 V) / RS **312-016** | — | **nicht** (Buck-Race) |
| U2 | DY-SV17F | — | **nicht bei RS** (AliExpress) |

J5 = Footprint `CNT_HENGSTLER_635`, Pitch 15,24 mm. One-Shot auf der Platine.

## Checkliste vor JLCPCB-Upload

- [x] Gerber.zip + CPL aus **V3.0** exportiert (`vogelstimmen_v3.0-Gerber.zip`)
- [x] Widerstände: PCB = **R_0603_1608Metric**, Pitch 1,65 mm (kein 0402)
- [ ] Jede LCSC-Seite: Package == Footprint (Parts Matching im JLCPCB-Upload)
- [ ] Parts Matching: 0× „Soldering area too small“
- [ ] **RS:** Hengstler **312-022** + MPT **220-4260** / **220-4327** (`docs/rs_bestellliste.md`)
- [ ] DY-SV17F parallel (nicht RS — AliExpress)
- [x] DRC: 0 open / 0 short (`DRC_v3.0_final.rpt`)
