# Entscheidungen Rev 3.0

Delta gegenüber Rev 2.5 (Latch, Buck, Audio, MPT bleiben — siehe [`docs/entscheidungen.md`](../../../docs/entscheidungen.md)). Hier nur, was sich an **Fertigung, Zähler und BOM** geändert hat.

| ID | Entscheidung | Begründung |
|----|--------------|------------|
| [E-R0603](#e-r0603--alle-widerstände-0603--jlcpcb-basic) | Alle Widerstände **0603** + JLCPCB Basic-LCSC | 2.5: Pads 0402 / Teile 0603 → Fertigungs-Reject |
| [E-CNT-02](#e-cnt-02--kübler-k07-gestrichen) | Kübler gestrichen | nicht beschaffbar |
| [E-CNT-03](#e-cnt-03--one-shot-80-ms-auf-12v_sw) | **One-Shot ~80 ms** auf `12V_SW` | Session = 1 Count; Idle-Spule 0 |
| [E-CNT-04](#e-cnt-04--hengstler-0635128-12-v-pcb) | Zähler = **Hengstler 0.635.128** | 12 V PCB; 5 V-Typ 0.635.132 verworfen (Buck-Race) |
| [E-BOM-PKG](#e-bom-pkg--lcsc-package--kicad-footprint-vor-bestellung) | Vor Bestellung Package LCSC == Footprint | Checkliste in `bom_verfuegbarkeit.md` |

Schaltungsfunktion sonst = Rev 2.5 (Latch, Buck, Audio, F-01…F-09).

---

## E-R0603 — Alle Widerstände 0603 + JLCPCB Basic

**Datum:** Rev 3.0 (August 2026)  
**Status:** gültig  
**Anforderungen:** H02, M01, F-11 (DFM)

### Kontext / Problem

Rev 2.5: KiCad-Footprints **0402**, in der BOM aber oft **0603**-Teile (Basic-Reihe). JLCPCB Assembly lehnt das ab (Pad/Bauteil-Mismatch). Zusätzlich sind 0402 outdoor/Handnacharbeit unfreundlich (F-11).

### Entscheidung

Alle Widerstände auf **0603**, LCSC **Basic** wo möglich (`C25803` 100 kΩ, `C25804` 10 kΩ, `C23162` 4,7 kΩ, `C23178` 470 kΩ, `C22775` 100 Ω, `C22859` 10 Ω, `C21189` 0 Ω, …). Kondensatoren bleiben überwiegend **0805** (C1–C4) bzw. C20 **0603** 1 µF/50 V — Package muss zum Footprint passen, nicht „alles 0603 um des Prinzips willen“.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| BOM auf echte 0402 umstellen | Assembly ginge, Handrework/Feuchte schlechter; Basic-0603 war das Ziel |
| Gemisch 0402/0603 je nach Wert | Fehlerquelle in CPL/BOM; ein Raster für alle R |
| 0805 für alle R | unnötig groß; 0603 Basic ist der JLCPCB-Sweet-Spot |

### Konsequenz

Gerber/CPL/BOM von Rev 2.5 nicht wiederverwenden. Vor Order: [E-BOM-PKG](#e-bom-pkg--lcsc-package--kicad-footprint-vor-bestellung).

**Siehe:** `hardware/V3.0/docs/bom_verfuegbarkeit.md`, `docs/adversarial_review_v24.md` F-11.

---

## E-CNT-02 — Kübler K07 gestrichen

**Datum:** Rev 3.0  
**Status:** gültig  
**Ersetzt:** [E-CNT-01](../../../docs/entscheidungen.md#e-cnt-01--kübler-k0790-bestellnummer)

### Kontext / Problem

Rev 2.5 spezifizierte Kübler **K07.90** Bestellnr. `1.130.900.008` (4,5 V an 5 V-Rail). Das Teil war zum Order-Zeitpunkt **nicht beschaffbar** (EU/Distributor). Ohne Zähler ist F10/H01 nicht erfüllbar.

### Entscheidung

Kübler-Linie streichen. Neuer Zähler: [E-CNT-04](#e-cnt-04--hengstler-0635128-12-v-pcb). Ansteuerung nicht mehr dauerhaft an 5 V, sondern One-Shot an 12 V ([E-CNT-03](#e-cnt-03--one-shot-80-ms-auf-12v_sw)).

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Warten auf Kübler-Lieferung | unbekanntes Datum; blockiert Fertigung |
| Anderer Kübler 12 V-Typ an `12V_SW` dauerhaft | Spule die ganze Session unter Strom; Idle nur ok wenn Latch tot — aber Beschaffung gleich unsicher |
| LCD/MCU-Zähler | Firmware, Ruhestrom, U04-Geist |

**Siehe:** `docs/datasheets/Kuebler_K04-K07.pdf` (Archiv), `docs/zaehler_formfaktor_recherche.md`.

---

## E-CNT-03 — One-Shot ~80 ms auf 12V_SW

**Datum:** Rev 3.0  
**Status:** gültig  
**Architektur:** D6  
**Anforderungen:** F10, H01, E02

### Kontext / Problem

Ein elektromechanischer Impulszähler braucht einen **Impuls** (Hengstler 635: ≥ 50 ms), nicht Dauerstrom. Würde die Spule an `12V_SW` hängen, solange die Stimme spielt (~10 s), wäre das:

- unnötige ~80 mW und Wärme (früher F-10 am Kübler),
- kein „ein Count pro Session“, sondern Dauererregung,
- bei Retrigger trotzdem nur eine Session — aber die Spule wäre die ganze Zeit an.

F10 verlangt: **Wiedergabe-Session** (Aufweck), nicht jeder Tastendruck. BUSY pulsiert bei Retrigger **nicht** neu — eine Zählung über BUSY-Flanken würde Stimmenwechsel verpassen oder doppelt zählen, je nach Firmware. Der Latch-ON-Edge ist das eindeutige Session-Ereignis.

### Entscheidung

Rising-Edge von **`12V_SW`** (Latch geht an) erzeugt **einen** Spulenimpuls ~80 ms. Danach sperrt Q7, Spulenstrom 0 für den Rest der Session. Idle: Latch aus → `12V_SW` tot → 0 mA.

```
12V_SW ── C20 1µF ── CNT_PULSE ── R21 100Ω ── Q7.G (AO3400)
                       │
                      R20 100k → GND
                       │
                      D23 Clamp (K=CNT_PULSE, A=GND)

J5+ (Pad1) = 12V_SW
J5− (Pad2) = CNT_LO = Q7.Drain; Q7.Source = GND
D10 Freilauf parallel zur Spule (K=12V_SW, A=CNT_LO)
```

Zeitkonstante C20·R20 = 1 µF × 100 kΩ = **100 ms**; der Gate-Puls liegt praktisch bei **~80 ms** — über dem Datenblatt-Minimum 50 ms, kurz gegen eine 10 s-Session.

| Ref | Funktion |
|-----|----------|
| **C20** (1 µF/50 V) | Koppelkondensator: nur die Rising-Edge erzeugt den Puls. Ohne C20 wäre die Spule dauerhaft an, sobald Q7 leitet. |
| **R20** (100 kΩ) | Entlädt `CNT_PULSE` nach GND; legt mit C20 die Impulsbreite fest. |
| **R21** (100 Ω) | Serie Q7-Gate: Stromspitzen / Dämpfung. |
| **D23** | Clamp gegen GND: wenn `12V_SW` abfällt, würde C20 den Gate-Knoten negativ ziehen — D23 schützt Q7 (VGS). |
| **Q7** (AO3400) | Low-Side N-FET, VDS 30 V, VGS max 12 V — hält 12 V-Spule und den negativen Clamp-Fall. **Nicht** 2N7002 (knapp bei 12 V-Gate und Spulenenergie). |
| **D10** | Freilaufdiode: Induktionsenergie beim Abschalten von Q7. |
| **J5** | Elektromechanik: +1 bei gültigem Impuls; Stand bleibt ohne Strom erhalten. |

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Spule dauerhaft an `12V_SW` während Play | Wärme, ~80 mW, unnötig |
| Zählen über BUSY-Flanke | Retrigger (F07) ändert BUSY nicht zuverlässig; Boot-Glitch |
| Zählen jeden Tastendruck (IOx) | widerspricht F10; Mehrfachzählung bei Prellen/Retrigger |
| 555 / MCU-Monostabile | extra IQ oder Firmware |
| 2N7002 als Q7 | VGS/Energie-Reserve geringer; AO3400 ist Basic (C20917) |

### Konsequenz

Ein Besuch mit mehreren Stimmen = **eine** Zahl. Idle-Elektronik bleibt E02-konform. Proto: Impulsbreite oszilloskopieren (optional, analog F-03).

**Siehe:** `hardware/V3.0/docs/schaltplan.md` B5, Hengstler `docs/datasheets/Hengstler_634_635.pdf`, Twin `simulation/js/parts.js` (One-Shot-Modell).

---

## E-CNT-04 — Hengstler 0.635.128 (12 V PCB)

**Datum:** Rev 3.0  
**Status:** gültig  
**Anforderungen:** F10, H01, H06

### Kontext / Problem

Nach [E-CNT-02](#e-cnt-02--kübler-k07-gestrichen) braucht die Platine einen **Printzähler**: 6 Stellen, von oben ablesbar, Lötpins auf der PCB, Stückzahl 1, EU-Bezug. Die Ansteuerung ist 12 V-seitig ([E-CNT-03](#e-cnt-03--one-shot-80-ms-auf-12v_sw)), weil 5 V erst nach dem Buck-Soft-Start da ist.

### Entscheidung

**Hengstler 0.635.128** (Typ 635.1, **12 V DC**, 6 Stellen, Spule 1860 Ω ≈80 mW, PCB-Lötpins).

| | |
|--|--|
| Körper | **25,2 × 14,6 mm** (Höhe ~31 mm), ~10 g |
| Pins | Ø 0,6 mm, Pitch **15,24 mm**; Pad1=**+**, Pad2=**−** |
| Footprint | `vogelstimmen:CNT_HENGSTLER_635` — 25,2×31 mm, **4 Pins** 15,24×25,4 mm, Bohrung 0,9 mm |
| J5+ | `12V_SW` (nicht 5 V, nicht U1) |
| J5− | `CNT_LO` (Q7) |
| Bezug | Mercateo / RS / Farnell, EU ab 1 Stk. (~35–40 €) |
| Datenblatt | `docs/datasheets/Hengstler_634_635.pdf` |

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Hengstler **0.635.132** (5 V) | Spule an 5 V: Latch-Edge kommt **vor** Buck-Ready → Impuls ins Leere oder zu kurz (**Buck-Race**). Genau das, was E-CNT-03 auf 12 V verlegt. |
| Kübler K07 12 V-Variante | gleiche Beschaffungslage wie E-CNT-02 |
| Panel-Zähler CSK/875 (~46 × 74 mm) | zu groß, nicht PCB-Print, extra Verdrahtung |
| 5 V-Zähler + Verzögerung/MCU | extra Bauteile; Race bleibt ein Timing-Thema |

### Konsequenz

U1/TPS62163 bleibt **ausschließlich** Audio-5 V. Silk/Twin: Spule+ = `12V_SW`. Mechanik: Anzeige zum Gehäuse-Sichtfenster (H06). Handbestückung nach Reflow.

**Siehe:** `hardware/V3.0/docs/zaehler_mechanisch_lieferanten.md`, `docs/zaehler_formfaktor_recherche.md`.

---

## E-BOM-PKG — LCSC-Package == KiCad-Footprint vor Bestellung

**Datum:** Rev 3.0 (Lesson aus E-R0603 + Rev-1 Footprint-Fehler)  
**Status:** gültig  
**Anforderungen:** M01, M02, H02

### Kontext / Problem

Rev 1: SOIC-8 208 mil statt 150 mil. Rev 2.5: 0402-Pads vs. 0603-Teile → JLCPCB-Reject. Ursache jeweils: LCSC-Bestellnummer und KiCad-Footprint wurden nicht **zeilenweise** gegeneinander gehalten.

### Entscheidung

Vor jedem Gerber-/BOM-Upload:

1. Jede SMD-Zeile: LCSC-Code, Value, **Package-String bei LCSC** vs. **KiCad-Footprint**.
2. ICs: anliegende Spannung vs. AbsMax dokumentiert (M02) — U1 VIN 17 V, U2 5 V, FETs VDS/VGS.
3. Eine kanonische BOM (`JLCPCB_BOM.csv`); keine stillen Patches ohne Schaltplan.
4. Handteile separat (`HAND_BESTUECKUNG.csv`): MPT, Hengstler, **U2-Sockel + Modul**.

Checkliste: `hardware/V3.0/docs/bom_verfuegbarkeit.md`.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| „Passt schon, Basic-Teile“ | genau so kam der 0402/0603-Reject |
| Nur KiCad-ERC | ERC prüft keine LCSC-Gehäuse |

### Konsequenz

Package-Mismatch ist ein **Bestell-Gate**, kein Layout-Nice-to-have. TPS62163-Bestand extra prüfen (historisch knapp).
