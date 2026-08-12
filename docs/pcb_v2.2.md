# KiCad PCB Rev 2.2 — Optimierte Platzierung

**Datei:** `hardware/vogelstimmen_v2.2.kicad_pcb`  
**Basis:** Kopie von `vogelstimmen_v2.kicad_pcb` mit neuer Bauteil-Anordnung  
**Routing:** absichtlich entfernt (neu zu routen)

## Öffnen

1. Projekt `vogelstimmen_v2.kicad_pro` öffnen  
2. Menü **Datei → Öffnen** → `vogelstimmen_v2.2.kicad_pcb`  
   oder im Projektbaum die `.kicad_pcb` doppelklicken falls sichtbar

Die alte `vogelstimmen_v2.kicad_pcb` bleibt unverändert (dein bisheriger Stand).

## Platzierung (Konzept)

- **U2** links, USB nach außen (90°)
- **Q3 / R3** nah an U2 (BUSY)
- **U1 + L1 + C2/C3 + R5** Buck-Cluster oben Mitte
- **J5** nah an 5V
- **Q1/Q2 + R1/R2/R4** Latch unter dem Buck
- **D1–D8** Reihe über den Taster-Steckern
- **J1 → Q5/F1/D9/C1** Schutzkette unten links
- **J3/J4** unten (Taster), **J6** unten rechts (LEDs), **J2** nahe U2 (SPK)

## Nächste Schritte in KiCad

1. Visuell prüfen, Bauteile feinjustieren (`M` / `R`)
2. GND-Zone neu füllen (`B`)
3. Power manuell routen (0,5 mm), dann Signale
4. DRC → 0 Fehler

## Script

Neu erzeugen / anpassen: `hardware/make_v22_placement.js`
