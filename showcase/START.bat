@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  Vogelstimmen MBSE Showcase — Starte lokalen Server ...
echo  (kein Python noetig — nutzt Windows PowerShell)
echo.

REM serve.ps1 liegt in diesem Ordner (showcase); Root = Parent
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
if errorlevel 1 (
  echo.
  echo Server konnte nicht starten.
  pause
)
