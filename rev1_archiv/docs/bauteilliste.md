# Bauteilliste (Bill of Materials)

Basierend auf Architekturentscheidung: **Option D (WT588D ohne Mikrocontroller)**

Stand: **Juli 2026** – abgestimmt auf KiCad-Design und JLCPCB-Bestellung

Siehe auch: [projektstatus.md](projektstatus.md)

## Fertigungsstrategie

- **PCB + SMD-Bestückung:** JLCPCB (SMT Assembly, nur Top)
- **Through-Hole:** Manuell einlöten (WT588D, Stecker J1–J5)
- **Passivbauteile:** 0805 (SMD), Induktor 1210, Sicherung F1206, TVS SMA

## SMD-Bauteile (JLCPCB bestückt)

### Hauptkomponenten

| Ref | Bauteil | Beschreibung | Package | LCSC |
|-----|---------|--------------|---------|------|
| U2 | W25Q128JVSIQ | 128 Mbit SPI-Flash | SOIC-8 | C97521 |
| U3 | PAM8403DR-H | Class-D Verstärker, 2×3 W | SOP-16 | **C17337** |
| U4 | TPS62203DBVR | Buck 12 V → 3,3 V, 300 mA | SOT-23-5 | **C9051** |
| U5 | SGM809B-RXN3LG/TR | Unterspannungswächter (UVLO) | SOT-23 | C699615 |
| Q1 | SI2301CDS-T1-GE3 | P-MOSFET Verpolungsschutz | SOT-23 | C10487 |
| Q2 | 2N7002 | N-MOSFET Zähler-Ansteuerung | SOT-23 | C8545 |

### Passive Bauteile

| Ref | Wert | Package | LCSC (JLCPCB) | Funktion |
|-----|------|---------|---------------|----------|
| L1 | 10 µH | 1210 | C76835 | Buck-Induktor |
| C1, C2 | 10 µF | 0805 | C440198 | Buck-Eingang |
| C3, C4 | 10 µF | 0805 | C440198 | Buck-Ausgang |
| C5–C8 | 100 nF | 0805 | C49678 | Abblockkondensatoren |
| C9 | 100 nF | 0805 | C49678 | Audio-RC-Filter |
| C10–C17 | 100 nF | 0805 | C49678 | Taster-Entprellung |
| C18 | 1 µF | 0805 | C28323 | Audio-Koppelkondensator |
| R1–R8 | 100 Ω | 0805 | C17408 | Taster (Serie/ESD) |
| R9, R11, R12 | 10 kΩ | 0805 | C17414 | Pull-Up |
| R10 | 10 kΩ | 0805 | C17414 | MOSFET Pull-Down |
| R13 | 1 kΩ | 0805 | C17513 | Audio-RC-Filter |

### Schutz

| Ref | Bauteil | Package | LCSC | Anmerkung |
|-----|---------|---------|------|-----------|
| D1 | SMAJ15A | SMA | C23424 | TVS 15 V am 12-V-Eingang |
| F1 | BSMD1206-050-33V | F1206 | C7202014 | PTC 500 mA rücksetzend |

## Through-Hole (manuell einlöten)

| Ref | Bauteil | Footprint (PCB) | Beschaffung |
|-----|---------|-----------------|-------------|
| U1 | WT588D-16P | DIP-16 | AliExpress |
| – | IC-Sockel 16-pol | – | Reichelt, Amazon |
| J1 | Batterie 12 V | PinHeader 1×2 | Reichelt, Amazon |
| J2 | Lautsprecher | PinHeader 1×2 | Reichelt, Amazon |
| J3 | 8 Taster + GND + 3V3 | PinHeader 1×10 | Reichelt, Amazon |
| J4 | Programmierung | PinHeader 1×4 | Reichelt, Amazon |
| J5 | Impulszähler | PinHeader 1×2 | Reichelt, Amazon |

Auf der Platine sind **2,54-mm-Stiftleisten**. Extern können Schraubklemmen oder Kabel zum Gehäuse angeschlossen werden.

## Extern (nicht auf der Platine)

| Teil | Beschreibung | Bezugsquelle |
|------|--------------|--------------|
| Z1 | Impulszähler 6-stellig, 12 V DC | Amazon |
| – | Lautsprecher 4–8 Ω, 2–3 W (falls neu) | Reichelt, Amazon |
| – | 12-V-Bleibatterie | vorhanden |

## Fertigungsdateien

| Datei | Ort |
|-------|-----|
| Gerber + BOM + CPL (ZIP) | `hardware/Gerber/vogelstimmen-jlcpcb.zip` |
| BOM (JLCPCB) | `hardware/Gerber/vogelstimmen-bom.csv` |
| CPL | `hardware/Gerber/vogelstimmen-cpl.csv` |
| Nicht bestücken | `hardware/Gerber/nicht-bestueckt.txt` |

## Gesamtkosten (Richtwert, 5 Platinen)

| Position | ca. Kosten |
|----------|------------|
| PCB + SMT + Versand (JLCPCB) | 20–35 € |
| WT588D + Sockel + Stecker | ~5 € |
| Impulszähler | 5–8 € |
| **Pro einsatzbereite Platine** | **~8–12 €** |

## Bestellablauf (Stand Juli 2026)

1. ✅ KiCad: Gerber, BOM, CPL exportiert
2. ✅ JLCPCB: `vogelstimmen-jlcpcb.zip` hochgeladen, SMT Assembly, Teile zugeordnet
3. ⏳ AliExpress: WT588D-16P
4. ⏳ Reichelt/Amazon: Stecker, Sockel, Zähler
5. ⏳ Platine einlöten, WT588D programmieren, einbauen
