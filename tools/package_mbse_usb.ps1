# Paketiert MBSE-Showcase + Docs + Simulation + V2.5-final als USB-ZIP
$ErrorActionPreference = "Stop"
# tools/ -> repo root
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$OutDir = Join-Path $Root "dist\Vogelstimmen-MBSE-USB"
$ZipPath = Join-Path $Root "dist\Vogelstimmen-MBSE-USB.zip"

Write-Host "Root: $Root"
Write-Host "Out:  $OutDir"

if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Copy-Tree($src, $dst, $exclude = @()) {
  if (-not (Test-Path $src)) { Write-Warning "fehlt: $src"; return }
  New-Item -ItemType Directory -Force -Path $dst | Out-Null
  robocopy $src $dst /E /NFL /NDL /NJH /NJS /nc /ns /np `
    /XD .history .git __pycache__ node_modules `
    /XF *.kicad_sch-bak *.kicad_pcb-bak *.lck | Out-Null
}

Copy-Tree (Join-Path $Root "showcase") (Join-Path $OutDir "showcase")
Copy-Tree (Join-Path $Root "docs") (Join-Path $OutDir "docs")
Copy-Tree (Join-Path $Root "simulation") (Join-Path $OutDir "simulation")
Copy-Tree (Join-Path $Root "hardware\V2.5-final") (Join-Path $OutDir "hardware\V2.5-final")

# Schlanke Rev1-Story
$r1 = Join-Path $OutDir "rev1_archiv\docs"
New-Item -ItemType Directory -Force -Path $r1 | Out-Null
foreach ($f in @("architekturvergleich.md", "projektstatus.md", "vogelstimmen-projektdoku.html")) {
  $src = Join-Path $Root "rev1_archiv\docs\$f"
  if (Test-Path $src) { Copy-Item $src $r1 -Force }
}

Copy-Item (Join-Path $Root "README.md") (Join-Path $OutDir "README.md") -Force

@'
============================================================
  Vogelstimmen — MBSE Showcase (USB-Stick Paket)
============================================================

START (kein Python noetig!)
  1. Doppelklick auf  START.bat
  2. Ein schwarzes Fenster bleibt offen (= Server laeuft)
  3. Browser oeffnet http://127.0.0.1:8877/showcase/
     (falls Port belegt: 8878 / 8879 — steht im Fenster)

WICHTIG bei "Verbindung verweigert"
  - Das schwarze Server-Fenster muss OFFEN bleiben
  - Nicht nur die ZIP oeffnen — erst ENTPACKEN, dann START.bat
  - URL genau 127.0.0.1 (nicht eine andere IP) aus dem Fenster kopieren
  - Bei Firmen-PC: PowerShell ggf. "Als Administrator" / ExecutionPolicy

INHALT
  showcase/              V-Modell / MBSE-Tour (Stakeholder bis Service)
  docs/                  Volles SE-Set (ohne Business/APQP/CE)
  simulation/            Digitaler Zwilling
  hardware/V2.5-final/   Fertigungspaket Rev 2.5
  rev1_archiv/docs/      Historie
  README.md              Projektueberblick

Kolping / interner Gebrauch
'@ | Set-Content -Path (Join-Path $OutDir "LIESMICH.txt") -Encoding UTF8

@'
@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo  Vogelstimmen MBSE Showcase
echo  Startet PowerShell-Server (kein Python noetig)
echo.
if not exist "%~dp0showcase\serve.ps1" (
  echo FEHLER: showcase\serve.ps1 fehlt. ZIP vollstaendig entpacken!
  pause
  exit /b 1
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0showcase\serve.ps1"
if errorlevel 1 pause
'@ | Set-Content -Path (Join-Path $OutDir "START.bat") -Encoding ASCII

# Simulation paths in showcase use ../simulation — OK from /showcase/
# Docs use ../docs — OK

if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Compress-Archive -Path $OutDir -DestinationPath $ZipPath -CompressionLevel Optimal

$size = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Fertig:"
Write-Host "  Ordner: $OutDir"
Write-Host "  ZIP:    $ZipPath  ($size MB)"
Write-Host "  Start:  START.bat im Ordner oder nach Entpacken der ZIP"
