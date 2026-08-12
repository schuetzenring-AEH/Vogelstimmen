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

## Zähler (Hand)

| Priorität | Teil | Größe | Bezug |
|-----------|------|-------|-------|
| **1** | **Hengstler 0.635.128** (Typ 635.1, 12 V PCB) | Body **25,2×31 mm**, Pins 15,24×25,4 | Mercateo / RS / Farnell |
| — | 0.635.132 (5 V) | — | **nicht** (Buck-Race) |
| — | CSK / 875 Panel | ~46×74 mm | **gestrichen** |

J5 = Footprint `CNT_HENGSTLER_635`, Pitch 15,24 mm. One-Shot auf der Platine.

## Checkliste vor JLCPCB-Upload

- [x] Gerber.zip + CPL aus **V3.0** exportiert (`vogelstimmen_v3.0-Gerber.zip`)
- [x] Widerstände: PCB = **R_0603_1608Metric**, Pitch 1,65 mm (kein 0402)
- [ ] Jede LCSC-Seite: Package == Footprint (Parts Matching im JLCPCB-Upload)
- [ ] Parts Matching: 0× „Soldering area too small“
- [ ] **Hengstler 0.635.128** parallel bestellt (Lieferzeit oft Wochen)
- [ ] MPT-Klemmen + DY-SV17F parallel bestellt
- [x] DRC: 0 open / 0 short (`DRC_v3.0_final.rpt`)
