@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Vogelstimmen MBSE Impact-App
echo  http://127.0.0.1:8877/mbse/  (wenn Showcase-Server laeuft)
echo.
where python >nul 2>&1 && (
  echo Starte python -m http.server 8781 im Ordner mbse-app
  cd mbse-app
  python -m http.server 8781
  exit /b
)
echo Python nicht gefunden — starte Showcase-Server mit /mbse/-Alias
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0showcase\serve.ps1"
