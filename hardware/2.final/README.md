# Fertigungspaket Rev 2.4 — `2.final`

**Datum:** 3. August 2026  
**Projekt:** Soundplatine Waldlehrpfad / Kolping Alteglofsheim  
**KiCad Working:** `hardware/vogelstimmen_v2.4.*`

> **Hinweis:** Dieses Paket ist **Pre-Respin** (Stand 01.08.2026).  
> Vor JLCPCB-Bestellung aus dem **aktuellen Working-PCB** (Respin F-01…F-05) neu exportieren: Gerber, BOM, CPL, PDFs.

## Respin F-01…F-05 (Working-PCB)

| Änderung | Bauteile |
|----------|----------|
| Modul-IO-Schutz | D15–D22 |
| VOS direkt | R5 = 0 Ω |
| BUSY-Blanking | R13, C4 |
| LED-Serie | R12, Netz 12V_LED |
| SPK-Breite | ≥ 0,4 mm |

DRC/ERC Working: **0 Fehler** (Stand 03.08.2026).

## Inhalt (Stand Paket)

| Datei / Ordner | Zweck |
|----------------|--------|
| `vogelstimmen_v2.4.kicad_sch` | Schaltplan (KiCad) — **ggf. veraltet** |
| `vogelstimmen_v2.4.kicad_pcb` | Layout — **Pre-Respin** |
| `vogelstimmen_v2.4-Gerber.zip` | Gerber — **Pre-Respin** |
| `JLCPCB_BOM.csv` | SMD-BOM — **Respin-Zahlen aktualisiert** |
| `docs/` | Review-Dokumente |

Aktuelle Quellen: `../vogelstimmen_v2.4.kicad_pcb`, `../../docs/schaltplan.md`

## Manuell (nicht JLCPCB-SMD)

- **U2** DY-SV17F  
- **J5** Kübler `1.130.900.008`  
- **J3/J4/J1/J2/J6** Phoenix MPT  

## Design-Review

[`../../docs/reviewer_handoff.md`](../../docs/reviewer_handoff.md) · [`../../docs/review_checkliste_m04.md`](../../docs/review_checkliste_m04.md)
