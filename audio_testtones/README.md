# DY-SV17F Testtöne (10 s)

Format für Mode 0 (IO-Trigger):

- Ordner: **Root** vom USB-Laufwerk (meist `D:`)
- Namen: `00001.mp3` … `00008.mp3` (fünf Ziffern)
- Dauer: je ~10 s, verschiedene Tonhöhen

| Datei | Taste / IO | Frequenz |
|-------|------------|----------|
| 00001.mp3 | IO0 / Taste 1 | 440 Hz |
| 00002.mp3 | IO1 / Taste 2 | 523 Hz |
| 00003.mp3 | IO2 / Taste 3 | 587 Hz |
| 00004.mp3 | IO3 / Taste 4 | 659 Hz |
| 00005.mp3 | IO4 / Taste 5 | 784 Hz |
| 00006.mp3 | IO5 / Taste 6 | 880 Hz |
| 00007.mp3 | IO6 / Taste 7 | 988 Hz |
| 00008.mp3 | IO7 / Taste 8 | 1047 Hz |

## Auf Modul kopieren

1. Latch aus **oder** Modul abgezogen
2. Micro-USB → PC, Laufwerk erscheint (z. B. `D:`)
3. `KOPIERE_AUF_MODUL_D.bat` doppelklicken **oder** die acht MP3s von Hand nach `D:\` kopieren
4. Laufwerk sicher entfernen
