# Designentscheidungen — Vogelstimmenkasten

Versionierte Architektur- und Schaltungsentscheidungen (ADR). Ältere Einträge bleiben stehen (Historie).

**Aktuell Rev 3.0:** Zähler, 0603 und BOM-Gate stehen in [`hardware/V3.0/docs/entscheidungen_v30.md`](../hardware/V3.0/docs/entscheidungen_v30.md). Latch, VGS, Audio, Buck, USB und Respin in **diesem** Dokument bleiben gültig.

**Lesart:** Jeder Eintrag hat Kontext → Entscheidung → verworfene Alternativen → Konsequenz. IDs `E-…` sind stabil; Architektur-Kurzcodes `D1…D9` in `systemarchitektur.md` verweisen hierher.

---

## Inhaltsverzeichnis

| ID | Thema | Status |
|----|--------|--------|
| [E-AUDIO-01](#e-audio-01--dy-sv17f-statt-wt588d--kein-mcu) | DY-SV17F statt WT588D, kein MCU | gültig |
| [E-AUDIO-02](#e-audio-02--mode-0-flanke-statt-mode-1-pegel) | Mode 0 (Flanke) | gültig |
| [E-AUDIO-03](#e-audio-03--con2--v33-nicht-5-v) | CON2 = V33, nicht 5 V | gültig |
| [E-AUDIO-04](#e-audio-04--u2-immer-sockel-usb-nur-werkstatt) | U2-Sockel Pflicht; USB nur Werkstatt | gültig |
| [E-LATCH-01](#e-latch-01--hardware-latch-für-0-µa-ruhestrom) | Hardware-Latch, ≈0 µA Idle | gültig |
| [E-LATCH-02](#e-latch-02--kaltstart-set-mit-p-fet-v24-nicht-n-fet-inverter) | Kaltstart-SET mit P-FET Q6 | gültig |
| [E-RPP-01](#e-rpp-01--r6--470-kω-für-idle--100-µa) | R6 = 470 kΩ | gültig |
| [E-VGS-01](#e-vgs-01--zener-clamp-an-si2301-q5-q1-q6) | VGS-Clamp 6,2 V | gültig |
| [E-BUCK-01](#e-buck-01--tps62163-5-v-nur-für-u2) | Buck 5 V nur für U2 | gültig |
| [E-UVLO-01](#e-uvlo-01--kein-unterspannungsschutz-ic--kein-teiler-am-en) | Kein UVLO-IC / kein EN-Teiler | gültig |
| [E-SPK-01](#e-spk-01--lautsprecher-btl-keine-seite-an-gnd) | Lautsprecher BTL | gültig |
| [E-LED-01](#e-led-01--alle-taster-leds-gemeinsam-an-12v_sw) | LEDs gemeinsam an 12V_SW | gültig |
| [E-CNT-01](#e-cnt-01--kübler-k0790-bestellnummer) | Kübler K07 | **superseded** → v30 E-CNT-02…04 |
| [E-CONN-01](#e-conn-01--phoenix-mpt-05-schraubklemmen-statt-stiftleisten) | Phoenix MPT 0,5 | gültig |
| [E-RESPIN-01](#e-respin-01--adversarial-review-fixes-f-01f-05-02082026) | F-01…F-05 | gültig |
| [E-RESPIN-02](#e-respin-02--restrisiko-f-06f-09-03082026) | F-06…F-09 akzeptiert | gültig |

---

## E-AUDIO-01 — DY-SV17F statt WT588D / kein MCU

**Datum:** Rev-2 Architektur (28.07.2026)  
**Status:** gültig  
**Architektur:** D1, D2, D4  
**Anforderungen:** F01–F09, F06, E06, U04

### Kontext / Problem

Rev 1 plante den WT588D-16P plus Programmer. Der Standalone-Chip war nicht beschaffbar, das Modul WT588DM02 abgekündigt. Ein eigener Mikrocontroller (ATtiny o. ä.) würde Firmware, Sleep-Strom und ein zweites Programmierwerkzeug bedeuten — für acht feste Taster-zu-Datei-Zuordnungen unnötig.

### Entscheidung

Fertigmodul **DY-SV17F** (I/O-Stand-alone): acht Trigger-Eingänge, integrierter Class-D-Verstärker (~5 W), Audio per USB-Stick-Emulation (Drag & Drop, Dateien `00001`…`00008`). **Kein MCU** auf der Platine.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| WT588D-16P / WT588DM02 | nicht bzw. nicht mehr beschaffbar (Rev-1-Lesson) |
| Adafruit Audio FX | Idle ~35 mA — mit Latch machbar, aber teurer, USB-Workflow anders, 8 Trigger nicht so direkt |
| MCU + DAC/Codec + PAM8403 | Firmware, Sleep-Design, extra Verstärker; verletzt E06 und U04-Geist (keine SD im Betrieb) |
| Soft-Start / 74HC125 / ATtiny nur als IO-Puffer (D4) | extra Bauteile; kurzer Druck &lt; 30 ms ohne Sound ist akzeptabel |

### Konsequenz

- 5 V nur für dieses Modul ([E-BUCK-01](#e-buck-01--tps62163-5-v-nur-für-u2)).
- I/O-Pegel max. 3,3 V → CON2 an V33 ([E-AUDIO-03](#e-audio-03--con2--v33-nicht-5-v)).
- Latch muss das ganze Modul hart abschalten, weil der IO-Modus **keinen** Sleep mit µA-Ruhestrom hat ([E-LATCH-01](#e-latch-01--hardware-latch-für-0-µa-ruhestrom)).

**Bauteile:** U2. **Siehe:** `docs/systemarchitektur.md` D1–D4, `docs/anforderungen.md` Lesson 2, Modulhandbuch `docs/datasheets/DY-SV17F.pdf`.

---

## E-AUDIO-02 — Mode 0 (Flanke) statt Mode 1 (Pegel)

**Datum:** Rev-2 Architektur  
**Status:** gültig  
**Architektur:** D3

### Kontext / Problem

Besucher drücken kurz. Die Sequenz dauert ~10 s (F04). Retrigger soll die laufende Stimme ersetzen (F07), nie zwei Stimmen gleichzeitig (F08).

### Entscheidung

DY-SV17F **I/O Mode 0** (Falling-Edge, Active-Low):

| Pin | Verbindung | Bedeutung |
|-----|------------|-----------|
| CON1 (Pad 10) | GND | Mode-Bit 0 |
| CON2 (Pad 11) | **V33** | Mode-Bit 1 — siehe E-AUDIO-03 |
| CON3 (Pad 12) | R3 10 kΩ nach GND, danach BUSY-Ausgang | Mode-Bit 2 + Busy nach Boot |

Ein kurzer Tastendruck erzeugt die Flanke; das Modul spielt die Datei zu Ende, auch wenn der Finger längst weg ist. BUSY geht während Play auf LOW und am Ende auf HIGH → Latch-Release.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Mode 1 (Pegel) | Taster müsste die ganzen ~10 s gehalten werden — unbrauchbar am Lehrpfad |
| MCU-getriggerte Serial/UART-Steuerung | Firmware, extra Bauteile |

### Konsequenz

- Kaltstart-Race: Flanke kann vor Modul-Boot kommen → Blanking F-03 ([E-RESPIN-01](#e-respin-01--adversarial-review-fixes-f-01f-05-02082026)).
- Sehr kurzer Druck (&lt; ~30 ms CON3-Fenster) kann ohne Sound bleiben — bewusst akzeptiert (D4).
- Zähler zählt **Sessions** (Latch-ON), nicht jeden Retrigger, weil BUSY bei Stimmenwechsel nicht neu pulsiert ([E-CNT-03](../hardware/V3.0/docs/entscheidungen_v30.md)).

**Bauteile / Netze:** CON1…3, R3, IOx, BUSY. **Siehe:** `hardware/V3.0/docs/schaltplan.md` B4.

---

## E-AUDIO-03 — CON2 = V33, nicht 5 V

**Datum:** Schaltplan Rev 2 / 3.0  
**Status:** gültig

### Kontext / Problem

Mode-Bits CON1…3 sind Logik-Eingänge. Manche Web-Pinouts (Electropeak u. a.) zeichnen CON2 an 5 V. Das Modulhandbuch und die IO-AbsMax sagen: High-Pegel **max. 3,3 V**.

### Entscheidung

CON2 an den Modul-Ausgang **V33** (interner 3,3 V-Regler), nicht an die 5 V-Rail. CON1 an GND, CON3 über R3 nach GND.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| CON2 an 5 V | VIH/AbsMax verletzt — dauerhaft oder sporadisch Modulschaden |
| CON2 über Teiler von 5 V | extra Bauteile; V33 ist genau der vorgesehene High-Pegel |

### Konsequenz

V33 darf **nicht** als Versorgung für andere Baugruppen genutzt werden (Modul-PDF: begrenzt, typ. ≤ 80 mA, nur intern). Nur Mode-Pin.

**Siehe:** DY-SV17F-Handbuch; Twin-Hinweis zur Steckrichtung (USB zur Platinenmitte / Silk `USB`).

---

## E-AUDIO-04 — U2 immer Sockel; USB nur Werkstatt

**Datum:** 14.08.2026 (festgehalten; F-09 seit 03.08.2026)  
**Status:** gültig  
**Klärt:** F-09 / H03 / F06

### Kontext / Problem

Das Modul hat Micro-USB. USB speist das Modul intern. Liegt gleichzeitig Board-5 V vom Buck an, sitzen zwei Quellen auf derselben Schiene (Backfeed in den TPS62163-Ausgang). Stimmen sollen tauschbar bleiben (F06), aber **nicht** im Wald durch ein Gehäuseloch.

### Entscheidung

1. **U2 immer auf Sockel** (2×9, Raster des Moduls) — nicht direkt auflöten. Tausch und USB ohne Entlöten.
2. **USB nur in der Werkstatt:** Gehäuse auf, Latch aus (kein `12V_SW` / kein Board-5 V). Im Wald **kein** USB-Zugang, kein Gehäuseloch.
3. Alternativ: Modul vom Sockel nehmen und am Schreibtisch laden.

Die PCB-Lage (USB zur Platinenmitte, erreichbar bei offenem Deckel) bleibt; sie dient der Werkstatt, nicht dem Feld.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Modul hart auflöten | Tausch/USB nur mit Löten; F-09 schwerer einzuhalten |
| USB-Loch im Gehäuse, Latch aus | Feldzugriff, Feuchte, mutwilliges Ziehen |
| USB bei eingelegter Batterie / Latch an | Backfeed F-09; extra Schottky/Lastschalter nötig |
| Ideal-Diode / USB-Power-Mux auf der PCB | Bauteil- und Layout-Aufwand für seltenen Werkstattfall |

### Konsequenz

Montage: Sockel ist **Pflicht**, nicht optional. IBN und Use-Case UC-04: USB nur bei Latch aus oder Modul abgezogen.

**Bauteile:** U2-Sockel. **Siehe:** `docs/use_cases.md` UC-04, `docs/adversarial_review_v24.md` F-09, `docs/pbs_icd.md` IF-USB.

---

## E-LATCH-01 — Hardware-Latch für ≈0 µA Ruhestrom

**Datum:** Rev-2 Architektur  
**Status:** gültig  
**Architektur:** D2, D8  
**Anforderungen:** E02, E04, E05

### Kontext / Problem

Bleiakku 12 V, Standzeit ≥ 1 Jahr (E03). Das DY-SV17F zieht im IO-Modus **keinen** Sleep-Strom im µA-Bereich (Idle-Modul allein schon ~14 mA). Ein MCU-Sleep würde Firmware und immer noch Quiescent des Audio-Pfads brauchen.

### Entscheidung

Komplette Abschaltung von Buck + Modul + LEDs + Zähler-Spule über **P-FET-Latch Q1** auf der **12 V-Schiene** (`12V_SW`), nicht nur Buck-EN:

- **SET:** Taster → Dioden-OR → Q6 → `LATCH_SET` (Details [E-LATCH-02](#e-latch-02--kaltstart-set-mit-p-fet-v24-nicht-n-fet-inverter)).
- **HOLD:** R4 von `12V_SW` hält den Latch, solange Q3 nicht zieht.
- **RELEASE:** BUSY HIGH → Q3 zieht `LATCH_SET` auf GND → Q1 aus.

Kein MCU. Kein Quiescent des Audio-Moduls im Idle.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Software-Sleep im DY-SV17F | im IO-Modus nicht nutzbar; Idle-mA |
| Nur Buck-EN schalten, 12 V immer an | LEDs bräuchten extra 12 V-Schalter; kein True-Zero auf der Lastschiene |
| MCU weckt per Interrupt | Firmware, Quiescent, extra Stromschiene |

### Konsequenz

Im Idle liegt nur `12V_PROT` an (Schutz, TVS, C1, Gate-Netz R6). `12V_SW` und `5V` sind tot → Ruhestrom ≈ Leckage + R6 (~12 µA, [E-RPP-01](#e-rpp-01--r6--470-kω-für-idle--100-µa)).

**Bauteile / Netze:** Q1, Q2, Q3, R1–R4, `12V_SW`, `LATCH_SET`, `LATCH_GATE`. **Siehe:** `docs/schaltplan.md` / `hardware/V3.0/docs/schaltplan.md` B2.

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

**PCB:** Historie `vogelstimmen_v2.4.kicad_pcb`; aktuell `hardware/V3.0/`.  
**Siehe:** `docs/pcb_v2.4.md`, `hardware/V3.0/docs/schaltplan.md` B2, `docs/digitaler_zwilling.md`

---

## E-RPP-01 — R6 = 470 kΩ für Idle &lt; 100 µA

**Datum:** 31.07.2026  
**Status:** gültig  

**Problem:** R6 = 10 kΩ am Verpolungs-Gate (Q5) zog ~580 µA Dauerstrom → E02 verletzt, obwohl Latch ≈0 µA.

**Entscheidung:** R6 = **470 kΩ** → Idle ≈ **12 µA** (+ Leckage). Latch unverändert. Q5 bleibt im Normalbetrieb voll durchgesteuert (VGS über Zener auf −6,2 V, [E-VGS-01](#e-vgs-01--zener-clamp-an-si2301-q5-q1-q6)).

**Trade-off:** Q5 schaltet beim Batterieanschluss etwas träger — irrelevant (einmalig, nicht im Tasterpfad).

**Verworfen:** R6 = 100 kΩ (~120 µA, knapp über E02); R6 weglassen (Gate floatet).

---

## E-VGS-01 — Zener-Clamp an SI2301 (Q5, Q1, Q6)

**Datum:** Rev 2 (H07)  
**Status:** gültig  
**Anforderung:** H07

### Kontext / Problem

Q5 (Verpolung), Q1 (Latch-Lastschalter) und Q6 (Kaltstart-SET) sind **SI2301CDS**, VGS abs. max. **±8 V**. Ohne Clamp würde das Gate bei Source = 12 V und Gate nach GND auf **−12 V** gehen → spezifikationswidrig, Gate-Oxyd-Risiko.

### Entscheidung

An jedem der drei P-FETs: **BZX84C6V2** (6,2 V) Kathode an Source, Anode an Gate, plus **4,7 kΩ Serie** im Gate-Zweig.

| FET | Zener | Serie |
|-----|-------|-------|
| Q5 | D11 | R7 4,7 kΩ |
| Q1 | D12 | R8 4,7 kΩ |
| Q6 | D14 | R11 4,7 kΩ |

LCSC **C179522** (Basic). 6,2 V liegt **unter** 8 V (Reserve ~1,8 V inkl. Zener-Toleranz) und **über** der üblichen Rds(on)-Angabe des SI2301 (typ. spezifiziert bei VGS = −4,5 V) → FET bleibt voll ein.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Kein Clamp | −12 V am Gate, AbsMax verletzt |
| BZX84C5V1 | ginge elektrisch (noch über −4,5 V); 6,2 V ist das gewählte Basic-Teil und lässt mehr Enhancement |
| BZX84C7V5 | zu nah an ±8 V (Toleranz/Temperatur) |
| 12 V-tauglicher P-FET mit VGS ±20 V | anderes Footprint/BOM; Clamp ist billiger und hält SI2301 (JLCPCB Basic) |

### Konsequenz

Drei gleiche Klemmen — Q6 nicht vergessen (Kaltstart-Pfad). Polarität Silk: K = Source-Seite.

**Siehe:** SI2301-Datenblatt, `docs/anforderungen.md` H07.

---

## E-BUCK-01 — TPS62163, 5 V nur für U2

**Datum:** Rev-2 Architektur  
**Status:** gültig  
**Architektur:** D5, D8

### Kontext / Problem

Das Audio-Modul braucht 5 V. Die Batterie ist 12 V. Rev 1 hatte TPS62203 (VIN max. 6 V) an 12 V gelegt — tot. Der Zähler darf **nicht** von derselben 5 V-Rail abhängen, die erst nach Buck-Soft-Start steht ([E-CNT-04](../hardware/V3.0/docs/entscheidungen_v30.md)).

### Entscheidung

**TPS62163** (fest 5 V, VIN bis 17 V, WSON-8, LCSC C97534):

- VIN und EN an **`12V_SW`** (Latch schaltet den Buck hart mit ab).
- VOUT **nur** U2 (DY-SV17F).
- VOS über R5 = **0 Ω** direkt an 5 V (F-02).
- L1 2,2 µH, C2/C3 nach TI-Datenblatt.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| LDO 12 V→5 V | Verlustwärme bei Audio-Peaks (Volt × Ampere); Outdoor-Gehäuse |
| TPS62203 / ähnliche 6 V-Teile | Rev-1-Totalschaden |
| Dual-Rail 3,3 V + 5 V | unnötig; Modul macht V33 intern |
| Buck immer an, nur EN-Logik | Idle-Iq des Buck (typ. 17 µA) plus immer 12 V an LEDs/Zähler-Pfad; widerspricht True-Zero |
| 5 V auch für den Zähler | Soft-Start-Race, siehe E-CNT-04 |

### Konsequenz

U1 speist **niemals** den Hengstler. EN hängt **nicht** an einem UVLO-Teiler ([E-UVLO-01](#e-uvlo-01--kein-unterspannungsschutz-ic--kein-teiler-am-en)).

**Bauteile:** U1, L1, C2, C3, R5. **Siehe:** TI SLVSAM2, `hardware/V3.0/docs/schaltplan.md` B3.

---

## E-UVLO-01 — Kein Unterspannungsschutz-IC / kein Teiler am EN

**Datum:** 14.08.2026 (Absicht seit Rev 2; Architektur-D9 damit **ersetzt**)  
**Status:** gültig  
**Ersetzt:** `systemarchitektur.md` D9 / offenen Punkt S6 (UVLO-Teiler 10,5 V)

### Kontext / Problem

Rev 1: Supervisor **SGM809** (bis 6 V) an 12 V — verbrannt. Die Architektur-Tabelle D9 plante danach einen Spannungsteiler an Buck-EN (Schwelle ~10,5 V), „kein extra IC“. Im Schaltplan Rev 2.4 / 3.0 hängt EN **direkt** an `12V_SW`.

### Entscheidung

**Kein** UVLO-IC, **kein** Teiler an EN. Tiefentladeschutz entfällt bewusst:

- Latch aus → Verbrauch ~12 µA. Eine leere Batterie wird nicht durch Elektronik-Idle geleert.
- Ist die Batterie so weit unten, dass Modul/Buck nicht mehr sauber starten, „stirbt“ die Box von selbst — akzeptabel für den Lehrpfad (nächste Wartung = Batterietausch).
- Internes UVLO des TPS62163 bleibt als Notfall (IC schützt sich), ist aber **kein** spezifizierter 10,5 V-Bleiakku-Schutz.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| SGM809 / Supervisor-IC an 12 V | Rev-1-Schaden; extra Iq |
| Widerstandsteiler an Buck-EN | extra Idle-Pfad oder komplexes Abschalten; EN folgt bereits dem Latch; Schwelle 10,5 V nie dimensioniert |
| Separater 12 V-Komparator | Bauteile, Ruhestrom, kein Nutzen bei ~12 µA Idle |

### Konsequenz

Lastenheft §10 bleibt: „Tiefentladeschutz bewusst entfallen“. D9 in der Architektur-Kurzliste ist historisch; **diese ADR gilt**.

**Siehe:** `docs/anforderungen.md` Lesson 1 und §10, `docs/systemarchitektur.md` B3 (EN=12V_SW).

---

## E-SPK-01 — Lautsprecher BTL, keine Seite an GND

**Datum:** Rev-2 Schaltplan  
**Status:** gültig  
**Anforderungen:** F05, F09

### Kontext / Problem

Der DY-SV17F treibt den Lautsprecher **brückengekoppelt** (BTL, Class-D). Beide Adern sind aktiv. Wer SPK− an Gehäuse-GND legt, schließt einen Halbbrücken-Ausgang kurz.

### Entscheidung

J2 nur **SPK+** und **SPK−**. Keine Verbindung zu GND. Ein Mono-Lautsprecher 4–8 Ω. Leiterbahnen Hauptpfad 0,8 mm (F-05).

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Ein Leiter an GND (Single-ended) | Ausgang kurz, Verstärker tot |
| Zwei Lautsprecher parallel ohne Prüfung | Bestand hat 2× ~2 W; ein Treiber, ein Chassis reicht (F09) |

### Konsequenz

Montage/ICD: IF-SPK explizit „kein GND an SPK“. Twin und Silk müssen beide Pins als heiß zeigen.

**Siehe:** `docs/pbs_icd.md` IF-SPK, `hardware/V3.0/docs/schaltplan.md` B7.

---

## E-LED-01 — Alle Taster-LEDs gemeinsam an 12V_SW

**Datum:** Rev-2 Architektur  
**Status:** gültig  
**Architektur:** D7  
**Anforderung:** F11 (Wunsch)

### Kontext / Problem

Acht beleuchtete Taster (6–24 V-LEDs im Taster). Einzelansteuerung wäre 8 extra Schalter.

### Entscheidung

Alle LED+ parallel an **`12V_LED`** = `12V_SW` über **R12 = 10 Ω** (F-04). LEDs leuchten **gemeinsam**, solange die Box wach ist — nicht „nur der gedrückte Taster“.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Eine LED-Leitung pro Taster | ~16 extra Bauteile/Klemmen |
| LEDs an 5 V | Taster oft für 12 V-LED ausgelegt; 5 V-Rail nur für U2 |

### Konsequenz

R12 begrenzt Sammelstrom / Kurzschluss etwas; Temperatur im Betrieb messen (F-04). Kein Einzelleuchten.

**Bauteile / Netze:** R12, J6, `12V_LED`.

---

## E-CNT-01 — Kübler K07.90 Bestellnummer

**Status:** superseded (Rev 3.0) — siehe [`hardware/V3.0/docs/entscheidungen_v30.md`](../hardware/V3.0/docs/entscheidungen_v30.md) (E-CNT-02…04: Hengstler 0.635.128 + One-Shot)

Historie (Rev 2.5): Typ K07.90 liegend, Bestellnr. **1.130.900.008** (4,5 V DC / 10 Hz) an der 5 V-Rail. Datenblatt Typ 0: −10 % / +20 % → 4,05…5,4 V; 5,0 V war spec-konform. Trotzdem in Rev 3.0 aufgegeben: Teil **nicht beschaffbar**, und 5 V-Zähler **racen** den Buck-Soft-Start.

---

## E-CONN-01 — Phoenix MPT-0,5 Schraubklemmen statt Stiftleisten

**Datum:** 01.08.2026  
**Status:** gültig  

### Kontext / Problem

Bestand: acht Taster mit **Einzelleitungen** (2 Adern), Feldverkabelung ohne Crimpgehäuse. Stiftleisten + Dupont sind im Outdoor-Schrank unzuverlässig (Vibration, Zug).

### Entscheidung

Leiterplatten-Schraubklemmen Phoenix **MPT 0,5** (Raster 2,54 mm, max. 0,5 mm², 6 A / 160 V). „0,5“ = Aderquerschnitt, nicht Pitch.

| Stecker | Polzahl | Artikel (Beispiel) | Footprint (KiCad) |
|---------|---------|--------------------|-------------------|
| J3 (IO), J4 (GND) | 8-pol | **1725711** MPT 0,5/8-2,54 | `TerminalBlock_Phoenix_MPT-0,5-8-2.54_…` |
| J1 Batterie | 2-pol | MPT 0,5/2-2,54 | `…MPT-0,5-2-2.54_…` |
| J2 Lautsprecher | 2-pol | MPT 0,5/2-2,54 | dito |
| J6 Taster-LEDs | 2-pol | MPT 0,5/2-2,54 | dito |

J3 um 180° gedreht (Kabelabgang nach oben); übrige Klemmen von unten. Netze unverändert.

### Verworfene Alternativen

| Alternative | Warum nicht |
|-------------|-------------|
| Stiftleisten 2,54 | kein Zugentlastung, lose im Feld |
| Wago/Push-in andere Raster | Footprint, Höhe, JLCPCB-Lib |
| Gemeinsame GND-Sammelschiene statt J4 | weniger Klemmen, aber unübersichtliche Adern am Bestandskabel |

**Hinweis:** Routing nach Footprint-Wechsel manuell nachziehen.  
**Siehe:** `docs/pbs_icd.md`, `docs/pcb_v2.4.md`.

---

## E-RESPIN-01 — Adversarial-Review-Fixes F-01…F-05 (02.08.2026)

**Status:** gültig (Working-PCB + Schaltplan ab Rev 2.4r, übernommen in 3.0)

Review: `docs/adversarial_review_v24.md` — zwei Blocker, drei Majors. Alle fünf als Schaltungs-/Layout-Änderung, nicht als „später messen“.

| ID | Problem (kurz) | Änderung | Bauteile / Netze |
|----|----------------|----------|------------------|
| F-01 | 12 V-OR speiste U2-IOs (Phantom, Idle-mA, Latch klebt) | 12 V-Domain von Modul-IOs trennen | **D15–D22**: A=IOx_M (U2), K=IOx (J3); D1–D8 bleiben Latch-OR |
| F-02 | R5=100 kΩ in VOS (TI: VOS direkt an VOUT) | TPS62163 VOS direkt | **R5 → 0 Ω** (5V↔VOS) |
| F-03 | BUSY HIGH vor Play killt Latch; Flanke vor Boot | Blanking ~470 ms | **R13 100 kΩ** BUSY→Q3_GATE; **C4 4,7 µF** Q3_GATE→GND |
| F-04 | J6 = Roh-12 V, LED-Kurzschluss ungebremst | Strombegrenzung | **R12 10 Ω**; Netz **12V_LED** → J6 |
| F-05 | SPK-Bahnen stellenweise 0,2 mm | Class-D-Peaks | Hauptpfad **0,8 mm**; Stubs ≥ **0,4 mm** |

**Konsequenz:** Modul-IOs nur über Serie-Diode an Feld-IOx; Latch-SET weiter über D1–D8/`BTN_OR`. F-03 Oszi am Proto **empfohlen**, nicht blockierend für die Bestellung.

**Referenz:** `docs/adversarial_review_v24.md`, `hardware/apply_f01_f05.py`

---

## E-RESPIN-02 — Restrisiko F-06…F-09 (03.08.2026)

**Status:** gültig — **bewusst akzeptiert**, keine PCB-Änderung

| ID | Disposition | Warum akzeptiert |
|----|-------------|------------------|
| **F-06** | Keine extra IO-TVS an J3 | Tasterleitungen **≤ 30 cm im Schrank**, nicht Meter im Wald. D15–D22 trennen 12 V. |
| **F-07** | SI2301 VDS 20 V vs. SMAJ15A Vc ~24 V | Nur Batterie im Schrank, **kein** Jumpstart/Lichtmaschine. PTC+TVS bleiben Erstlinie. |
| **F-08** | Engstellen 0,2 mm nur Pad-Stubs / Latch-Zweig | Lastpfad 12 V 0,5–0,7 mm; WSON-Stubs &lt;1 mm. |
| **F-09** | Kein USB-Ideal-Diode auf der PCB | IBN: USB nur bei **Latch aus** oder **Modul ab** — jetzt [E-AUDIO-04](#e-audio-04--u2-immer-sockel-usb-nur-werkstatt) (Sockel Pflicht, kein Feld-USB). |

**Referenz:** `docs/adversarial_review_v24.md` Dispositionstabelle

**Nicht entschieden / nicht als ADR geführt:** Conformal Coating bleibt im Lastenheft §10 **empfohlen**, nicht Pflicht. Extra IO-TVS bewusst nicht (F-06).
