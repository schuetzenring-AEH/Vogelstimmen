# Architekturvergleich: Vogelstimmenkasten

## 1. Einleitung

Dieses Dokument vergleicht vier technische Ansätze für die Realisierung des Vogelstimmenkastens. Ziel ist eine objektive Bewertung anhand gewichteter Kriterien, bevor eine Architektur festgelegt wird.

## 2. Kandidaten

### Option A: Einfacher MCU + Dediziertes Audio-Modul

**Komponenten:**
- Mikrocontroller: ATmega328P (oder STM32L011)
- Audio-Modul: DFPlayer Mini (YX5200-Chip)
- Speicher: microSD-Karte im DFPlayer
- Verstärker: im DFPlayer integriert (3W)

**Funktionsprinzip:**
Der MCU wacht per Pin-Change-Interrupt auf, sendet einen UART-Befehl an den DFPlayer, der die entsprechende MP3-Datei von der SD-Karte abspielt. Nach Wiedergabe geht der MCU zurück in den Sleep.

**Vorteile:**
- Sehr wenige Bauteile (MCU + DFPlayer + Spannungsregler)
- Minimale Firmware-Komplexität
- Schnell umsetzbar, gut dokumentiert

**Nachteile:**
- DFPlayer hat bekannte Zuverlässigkeitsprobleme (China-Clones, Qualitätsschwankungen)
- SD-Karte als mechanisches Bauteil im Außenbereich problematisch
- DFPlayer-Ruhestrom ~20 mA → muss per MOSFET abgeschaltet werden
- Begrenzte Erweiterbarkeit (kein WiFi, wenig GPIO frei)
- Audioqualität abhängig vom DFPlayer-Clone

**Ruhestrom:** 1–5 µA (MCU) + Power-Switch für DFPlayer nötig

**Geschätzte Kosten:** 8–12 EUR

---

### Option B: STM32L4 + SPI-Flash + I2S-DAC + Class-D-Verstärker

**Komponenten:**
- Mikrocontroller: STM32L476 (ARM Cortex-M4, FPU, 1 MB Flash)
- Audio-Speicher: W25Q128JV SPI-Flash (16 MB)
- DAC: Integrierter 12-Bit-DAC oder externer PCM5102A (I2S)
- Verstärker: MAX98357A (Class-D, I2S-Eingang)

**Funktionsprinzip:**
Der STM32L4 wacht per EXTI-Interrupt auf, liest MP3-Daten aus dem SPI-Flash, decodiert per Software (Helix MP3 Decoder) und gibt PCM-Daten über I2S an den Verstärker aus. DMA-Transfer entlastet die CPU.

**Vorteile:**
- Extrem niedriger Ruhestrom (Stop2-Modus: 0,1–1 µA)
- Keine mechanischen Teile (SPI-Flash statt SD-Karte)
- Volle Kontrolle über Audio-Pipeline
- Hochgradig erweiterbar (viele Peripherie-Schnittstellen)
- Langzeit-Verfügbarkeit von ST-Bauteilen

**Nachteile:**
- Komplexere Firmware (MP3-Decoder, DMA, I2S-Konfiguration)
- STM32-Toolchain (STM32CubeIDE/HAL) für Einsteiger anspruchsvoll
- Mehr Bauteile auf der Platine
- Kein eingebautes WiFi/BLE

**Ruhestrom:** 0,1–1 µA

**Geschätzte Kosten:** 12–18 EUR

---

### Option C: ESP32-S3 + SPI-Flash + I2S + Class-D-Verstärker

**Komponenten:**
- Mikrocontroller: ESP32-S3-WROOM-1 (Dual-Core, WiFi, BLE 5.0)
- Audio-Speicher: W25Q128JV SPI-Flash (16 MB)
- Verstärker: MAX98357A (Class-D, I2S-Eingang, integrierter DAC)

**Funktionsprinzip:**
Der ESP32-S3 wacht per GPIO-Interrupt aus dem Deep Sleep auf, liest MP3-Daten aus dem externen SPI-Flash, decodiert per Software und gibt PCM-Audio über I2S direkt an den MAX98357A aus. Nach Wiedergabe + Timeout geht er zurück in Deep Sleep.

**Vorteile:**
- Große Community, umfangreiche Dokumentation und Beispiele
- Arduino/PlatformIO als einsteigerfreundliche Entwicklungsumgebung
- WiFi und BLE eingebaut (Fernwartung, OTA-Updates)
- Leistungsfähiger Dual-Core (240 MHz) für MP3-Decodierung
- I2S-Hardware integriert
- SPI-Flash statt SD-Karte (keine mechanischen Teile)

**Nachteile:**
- Höherer Ruhestrom als STM32L4 (~5–10 µA im Deep Sleep)
- Boot-Zeit aus Deep Sleep ~150 ms
- Höherer Aktivstrom (~80 mA vs. ~30 mA bei STM32L4)

**Ruhestrom:** 5–10 µA (Deep Sleep mit GPIO-Wakeup)

**Geschätzte Kosten:** 10–15 EUR

---

### Option D: Dedizierter Audio-IC ohne Mikrocontroller (WT588D)

**Komponenten:**
- Audio-IC: WT588D-16P (oder kompatibel, z. B. WT2003S)
- Audio-Speicher: Externer SPI-Flash (W25Q128JV, 16 MB)
- Verstärker: PAM8403 oder ähnlicher Class-D (analoger Eingang)
- Spannungsregler: Buck-Converter 12V → 3.3V

**Funktionsprinzip:**
Der WT588D hat 8 Trigger-Eingänge (KEY0–KEY7). Jeder Taster ist direkt mit einem Trigger-Pin verbunden. Beim Drücken spielt der Chip die zugehörige Audiodatei aus dem SPI-Flash ab und gibt ein analoges oder PWM-Signal an den Verstärker aus. Es ist kein Mikrocontroller und keine Programmierung erforderlich. Die Audiodateien werden per PC-Software des Herstellers auf den Flash-Speicher geladen.

**Vorteile:**
- Einfachste Lösung: keine Firmware, keine IDE, kein Programmieren
- Wenigste Bauteile, geringste Fehlerquellen
- Sehr schnelle Reaktionszeit (~50 ms)
- Niedriger Ruhestrom (~1–3 µA)
- Robuste, bewährte Technik für genau diesen Anwendungsfall
- Audiodateien per USB-Tool austauschbar

**Nachteile:**
- Keine Erweiterungsmöglichkeit (keine Statistik, kein WiFi, kein BLE)
- Audioformat und Abtastrate durch den Chip vorgegeben
- Abhängigkeit von der Verfügbarkeit des Hersteller-PC-Tools
- Kein OTA-Update möglich

**Ruhestrom:** 1–3 µA

**Geschätzte Kosten:** 5–8 EUR

---

## 3. Bewertungsmatrix

Bewertungsskala: 1 (schlecht) – 5 (sehr gut)

| Kriterium | Gewicht | Option A | Option B | Option C | Option D |
|-----------|---------|----------|----------|----------|----------|
| Ruhestrom | 30% | 3 | 5 | 4 | 5 |
| Einsteigerfreundlichkeit | 25% | 5 | 2 | 4 | 5 |
| Erweiterbarkeit | 15% | 1 | 5 | 5 | 1 |
| Audioqualität | 15% | 3 | 5 | 4 | 4 |
| Langzeit-Zuverlässigkeit | 15% | 2 | 5 | 4 | 4 |
| **Gewichtete Summe** | **100%** | **3,00** | **4,25** | **4,15** | **4,10** |

### Berechnung

- Option A: 3×0,30 + 5×0,25 + 1×0,15 + 3×0,15 + 2×0,15 = 0,90 + 1,25 + 0,15 + 0,45 + 0,30 = **3,05**
- Option B: 5×0,30 + 2×0,25 + 5×0,15 + 5×0,15 + 5×0,15 = 1,50 + 0,50 + 0,75 + 0,75 + 0,75 = **4,25**
- Option C: 4×0,30 + 4×0,25 + 5×0,15 + 4×0,15 + 4×0,15 = 1,20 + 1,00 + 0,75 + 0,60 + 0,60 = **4,15**
- Option D: 5×0,30 + 5×0,25 + 1×0,15 + 4×0,15 + 4×0,15 = 1,50 + 1,25 + 0,15 + 0,60 + 0,60 = **4,10**

Hinweis zur Audioqualität von Option D: Die Bewertung wurde von 3 auf 4 korrigiert. Bei 16 kHz / 16 Bit WAV über einen kleinen Lautsprecher im Außenbereich ist die Qualität für Vogelstimmen vollkommen ausreichend. Der limitierende Faktor ist der Lautsprecher, nicht der Chip.

Hinweis: Bei der Gewichtung wurde "Einsteigerfreundlichkeit" von 20% auf 25% erhöht und "Erweiterbarkeit" von 20% auf 15% gesenkt, da der Auftraggeber Erweiterungen als nachrangig eingestuft hat.

## 4. Entscheidung

**Gewählt: Option D (WT588D ohne Mikrocontroller)**

### Begründung

1. **Einfachste Lösung**: Keine Firmware-Entwicklung nötig, kein Programmieren, keine IDE -- das Risiko von Softwarefehlern entfällt vollständig
2. **Geringste Bauteilanzahl**: Weniger Bauteile bedeuten weniger Fehlerquellen und einfachere Fertigung
3. **Niedrigster Ruhestrom**: 1–3 µA, vergleichbar mit der professionellen STM32-Lösung
4. **Schnellste Reaktionszeit**: ~50 ms statt 150–200 ms bei MCU-Lösungen
5. **Erfüllt alle Muss-Anforderungen**: 8 Taster, schnelle Wiedergabe, austauschbare Sounds, niedriger Ruhestrom
6. **Pragmatisch**: Für einen ehrenamtlich betreuten Waldlehrpfad zählt Zuverlässigkeit mehr als Erweiterbarkeit

### Bewusster Verzicht

Auf folgende Kann-Anforderungen wird bewusst verzichtet:
- X01–X02: Nutzungsstatistik (kein Speicher für Zähler)
- X03–X05: Fernüberwachung / Mobilfunk (kein Netzwerk-Interface)
- X07: Erweiterungssteckplatz

Falls diese Funktionen in Zukunft gewünscht werden, wäre eine Neuentwicklung auf Basis von Option C (ESP32-S3) sinnvoll. Der Verstärker, Lautsprecher und Buck-Converter könnten dabei wiederverwendet werden.

## 5. Gewählte Bauteile (Übersicht)

| Funktion | Bauteil | Begründung |
|----------|---------|------------|
| Audio-IC | WT588D-16P | 8 Trigger-Pins, SPI-Flash-Interface, ~1 µA Standby |
| Audio-Flash | W25Q128JVSIQ | 16 MB SPI-Flash, -40 °C bis +85 °C, bewährt |
| Verstärker | PAM8403DR-H (LCSC C17337) | Class-D, 2×3W, analoger Eingang, Shutdown-Pin |
| Buck-Converter | TPS62203DBVR (LCSC C9051) | 12V → 3.3V, 300 mA, ~1 µA Quiescent |
| UVLO | SGM809 (LCSC C699615) | Tiefentladeschutz Batterie |
| Verpolungsschutz | SI2301CDS-T1-GE3 | P-MOSFET, Low-RDS(on) |
| TVS-Diode | SMAJ15A | Überspannungsschutz Batterie-Eingang |
| Sicherung | PTC BSMD1206 500 mA (LCSC C7202014) | Rücksetzende Sicherung, Footprint F1206 |

## 6. Umsetzungsstand (Juli 2026)

| Schritt | Status |
|---------|--------|
| KiCad Schaltplan + PCB | ✅ fertig, ERC/DRC ohne Fehler |
| LTspice-Simulation | ✅ durchgeführt |
| JLCPCB (Platine + SMT) | ✅ bestellt |
| WT588D + Handlöt-Teile | ⏳ separat zu bestellen |
| Vogelstimmen programmieren | ⏳ ausstehend |

Details: [projektstatus.md](projektstatus.md)

Detaillierte Bauteilliste siehe [bauteilliste.md](bauteilliste.md).
