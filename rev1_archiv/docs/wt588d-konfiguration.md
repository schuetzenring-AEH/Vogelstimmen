# WT588D – Vogelstimmen laden und konfigurieren

Der WT588D-16P speichert die Audio-Dateien im SPI-Flash (W25Q128) auf der Platine. Die Konfiguration erfolgt über ein PC-Tool des Herstellers.

## Voraussetzungen

- WT588D-16P im IC-Sockel auf der bestückten Platine
- 3,3 V Versorgung (Platine an 12-V-Batterie oder Labornetzteil)
- USB-zu-Serial-Adapter oder WT588D-Programmierboard
- Anschluss über **J4** (4-polige Stiftleiste) gemäß Hersteller-Dokumentation
- Windows-PC

## Software

Hersteller-Tool suchen nach: **„WTV020 WT588D USB download“** oder **„Waytronic VoiceChip“**

Typische Schritte (je nach Tool-Version leicht unterschiedlich):

1. Tool installieren und starten
2. WT588D/Modul per USB erkennen lassen
3. Projekt anlegen: **8 Dateien**, Key-Trigger-Modus

## Audio-Format

| Parameter | Wert |
|-----------|------|
| Abtastrate | **16 kHz** |
| Kanäle | **Mono** |
| Bit-Tiefe | 16 Bit |
| Format | WAV (Tool konvertiert ggf. intern) |

### Konvertierung mit ffmpeg (Beispiel)

```bash
ffmpeg -i vogel1.mp3 -ar 16000 -ac 1 -sample_fmt s16 vogel1_16k_mono.wav
```

Für 8 Vogelstimmen: `vogel1.wav` … `vogel8.wav`

## Tasten-Zuordnung

| Taste | WT588D Pin | Sound-Datei |
|-------|------------|-------------|
| 1 | P00 / KEY0 | Sound 1 |
| 2 | P01 / KEY1 | Sound 2 |
| 3 | P02 / KEY2 | Sound 3 |
| 4 | P03 / KEY3 | Sound 4 |
| 5 | P04 / KEY4 | Sound 5 |
| 6 | P05 / KEY5 | Sound 6 |
| 7 | P06 / KEY6 | Sound 7 |
| 8 | P07 / KEY7 | Sound 8 |

## Konfiguration im Tool

1. Modus: **Key Trigger** (One Key One Voice)
2. SPI-Flash auf Platine verwenden (nicht interner Demo-Speicher)
3. 8 Sounds der Reihe nach laden
4. **Download / Burn** – dauert einige Minuten
5. WT588D resetten, ohne PC testen

## Audio-Ausgang

- PWM-Ausgang über **P01 (KEY1)** → RC-Filter (R13, C9, C18) → PAM8403
- Im Tool: PWM-Ausgang aktivieren, falls wählbar

## Fehlersuche

| Problem | Mögliche Ursache |
|---------|------------------|
| Kein Ton | PAM8403 SD/MUTE auf 3,3 V? Lautsprecher an J2? |
| Verzerrt | Lautsprecher-Impedanz prüfen (4–8 Ω) |
| Falscher Sound | Tasten-Zuordnung im Tool prüfen |
| Upload schlägt fehl | 3,3 V stabil? J4-Verkabelung? W25Q128 bestückt? |

## Sounds später austauschen

Neue WAV-Dateien vorbereiten → Tool → erneut auf WT588D/Flash brennen. Keine Hardware-Änderung nötig.
