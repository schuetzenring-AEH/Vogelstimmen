# Schaltplan: Vogelstimmenkasten Rev 3.0

**Architektur:** DY-SV17F + Latch + TPS62163 Buck + **Hengstler One-Shot**  
**Basis:** `docs/systemarchitektur.md`, `docs/anforderungen.md`, `entscheidungen_v30.md`  
**KiCad:** `vogelstimmen_v3.0.kicad_sch` / `.kicad_pcb`  
**Datum:** 11. August 2026 (Rev 3.0)

---

## Blockschaltbild

```
                           12V_PROT (immer an)
  12V Batterie                │
  ┌──┐   ┌───┐   ┌───┐       │
  │J_BAT│→│Q_RPP│→│PTC│→──────┤
  └──┘   │P-FET│  │1A │       │
         └───┘   └───┘       │
         D_TVS ──┤            │
                 GND          │
                              │
              ┌───────────────▼────────────────┐
              │       B2: LATCH-SCHALTUNG      │
              │  SET ← D1–D8 OR (BTN_OR)       │
              │  HOLD ← R4 Selbsthaltung       │
              │  RELEASE ← BUSY via Q3+RC      │
              └───────┬────────────┬───────────┘
                      │            │
                   12V_SW    12V_SW→R12→12V_LED
                      │            │
         ┌────────────┼────────────┤
         │            │            │
  ┌──────▼──────┐ ┌───▼───┐   ┌───▼───┐
  │ TPS62163    │ │  B5   │   │ J_LED │→ 8× LEDs
  │ Buck 5V     │ │OneShot│   └───────┘
  └──────┬──────┘ │+Hengst│
         │ 5V     └───────┘
    ┌────▼─────┐
    │ DY-SV17F │
    │ U2       │
    │ BUSY→Q3  │
    │ SPK→J2   │
    └──────────┘
```

---

## B1: Batterie-Eingangsschutz

(unverändert — siehe Rev 2.5)

```
J_BAT / J1 (Phoenix MPT 0,5/2-2,54)
  Pin 1 (+12V) → Q5 Source (BAT+)
  Pin 2 (GND)  → GND

Q5 (SI2301CDS) — Verpolungsschutz, D11 VGS-Clamp, R7/R6 Gate
F1 PTC 1A/24V → 12V_PROT
D9 SMAJ15A, C1 10µF/25V
```

---

## B2: Latch-Schaltung

```
Taster → GND (IOx LOW, Mode 0)
   D1–D8: K=IOx, A=BTN_OR          (Latch-OR, 12V-Domain)
   R9 10k: 12V_PROT → BTN_OR
   R11 4k7 + D14: BTN_OR → Q6_GATE
   Q6 SI2301 (P): S=12V_PROT, D=SET_DRV
   R10 1k + D13: SET_DRV → LATCH_SET

LATCH_SET → Q2.Gate; R2→GND; R4←12V_SW (Hold)
Q3: G=Q3_GATE, S=GND, D=LATCH_SET (Release bei BUSY HIGH)
   R13 100k: BUSY → Q3_GATE
   C4 4,7µF: Q3_GATE → GND           (Blanking ~470 ms, F-03)

Q2.Drain = LATCH_GATE → R8 → Q1_GATE → Q1 → 12V_SW
```

---

## B3: Buck 12V → 5V

U1 TPS62163, EN=12V_SW, L1 2,2 µH, C2/C3, R5=0 Ω (VOS).  
Speist **nur** das Audio-Modul (nicht den Zähler).

---

## B4: Audio DY-SV17F

U2 an 5 V; D15–D22 Serie IOx_M↔IOx; BUSY → R13/C4 → Q3; SPK → J2.

Tasterdruck: IOx→GND → fallende Flanke an U2 über D15–D22.

### Mode 0

| Pin | Verbindung |
|-----|------------|
| CON1 (10) | GND |
| CON2 (11) | V33 |
| CON3 (12) | R3→GND; danach BUSY-Ausgang |

---

## B5: Impulszähler — One-Shot + Hengstler (E-CNT-03/04)

**Aufgabe der Baugruppe:** Beim Rising-Edge von `12V_SW` (Latch-ON) einen kurzen Spulenimpuls erzeugen, damit der Hengstler **genau einmal** zählt — nicht die ganze Session dauerbestromt.

```
12V_SW ── C20 1µF ── CNT_PULSE ── R21 100Ω ── Q7.G (AO3400)
                       │
                      R20 100k → GND
                       │
                      D23 (Clamp, K=CNT_PULSE, A=GND)

J5 Hengstler 0.635.128 (Typ 635.1, 12 V, 6 Stellen, Spule 1860 Ω)
  Pad1 (+) → 12V_SW
  Pad2 (−) → CNT_LO = Q7.Drain; Q7.Source = GND

D10 Freilauf: K=12V_SW, A=CNT_LO
```

| Ref | Rolle |
|-----|--------|
| C20 | Kopplung Rising-Edge → Puls |
| R20 | Entlade / Pulsbreite ~80 ms |
| R21 | Gate-Serie Q7 |
| D23 | Negativ-Clamp am Gate-Knoten |
| Q7 | Low-Side Spulenschalter |
| D10 | Freilauf Spule |
| J5 | Zählwerk (Handbestückung) |

Footprint: `vogelstimmen:CNT_HENGSTLER_635` (4 Pins, Pitch 15,24×25,4 mm).  
**Nicht** 0.635.132 (5 V) — Buck-Soft-Start-Race.

---

## B6: Taster-Interface

```
J3 (IO) / J4 (GND) — Phoenix MPT 0,5/8-2,54
D1–D8 Latch-OR; D15–D22 Modul-Schutz
```

---

## B7: Lautsprecher

```
J2: Pin1=SPK+, Pin2=SPK− (BTL — keine Seite an GND!)
```

---

## B8: Taster-LED-Versorgung

```
12V_SW → R12 (10 Ω) → 12V_LED → J6 Pin 1
J6 Pin 2 → GND
```

---

## Steckverbinder / Handteile

| Ref | Typ | Funktion |
|-----|-----|----------|
| J1 | MPT 0,5/2 | Batterie |
| J2 | MPT 0,5/2 | Lautsprecher |
| J3/J4 | MPT 0,5/8 | Taster IO / GND |
| J5 | Hengstler 0.635.128 | Impulszähler (One-Shot) |
| J6 | MPT 0,5/2 | Taster-LEDs |
| U2 | DY-SV17F | Audio-Modul |

Siehe auch `bom_verfuegbarkeit.md`, `JLCPCB_BOM.csv`, `HAND_BESTUECKUNG.csv`.
