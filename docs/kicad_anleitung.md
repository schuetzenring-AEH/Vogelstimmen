# KiCad 10 — Schaltplan mit Net-Labels (fertig verdrahtet)

**Stand:** Alle 105 Net-Labels und 3 No-Connect-Flags sind programmatisch in
`hardware/vogelstimmen_v2.4.kicad_sch` (Projekt `vogelstimmen_v2.4.kicad_pro`). Die Verdrahtung ist vollständig.

---

## Phase 1: Projekt öffnen und Symbole laden

1. **KiCad 10 → Datei → Projekt öffnen**
   → `C:\Users\Schue\Projects\Vogelstimmen\hardware\vogelstimmen_v2.kicad_pro`

2. **Schaltplaneditor** öffnen (Doppelklick auf `.kicad_sch` oder links oben)

3. Falls KiCad einen **"Rescue Symbols"** Dialog zeigt:
   → **Alle bestätigen / akzeptieren**

4. Falls Symbole als **"?"** angezeigt werden:
   → Menü: **Werkzeuge → Symbole aus Bibliothek aktualisieren**
   → Haken bei "Alle" → OK

5. Die Custom-Symbole (DY-SV17F, TPS62163) liegen in
   `hardware/symbols/vogelstimmen.kicad_sym`, referenziert über
   `hardware/sym-lib-table`.

---

## Phase 2: Visuelle Prüfung

Nach dem Öffnen sollten alle Bauteile Labels an ihren Pins haben.
Prüfe visuell ob die Labels korrekt an den Pin-Endpunkten sitzen.

### Tastenkürzel
- **Mausrad** = Zoom
- **Mittlere Maustaste halten** = Verschieben
- **E** = Bauteil/Label Eigenschaften bearbeiten
- **M** = Bauteil verschieben
- **R** = Bauteil drehen

### Falls ein Label nicht am Pin sitzt

Das kann passieren wenn die Koordinatenberechnung für Rotation/Mirror
leicht abweicht. Lösung:

1. Label anklicken → **M** drücken → auf den Pin-Endpunkt schieben
2. Oder: Label löschen, **L** drücken, gleichen Netznamen eingeben,
   am Pin-Endpunkt platzieren

---

## Phase 3: ERC laufen lassen

1. Menü: **Überprüfen → Electrical Rules Check** (Käfer-Symbol)
2. **ERC starten**
3. Erwartete Ergebnisse:

### Bekannte ERC-Fehler und Lösung

KiCad meldet "Input Power pin not driven" wenn ein Power-Pin keinen
expliziten Power-Ausgang im Netz hat. Lösung: **PWR_FLAG** platzieren.

| ERC-Fehler | Betroffener Pin | PWR_FLAG an Netz |
|------------|-----------------|------------------|
| U1 Pin 2 (VIN) not driven | TPS62163 VIN | **12V_SW** |
| U1 Pin 1 (PGND) not driven | TPS62163 PGND | **GND** |
| U2 Pin 13 (V5) not driven | DY-SV17F V5 | **5V** |

### PWR_FLAG platzieren (ERC-Pflicht)

Drücke **P**, suche "PWR_FLAG", platziere je einen an:
- Einem **GND**-Knoten (z.B. neben U1)
- Dem **12V_SW**-Netz (z.B. neben U1.VIN)
- Dem **5V**-Netz (z.B. neben U2.V5)

Nach dem Platzieren der 3 PWR_FLAGs: ERC erneut laufen lassen → **0 Fehler**.

---

## Phase 4: Footprints prüfen

Menü: **Werkzeuge → Footprint-Zuweisung bearbeiten**

| Ref | Footprint | Paket |
|-----|-----------|-------|
| Q1, Q5 | Package_TO_SOT_SMD:SOT-23 | SOT-23 |
| Q2, Q3 | Package_TO_SOT_SMD:SOT-23 | SOT-23 |
| R1–R6, **R12, R13** | Resistor_SMD:R_0402_1005Metric | 0402 |
| C1, C2, **C4** | Capacitor_SMD:C_0805_2012Metric | 0805 |
| C3 | Capacitor_SMD:C_0805_2012Metric | 0805 |
| D1–D8, D10, **D15–D22** | Diode_SMD:D_SOD-323 | SOD-323 |
| D9 | Diode_SMD:D_SMA | SMA |
| F1 | Fuse:Fuse_1206_3216Metric | 1206 |
| U1 | Package_SON:WSON-8-1EP_2x2mm_P0.5mm_EP0.9x1.6mm | WSON-8 |
| U2 | *(Stiftleisten 2×9 oder Custom-Footprint)* | THT |
| L1 | Inductor_SMD:L_1008_2520Metric | 1008 |
| J1, J2, J6 | Phoenix MPT-0,5-2-2.54 | THT Schraubklemme |
| J3, J4 | Phoenix MPT-0,5-8-2.54 | THT Schraubklemme |
| TP1–TP5 | TestPoint_Pad_D1.0mm | SMD |

---

## Netzliste — Power + Latch (nach VGS-Update)

| # | Label | Punkte |
|---|-------|--------|
| 1 | **GND** | … R6↓, Q2.S, Q3.S, … |
| 2 | **BAT+** | J1.1, Q5.S, **D11.K** |
| 3 | **Q5_GATE** | Q5.G, **D11.A**, **R7** |
| 4 | **Q5_G_PD** | R7 andere Seite → **R6** → GND |
| 5 | **RPP_OUT** | Q5.D, F1 |
| 6 | **12V_PROT** | F1, D9, C1, R1, Q1.S, **D12.K**, TP1 |
| 7 | **Q1_GATE** | Q1.G, R1, **D12.A**, **R8** |
| 8 | **LATCH_GATE** | **R8** andere Seite, Q2.D, Q3.D |
| 9 | **12V_SW** | Q1.D, R4, U1, C2, **R12** |
| 10 | **12V_LED** | **R12**, J6.1 |
| 11 | **Q3_GATE** | Q3.G, **R13**, **C4** |
| 12 | **IO0_M…IO7_M** | U2.1–8, **D15–D22** Anode |
| … | (Signalnetze unverändert) | |

### Verdrahtung VGS-Schutz in Eeschema (PCB noch nicht)

**Q5:**
1. Alte direkte Verbindung Gate↔R6 trennen
2. D11: Kathode an BAT+/Q5.Source, Anode an Q5.Gate
3. R7 zwischen Q5.Gate und R6; R6 nach GND

**Q1:**
1. Alte Verbindung Q1.Gate↔Q2.Drain (LATCH_GATE) auftrennen
2. D12: Kathode an 12V_PROT/Q1.Source, Anode an Q1.Gate
3. R8 zwischen Q1.Gate und Q2.Drain (LATCH_GATE); R1 bleibt Pull-up Gate↔12V_PROT

Bauteile D11/D12/R7/R8 sind im Schaltplan bereits angelegt (siehe Textnotiz).  
Details: `docs/digitaler_zwilling.md` · BOM: LCSC **C179522**

### No-Connect Flags (3)

| Pin | Bauteil |
|-----|---------|
| DACR (Pin 15) | U2 DY-SV17F |
| DACL (Pin 16) | U2 DY-SV17F |
| PG (Pin 8) | U1 TPS62163 |

---

## Koordinaten-Berechnung (Referenz)

Die Labels wurden mit folgender Formel an den exakten Pin-Endpunkten platziert:

```
Rotation im Symbolraum (gegen Uhrzeigersinn):
  0°:   (px, py) → (px, py)
  90°:  (px, py) → (-py, px)
  180°: (px, py) → (-px, -py)
  270°: (px, py) → (py, -px)

Globale Position:
  Ohne Mirror:  (sx + rx, sy - ry)
  Mit Mirror X: (sx + rx, sy + ry)

sx, sy = Bauteil-Platzierung
px, py = Pin-Position im Symbol (Y-up)
rx, ry = Rotierter Pin-Vektor
```
