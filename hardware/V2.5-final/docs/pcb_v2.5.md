# KiCad PCB Rev 2.5 — Latch Kaltstart ≈0 µA

**Projekt:** `vogelstimmen_v2.5.kicad_pro`  
**Schaltplan:** `vogelstimmen_v2.5.kicad_sch`  
**PCB:** `vogelstimmen_v2.5.kicad_pcb`  
**Basis:** `vogelstimmen_v2.3.kicad_pcb`  
**Designentscheidung:** `docs/entscheidungen.md` → E-LATCH-02  
**Stand:** 3. August 2026 — Rev 2.5 Fertigpaket (Respin F-01…F-05 + GND-Vias)

## Respin F-01…F-05 (02.08.2026)

| Ref | Wert | Funktion |
|-----|------|----------|
| **D15–D22** | 1N4148WS | Serie U2 IOx_M ↔ IOx (F-01) |
| **R5** | **0 Ω** | VOS direkt an 5 V (F-02) |
| **R13** | 100 kΩ | BUSY → Q3_GATE (F-03) |
| **C4** | 4,7 µF/16 V | Q3_GATE → GND (F-03) |
| **R12** | 10 Ω | 12V_SW → 12V_LED → J6 (F-04) |
| — | SPK ≥ 0,4 mm | Leiterbahnbreite (F-05) |

### Netze (neu/geändert)

```
IOx_M: U2 Pin 1–8 ← D15–D22 Anode
IOx:   J3 ← D15–D22 Kathode; D1–D8 Kathode; BTN_OR über D1–D8
Q3_GATE: Q3.G ← R13 ← BUSY; C4 nach GND
12V_LED: R12 → J6.1; 12V_SW → R12
VOS: R5 (0R) zwischen 5V und U1.VOS
```

## Änderung gegenüber v2.3

| Weg | v2.3 (verworfen) | v2.5 |
|-----|------------------|------|
| Kaltstart | Q4 N-FET-Inverter + R10 47 kΩ nach GND | **Q6 P-FET** von 12V_PROT |
| Ruhestrom | ~255 µA dauernd durch R10 | **≈0 µA** (P-FET aus, kein Lastwiderstand) |

## Neue / geänderte Bauteile

| Ref | Wert | Funktion |
|-----|------|----------|
| Q6 | SI2301 | P-FET SET: Source=12V_PROT, Gate über R11, Drain→R10 |
| R11 | 4,7 kΩ | Serie Gate Q6 |
| D14 | BZX84C6V2 | VGS-Clamp Q6 (K=Source, A=Gate) |
| R10 | 1 kΩ | Serie SET_DRV→SET_PULSE (begrenzt Kurzschluss vs. Q3) |
| D13 | 1N4148WS | Steering SET_PULSE→LATCH_SET |
| R9 | 10 kΩ | Pull-up BTN_OR an 12V_PROT |
| — | Q4 entfernt | war 2N7002-Inverter |

## Netze

```
IOx --button-- GND
D1–D8: K=IOx, A=BTN_OR
R9: 12V_PROT → BTN_OR
R11: BTN_OR → Q6_GATE
D14: K=12V_PROT, A=Q6_GATE
Q6: S=12V_PROT, G=Q6_GATE, D=SET_DRV
R10: SET_DRV → SET_PULSE
D13: A=SET_PULSE, K=LATCH_SET
Q3: G=**Q3_GATE** (R13/C4), S=GND, D=LATCH_SET (Release bei BUSY HIGH)
```

## Layout-Feinschliff (01.08.2026)

Bauteile/Bahnen leicht verschoben (keine BOM-/Netzänderung):

| Ref | Anpassung |
|-----|-----------|
| Q6, R9, R10, R11, D14 | Cluster ~0,5 mm / +1,5 mm |
| C3, R5, D10 | 5 V-Bereich / Freilauf neu ausgerichtet |
| TP2, TP3 | 5 V / GND Testpunkte nachgezogen |

## Steckverbinder → MPT-Schraubklemmen (E-CONN-01)

| Ref | Alt | Neu (Footprint) |
|-----|-----|-----------------|
| J1, J2, J6 | PinHeader 1×02 | `TerminalBlock_Phoenix_MPT-0,5-2-2.54_1x02_…` |
| J3, J4 | PinHeader 1×08 | `TerminalBlock_Phoenix_MPT-0,5-8-2.54_1x08_…` |

Pad-1-Position und Netze beibehalten (Körper größer als Stiftleiste).  
Script: `hardware/replace_connectors_mpt.py`

### Kabelrichtung (Drahtöffnung)

| Ref | Rotation | Kabeleinführung |
|-----|----------|-----------------|
| J1, J2, J4, J6 | 0° | von **unten** (Platinenrand +Y) |
| **J3** | **180°** | von **oben** (weg von U2); Netze IO0…IO7 an gleicher XY-Position; Pinnummern im Schaltplan gespiegelt |

Script: `hardware/orient_mpt_j3.py`

Simulation: `simulation/pcb_layout.json` / `pcb_tracks.json`.  
DRC: **0 Fehler / 0 unverbunden** (Respin); Warnungen: U2 lib_mismatch, Silkscreen.

## Fertigungspaket

**Rev 2.5 Fertigpaket** — Gerber, BOM, CPL, PDFs (Export 03.08.2026). Siehe `README.md`.

## Silkscreen-Titel (über Kübler J5)

Drei Zeilen auf **F.SilkS**, zentriert oberhalb J5:

```
Soundplatine Waldlehrpfad
Kolping Alteglofsheim
Konrad Senn 2026
```

Script: `hardware/add_silk_title.py`

## Öffnen / Export

1. Projekt öffnen → `vogelstimmen_v2.5.kicad_pro` (Schaltplan + PCB)
2. Nach Layout-Änderungen Simulation aktualisieren:
   - `python simulation/tools/export_layout.py` (KiCad-Python)
   - `python simulation/tools/export_tracks.py`

## Script

`hardware/make_v24_latch_pfet.py` (initialer Q6-Cluster)
