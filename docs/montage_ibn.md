# Montage & Inbetriebnahme (IBN) — Rev 2.5

**Status:** Arbeitsanweisung Entwurf für Proto / Kleinserie.

---

## 1. Lieferumfang PCB

- SMD von JLCPCB bestückt (laut BOM/CPL)
- Manuell: U2 (DY-SV17F, optional Sockel), J5 Hengstler 0.635.128, J1/J2/J6 MPT 0,5/2, J3/J4 MPT 0,5/8

---

## 2. Montagefolge

1. Sichtprüfung SMD (**D9 Polarität!**, D15–D22 Polarität, R5=0R, R12, R13, C4)  
2. THT-Klemmen löten (Orientierung: J3 Kabelzugang beachten)  
3. Hengstler J5 (Anzeige zum Sichtfenster; Polarität Pad1=+ / Pad2=−)  
4. **C4 von 4,7 µF auf 22 µF tauschen** (0805, ≥10 V, X5R/X7R) — siehe §5 Errata  
5. Modul U2 auf Sockel / löten (**Orientierung beachten!** siehe §5 Errata)  
6. Optional: Conformal Coating (außer Stecker, Sockel, Zählerfenster)  
7. Einbau Gehäuse, M3, Verkabelung ≤30 cm  

---

## 3. IBN-Checkliste (Minimum)

| # | Prüfung | Soll |
|---|---------|------|
| 0 | **D9 Polarität** (Strich zu 12V_PROT / F1) | TP1 ≈ 12 V, F1 kalt |
| 0b | **U2 Orientierung** (IO-Reihe bei J3, CON/SPK bei J2) | siehe §5 |
| 1 | Batterie Polarität J1 | Platine lebt, Idle |
| 1b | TP2 ohne Taster | **< 0,5 V** (Idle) |
| 2 | Multimeter I_BAT Idle | < 100 µA |
| 3 | Taste halten ≥ 400 ms, loslassen | Audio spielt ~10 s weiter |
| 4 | Track Ende | Latch aus, Idle wieder (TP2 → 0 V) |
| 5 | Zähler | +1 pro Session |
| 6 | Retrigger | Stimme wechselt |
| 7 | USB-Regel | nur Latch aus / Modul ab |
| 8 | SPK Verkabelung | BTL, kein GND an SPK− |

Messungen Auflagen: Oszi BUSY/Q3_GATE; R12-Temp; 5 V Last — `vv_testplan.md`.

---

## 5. Errata Proto (August 2026)

### E-IBN-01 — D9 (SMAJ15A) falsch bestückt (JLCPCB)

**Symptom:** F1 (PTC) wird beim Einstecken sofort heiß; hinter F1 nur ~0,7 V statt ~12 V.

**Ursache:** D9 ist 180° falsch bestückt (beide Platinen betroffen). Der Kathoden-Ring
zeigt zu GND statt zu 12V_PROT. D9 leitet in Vorwärtsrichtung und klemmt 12V_PROT auf ~0,7 V.

**Fix:** D9 auslöten, 180° drehen, wieder einlöten. Kathoden-Ring muss zu **F1 / 12V_PROT** zeigen.

**Prüfung:** TP1 ≈ 12 V, F1 bleibt kalt.

### E-IBN-02 — U2 (DY-SV17F) Steckrichtung

**Symptom:** Kein Ton; TP4 (BUSY) zeigt ~2,5 V statt 0/5 V-Wechsel.

**Ursache:** Modul kann um die lange Achse verkehrt eingesteckt werden (IO-Reihe
und CON/SPK-Reihe vertauscht). Beide Reihen haben 9 Pins und passen mechanisch.

**Richtige Orientierung** (Platine so halten, dass H1 oben links und USB-Aufdruck links ist):

| Reihe | Lage auf Platine | Modul-Pins (links → rechts) |
|-------|------------------|-----------------------------|
| Obere (bei D15–D22 / J3) | IO-Reihe | GND · IO7 · IO6 · IO5 · IO4 · IO3 · IO2 · IO1 · IO0 |
| Untere (bei J2 / TP4) | CON/SPK-Reihe | CON1 · CON2 · BUSY · U5 · U33 · DACR · DACL · SPK− · SPK+ |

USB-Buchse des Moduls zeigt zum **USB-Aufdruck** auf der Platine (nach links).
Modulbeschriftung (DY-SV17F) ist von **oben lesbar** (Bauteilseite oben).

**Prüfung nach Einstecken:** TP4 bei Idle ≈ 5 V (Modul gebootet), beim Abspielen ≈ 0 V.

### E-IBN-03 — C4 Blanking zu kurz (4,7 µF → 22 µF)

**Symptom:** Latch oszilliert im Sekundentakt (Ton an/aus/an/aus); Ton stoppt sofort beim
Loslassen des Tasters; Platine schaltet sich nicht sauber ab.

**Ursache:** R13 (100 kΩ) × C4 (4,7 µF) = 0,47 s Blanking. Q3 erreicht die Schwelle in
~0,25 s. Die Boot-Zeit des DY-SV17F (~300 ms) plus BUSY-HIGH-Phase übersteigt das
Blanking-Fenster → Q3 killt den Latch bevor das Modul den Ton starten kann.

**Fix:** C4 ersetzen: **22 µF / ≥ 10 V / 0805 / X5R oder X7R**. Neues Blanking ≈ 1,1 s —
genug Puffer für Boot + erste Flanke.

**Prüfung:** Taste 2 s halten → loslassen → Ton spielt ~10 s weiter → Platine geht aus.

---

## 4. Fertigungsunterlagen

| Dokument | Ort |
|----------|-----|
| Gerber ZIP | `hardware/V2.5-final/` |
| BOM / CPL | dasselbe |
| JLCPCB README | `hardware/V2.5-final/README.md` |
