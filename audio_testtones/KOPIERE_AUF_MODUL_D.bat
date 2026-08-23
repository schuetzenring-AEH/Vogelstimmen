@echo off
chcp 65001 >nul
set "SRC=%~dp0"
echo DY-SV17F Testtoene auf Laufwerk D: kopieren
echo Quelle: %SRC%
echo.
if not exist D:\ (
  echo FEHLER: Laufwerk D: nicht gefunden.
  echo Modul per USB anschliessen - Latch AUS oder Modul abgezogen.
  pause
  exit /b 1
)
echo Alte Dateien auf D: loeschen...
del /q "D:\00001.mp3" "D:\00002.mp3" "D:\00003.mp3" "D:\00004.mp3" "D:\00005.mp3" "D:\00006.mp3" "D:\00007.mp3" "D:\00008.mp3" 2>nul
echo Kopiere 00001.mp3 .. 00008.mp3 ...
copy /y "%SRC%00001.mp3" "D:\00001.mp3" >nul
copy /y "%SRC%00002.mp3" "D:\00002.mp3" >nul
copy /y "%SRC%00003.mp3" "D:\00003.mp3" >nul
copy /y "%SRC%00004.mp3" "D:\00004.mp3" >nul
copy /y "%SRC%00005.mp3" "D:\00005.mp3" >nul
copy /y "%SRC%00006.mp3" "D:\00006.mp3" >nul
copy /y "%SRC%00007.mp3" "D:\00007.mp3" >nul
copy /y "%SRC%00008.mp3" "D:\00008.mp3" >nul
echo.
echo Fertig. Laufwerk sicher entfernen, dann testen.
dir "D:\0000*.mp3"
pause
