# Platinen-Simulation (HTML5 + JS)

Klick auf ein Bauteil öffnet Detail inkl. **Datenblatt**, **ADR** und **RFP-Kette** (Anforderung → Funktion → Bauteil).

## Mobile Web-App (iOS / Android)

Optional unter [`../sim-app/`](../sim-app/) — Touch-UI, Bottom-Sheet. Auf GitHub Pages: `/sim-app/`.  
Die **Standard-Simulation** bleibt hier in `simulation/` (`index.html`).

Lokal: `START_SIM_MOBILE.bat` im Projektroot.

## Start

**Empfohlen (frische Adresse, kein Cache von alter Session):**

```bash
simulation/start_rev30.bat
```

Öffnet **http://127.0.0.1:8766/**

Alternativ (Port 8765):

```bash
python simulation/serve.py
```

Port wählen: `python simulation/serve.py --port 8766`

## Aufbau

| Datei | Rolle |
|-------|--------|
| `index.html` | UI (Platine SVG, Taster, Tabelle) |
| `js/parts.js` | Datenblatt-Parameter (Rev 3.0, Laufzeit) |
| `js/model.js` | Verhaltensmodell inkl. One-Shot / Hengstler |
| `js/catalog.js` / `diagrams.js` | Baugruppen-Texte + SVG-Hilfsdiagramme |
| `src/parts.ts` / `src/model.ts` | TypeScript-Spiegel (Pflege parallel zu `js/`) |
| `pcb_layout.json` | Footprint-Positionen **und Bounding-Box** aus KiCad V3.0 |
| `pcb_tracks.json` | Leiterbahnen + Vias |
| `assets/topview.png` | JLCPCB-Topview (Hintergrund) |
| `assets/*_top.png` | Fotos Hengstler, DY-SV17F, Phoenix-Klemmen |
| `pcb_tracks.json` | Leiterbahnen + Vias |
| `tools/export_layout.py` | Neu-Export Footprints (KiCad-Python) |
| `tools/export_tracks.py` | Neu-Export Tracks/Vias (KiCad-Python) |

Nach PCB-Änderungen beide Exports mit KiCad-Python neu laufen lassen:

```bash
& "C:\Program Files\KiCad\10.0\bin\python.exe" simulation/tools/export_layout.py
& "C:\Program Files\KiCad\10.0\bin\python.exe" simulation/tools/export_tracks.py
```

## Rev 3.0 — Zähler-One-Shot (E-CNT-03/04)

| Ref | Rolle für den Hengstler |
|-----|-------------------------|
| **J5** | Hengstler **0.635.128** (12 V, Spule 1860 Ω): Pad1 = `12V_SW`, Pad2 = `CNT_LO` |
| **C20** | 1 µF: koppelt nur die Rising-Edge von `12V_SW` → `CNT_PULSE` |
| **R20** | 100 kΩ: Entladung / Pulsbreite (~R·C ≈ 100 ms, effektiv ~80 ms) |
| **R21** | 100 Ω: Serie zum Gate von Q7 |
| **D23** | Clamp: hält `CNT_PULSE` ≥ −Vf gegen GND |
| **Q7** | AO3400 Low-Side: zieht `CNT_LO` kurz nach GND → Spule zählt +1 |
| **D10** | Freilauf parallel zur Spule (K→`12V_SW`, A→`CNT_LO`) |

Phase `cnt_pulse`: Latch gerade AN, Spulenstrom ≈6,5 mA für ~80 ms, danach Spule aus für den Rest der Session. Idle: `12V_SW` tot → 0 mA.

## Respin (weiterhin gültig)

| Fix | Simulation |
|-----|------------|
| F-01 D15–D22 | Serie-Dioden U2↔IOx |
| F-02 R5=0 Ω | VOS direkt 5 V |
| F-03 R13+C4 | RC-Blanking Q3_GATE (~470 ms) |
| F-04 R12 | LED-Strombegrenzung 12V_LED |

## Modellierung

- **Diskret (Ohm/Kirchhoff):** R1–R13, R20/R21, Dioden, Zener-Clamp, FET als Schalter mit Rds(on)/VGS
- **Blöcke:** TPS62163 (η + IQ), DY-SV17F (Boot/BUSY/Play-Strom), Hengstler (Rcoil 1860 Ω @12 V, nur während One-Shot)
- **Kein** SPICE-Transient — DC-Arbeitspunkte pro Phase; RC-Blanking + One-Shot als Timer

## Datenblätter

Siehe `docs/datasheets/README.md` (alle SMT- + Handteile Rev 3.0) und Parameter in `js/parts.js`.

| Bauteil | Parameter | Quelle |
|---------|-----------|--------|
| SI2301CDS | VGS max ±8 V, RDS(on) typ 90 mΩ | Vishay |
| AO3400 (Q7) | Low-Side CNT_LO | AOS / LCSC C20917 |
| Hengstler 0.635.128 | 12 V, 1860 Ω ≈80 mW, min. Impuls 50 ms | Hengstler 634/635 |
| DY-SV17F | Idle **14 mA**; Betrieb **≤60 mA**; V33 max 80 mA | Messung / Spec |
| R6 | 470 kΩ → Idle ≈12 µA | E-RPP-01 |
