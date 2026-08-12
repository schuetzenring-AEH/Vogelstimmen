# KiCad PCB Rev 2.3 — VGS-Zeners platziert

**Datei:** `hardware/vogelstimmen_v2.3.kicad_pcb`  
**Basis:** Kopie von `vogelstimmen_v2.2.kicad_pcb`  
**Routing:** absichtlich nicht geändert — du verdrahtest

## Neu platziert

| Ref | Bauteil | Nähe | Hinweis |
|-----|---------|------|---------|
| D11 | BZX84C6V2 | Q5 | K→`/BAT+` (Source), A→`/RPP_GATE` (Gate) |
| R7 | 4.7k 0402 | Q5 / R6 | Serie in den RPP-Gate-Pfad |
| D12 | BZX84C6V2 | Q1 | K→`/12V_PROT` (Source), A→`/LATCH_GATE` (Gate) |
| R8 | 4.7k 0402 | Q1 / Q2 | Serie in den Latch-Gate-Pfad |

Footprint: `vogelstimmen:BZX84C6V2` (Pad1=K, Pad2=A, Pad3=NC).

## Öffnen

1. Projekt `vogelstimmen_v2.kicad_pro` öffnen  
2. **Datei → Öffnen** → `vogelstimmen_v2.3.kicad_pcb`

## Nächste Schritte

1. Position feinjustieren (`M` / `R`)
2. R7: R6 vom Gate lösen → R7 dazwischen (MCU/IO → R7 → Gate; R6 bleibt Gate↔GND)
3. R8: Serie zwischen Q2-Drain und Q1-Gate
4. D11/D12: kurze Tracks K→Source, A→Gate
5. Zone füllen (`B`), DRC

## Script

`hardware/make_v23_zeners.py`
