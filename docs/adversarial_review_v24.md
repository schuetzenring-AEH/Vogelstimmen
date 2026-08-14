# Adversarial Hardware Review — Rev 2.4

**Rolle:** Senior Hardware / PCB Reviewer (Widerlegung, nicht Bestätigung)  
**Datum:** 1. August 2026  
**Quellen:** `vogelstimmen_v2.4.kicad_sch/pcb`, `docs/schaltplan.md`, TI SLVSAM2, Kübler/SI2301-Annahmen, `hardware/2.final/`

**Gesamtverdict (01.08.): SPERRE vor Fertigung** — mindestens zwei blockierende Schaltungs-/Datenblattfehler.

**Disposition F-01…F-09 (03.08.2026):** Alle Punkte **behoben** oder **Restrisiko bewusst akzeptiert** — siehe Tabelle unten. F-10…F-13 unverändert offen (Moderate/Minor).

| ID | Status | Maßnahme / Begründung |
|----|--------|------------------------|
| **F-01** | ✅ **Behoben** | D15–D22 Serie U2↔IOx (Respin) |
| **F-02** | ✅ **Behoben** | R5 = 0 Ω (VOS direkt) |
| **F-03** | ✅ **Behoben** | R13 + C4 BUSY-Blanking; Proto-Oszi empfohlen, nicht blockierend |
| **F-04** | ✅ **Behoben** | R12 = 10 Ω → 12V_LED; Strom/R12-Temp. im Betrieb messen |
| **F-05** | ✅ **Behoben** | SPK-Hauptpfad 0,8 mm; Stubs ≥ 0,4 mm (TP/J2) |
| **F-06** | ✅ **Akzeptiert** | Tasterleitungen **≤ 30 cm im Schrank** — Feld-ESD entfällt praktisch |
| **F-07** | ✅ **Akzeptiert** | SI2301 20 V vs. SMAJ15A ~24 V; Batteriebetrieb, kein Jumpstart |
| **F-08** | ✅ **Akzeptiert** | Hauptpfad 12V 0,5–0,7 mm; U1-Pad-Stubs 0,2–0,3 mm (Platzzwang); 0,2 mm nur Latch-Zweig |
| **F-09** | ✅ **Akzeptiert** | IBN: USB nur Modul abgezogen / Latch aus (Sockel) |

**Respin-Status:** F-01…F-05 im Working-PCB (`hardware/vogelstimmen_v2.4.*`). DRC **0** Fehler / **0** unverbunden; ERC **0** Fehler; Schaltplan-Parität OK. Fertigungspaket `2.final/` noch neu exportieren.

---

## F-01 · BLOCKER — 12 V-Domain an DY-SV17F-IOs (D1–D8) · **FIXED (Respin)**

**Befund (PCB verifiziert):** D1…D8: Pad1 (Kathode) = `/IOx`, Pad2 (Anode) = `/BTN_OR`; R9 = 10 kΩ von `/12V_PROT` → `/BTN_OR`. IOx liegen parallel an U2 und J3.

### 1. Warum Risiko?
Im Idle liegt `BTN_OR` ≈ 12 V. Die Dioden leiten vorwärts in die IO-Pins. Unversorgtes Modul: IO-Spannung / Phantom-Supply über ESD-Dioden → AbsMax verletzt, Latch-up, Zerstörung.  
Bei 5 V an: interne Pull-ups ≈ 3,3 V → Dioden leiten dauernd → `BTN_OR` wird auf ≈ 4 V geklemmt → Q6 bleibt ein → Doku „Idle BTN_OR=12 V, kein Strom“ ist falsch. Zusätzlich ~0,8–1 mA Idle-Pfad möglich → E02 (<100 µA) gebrochen.

### 2. Wahrscheinlichkeit
**Hoch** (Topologie zwingend; nicht spekulativ).

### 3. Schaden
**Kritisch** — Modul tot / unzuverlässig; Idle-Strom-Ziel verfehlt; möglicherweise Dauer-SET über Q6.

### 4. Korrektur
12 V-OR und Modul-IO galvanisch trennen, z. B.:
- Taster-Knoten nur über Transistor/Open-Collector → Q6-Gate/`BTN_OR`, **ohne** Diode von 12 V in IOx, **oder**
- getrennte Leitungen (IO nur 5 V-Domain; Latch-SET eigener Pfad),  
- plus IO-Serien-R + Clamp an 5 V nach Neudesign.  
**Respin Schaltplan+PCB nötig.** Nicht durch BOM-Tausch heilbar.

---

## F-02 · BLOCKER — R5 = 100 kΩ in VOS (TPS62163) · **FIXED (R5→0R)**

**Befund:** R5 zwischen `/5V` und `/VOS` (U1 Pin 6). TI: *„VOS pin should connect in the shortest way to VOUT at the output capacitor.“*

### 1. Warum Risiko?
VOS ist Regelkreis-Sense. 100 kΩ + Rauschen/kapazitive Kopplung → falsche Ausgangsspannung, Jitter, im Extrem IC-Stress. Datenblatt verlangt **kurze direkte** Verbindung, keinen 100 k-Vorwiderstand.

### 2. Wahrscheinlichkeit
**Hoch**, dass Regulation außerhalb Spec oder instabil (Layout+100 k).

### 3. Schaden
**Hoch** — 5 V falsch → Kübler/Modul außerhalb Fenster; Buck kann fehlverhalten.

### 4. Korrektur
R5 → **0 Ω** oder R5 entfernen und VOS direkt an C3/`5V` legen (kurze Trace). Vor Order patchen (Handlöten 0 Ω auf Proto möglich, besser Layout-Fix).

---

## F-03 · MAJOR — Kaltstart / BUSY-Race (Mode 0 Flanke) · **FIXED (R13+C4; Proto-Oszi empfohlen)**

### 1. Warum Risiko?
Latch weckt erst die 5 V-Schiene. Mode 0 braucht **fallende Flanke** an IOx *nachdem* das Modul lebt. Kurzer Tastendruck vor Boot-Ende (~150 ms + CON3-Fenster 30 ms) → kein Play. Danach BUSY=HIGH → Q3 → Latch aus → „tot beim ersten Druck“.  
Zusätzlich: sobald BUSY als Ausgang HIGH ist und noch kein Play läuft, killt Q3 die Versorgung.

### 2. Wahrscheinlichkeit
**Mittel–hoch** (abhängig Tastendauer / Modul-Firmware; in Feld oft reproduzierbar).

### 3. Schaden
**Hoch funktional** (wirkt „defekt“), selten Hardwareschaden.

### 4. Korrektur
BUSY-Release verzögern/qualifizieren (RC + Schmitt, oder Release erst nach BUSY Low→High *nach* Play); oder Level-Trigger-Mode; oder monostabile Verlängerung des IO-Lows über Boot; Prototyp **oszi** Pflicht vor Serie.

---

## F-04 · MAJOR — Keine Strombegrenzung Taster-LEDs (J6) · **FIXED (R12=10Ω; Messung im Betrieb)**

**Verifikation:** Strom am LED-Ring + R12-Temperatur bei Dauerplay messen (Ziel ~50–120 mA gesamt).

### 1. Warum Risiko?
J6 = Roh-`12V_SW` + GND. Annahme „6–24 V LEDs mit Vorwiderstand“ ist **feldabhängig**. Ohne interne R: LED-/Kabelkurzschluss → hoher Strom über Q1 (SI2301), Thermik, PTC erst spät.

### 2. Wahrscheinlichkeit
**Mittel** (hängt von verbauten Tastern).

### 3. Schaden
**Mittel–hoch** — LED kaputt, Q1/Leiterbahn stress, entladene Batterie.

### 4. Korrektur
Serienwiderstand oder Konstantstrom auf Platine; max. LED-Strom spezifizieren; Kurzschlussfestigkeit prüfen; Annahme in Lastenheft verbindlich machen.

---

## F-05 · MAJOR — SPK-Bahnen stellenweise nur 0,2 mm · **FIXED (Hauptpfad 0,8 mm)**

**PCB:** U2→Lautsprecher **0,8 mm**; kurze Stubs zu TP5/J2 **≥ 0,4 mm**.

### 1. Warum Risiko?
Class-D-Peaks ≫ Mittelstrom. 0,2 mm auf `SPK+` (PCB-Auswertung) → I²R, Spannungsabfall, lokal Hitze, EMI durch hohe dI/dt in schmalen Spuren.

### 2. Wahrscheinlichkeit
**Mittel** bei 4 Ω / hoher Lautstärke.

### 3. Schaden
**Mittel** — Verzerrung, Warmstellen, im Extrem Pad-Stress.

### 4. Korrektur
SPK± auf ≥0,5–0,8 mm (besser Kupferfläche); kurze Wege U2→J2.

---

## F-06 · MAJOR — ESD / lange Tasterleitungen ohne Schutz · **AKZEPTIERT (Einsatzkontext)**

**Disposition (03.08.2026):** Review ging von Meter-Kabeln im Wald aus. **Tatsächlicher Aufbau:** Tasterleitungen **max. 30 cm**, **im Schrank** — ESD/EFT-Risiko praktisch vernachlässigbar. D15–D22 schützen Modul vor 12-V-Domain. **Keine TVS an J3.**

### 1. Warum Risiko? (ursprünglich)
Wald/außen, Meter Kabel an IOx → ESD/EFT direkt an Modul-Pins (und Latch-OR). Keine TVS/RC an J3.

### 2. Wahrscheinlichkeit
**Mittel** über Lebensdauer.

### 3. Schaden
**Hoch** — sporadische Resets/Defekte.

### 4. Korrektur
Nach Domain-Trennung (F-01): TVS-Array oder ≥1 kΩ Serie + Clamp 5 V/GND je IO; ggf. Common-Mode-Ferrit am Kabelbund.

---

## F-07 · MAJOR — SI2301 VDS 20 V vs. SMAJ15A Clamp ~24 V · **AKZEPTIERT**

**Disposition (03.08.2026):** 12-V-Batteriebetrieb im Schrank, kein Jumpstart/Lichtmaschine. Transienten-Risiko **bewusst eingegangen**; PTC + TVS bleiben Erstlinie.

### 1. Warum Risiko?
TVS Vc ≈ 24,4 V @ IPP. Q5/Q1 absolut max VDS = 20 V. Bei hartem Transient kann FET vor/mit TVS über VDS gehen.

### 2. Wahrscheinlichkeit
**Niedrig–mittel** (ohne Lichtmaschine selten; Jumpstart/induktive Spikes möglich).

### 3. Schaden
**Hoch** — FET kurz → Folgeschäden.

### 4. Korrektur
40 V P-FET (z. B. höhere VDS-Familie) **oder** TVS mit niedrigerem Vc / SMAJ12A prüfen (vs. Ladespannung); Transienten-Test.

---

## F-08 · MODERAT — Power-Integrität 12V_SW / GND · **AKZEPTIERT**

**Disposition (03.08.2026):** Hauptlastpfad F1→Q1→12V_SW **0,5–0,7 mm**. U1 VIN: Pad-Stubs **0,2–0,3 mm** (WSON-Platzzwang, &lt;1 mm). Lange **0,2-mm-Stellen** nur am Latch-Zweig (R9/Q6), **kein Lastpfad**. Verifikation: 5 V stabil unter Volllast.

### 1. Warum Risiko?
`12V_SW` enthält 0,2 mm-Segmente; Buck-Inrush + LEDs. Nur 12 Vias; GND primär Zone — OK wenn Fill solide, aber Engstellen bleiben.

### 2. Wahrscheinlichkeit
**Mittel** bei LED-Last + Audio-Peak.

### 3. Schaden
**Mittel** — Browout, Reset, EMI.

### 4. Korrektur
Mindestbreite Power ≥0,5 mm durchgängig; Via-Stitching unter U1 CIN/COUT; Inrush auf Scope.

---

## F-09 · MODERAT — USB-Programmierung vs. Board-5 V · **AKZEPTIERT**

**Disposition (03.08.2026):** Modul auf **Sockel** — IBN-Regel: *USB nur zum Programmieren, Modul abgezogen oder Latch aus (kein 12V_SW)*. Seit 14.08.2026: Sockel **Pflicht**, USB **nur Werkstatt**, kein Gehäuseloch — **E-AUDIO-04**.

### 1. Warum Risiko?
DY-SV17F USB speist Modul. Gleichzeitig Latch/Buck 5 V → zwei Quellen auf V5 möglich Backfeed in Buck-Ausgang.

### 2. Wahrscheinlichkeit
**Mittel** (wenn USB bei eingebautem Modul + Batterie).

### 3. Schaden
**Mittel** — Buck-Ausgang reverse, Modul-Oddities.

### 4. Korrektur
Programmierung nur Modul abgezogen (Sockel — gut) **oder** Schottky/Lastschalter; Arbeitsanweisung „USB nur ohne 12V_SW“.

---

## F-10 · MODERAT — Thermik Kübler dauernd an 5 V während Play

### 1. Warum Risiko?
Spule ~50 mW @4,5 V, hier 5 V für 10–20 s. Spec erlaubt Dauer — thermisch meist OK, aber Gehäuse/Sommer.

### 2. Wahrscheinlichkeit
**Niedrig** für Defekt; Komfort/Drift möglich.

### 3. Schaden
**Niedrig–mittel**.

### 4. Korrektur
Optional Impuls nur auf Power-Up-Edge; Temperaturrauchtest.

---

## F-11 · MODERAT — DFM/DFA Outdoor

### 1. Warum Risiko?
Viele **0402**, steckbares Modul, MPT-Schrauben, Vibration/Feuchte. Silk/Footprint-Warnung U2. Bestückungsreihenfolge THT nach Reflow.

### 2. Wahrscheinlichkeit
**Mittel** für Montage-/Feldprobleme.

### 3. Schaden
**Mittel** — Premature opens, Schraubklemm-Lockering.

### 4. Korrektur
Kritische R auf 0603; Conformal Coating; Schrauben sichern; U2-Lib sync; Montageanweisung.

---

## F-12 · MINOR — BOM / Prozess

| Punkt | Risiko |
|-------|--------|
| Q6/D13 ohne LCSC im KiCad-Feld | falsche Bestückung wenn nur Roh-BOM |
| `JLCPCB_BOM.csv` patched manuell | Drift zu Schaltplan |
| TPS62163 knapper Stock | Lieferverzögerung |
| Symbol Q teils „BSS84“ in Lib-Text | Verwechslung trotz Value SI2301 |

**Korrektur:** LCSC-Felder in Schaltplan pflegen; eine kanonische BOM; Q6=C10487, D13=C118873.

---

## F-13 · MINOR — Annahmen Datenblatt / Doku

| Annahme | Problem |
|---------|---------|
| „BTN_OR Idle kein Strom“ | durch **F-01-Fix** behoben (D15–D22) |
| E03 Real case | OK als Analyse; Worst case kommunizieren |
| Kübler 4,5 V @5 V | Spec-mäßig OK (E-CNT-01); Buck-Fehler >5,4 V tödlich → hängt an F-02 |
| LTspice übersprungen | kein Ersatz für F-01/F-02 |

---

## Was relativ robust wirkt (kurz)

- VGS-Zener Q5/Q1/Q6 + Serie-R (Konzept richtig, Polarität PCB plausibel)
- Verpolung Q5-Topologie üblich
- D13 Steering + R10 gegen Q3-Kampf (Verlust begrenzt)
- D10 Freilauf 5 V↔GND für Kübler sinnvoll
- PTC 24 V-Typ (nicht 6 V) richtig gewählt
- DRC 0 open nets

---

## Freigabe-Stand (03.08.2026)

1. ~~F-01…F-05 Respin~~ ✅  
2. ~~F-06…F-09 disposition~~ ✅ (akzeptiert / dokumentiert)  
3. **Proto:** F-03 Oszi optional; F-04 LED-Strom messen; F-08 5 V unter Last  
4. Gerber aus Working-PCB neu exportieren → M04 → Bestellung  
5. F-10…F-13: Moderate/Minor — bei Gelegenheit (DFM, BOM-LCSC, Kübler-Thermik)
