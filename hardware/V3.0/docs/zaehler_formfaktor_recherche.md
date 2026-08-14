# Bauteilrecherche Impulszähler — Formfaktor & Anschluss (ohne PCB-Zwang)

Stand: Aug 2026. Ziel: Session-Zähler (Latch-ON), ohne Netz → **kein Reset nötig**, Zählwert mechanisch halten.  
Platinen-Layout bewusst **nicht** als Filter; Auswahl zuerst nach Größe/Anschluss, Umbau danach.

## Formfaktor-Klassen

| Klasse | Körper grob | Typisch | Sichtfenster |
|--------|-------------|---------|--------------|
| **A — Mikro-Print** | ~25×31×15 mm, ~10–18 g | Direkt auf PCB löten | Sehr klein, Ziffern ~4 mm |
| **B — OEM-Mini** | ~30×42×~30 mm, ~16–30 g | Pins oder Litzen, oft M3-Schrauben | „Gaming/Vending“-Standard |
| **C — Panel / DIN** | ab ~48×24 oder ~46×74 mm | Frontmontage | Für euer Gehäuse meist zu groß |

---

## Klasse A — Mikro-Print (echt „auf die Platine“)

### 1) Hengstler mini-i 634 / 635 (stärkster EU-Kandidat)

| | |
|--|--|
| **Form** | ~**25 × 31 × 15 mm**, ~**10 g** |
| **Anschluss** | Version **.1 / .3** = **Lötpins (PCB)**; .7/.8 = Posts / Feder |
| **Spannung** | 5 / **12** / 24 V DC |
| **Leistung** | 635 @12 V: ~**80 mW** (sehr sparsam); Dauerbetrieb 100 % |
| **Impuls** | min. **50 ms**, max. 10 Hz — One-Shot ~80 ms ok |
| **Reset** | keiner |
| **Bestellbeispiel 12 V PCB** | **0.635.128** (6 Stellen, Typ 635.1) |
| **Bezug DE/EU** | [Mercateo ~37 €](https://www.mercateo.com/p/139-925573/HENGSTLER_0_635_128_SUMMENZAeHLER_PCB.html), RS, Farnell/Unite, [Impulse UK](https://www.impulseautomation.co.uk/hengstler-timers-and-counters/hengstler-634-635-totalising-counter/) |
| **Datenblatt** | [PDF Impulse](https://www.impulseautomation.co.uk/assets/pdf/Hengstler-634-635-Totalising-Counter-Datasheet.pdf) |
| **Hinweis** | Variante .1 vs .3 = **Blickrichtung** der Ziffern (Seite/oben) — vor Kauf Zeichnung prüfen |

### 2) Kübler K04–K07 / AK07 / K67 (DE-Hersteller)

| | |
|--|--|
| **Form** | Front/Körper **25×14 … 30×20 mm** (Print-Varianten) |
| **Anschluss** | **Print/PCB**-Varianten vorhanden |
| **Spannung** | u. a. **12 V DC** |
| **Leistung** | niedrig (teilweise batteriegeeignet) |
| **Bezug** | [kuebler.com K07](https://www.kuebler.com/en/products/evaluation/process-devices/product-finder/product-details/K07AK07), Distrelec |
| **Hinweis** | Viele Varianten (Einbau/Aufbau/Print) — **Print + 12 V** explizit bestellen |

### 3) Kübler W16 PCB (älterer OEM)

| | |
|--|--|
| **Form** | Mini, PCB liegend |
| **Anschluss** | Rundstift Ø 1,6 mm |
| **Bezug** | Distrelec / Kübler Katalog |
| **Hinweis** | eher Industrie-OEM, Variantenvielfalt groß |

**Fazit Klasse A:** Wenn „direkt auf die Platine löten + klein + EU-Stückzahl 1+“ zählt → **Hengstler 0.635.128** oder Kübler Print 12 V.

---

## Klasse B — OEM-Mini (~30×42, Slot-Machine-Klasse)

Alle in dieser Klasse sind **sehr ähnlich** (oft gleiche asiatische OEM-Linie). Körper ~**30 × 41,5 mm**, Ziffern ~3 mm, ~20–30 g.

### Vergleich Anschluss

| Modell | Anschluss | Pin-/Schraubenmaß | Leistung | Continuous | Bezug |
|--------|-----------|-------------------|----------|------------|-------|
| **Line Seiki MZ-602** DC12V | **PCB-Pins** Ø~0,7 mm | Pinabstand **12,7 mm**; M3-Löcher **15 mm** | 1,2 W | ja | [lineseiki MZ](https://www.lineseiki.com/product/2104/), Katalog [PDF](https://www.lineseiki.com/wp-content/uploads/2023/06/MZcatalogE.pdf) — oft **MOQ 100** |
| **Line Seiki MZ-600** DC12V | **Litzen** ~265 mm | Schrauben **15 mm** | 1,2 W | ja | wie oben |
| **MZ-612** DC12V | PCB-Pins | Pinabstand **10 mm**; Schrauben **20 mm** | 1,2 W | ja | wie oben |
| **Trumeter / KEP E660 RT** DC12 | **PCB-Pins** 0,65 mm □ | Pinabstand **18,0 mm** | 1,2 W | infinite ON | [trumeter.com](https://www.trumeter.com/product/e660-e760/), [PDF](https://www.precisionsales.com/counter-timer-ratemeter/keppdf/e660760.pdf), ITM/GlobalTestSupply |
| **E660 R / Litzen** | **Litzen** 350 mm | Schrauben Rear | 1,2 W | ja | wie oben |
| **EP770 MRT** 12 V | **PCB-Pins** 0,70 mm □ | Rear M3 (Pitch siehe DS-Zeichnung) | **0,6 W** | ja | [EP770 PDF](https://www.precisionsales.com/counter-timer-ratemeter/keppdf/EP770_DS.pdf) |
| **Redington P9-4016** | PCB-Pins | Körper ~30 mm breit | ~1 W | ja | Redington/Trumeter Katalog |
| **Yaoye-5 / 5B** | Litzen **oder** Pins (anfragen) | MZ-ähnlich | typ. ~1 W | klären | [yaoye Alibaba](https://yaoye.en.alibaba.com/), [yaooye.com](http://www.yaooye.com/) |

Körpermaße MZ (Katalog): Breite **30 mm**, Tiefe **~41,5 mm**, Höhe Frontbereich ~**29–30 mm**.

**Fazit Klasse B:** Formfaktor fast austauschbar. Entscheidend ist **Anschluss**:
- **Pins 12,7 mm** → MZ-602  
- **Pins 18 mm** → E660 RT  
- **Litzen** → MZ-600 / E660 R / Yaoye (flexibelste Montage, Footprint egal)

---

## Klasse C — Panel (meist verwerfen)

| Modell | Größe | Warum raus |
|--------|-------|------------|
| Omron **CSK6** / Klone | ~46 × ~50+, ~100 g | zu groß |
| Yaoye-**875** / CSK-Panel | ~46 × 74 mm | zu groß (bereits abgelehnt) |
| Trumeter **4916** Panel | Flansch ~46 × 46 mm | Panel, nicht PCB-Mini |
| Kübler **W15** Reset | ~48 × 24 DIN | Frontpanel, Reset unnötig |

---

## Entscheidungsmatrix (ohne PCB)

| Priorität | Wenn du willst… | Nimm… |
|-----------|-----------------|-------|
| **Kleinst + EU 1 Stk.** | echt auflöten, ~25 mm | **Hengstler 0.635.128** (oder Kübler Print 12 V) |
| **Klassisches Gaming-Fenster** | ~30 × 42, Ziffern gut lesbar | **MZ / E660 / EP770 / Yaoye** |
| **Anschluss maximal flexibel** | Gehäuse-Kabel, Footprint egal | **Litzen**: MZ-600 / E660 R / Yaoye |
| **Direkt PCB ohne Litzen** | feste Pins | MZ-602 (12,7) **oder** E660 RT (18,0) **oder** Hengstler Pins |
| **Niedrigster Spulenstrom** | Batterie/Idle | Hengstler 635 (~80 mW) ≫ EP770 (0,6 W) ≫ MZ/E660 (1,2 W) |
| **Günstig Serie** | China | Yaoye-5 12 V (Maßzeichnung anfordern) |
| **OEM Serie ≥100** | Original JP | Line Seiki MZ-602 DC12V |

---

## Was als Nächstes (nach eurer Wahl)

1. Bauteil + Variante fixieren (Form + Anschluss).  
2. Footprint/Fenster im Gehäuse gegen Maßzeichnung legen.  
3. Dann entscheiden: nur Litzen-Pads belassen **oder** Platine um Footprint/Höhe/Blickrichtung umbauen.

One-Shot (~80 ms) passt zu allen genannten (min. ON typ. 25–50 ms). Continuous-ON-Rating ist mit One-Shot unkritisch.
