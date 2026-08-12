# Platinen-Simulation (HTML5 + TypeScript/JS)

Interaktive Rev-2.5-Simulation: Taster drücken → Phasenablauf → Spannungen/Ströme pro Bauteil auf dem Platinen-Abbild.

## Start

**Empfohlen (frische Adresse, kein Cache von alter Session):**

```bash
simulation/start_rev25.bat
```

Öffnet **http://127.0.0.1:8766/**

Alternativ (Port 8765):

```bash
python simulation/serve.py
```

Öffnet `http://127.0.0.1:8765/`.

Port wählen: `python simulation/serve.py --port 8766`

## Aufbau

| Datei | Rolle |
|-------|--------|
| `index.html` | UI (Platine SVG, Taster, Tabelle) |
| `src/parts.ts` | Datenblatt-Parameter (TypeScript-Quelle) |
| `src/model.ts` | Verhaltensmodell (TypeScript-Quelle) |
| `js/parts.js` / `js/model.js` / `js/app.js` | Lauffähige ESM-Module |
| `pcb_layout.json` | Footprint-Positionen aus KiCad v2.5 (63 Bauteile, 32 Vias) |
| `pcb_tracks.json` | Leiterbahnen + Vias |
| `tools/export_layout.py` | Neu-Export Footprints (KiCad-Python) |
| `tools/export_tracks.py` | Neu-Export Tracks/Vias (KiCad-Python) |

Nach PCB-Änderungen beide Exports mit KiCad-Python neu laufen lassen:

```bash
& "C:\Program Files\KiCad\10.0\bin\python.exe" simulation/tools/export_layout.py
& "C:\Program Files\KiCad\10.0\bin\python.exe" simulation/tools/export_tracks.py
```

## Rev 2.5 (Respin)

| Fix | Simulation |
|-----|------------|
| F-01 D15–D22 | Serie-Dioden U2↔IOx in `parts.js` / `catalog.js` |
| F-02 R5=0 Ω | VOS direkt 5 V |
| F-03 R13+C4 | RC-Blanking Q3_GATE (~470 ms) in `model.js` |
| F-04 R12 | LED-Strombegrenzung 12V_LED |
| Layout | 32 GND-Vias in `pcb_tracks.json` |

## Modellierung

- **Diskret (Ohm/Kirchhoff):** R1–R13, Dioden, Zener-Clamp, FET als Schalter mit Rds(on)/VGS
- **Blöcke:** TPS62163 (η + IQ), DY-SV17F (Boot/BUSY/Play-Strom), Kübler (Rcoil aus 50 mW @ 4,5 V)
- **Kein** SPICE-Transient — DC-Arbeitspunkte pro Phase; RC-Blanking als einfacher Tiefpass

## Datenblätter

Siehe `docs/datasheets/` und Parameter-Kommentare in `js/parts.js`.

### Wichtige verifizierte Werte

| Bauteil | Parameter | Quelle |
|---------|-----------|--------|
| SI2301CDS | VGS max ±8 V, RDS(on) typ 90 mΩ @−4,5 V | Vishay |
| BZX84C6V2 | Vz 6,2 V | Nexperia/Good-Ark |
| 2N7002L | VGS(th) 1–2,5 V, RDS max 7,5 Ω | onsemi |
| TPS62163 | VOUT 5 V fest, IQ typ 17 µA | TI SLVSAM2E |
| SMAJ15A | VRWM 15 V, VBR 16,7–18,5 V | Littelfuse |
| K07.90 | ~50 mW @ Unenn (10 Hz) → @5 V ≈12 mA | Kübler |
| DY-SV17F | Idle **14 mA** (Messung); Betrieb **≤60 mA** (Spec); V33 max 80 mA | siehe unten |
| R6 | 470 kΩ → Idle ≈12 µA | E-RPP-01 |

### DY-SV17F Ströme (Quellen)

| Zustand | Strom | Quelle |
|---------|-------|--------|
| Idle (powered, kein Play) | **14 mA** | Messung inkl. LTK5128 + 32 Mbit Flash; Sleep-Befehl wirkungslos — [arduino12/mp3_player_module_wire](https://github.com/arduino12/mp3_player_module_wire) |
| Betrieb (рабочий режим) | **bis 60 mA** | Händler-Spec — [compacttool.ru](https://compacttool.ru/mp3wav-pleer-dy-sv17f-s-mono-audiousilitelem-5vt) |
| Lautsprecher | extra (Sim: `Ispk_avg`) | Class-D; Spitzen je nach Lautstärke deutlich höher (Foren: ~110 mA … Angaben bis 500 mA) |
| V33-Ausgang | max **80 mA** | Modul-PDF — *Ausgang*, nicht Modul-Iq |

Im Hersteller-Functions-PDF steht **kein** Versorgungsstrom — nur V33-Limit.
