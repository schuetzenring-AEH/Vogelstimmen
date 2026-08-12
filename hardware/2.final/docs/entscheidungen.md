# Designentscheidungen — Vogelstimmenkasten Rev 2

Versionierte Architektur- und Schaltungsentscheidungen. Ältere Einträge bleiben stehen (Historie).

---

## E-LATCH-01 — Hardware-Latch für ≈0 µA Ruhestrom (unverändert gültig)

**Datum:** Rev‑2 Architektur  
**Status:** gültig  

**Kontext:** Batteriebetrieb (Bleiakku), lange Standzeiten, Anforderung E02 (&lt; 100 µA, Ziel ≈0 µA).

**Entscheidung:** Komplette Abschaltung von Buck + DY-SV17F über P-FET-Latch (Q1), der nur bei Tastendruck einschaltet und über BUSY wieder ausfällt. Kein MCU-Sleep, kein Quiescent des Audio-Moduls im Idle.

**Konsequenz:** Im Idle liegt nur `12V_PROT` an (Schutz/TVS/C). `12V_SW` / `5V` sind tot → Ruhestrom ≈ Leckage.

---

## E-LATCH-02 — Kaltstart-SET mit P-FET (v2.4), nicht N-FET-Inverter

**Datum:** 31.07.2026  
**Status:** gültig (ab PCB **v2.4** / Doku Rev 2.4)  
**Ersetzt:** Kurzzeitige v2.3-Lösung mit Q4+R10 (verworfen)

### Problem

- DY-SV17F Mode 0: Taster **Active-Low** (IOx → GND).
- Alter Dioden-OR (Anode=IOx → LATCH_SET) braucht IO=HIGH → **setzt im Kaltstart nicht**.
- Zusätzlich hing Q3.Drain fälschlich an `LATCH_GATE` → Release über BUSY wirkte nicht zuverlässig.

### Verworfene Variante (v2.3 kurz)

Active-Low-OR → N-FET-Inverter Q4 + Pull-up **R10 = 47 kΩ** nach GND am Drain.

| | |
|--|--|
| Vorteil | Kaltstart funktioniert |
| Nachteil | Im Idle leitet Q4 dauernd → **I ≈ 12 V/47 kΩ ≈ 255 µA** |
| Verstoß | Gegen **E-LATCH-01** und E02 (&lt; 100 µA) |

### Gewählte Variante (v2.4)

```
Taster→GND → D1–D8 (K=IOx, A=BTN_OR) → R9 Pull-up an 12V_PROT
BTN_OR → R11 → Q6_GATE
Q6 = SI2301 (P): Source=12V_PROT, Drain→R10(1k)→D13→LATCH_SET
D14 = BZX84C6V2 VGS-Clamp an Q6
Q3.Drain = LATCH_SET (Release)
R4 = Hold von 12V_SW
```

| Zustand | Verhalten | Ruhestrom |
|---------|-----------|-----------|
| Idle, kein Taster | BTN_OR≈12 V → VGS(Q6)=0 → Q6 **aus** | **≈0 µA** (+Leckage) |
| Taster | BTN_OR low → Q6 **ein** → LATCH_SET high | kurzzeitig |
| Wiedergabe | R4 hält; Q6 ggf. noch „ein“ unkritisch | aktiv |
| Ende (BUSY HIGH) | Q3 zieht LATCH_SET auf GND; R10 begrenzt Konfliktstrom | → Idle |

**Warum P-FET statt Inverter:** Im Ruhezustand darf **kein Widerstand dauerhaft 12 V nach GND** verbinden. Ein P-FET mit Gate=12 V ist einfach aus.

**PCB:** `vogelstimmen_v2.4.kicad_pcb`  
**Siehe:** `docs/pcb_v2.4.md`, `docs/schaltplan.md` B2, `docs/digitaler_zwilling.md`

---

## E-RPP-01 — R6 = 470 kΩ für Idle &lt; 100 µA

**Datum:** 31.07.2026  
**Status:** gültig  

**Problem:** R6 = 10 kΩ am Verpolungs-Gate (Q5) zog ~580 µA Dauerstrom → E02 verletzt, obwohl Latch ≈0 µA.

**Entscheidung:** R6 = **470 kΩ** → Idle ≈ **12 µA** (+ Leckage). Latch unverändert.

**Trade-off:** Q5 schaltet beim Batterieanschluss etwas träger — irrelevant.

---

## E-VGS-01 — Zener-Clamp an SI2301 (Q5, Q1, Q6)

**Status:** gültig  

BZX84C6V2 (6,2 V) + Serie 4,7 kΩ, LCSC **C179522**.  
K=Source, A=Gate. Ohne Clamp wäre \|VGS\|≈12 V &gt; Limit.

---

## E-CNT-01 — Kübler K07.90 Bestellnummer

**Status:** gültig  

| | |
|--|--|
| Typ | K07.90 liegend, Anzeige oben |
| Bestellnr. | **1.130.900.008** (4,5 V DC / 10 Hz, Typ 0) an 5 V-Rail |
| Alternative | 1.130.900.012 (12 V) an 12V_SW |

### Datenblatt — Spannungstoleranz (Typ 0 / 10 Hz)

Kübler K04–K07: **Rated voltage type 0: −10 % / +20 %** der Nennspannung.

| | |
|--|--|
| Nenn | 4,5 V |
| Erlaubt | **4,05 V … 5,4 V** (4,5 × 0,9 … 4,5 × 1,2) |
| Unsere Rail | **5,0 V** fest (TPS62163) → **+11 %** → **innerhalb +20 %** |

Zusätzlich: **Cycle duration factor 100 %** (Dauerbetrieb der Spule bei Nennspannung erlaubt).  
Im Betrieb liegt 5 V nur während Latch AN (~10–20 s pro Play) an — thermisch unkritisch; ohnehin Spec-konform.

**Gefahr bei 5 V?** Keine Spec-Überschreitung. Risiko wäre erst &gt; 5,4 V (Buck-Fehler) oder dauerhaft stark erhöhte Verlustleistung — beides hier nicht gegeben.  
Optional robuster: 12 V-Typ an 12V_SW.

---

## E-CONN-01 — Phoenix MPT-0,5 Schraubklemmen statt Stiftleisten

**Datum:** 01.08.2026  
**Status:** gültig  

**Kontext:** Taster mit Einzelleitungen (2 Adern), Feldverkabelung ohne Crimpgehäuse.

**Entscheidung:** Leiterplatten-Schraubklemmen Phoenix **MPT 0,5** (Raster 2,54 mm, max. 0,5 mm², 6 A / 160 V).

| Stecker | Polzahl | Artikel (Beispiel) | Footprint (KiCad) |
|---------|---------|--------------------|-------------------|
| J3 (IO), J4 (GND) | 8-pol | **1725711** MPT 0,5/8-2,54 | `TerminalBlock_Phoenix_MPT-0,5-8-2.54_…` |
| J1 Batterie | 2-pol | MPT 0,5/2-2,54 | `…MPT-0,5-2-2.54_…` |
| J2 Lautsprecher | 2-pol | MPT 0,5/2-2,54 | dito |
| J6 Taster-LEDs | 2-pol | MPT 0,5/2-2,54 | dito |

**Hinweis:** „0,5“ = Aderquerschnitt, nicht Pitch. Routing nach Footprint-Wechsel manuell.

---

## E-RESPIN-01 — Adversarial-Review-Fixes F-01…F-05 (02.08.2026)

**Status:** gültig (Working-PCB + Schaltplan Rev 2.4r)

| ID | Änderung | Bauteile / Netze |
|----|----------|------------------|
| F-01 | 12-V-Domain von DY-SV17F-IOs trennen | **D15–D22**: A=IOx_M (U2), K=IOx (J3); D1–D8 bleiben für Latch-OR |
| F-02 | TPS62163 VOS direkt | **R5 → 0 Ω** (5V↔VOS) |
| F-03 | BUSY/Kaltstart-Blanking | **R13 100 kΩ** BUSY→**Q3_GATE**; **C4 4,7 µF** Q3_GATE→GND |
| F-04 | LED-Strombegrenzung | **R12 10 Ω**; Netz **12V_LED** → J6 |
| F-05 | SPK-Leiterbahnen | Hauptpfad **0,8 mm**; Stubs ≥ **0,4 mm** |

**Konsequenz:** Modul-IOs nur über Serie-Diode an Feld-IOx; Latch-SET weiter über D1–D8/BTN_OR. F-03 Oszi am Proto **empfohlen**, nicht blockierend.

**Referenz:** `docs/adversarial_review_v24.md`, `hardware/apply_f01_f05.py`

---

## E-RESPIN-02 — Restrisiko F-06…F-09 (03.08.2026)

**Status:** gültig — **bewusst akzeptiert**, keine PCB-Änderung

| ID | Disposition |
|----|-------------|
| **F-06** | Tasterleitungen **≤ 30 cm im Schrank** — kein praktisches ESD-Risiko im Feld |
| **F-07** | SI2301 VDS 20 V vs. SMAJ15A ~24 V — Batteriebetrieb, kein Jumpstart |
| **F-08** | Hauptpfad 12V 0,5–0,7 mm ausreichend; 0,2 mm nur Pad-Stubs / Latch-Zweig |
| **F-09** | IBN-Regel: USB nur bei **abgezogenem Modul** oder **Latch aus** |

**Referenz:** `docs/adversarial_review_v24.md` Dispositionstabelle
