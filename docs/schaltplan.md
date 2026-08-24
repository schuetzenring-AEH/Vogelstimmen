# Schaltplan: Vogelstimmenkasten Rev 2.4 (historisch)

> **Aktuell Rev 3.0:** `hardware/V3.0/docs/schaltplan.md` — Hengstler 0.635.128 + One-Shot (C20/R20/R21/D23/Q7/D10).  
> Dieser Stand beschreibt noch Kübler an 5 V (eingefroren).

**Architektur:** DY-SV17F + Latch-Schaltung + TPS62163 Buck  
**Basis:** `docs/systemarchitektur.md`, `docs/anforderungen.md`  
**KiCad:** `hardware/vogelstimmen_v2.4.kicad_sch` / `.kicad_pcb`  
**Datum:** 3. August 2026 (Respin F-01…F-05)

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
              ┌───────▼───┐    ┌───▼───┐
              │ TPS62163  │    │ J_LED │→ 8× Taster-LEDs
              │ Buck 5V   │    └───────┘
              └─────┬─────┘
                    │ 5V
          ┌─────────┼──────────┐
          │         │          │
    ┌─────▼─────┐ ┌─▼────────┐│
    │ DY-SV17F  │ │ Kübler   ││
    │ U2        │ │ K07.90   ││
    │ IOx_M←D15+│ └──────────┘│
    │ BUSY→RC→Q3│              │
    │ SPK→J2    │              │
    └──────────────────────────┘
```

---

## B1: Batterie-Eingangsschutz

(unverändert — siehe Rev 2.4)

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

### Bauteil-Liste Latch

| Ref | Bauteil | Paket | Funktion |
|-----|---------|-------|----------|
| Q1 | SI2301CDS | SOT-23 | P-FET Leistungsschalter (12V_SW) |
| D12 | BZX84C6V2 | SOT-23 | VGS-Clamp Q1 |
| R8 | 4,7 kΩ | 0402 | Serie Q2→Q1.Gate |
| Q2 | 2N7002 | SOT-23 | N-FET Latch-Logik |
| Q3 | 2N7002 | SOT-23 | BUSY → LATCH_SET (Release) |
| **R13** | **100 kΩ** | **0402** | **BUSY → Q3_GATE (Serie, F-03)** |
| **C4** | **47 µF/10 V** | **0805** | **Q3_GATE → GND (Blanking, F-03; Proto: 4,7 µF zu kurz → E-IBN-03)** |
| Q6 | SI2301 | SOT-23 | P-FET Kaltstart-SET |
| D14 | BZX84C6V2 | SOT-23 | VGS-Clamp Q6 |
| R1 | 100 kΩ | 0402 | Q1 Gate Pull-up |
| R2 | 100 kΩ | 0402 | Q2 Gate Pull-down |
| R3 | 10 kΩ | 0402 | BUSY Pull-down |
| R4 | 10 kΩ | 0402 | Selbsthaltung von 12V_SW |
| R6 | 470 kΩ | 0402 | Q5 Gate→GND |
| R9 | 10 kΩ | 0402 | Pull-up BTN_OR |
| R10 | 1 kΩ | 0402 | Serie SET (vs. Q3) |
| R11 | 4,7 kΩ | 0402 | Serie Gate Q6 |
| D1–D8 | 1N4148WS | SOD-323 | Active-Low OR → BTN_OR |
| D13 | 1N4148WS | SOD-323 | SET_PULSE → LATCH_SET |

### Ablauf

1. **Kaltstart:** IOx→GND → BTN_OR LOW → Q6 ein → D13 → Latch AN (ohne 5 V)
2. **12V_SW da:** R4 hält LATCH_SET
3. **BUSY = LOW:** Q3 sperrt → Hold bleibt
4. **BUSY = HIGH:** Q3 zieht LATCH_SET → Latch AUS (verzögert durch R13/C4)

---

## B3: Buck-Converter (12V → 5V)

```
U1 (TPS62163DSGR, feste 5.0 V)
  VIN/EN → 12V_SW
  FB     → AGND (Fixed-5V-Version)
  VOS    → 5V über R5 = 0 Ω (F-02, direkt an C3)
  SW     → L1 → 5V

C2 10µF/25V (VIN), C3 22µF/10V (VOUT), L1 2,2 µH
```

**Hinweis TI:** VOS direkt und kurz an VOUT/COUT — **kein** Vorwiderstand.

---

## B4: DY-SV17F Audio-Modul (U2)

Modul auf 2× Stiftleisten (je 1×9), **nicht verlötet**.

```
Pin  1–8 (IO0–IO7)  ← IO0_M…IO7_M ← D15–D22 (Serie, F-01)
Pin  9, 10 (GND)    → GND
Pin 11 (CON2)       → V33 (Mode 0)
Pin 12 (BUSY)       → R3 (10k→GND), R13 (→ Q3_GATE)
Pin 13 (V5)         ← 5V
Pin 14 (V33)        → CON2
Pin 17/18 (SPK±)    → J2 (BTL, ≥0,4 mm Leiterbahn)
```

### IO-Domain-Trennung (F-01)

Pro Kanal **zwei Dioden**:

| Diode | Pfad | Funktion |
|-------|------|----------|
| D1–D8 | K=**IOx**, A=**BTN_OR** | Latch-SET über 12-V-OR |
| D15–D22 | A=**IOx_M**, K=**IOx** | Modul vor 12 V auf Kabelseite schützen |

```
U2.IOx_M ──A── D15+ ──K── IOx ── J3 ── Taster ── GND
                              └── D1 ── BTN_OR (Latch)
```

Tasterdruck: IOx→GND → fallende Flanke an U2 über D15–D22.

### Mode 0

| Pin | Verbindung |
|-----|------------|
| CON1 (10) | GND |
| CON2 (11) | V33 |
| CON3 (12) | R3→GND; danach BUSY-Ausgang |

---

## B5: Impulszähler

```
J5 Kübler K07.90 (1.130.900.008, 4,5 V Typ 0 @ 5 V)
  + → 5V,  − → GND
D10 1N4148WS: K=5V, A=GND (Freilauf)
```

Kein Q4 — Zähler direkt an 5-V-Schiene (nur bei Latch AN).

---

## B6: Taster-Interface

```
J3 (IO) / J4 (GND) — Phoenix MPT 0,5/8-2,54

J3 Pin 8…1 → IO0…IO7 (Kabelseite, 12-V-Domain über D1–D8/R9)
J4 Pin 9…16 → GND

D1–D8: Latch-OR (s. o.)
D15–D22: Modul-Schutz (s. B4)

Extern: Metzler P19-TF-W o.ä. (5-pol: C, NO, NC, LED+, LED−)
  IO + GND → J3/J4
  LED+ / LED− → J6 (über R12)
```

---

## B7: Lautsprecher

```
J2: Pin1=SPK+, Pin2=SPK− (BTL — keine Seite an GND!)
SPK-Bahnen PCB: ≥ 0,4 mm (F-05)
```

---

## B8: Taster-LED-Versorgung

```
12V_SW → R12 (10 Ω, 0402) → 12V_LED → J6 Pin 1
J6 Pin 2 → GND

Extern: alle 8 LED+ parallel an Pin 1, LED− an Pin 2.
Leuchten gemeinsam während Wiedergabe (F11).
```

**Annahme:** Metzler-LEDs 6–24 V mit internem Vorwiderstand. R12 begrenzt Kurzschlussstrom.

---

## Steckverbinder

| Ref | Typ | Funktion |
|-----|-----|----------|
| J1 | MPT 0,5/2 | Batterie |
| J2 | MPT 0,5/2 | Lautsprecher |
| J3/J4 | MPT 0,5/8 | Taster IO / GND |
| J5 | K07.90 | Impulszähler |
| J6 | MPT 0,5/2 | Taster-LEDs |

---

## Netzliste (aus PCB, Stand 03.08.2026)

| Netz | Verbundene Punkte |
|------|-------------------|
| GND | J1.2, J4.*, J6.2, C1–C4.2, D9.1, D10.2, Q2.S, Q3.S, Q5.1, R3.2, R6.2, TP3, U1 AGND/PGND, U2.9/10, … |
| BAT+ | J1.1, Q5.2, D11.1 |
| 12V_PROT | F1.2, D9.2, D12.1, D14.1, Q1.2, Q6.2, R1.2, R9.1, TP1 |
| 12V_SW | Q1.3, R4.1, R12.1, U1 VIN/EN, C2.1 |
| **12V_LED** | **R12.2, J6.1** |
| 5V | C3.1, L1.2, R5.1, D10.1, J5.1, TP2, U2.13 |
| VOS | R5.2, U1.6 |
| V33 | U2.11, U2.14 |
| BUSY | U2.12, R3.1, R13.1, TP4 |
| **Q3_GATE** | **Q3.1, R13.2, C4.1** |
| IO0…IO7 | J3, D1–D8.1, D15–D22.1 (Kathode) |
| **IO0_M…IO7_M** | **U2.1–8, D15–D22.2 (Anode)** |
| BTN_OR | D1–D8.2, R9.2, R11.1 |
| LATCH_SET | D13.1, Q2.1, Q3.3, R2.1, R4.2 |
| SPK+/SPK− | U2.18/17, J2, TP5 |

---

## Testpunkte

| TP | Netz |
|----|------|
| TP1 | 12V_PROT |
| TP2 | 5V |
| TP3 | GND |
| TP4 | BUSY |
| TP5 | SPK+ |

---

## BOM-Übersicht (SMD + manuell)

| Ref | Wert | LCSC | Anmerkung |
|-----|------|------|-----------|
| D1–D8, D10, D13 | 1N4148WS | C118873 | Latch-OR / Freilauf |
| **D15–D22** | **1N4148WS** | **C118873** | **Serie U2 IO (F-01)** |
| D11, D12, D14 | BZX84C6V2 | C179522 | VGS-Clamp |
| D9 | SMAJ15A | C113958 | TVS |
| Q1, Q5, Q6 | SI2301 | C10487 | P-FET |
| Q2, Q3 | 2N7002 | C16338 | N-FET |
| U1 | TPS62163 | C97534 | Buck |
| L1 | 2,2 µH | C88527 | |
| C1, C2 | 10 µF/25 V | — | |
| C3 | 22 µF/10 V | — | VOUT |
| **C4** | **4,7 µF/16 V** | — | **Q3 Blanking** |
| R1, R2, **R13** | 100 kΩ | — | |
| **R5** | **0 Ω** | — | **VOS sense (F-02)** |
| R3, R4, R9 | 10 kΩ | — | |
| R6 | 470 kΩ | — | |
| R7, R8, R11 | 4,7 kΩ | — | |
| R10 | 1 kΩ | — | |
| **R12** | **10 Ω** | — | **LED-Serie (F-04)** |
| F1 | PTC 1A/24 V | C2760272 | |
| U2 | DY-SV17F | — | manuell |
| J5 | K07.90 | — | manuell |
| J1–J4, J6 | MPT Phoenix | — | manuell |

**SMD:** ~39 Stück (inkl. Respin) → JLCPCB  
**THT:** Modul, Zähler, Klemmen

---

## Respin F-01…F-05 (02.08.2026)

| ID | Änderung |
|----|----------|
| F-01 | D15–D22 Serie U2↔IOx |
| F-02 | R5 → 0 Ω (VOS) |
| F-03 | R13 + C4 BUSY-Blanking → Q3_GATE |
| F-04 | R12 10 Ω, Netz 12V_LED |
| F-05 | SPK ≥ 0,4 mm |

Details: `docs/adversarial_review_v24.md`, `docs/entscheidungen.md` E-RESPIN-01.
