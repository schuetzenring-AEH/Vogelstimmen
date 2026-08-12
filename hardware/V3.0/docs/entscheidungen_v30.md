# Entscheidungen Rev 3.0

| ID | Entscheidung | Begründung |
|----|--------------|------------|
| E-R0603 | Alle Widerstände **0603** + JLCPCB Basic-LCSC (`C25803` …) | 2.5: Pads 0402 / Teile 0603 → Fertigungs-Reject |
| E-CNT-02 | Kübler gestrichen | nicht beschaffbar |
| E-CNT-03 | **One-Shot ~80 ms** auf `12V_SW` | Session = 1 Count; Idle ≈ 0 |
| E-CNT-04 | Zähler = **Hengstler 0.635.128** (Typ 635.1, 12 V PCB) | Mikro-Print ~25×15 mm; EU ab 1 Stk.; 5 V-Variante 0.635.132 verworfen (Buck-Race) |
| E-BOM-PKG | Vor Bestellung Package LCSC == Footprint | Checkliste in `bom_verfuegbarkeit.md` |

## E-CNT-03 / E-CNT-04 — Zähler

| | |
|--|--|
| Teil | **Hengstler 0.635.128** — 6 Stellen, 12 V, ~80 mW, PCB-Lötpins |
| Footprint | `vogelstimmen:CNT_HENGSTLER_635` — Body **25,2×31 mm**, **4 Pins** Pitch **15,24×25,4 mm**, Ø 0,6 mm (Bohrung 0,9) |
| J5+ (Pad1) | `12V_SW` |
| J5− (Pad2) | `CNT_LO` (Drain Q7 AO3400) |
| One-Shot | `12V_SW` → C20 1 µF → R21 100 Ω → Q7.G; R20 100 k + D23 Clamp → GND |
| Freilauf | D10 parallel Spule |
| Idle | Latch aus → `12V_SW` tot → Zähler 0 mA |
| Bezug | Mercateo / RS / Farnell (~35–40 €) |

Schaltungsfunktion sonst = Rev 2.5 (Latch, Buck, Audio).

### Was jedes One-Shot-Bauteil für den Hengstler tut

| Ref | Funktion |
|-----|----------|
| **C20** (1 µF) | Koppelkondensator: nur die Rising-Edge von `12V_SW` erzeugt einen Puls auf `CNT_PULSE`. Ohne C20 wäre die Spule dauerhaft an, sobald Q7 leiten würde. |
| **R20** (100 kΩ) | Entlädt `CNT_PULSE` → GND; legt mit C20 die Impulsbreite fest (~80 ms ≥ 50 ms Datenblatt-Minimum). |
| **R21** (100 Ω) | Serie Q7-Gate: Stromspitzen begrenzen. |
| **D23** | Clamp gegen GND: schützt Q7-Gate, wenn `12V_SW` abfällt und C20 den Knoten negativ ziehen würde. |
| **Q7** (AO3400) | Low-Side: schließt Spulenkreis nur während des Pulses (`CNT_LO`→GND). Danach sperrt → Spulenstrom 0 für Rest der Session. |
| **D10** | Freilaufdiode parallel zur Spule: Induktionsenergie beim Abschalten von Q7. |
| **J5** | Elektromechanisches Zählwerk: +1 bei jedem gültigen Spulenimpuls; Stand bleibt ohne Strom erhalten. |
