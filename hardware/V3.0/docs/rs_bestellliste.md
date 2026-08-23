# RS-Bestellliste — Handteile Rev 3.0

**Händler:** [RS Deutschland](https://de.rs-online.com/)  
**Schnellbestellung:** [de.rs-online.com/web/ca/schnellbestellung](https://de.rs-online.com/web/ca/schnellbestellung/)  
**CSV zum Einfügen:** `hardware/V3.0/RS_SCHNELLBESTELLUNG.csv`

SMD bleibt **JLCPCB** (`JLCPCB_BOM.csv`). Hier nur die Teile, die bisher Reichelt / Mercateo / AliExpress waren.

## Warenkorb (eine Platine)

| Bedarf | RS-Best.-Nr. | Hersteller | Artikel | VE | Bestellen | Link |
|--------|--------------|------------|---------|----|-----------|------|
| J1, J2, J6 | **220-4260** | Phoenix | MPT 0,5/2-2,54 **1725656** | oft 5 | **5** (brauchen 3) | [RS](https://de.rs-online.com/web/p/leiterplattensteckverbinder/2204260) |
| J3, J4 | **220-4327** | Phoenix | MPT 0,5/8-2,54 **1725711** | **5** | **5** (brauchen 2) | [RS](https://de.rs-online.com/web/p/leiterplattensteckverbinder/2204327) |
| J5 | **312-022** | Hengstler | **0 635 128** (Typ 635.1, 12 V, PCB) | 1 | **1** | [RS](https://de.rs-online.com/web/p/zahler-ic/0312022) |

Richtpreise netto (Stand Recherche 08/2026, vor Kasse prüfen):

| RS | ca. netto |
|----|-----------|
| 220-4327 ×5 | ~26 € (5,21 €/Stk.) |
| 220-4260 ×5 | Warenkorb — VE oft 5 |
| 312-022 ×1 | ~32 € |
| **Summe 1 Platine** | **~60–70 €** + MwSt. |

Versand bei RS DE oft frei ab 100 € — bei einer Platine ggf. Versand oder gleich für 10 Stück bestellen.

## Für 10 Platinen (wie DY-SV17F-Hinweis in der Hand-BOM)

| RS-Best.-Nr. | Menge | Deckt |
|--------------|-------|-------|
| 220-4260 | **30** | 10× (J1+J2+J6) |
| 220-4327 | **20** | 10× (J3+J4) |
| 312-022 | **10** | 10× J5 |

CSV-Variante: `hardware/V3.0/RS_SCHNELLBESTELLUNG_10x.csv`

## Schnellbestellung — 1 Platine (kopieren)

```
220-4260,5
220-4327,5
312-022,1
```

## Nicht bei RS bestellen

| Teil | Warum | Wo |
|------|-------|-----|
| **U2 DY-SV17F** | kein RS-Artikel | AliExpress / eBay (bereits da) |
| SMD (U1, FETs, 0603, …) | Assembly + LCSC-Basic | JLCPCB |
| Metzler-Taster, Lautsprecher, Batterie | Gehäuse / Feld, nicht PCB-HAND | Bestand / Amazon |

## Optional — Sockel für U2 (Tausch)

DY-SV17F ist 2×9 Pins, Raster 2,54 mm. Zwei einreihige 9-pol SIL-Buchsen nebeneinander:

| RS-Best.-Nr. | Teil | Menge / Platine | Link |
|--------------|------|-----------------|------|
| **702-2864** | Preci-Dip 801-87-009-10-012101, 9-pol SIL | 2 | [RS](https://de.rs-online.com/web/p/sil-sockel/7022864) |

Ohne Sockel das Modul direkt einlöten.

## Warnungen

1. **Hengstler nur `312-022` / MPN `0 635 128`.**  
   Nicht **312-016** (`0 635 132`, 5 V) — Buck-Race (E-CNT-04).  
   RS-Text „Frontplatte / Schraube“ ignorieren: **0 635 128 ist Typ 635.1 mit PCB-Lötpins.**
2. MPT-Klemmen: Raster **2,54 mm**, max. **0,5 mm²** (AWG 26–20). „0,5“ ist der Querschnitt, nicht der Pitch.
3. Hengstler oft **Wochen** Lieferzeit — zuerst in den Warenkorb, Lager prüfen.
4. USB am DY-SV17F nie zusammen mit Platinen-5 V (F-09).
