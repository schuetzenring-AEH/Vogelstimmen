# Projektstatus: Vogelstimmenkasten

Stand: **5. Juli 2026**

## Kurzüberblick

| Phase | Status |
|-------|--------|
| Anforderungen & Architektur | ✅ abgeschlossen |
| Schaltplan (KiCad) | ✅ abgeschlossen (ERC: 0 Fehler) |
| PCB-Layout (KiCad) | ✅ abgeschlossen (DRC: 0 Fehler) |
| Simulation (LTspice) | ✅ durchgeführt |
| Fertigungsdaten (Gerber/BOM/CPL) | ✅ exportiert |
| JLCPCB-Bestellung | ✅ bestellt (Platine + SMT, 5 Stück) |
| Handlöt-Teile bestellen | ⏳ ausstehend |
| Vogelstimmen laden (WT588D) | ⏳ ausstehend |
| Inbetriebnahme im Gehäuse | ⏳ ausstehend |

---

## Gewählte Architektur

**Option D: WT588D-16P ohne Mikrocontroller**

- Audio: WT588D + W25Q128 SPI-Flash
- Verstärker: PAM8403DR-H (Class-D, Mono über einen Kanal)
- Versorgung: 12 V Bleiakku → TPS62203 → 3,3 V
- Schutz: SI2301 Verpolung, SMAJ15A TVS, PTC-Sicherung 500 mA
- Tiefentladeschutz: SGM809 → Enable TPS62203
- Zähler: Impulszähler über BUSY-Signal + 2N7002

Details: [architekturvergleich.md](architekturvergleich.md)

---

## Was erledigt wurde

### Dokumentation
- [anforderungen.md](anforderungen.md) – Lastenheft
- [architekturvergleich.md](architekturvergleich.md) – Entscheidung Option D
- [bauteilliste.md](bauteilliste.md) – Stückliste inkl. JLCPCB-Teile
- [schaltplan.md](schaltplan.md) – Verbindungsübersicht
- [vogelstimmen-projektdoku.pdf](vogelstimmen-projektdoku.pdf) – **Kompakte Projektdoku (PDF)**

### Hardware (KiCad 8)
- Projekt: `hardware/vogelstimmen.kicad_pro`
- Schaltplan: ~40 Bauteile, Netzlabels, PWR_FLAG
- PCB: 2-Lagen, GND-Flächen F.Cu + B.Cu, Freerouting
- Prüfungen: ERC 0 Fehler, DRC 0 Fehler (nur kosmetische Raster-Warnungen im Schaltplan)

### Simulation (LTspice)
| Datei | Inhalt | Ergebnis |
|-------|--------|----------|
| `simulation/power_supply.cir` | Buck 12 V → 3,3 V | ~3,3 V stabil, Lastsprung OK |
| `simulation/audio_filter.cir` | PWM → RC-Filter → PAM8403 | Filterung funktioniert |
| `simulation/counter_mosfet.cir` | BUSY → 2N7002 → Zählerspule | ~120 mA Impuls OK |

### Audio-Vorbereitung
- `scripts/convert-vogelstimmen.ps1` – Batch-Konvertierung nach 16 kHz Mono WAV
- Anleitung: [wt588d-konfiguration.md](wt588d-konfiguration.md)

### Fertigungsdaten
Ordner: `hardware/Gerber/`

| Datei | Zweck |
|-------|--------|
| `vogelstimmen-jlcpcb.zip` | **Upload-Paket für JLCPCB** (Gerber + BOM + CPL) |
| `vogelstimmen-bom.csv` | Stückliste SMT (JLCPCB-Format) |
| `vogelstimmen-cpl.csv` | Bestückungspositionen |
| `nicht-bestueckt.txt` | Manuell zu löten |

---

## JLCPCB-Bestellung (abgeschlossen)

Bestellt bei jlcpcb.com mit SMT Assembly (Top only).

**Upload-Paket:** `hardware/Gerber/vogelstimmen-jlcpcb.zip`

**Wichtige manuelle Zuordnungen beim Checkout:**
- U3: **PAM8403DR-H C17337** (nicht PAM8302!)
- U4: **TPS62203DBVR C9051**
- U5: **SGM809 C699615** (oder gleichwertig mit Lager)
- D1: **SMAJ15A C23424** oder C113958
- Widerstände/Kondensatoren: „Comment does not match“ → **Confirm**, wenn Wert + 0805 stimmen

### Von JLCPCB bestückt (SMD)

| Ref | Wert | LCSC (bestellt/zugeordnet) |
|-----|------|----------------------------|
| C1–C4, C8 | 10 µF | C440198 |
| C5–C17 | 100 nF | C49678 |
| C18 | 1 µF | C28323 |
| D1 | SMAJ15A | C23424 (alternativ C113958) |
| F1 | 500 mA PTC | C7202014 (F1206) |
| L1 | 10 µH | C76835 |
| Q1 | SI2301CDS | C10487 |
| Q2 | 2N7002 | C8545 |
| R1–R8 | 100 Ω | C17408 |
| R9–R12 | 10 kΩ | C17414 |
| R13 | 1 kΩ | C17513 |
| U2 | W25Q128JV | C97521 |
| U3 | PAM8403DR-H | **C17337** |
| U4 | TPS62203DBVR | **C9051** |
| U5 | SGM809 | C699615 (oder gleichwertiges SOT-23-Teil mit Lager) |

Hinweis: Bei JLCPCB erscheint oft „Comment does not match“ – mit **Confirm** bestätigen, wenn Wert und Gehäuse stimmen.

### Manuell einlöten (nicht JLCPCB)

| Ref | Bauteil | Beschaffung |
|-----|---------|-------------|
| U1 | WT588D-16P + IC-Sockel 16-pol | AliExpress |
| J1 | Stiftleiste 1×2 (Batterie) | Reichelt/Amazon |
| J2 | Stiftleiste 1×2 (Lautsprecher) | Reichelt/Amazon |
| J3 | Stiftleiste 1×10 (8 Taster + GND + 3V3) | Reichelt/Amazon |
| J4 | Stiftleiste 1×4 (Programmierung) | Reichelt/Amazon |
| J5 | Stiftleiste 1×2 (Zähler) | Reichelt/Amazon |

Extern anschließbar: Schraubklemmen, Kabel zum Gehäuse, Impulszähler 12 V.

---

## Nächste Schritte

### Schritt 1 – Warten auf JLCPCB (1–3 Wochen)
- Bestellstatus auf jlcpcb.com verfolgen
- Platine visuell prüfen (Lötstopp, Beschriftung, Bohrungen)

### Schritt 2 – Handlöt-Teile bestellen (parallel möglich)

| Teil | Wo suchen |
|------|-----------|
| WT588D-16P DIP | AliExpress: „WT588D-16P“ |
| IC-Sockel 16-pol | Reichelt, Amazon |
| Stiftleisten 2,54 mm (1×2, 1×4, 1×10) | Reichelt, Amazon |
| Impulszähler 12 V DC, 6-stellig | Amazon: „electromagnetic counter 12V“ |
| Lautsprecher 4–8 Ω, 2–3 W (falls nötig) | Reichelt, Amazon |

### Schritt 3 – Platine fertigstellen
1. Stiftleisten J1–J5 einlöten
2. IC-Sockel + WT588D einstecken (Chip **nicht** direkt löten)
3. Visuelle Prüfung: keine Kurzschlüsse, Polarität D1/F1/Q1

### Schritt 4 – Vogelstimmen vorbereiten
- Vogelstimmen als WAV/MP3 beschaffen (lizenzfrei oder eigene Aufnahmen)
- Konvertieren mit `scripts/convert-vogelstimmen.ps1` → **16 kHz, Mono, 16 Bit**
- Siehe [wt588d-konfiguration.md](wt588d-konfiguration.md)

### Schritt 5 – WT588D programmieren
1. WT588D per USB-Adapter an PC (über J4 / Hersteller-Tool)
2. 8 Sounds laden, Tasten 1–8 zuordnen
3. Key-Trigger-Modus aktivieren
4. In SPI-Flash (W25Q128 auf Platine) speichern

### Schritt 6 – Mechanischer Einbau
- Platine ins Gehäuse (Maße vor Ort prüfen, siehe Lastenheft O3)
- Taster, Lautsprecher, Batterie, Zähler anschließen
- Offene Punkte vor Ort klären: [anforderungen.md](anforderungen.md) Abschnitt 11

### Schritt 7 – Inbetriebnahme & Test
Checkliste (Kurzform):

- [ ] 12 V ohne Kurzschluss (Multimeter)
- [ ] 3,3 V am WT588D messen
- [ ] Jeder Taster → Vogelstimme innerhalb 0,5 s
- [ ] Lautstärke im 2–3 m Umkreis OK
- [ ] Zähler zählt bei jedem Tastendruck
- [ ] Ruhestrom gering (Batterie hält ~1 Jahr)

Ausführliche Checkliste: [inbetriebnahme.md](inbetriebnahme.md)

---

## Offene Punkte vor Ort (Gehäuse)

Aus dem Lastenheft – noch am Kasten prüfen:

| # | Punkt |
|---|--------|
| O1 | Lautsprecher-Impedanz (4 Ω / 8 Ω) |
| O2 | Taster-Verkabelung (gemeinsame Masse?) |
| O3 | Einbauraum / maximale Platinengröße |
| O4 | Batterietyp und Kapazität |
| O5 | Feuchtigkeitsschutz nötig? |
| O6 | Kabellänge Taster → Platine |
| O7 | Befestigungspunkte im Gehäuse |

---

## Projektdateien (Referenz)

```
Vogelstimmen/
├── docs/           ← Dokumentation
├── hardware/       ← KiCad + Gerber
├── simulation/     ← LTspice (.cir)
└── README.md
```

Keine Firmware nötig (WT588D-Architektur).
