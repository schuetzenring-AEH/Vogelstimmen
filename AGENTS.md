# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **hardware/MBSE project** (KiCad PCB for a "Vogelstimmenkasten"), not a
conventional software app. There is **no package manager, no lockfile, no build step, and no
automated test or lint suite**. The only runtime dependency for the things you can actually run is
**Python 3** (already present in the Cloud environment). Do not look for `package.json` /
`requirements.txt`; none exist and none are needed for the runnable apps.

### Runnable apps (both are browser front-ends)

- **Interactive PCB simulation** (`simulation/`): `python3 simulation/serve.py --no-browser --port 8765`
  then open `http://127.0.0.1:8765/`. It must be served over `http://` because the UI uses native ES
  modules (`import` in `index.html`); opening the HTML via `file://` will fail to boot. The `.bat`
  files (`start_rev25.bat`, `start_rev30.bat`) are Windows-only wrappers — use `serve.py` directly on
  Linux.
- **MBSE showcase** (`showcase/`): this is a fully static site. Its `START.bat` / `serve.ps1` are
  **Windows PowerShell only**. On Linux, serve the repo root with `python3 -m http.server 8000` and
  open `http://127.0.0.1:8000/` — the root `index.html` redirects to `showcase/`, and the simulation
  is also reachable under `/simulation/`.

### Offline tooling that is NOT needed to run the apps

- `tools/*.py` and `simulation/tools/export_*.py` import `pcbnew`, which is **KiCad's bundled Python
  module** (not pip-installable). Run these only inside KiCad's Python, e.g.
  `& "C:\Program Files\KiCad\10.0\bin\python.exe" simulation/tools/export_layout.py`. They regenerate
  `pcb_layout.json` / `pcb_tracks.json` after PCB edits.
- The `v3_*` USB packaging tools import `fitz` (PyMuPDF) — install `pymupdf` only if you specifically
  need PDF packaging (`tools/package_mbse_usb.ps1`); it is irrelevant to running the simulation or
  showcase.

### Testing / verifying

There are no unit tests. Verify changes manually in the browser: press a bird "Taster" button in the
simulation and confirm the `Phase`, `I_BAT`, `Track`, and `Zähler` stats update and the PCB traces
change color (idle ≈15 µA → active ≈160 mA). `simulation/src/*.ts` is a hand-maintained TypeScript
mirror of `simulation/js/*.js`; the browser runs the `js/` files, so keep both in sync when editing
model/parts logic.
