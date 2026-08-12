# Lastenheft: Vogelstimmenkasten (Rev 2)

## 1. Projektbezeichnung

Neubau der Elektronik eines Vogelstimmenkastens für den Waldlehrpfad der Kolpingfamilie.

## 2. Ausgangssituation

Auf dem Waldlehrpfad befindet sich ein Vogelstimmenkasten, an dem Besucher per Knopfdruck verschiedene Vogelstimmen anhören können. Der vorhandene Kasten ist technisch veraltet und defekt. Das Gehäuse, die acht Taster und der Lautsprecher sind weiterhin verwendbar.

### Bestandskomponenten

| Komponente | Zustand | Weiterverwendung |
|------------|---------|------------------|
| Gehäuse (Holz/Metall) | intakt | ja |
| 8 Taster | intakt | ja, Einzelleitungen (je 2 Adern pro Taster) |
| 2 Lautsprecher (je ca. 2W) | zu prüfen | 1 Lautsprecher genügt, ggf. neuen kaufen |
| Verkabelung Taster | zu prüfen | ggf. neu verlegen |
| 12V Autobatterie (~30 Ah) | vorhanden | ja |

### Lessons Learned aus Rev 1

| # | Fehler in Rev 1 | Maßnahme Rev 2 |
|---|-----------------|----------------|
| 1 | U4 (TPS62203) und U5 (SGM809) verbrannt — nur bis 6V spezifiziert, aber an 12V angeschlossen | Buck-Converter mit VIN bis 17V (TPS62160); UVLO per Spannungsteiler statt separatem IC |
| 2 | WT588D-16P als Standalone-Chip nicht beschaffbar, WT588DM02 (28-Pin) abgekündigt | DY-SV17F Modul: 8 IO-Trigger, USB Drag&Drop, 5W Amp eingebaut, überall verfügbar |
| 3 | U2 Footprint falsch (SOIC-8 208mil statt 150mil) | Footprint-Verifikation gegen Datenblatt vor Layout (M01) |
| 4 | Keine Montagelöcher auf der Platine | 4x M3 Montagelöcher vorsehen |
| 5 | Bauteilbeschaffbarkeit nicht vorab geprüft | Alle Bauteile bei LCSC/JLCPCB verifizieren vor Layout (M01) |

## 3. Projektziel

Entwicklung einer robusten, energieeffizienten Elektronik, die dauerhaft im Außenbereich betrieben werden kann und Besuchern zuverlässig verschiedene Vogelstimmen wiedergibt.

## 4. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F01 | 8 externe Taster anschließbar (Einzelleitungen, je 2 Adern) | Muss |
| F02 | Jeder Taster startet eine fest zugeordnete Vogelstimme | Muss |
| F03 | Wiedergabebeginn innerhalb 0,5 Sekunden nach Tastendruck | Muss |
| F04 | Jede Tonsequenz dauert ca. 10 Sekunden | Muss |
| F05 | Lautstärke: im Umkreis von 2–3 m gut wahrnehmbar (3W Class-D Verstärker) | Muss |
| F06 | Vogelstimmen austauschbar per USB (Drag & Drop, Modul wird als USB-Stick erkannt) | Muss |
| F07 | Tastendruck während Wiedergabe bricht aktuelle Stimme ab und startet neue | Muss |
| F08 | Keine gleichzeitige Wiedergabe mehrerer Stimmen | Muss |
| F09 | Ein einzelner Lautsprecher wird angesteuert (Mono) | Muss |
| F10 | Elektromechanischer Impulszähler (Printzähler auf PCB) zählt jede Wiedergabe-Session (Aufweck-Event) | Muss |
| F11 | Taster-LEDs (6–24V) leuchten während Wiedergabe — alle LEDs gemeinsam über Latch-12V gespeist | Wunsch |

## 5. Anforderungen an den Energieverbrauch

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| E01 | Betrieb über 12V-Autobatterie (Bleiakku, ~30 Ah) | Muss |
| E02 | Ruhestrom unter 100 µA (Ziel ≈0 µA via Latch; siehe E-LATCH-01/02) | Muss |
| E03 | Batterielebensdauer mindestens 1 Jahr ohne Laden (Real case: 12 V-Autobatterie ~30 Ah; Analyse `traceability.md`) | Muss |
| E04 | Aufwachen aus Ruhezustand per Tastendruck (Latch-Schaltung schaltet Modul ein) | Muss |
| E05 | Automatischer Übergang in Ruhezustand nach Wiedergabe-Ende (BUSY-Pin steuert Latch-Abschaltung) | Muss |
| E06 | Audio-Verstärker ist im Modul integriert (DY-SV17F, 5W Class-D) — kein separater PAM8403 nötig | Muss |

## 6. Einsatzbedingungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| U01 | Betriebstemperatur: -10 °C bis +60 °C | Muss |
| U02 | Hohe Luftfeuchtigkeit / Kondenswasser tolerieren | Muss |
| U03 | Wartungsfreier Betrieb über mindestens 1 Jahr | Muss |
| U04 | Keine beweglichen Teile (keine SD-Karte im Normalbetrieb) | Muss |
| U05 | Keine externe Netzversorgung erforderlich | Muss |

## 7. Hardware-Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| H01 | Elektromechanischer Impulszähler (Printzähler, 12 V DC, 6-stellig, von oben ablesbar) direkt auf der Platine; Ansteuerung per One-Shot an 12V_SW | Muss |
| H02 | Alle SMD-Bauteile werden vom Platinen-Lieferanten (JLCPCB) bestückt — kein manuelles SMD-Löten | Muss |
| H03 | Manuell bestückt werden nur: THT-Schraubklemmen (MPT), DY-SV17F-Modul, Printzähler | Muss |
| H04 | 4x M3 Montagelöcher in den Ecken der Platine | Muss |
| H05 | Testpunkte für: 12V (geschützt), 5V, GND, BUSY, Audio | Soll |
| H06 | Zähler von oben ablesbar (Hengstler 0.635.128; Sichtfenster im Gehäuse) | Muss |
| H07 | Gate-Source-Schutz der P-FETs Q5/Q1: Zener 6,2 V (BZX84C6V2) + Serie-Widerstand, weil SI2301 VGS max ±8 V | Muss |

## 8. Methodik-Anforderungen (Prozess)

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| M01 | Bauteilbeschaffbarkeit (LCSC-Verfügbarkeit, korrekter Footprint, JLCPCB DFM-Prüfung) muss VOR dem PCB-Layout vollständig verifiziert und dokumentiert sein | Muss |
| M02 | Jeder IC muss vor Schaltplan-Abschluss eine dokumentierte Spannungsprüfung haben (anliegende Spannung vs. Datenblatt-Maximum) | Muss |
| M03 | LTspice-Simulation der Stromversorgung vor Fertigung | Muss |
| M04 | Review-Checkliste muss vor Bestellung vollständig abgearbeitet sein | Muss |

## 9. Schnittstellen

| Schnittstelle | Beschreibung | Steckverbinder |
|---------------|--------------|----------------|
| Taster (8×) | Einzelleitungen (2 Adern pro Taster), Schließer gegen GND | 2× 8-pol Schraubklemme Phoenix MPT 0,5/8-2,54 (J3/J4) |
| Lautsprecher (1×) | Mono, ca. 2–3 W, 4–8 Ω, BTL-Ausgang | 2-pol Schraubklemme MPT 0,5/2-2,54 (J2) |
| Stromversorgung | 12V Autobatterie (Bleiakku), verpolungsgeschützt | 2-pol Schraubklemme MPT 0,5/2-2,54 (J1) |
| Taster-LEDs | parallel an **12V_LED** (via **R12 10 Ω** von 12V_SW) | 2-pol Schraubklemme MPT 0,5/2-2,54 (J6) |
| Impulszähler | 12V DC Printzähler Hengstler 0.635.128, One-Shot an 12V_SW | 4 Lötpins (Footprint CNT_HENGSTLER_635) |
| Audio-Upload | USB Micro am DY-SV17F — Drag & Drop wie USB-Stick (kein Programmer nötig) | Micro-USB-Buchse am Modul |

## 10. Qualitätsanforderungen

- Alle Bauteile für Temperaturbereich -10 °C bis +60 °C spezifiziert
- Leiterplatte mit Schutzlackierung (Conformal Coating) empfohlen
- TVS-Diode (SMAJ15A) am Batterie-Eingang als Überspannungsschutz
- Verpolungsschutz an der Batterie-Eingangsklemme (P-MOSFET SI2301 **mit VGS-Zener D11**)
- Latch-Leistungsschalter Q1 ebenfalls mit VGS-Zener D12
- Tiefentladeschutz: bewusst entfallen (0 µA-Standby; internes UVLO des Buck reicht als Notfall)

## 11. Abnahmekriterien

1. Alle 8 Taster lösen korrekt die zugeordnete Vogelstimme aus
2. Wiedergabe startet innerhalb 500 ms nach Tastendruck
3. Ruhestrom unter 100 µA (gemessen an der Batterie)
4. Wiedergabelautstärke in 2 m Abstand gut wahrnehmbar
5. Funktion bei -10 °C und +60 °C nachgewiesen
6. 1000 Betätigungszyklen ohne Fehler
7. Tastendruck während Wiedergabe wechselt korrekt zur neuen Stimme
8. Impulszähler auf PCB zählt bei jedem Tastendruck zuverlässig hoch

## 12. Offene Punkte (zu prüfen vor Hardware-Design)

| # | Offener Punkt | Auswirkung auf Design |
|---|---------------|----------------------|
| O1 | Impedanz der vorhandenen Lautsprecher messen (4 Ω oder 8 Ω?) | Verstärker-Dimensionierung, ggf. neuen Lautsprecher kaufen |
| O2 | Verfügbarer Einbauraum im Gehäuse ausmessen (L × B × H) | Maximale Platinengröße |
| O3 | Batterietyp identifizieren (Nass/Gel/AGM?) und Kapazität ablesen | Spannungsbereich |
| O4 | Gehäuse-Dichtigkeit beurteilen: dringt Feuchtigkeit ein? | Notwendigkeit von Conformal Coating / Verguss |
| O5 | Kabellänge von Tastern zur Platine messen | Entprellung |
| O6 | Vorhandene Befestigungspunkte / Montagelöcher im Gehäuse | Platinenform und Befestigung |
| O7 | Position für Zähler-Sichtfenster im Gehäuse klären | PCB-Ausrichtung |

## 13. Projektfortschritt (Stand 01.08.2026)

| Meilenstein | Status |
|-------------|--------|
| Lastenheft Rev 2 (dieses Dokument) | **erledigt** |
| Systemarchitektur (BDD/IBD) | **erledigt** (`docs/systemarchitektur.md`) |
| Bauteilbeschaffbarkeit verifizieren (M01) | **erledigt** (`bom_verfuegbarkeit.md`) |
| Schaltplan KiCad Rev 2 (ERC 0 Fehler) | **erledigt** (1 Warnung SET_DRV optional) |
| PCB Rev 2.4 Routing / DRC 0 Fehler | **erledigt** (1 Footprint-Warnung U2) |
| HTML-Platinen-Simulation | **erledigt** (`simulation/`) |
| LTspice-Simulation Stromversorgung (M03) | optional — Reviewer entscheidet (G4 in M04) |
| Review-Checkliste (M04) | **Vorlage bereit** — Signatur ausstehend (`review_checkliste_m04.md`) |
| JLCPCB-Bestellung | nach M04-Freigabe |
| DY-SV17F bestücken & Audio laden | ausstehend |

Details: [zwischenstand.md](zwischenstand.md) · Traceability: [traceability.md](traceability.md)
