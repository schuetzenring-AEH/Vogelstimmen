# Audio-Konvertierung für WT588D

Skript zum Vorbereiten von Vogelstimmen im Format **16 kHz, Mono, 16 Bit WAV**.

## Voraussetzung

[ffmpeg](https://ffmpeg.org/download.html) installiert und im PATH.

## Verwendung (PowerShell)

```powershell
cd C:\Users\Schue\Projects\Vogelstimmen\scripts
.\convert-vogelstimmen.ps1 -InputDir "C:\Pfad\zu\rohdateien" -OutputDir "C:\Pfad\zu\wav"
```

Alle MP3/WAV/OGG-Dateien im Eingabeordner werden nummeriert als `vogel1.wav` … `vogel8.wav` exportiert (max. 8 Dateien, alphabetische Sortierung).

## Verwendung (Bash)

```bash
./convert-vogelstimmen.sh /pfad/zu/rohdateien /pfad/zu/wav
```

## Manuell (einzelne Datei)

```bash
ffmpeg -i vogel1.mp3 -ar 16000 -ac 1 -sample_fmt s16 vogel1_16k_mono.wav
```

## Nächster Schritt

Die erzeugten WAV-Dateien mit dem WT588D PC-Tool auf den Chip/Flash laden → [wt588d-konfiguration.md](../docs/wt588d-konfiguration.md)
