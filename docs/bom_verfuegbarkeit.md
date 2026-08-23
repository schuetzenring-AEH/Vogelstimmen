# BOM-Verfügbarkeitsprüfung LCSC/JLCPCB

**Datum:** 3. August 2026  
**Status:** Respin F-01…F-05; Working-BOM `hardware/2.final/JLCPCB_BOM.csv`

## Ergebnis: Alle SMD-Kernbauteile verfügbar

| Ref | Bauteil | LCSC # | Bestand (ca.) | Status |
|-----|---------|--------|---------------|--------|
| Q5, Q1, Q6 | SI2301CDS (P-FET) | C10487 | ~326k | OK |
| D11, D12, D14 | BZX84C6V2 | C179522 | ~1 360 | OK |
| Q2, Q3 | 2N7002LT1G | C16338 | ~463k | OK |
| U1 | TPS62163DSGR | C97534 | ~510 | OK — Reserve |
| D9 | SMAJ15A | C113958 | ~52k | OK |
| **D1–D8, D10, D13, D15–D22** | 1N4148WS | C118873 | ~68k | OK (18×) |
| F1 | PTC 1A/24V | C2760272 | ~14k | OK |
| L1 | 2,2µH TDK 1008 | C88527 | ~2 120 | OK |
| C1, C2 | 10µF/25V 0805 | Standard | >100k | OK |
| C3 | 22µF/10V 0805 | Standard | >100k | OK |
| **C4** | **4,7µF/16V 0805** | Standard | >100k | OK |
| R1, R2, **R13** | 100kΩ 0402 | Standard | >1M | OK |
| **R5** | **0Ω 0402** | Standard | >1M | OK |
| R3, R4, R9 | 10kΩ 0402 | Standard | >1M | OK |
| R6 | 470kΩ 0402 | Standard | >1M | OK |
| R7, R8, R11 | 4,7kΩ 0402 | Standard | >1M | OK |
| R10 | 1kΩ 0402 | Standard | >1M | OK |
| **R12** | **10Ω 0402** | Standard | >1M | OK |

**Geschätzter SMD-Materialpreis:** ~$3,00–3,50 (39 Bauteile)

## Respin-Ergänzungen (F-01…F-05)

| Ref | Wert | LCSC-Hinweis |
|-----|------|--------------|
| D15–D22 | 1N4148WS | wie D1–D8, C118873 |
| R5 | 0Ω | Jumper-0402 oder 0Ω-Reel |
| R13 | 100kΩ | Standard |
| C4 | 4,7µF/16V 0805 | X7R |
| R12 | 10Ω | Standard |

## Empfohlene LCSC-Bestell-Liste (aktualisiert)

| LCSC # | Bauteil | Menge |
|--------|---------|-------|
| C10487 | SI2301 P-FET | 3 +1 |
| C179522 | BZX84C6V2 | 3 +1 |
| C16338 | 2N7002 | 2 +1 |
| C97534 | TPS62163 | 1 +1 |
| C113958 | SMAJ15A | 1 +1 |
| **C118873** | **1N4148WS** | **18 +4** |
| C2760272 | PTC 1A/24V | 1 +1 |
| C88527 | 2,2µH | 1 +1 |
| — | 10µF/25V 0805 | 2 +2 |
| — | 22µF/10V 0805 | 1 +1 |
| — | **4,7µF/16V 0805** | **1 +1** |
| — | 100kΩ 0402 | 3 +3 |
| — | **0Ω 0402** | **1 +5** |
| — | 10kΩ 0402 | 3 +3 |
| — | 470kΩ 0402 | 1 +1 |
| — | 4,7kΩ 0402 | 3 +2 |
| — | 1kΩ 0402 | 1 +1 |
| — | **10Ω 0402** | **1 +5** |

## Nicht in JLCPCB-BOM (Handbestückung)

Stehen **nicht** in der SMT-BOM. Liste: `hardware/V2.5-final/HAND_BESTUECKUNG.csv`.

| Bauteil | Quelle | Assembly |
|---------|--------|----------|
| DY-SV17F U2 | AliExpress / eBay (**nicht RS**) | HAND |
| Hengstler 0.635.128 | **RS 312-022** | HAND — V3.0 |
| ~~Kübler 1.130.900.008~~ | — | gestrichen E-CNT-02 |
| Phoenix MPT J1/J2/J6 (1725656) | **RS 220-4260** | HAND |
| Phoenix MPT J3/J4 (1725711) | **RS 220-4327** | HAND |
| TP1–TP5 Testpads | — | DNP |
| Metzler-Taster P19-TF-W (Gehäuse) | Amazon B01HQDH2OK | extern / Bestand |

RS-Warenkorb: `hardware/V3.0/docs/rs_bestellliste.md`

| Datei | Inhalt |
|-------|--------|
| `hardware/V2.5-final/JLCPCB_BOM.csv` | nur SMT (`Mount=SMT`) |
| `hardware/V2.5-final/HAND_BESTUECKUNG.csv` | nur HAND / DNP |
