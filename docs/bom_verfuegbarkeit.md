# BOM-Verfügbarkeitsprüfung LCSC/JLCPCB

**Datum:** 13. August 2026  
**Status:** Rev **3.0** — Working-BOM = JLCPCB-Export aus Downloads

> Aktuell gilt: [`docs/bom_jlcpcb.md`](bom_jlcpcb.md) (Downloads `bom.xls`) = `hardware/V3.0/JLCPCB_BOM.csv`.  
> Live-Gate vor Bestellung: `hardware/V3.0/CHECK_BEFORE_ORDER.bat` (nicht Dokument gegen Dokument).  
> Datenblätter: [`datasheets/README.md`](datasheets/README.md). Topview: [`pcb_v3.0.md`](pcb_v3.0.md).

## SMT (52 Teile, alle Widerstände 0603 Basic)

Siehe vollständige Tabelle in [`bom_jlcpcb.md`](bom_jlcpcb.md). Kritische Nummern:

| Ref | Teil | LCSC | Package |
|-----|------|------|---------|
| R21 | 100 Ω | **C22775** | 0603 Basic (nicht C25796 / 0402) |
| C20 | 1 µF/50 V | **C15849** | 0603 Basic |
| U1 | TPS62163 | C97534 | WSON-8 2×2 |
| Q7 | AO3400 | C20917 | SOT-23 |
| Q1, Q5, Q6 | SI2301CDS | C10487 | SOT-23 |

## Handbestückung (nicht in JLCPCB-BOM)

| Bauteil | Quelle | Assembly |
|---------|--------|----------|
| DY-SV17F U2 | AliExpress / eBay | HAND |
| Hengstler 0.635.128 | Fachhandel (Mercateo/RS/Farnell) | HAND |
| Phoenix MPT 0,5/2 (J1, J2, J6) | Phoenix 1725656 | HAND |
| Phoenix MPT 0,5/8 (J3, J4) | Phoenix 1725711 | HAND |
| TP1–TP5 | — | DNP |
| ~~Kübler 1.130.900.008~~ | — | gestrichen E-CNT-02 |

| Datei | Inhalt |
|-------|--------|
| `docs/assets/bom_jlcpcb.xls` | JLCPCB-Export (Downloads) |
| `hardware/V3.0/JLCPCB_BOM.csv` | SMT für Upload |
| `hardware/V3.0/HAND_BESTUECKUNG.csv` | HAND / DNP |
