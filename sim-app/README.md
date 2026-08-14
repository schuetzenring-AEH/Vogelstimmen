# Platinen-Simulation (Mobile App)

Eigenständige Web-App nur für die interaktive Platinen-Simulation Rev 3.0.
Fokus: **stabiler Lauf auf iOS Safari und Android Chrome** (Touch, große Taster, Bottom-Sheet).

Die Simulations-Engine liegt in `../simulation/js/` (Single Source of Truth).
Beim Deploy werden Engine, Assets und Layout-Daten nach `sim-app/` auf GitHub Pages kopiert (neben der Standard-Simulation unter `/simulation/`).

## Lokal starten

```powershell
# Aus Projektroot — Showcase + Simulation
.\START_SHOWCASE.bat

# Nur Simulation (Mobile Shell)
cd simulation
python serve.py
# Dann im Browser: http://127.0.0.1:8765/../sim-app/  — besser:
```

Für lokale Entwicklung der Mobile-App:

```powershell
cd sim-app
# Engine + Daten verknüpfen (einmalig oder nach Engine-Änderungen):
Copy-Item ..\simulation\js\*.js .\js\ -Force
Copy-Item ..\simulation\pcb_layout.json, ..\simulation\pcb_tracks.json .\
New-Item -ItemType Directory -Force -Path .\assets | Out-Null
Copy-Item ..\simulation\assets\* .\assets\ -Force

python -m http.server 8780
# http://127.0.0.1:8780/
```

## Struktur

| Pfad | Rolle |
|------|--------|
| `index.html` | Mobile-first UI |
| `css/mobile.css` | Layout, Touch, Bottom-Sheet |
| `js/mobile-shell.js` | Boot, Sheet, Touch, Sichtbarkeits-Pause |
| `js/app.js` | Engine-UI (aus `simulation/js/`, beim Deploy kopiert) |

## Live

https://schuetzenring-aeh.github.io/Vogelstimmen/sim-app/

Die Standard-Simulation: https://schuetzenring-aeh.github.io/Vogelstimmen/simulation/

Die Begleit-Dokumentation bleibt im [Showcase](../showcase/index.html).
