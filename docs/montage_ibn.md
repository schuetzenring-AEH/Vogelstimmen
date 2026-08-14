# Montage & Inbetriebnahme (IBN) — Rev 3.0

**Status:** Arbeitsanweisung Entwurf für Proto / Kleinserie.

---

## 1. Lieferumfang PCB

- SMD von JLCPCB bestückt (laut BOM/CPL)
- Manuell: **U2-Sockel +** DY-SV17F (Sockel Pflicht, E-AUDIO-04), J5 Hengstler 0.635.128, J1/J2/J6 MPT 0,5/2, J3/J4 MPT 0,5/8

---

## 2. Montagefolge

1. Sichtprüfung SMD (D15–D22 Polarität, R5=0R, R12, R13, C4)  
2. THT-Klemmen löten (Orientierung: J3 Kabelzugang beachten)  
3. Hengstler J5 (Anzeige zum Sichtfenster; Polarität Pad1=+ / Pad2=−)  
4. **Sockel löten**, Modul U2 einstecken (nicht direkt auflöten)  
5. Optional: Conformal Coating (außer Stecker, Sockel, Zählerfenster)  
6. Einbau Gehäuse, M3, Verkabelung ≤30 cm  

---

## 3. IBN-Checkliste (Minimum)

| # | Prüfung | Soll |
|---|---------|------|
| 1 | Batterie Polarität J1 | Platine lebt, Idle |
| 2 | Multimeter I_BAT Idle | <100 µA |
| 3 | Taste halten ≥400 ms | Audio + LEDs |
| 4 | Track Ende | Latch aus, Idle wieder |
| 5 | Zähler | +1 pro Session |
| 6 | Retrigger | Stimme wechselt |
| 7 | USB-Regel | nur Werkstatt, Latch aus / Modul ab; kein Gehäuseloch |
| 8 | SPK Verkabelung | BTL, kein GND an SPK− |

Messungen Auflagen: Oszi BUSY/Q3_GATE; R12-Temp; 5 V Last — `vv_testplan.md`.

---

## 4. Fertigungsunterlagen

| Dokument | Ort |
|----------|-----|
| Gerber ZIP | `hardware/V3.0/` |
| BOM / CPL | `JLCPCB_BOM.csv` · `JLCPCB_CPL.csv` |
| JLCPCB README | `hardware/V3.0/README.md` |
