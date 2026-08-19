# Platinen-MBSE App (Impact · Audit · Export)

Eigenständige Web-App unter GitHub Pages: **`/mbse/`**  
Showcase-Teaser: `#/copilot` · Präsentation: `#/pitch` oder [`presentation.html`](presentation.html)

Der Vogelstimmenkasten ist ein **exemplarischer Referenz-Rahmen** — klein, vollständig, übertragbar auf eine Produktlinie. Der Mehrwert ist nicht die Menge der Dokumente, sondern **Konsistenz, Durchgängigkeit und ein Digital Thread**.

## Start

Lokal (Python): `START_MBSE.bat` → http://127.0.0.1:8781/

Oder Showcase-Server: `START_SHOWCASE.bat` → http://127.0.0.1:8877/mbse/

What-if-Demo: [`index.html?demo=e03`](index.html?demo=e03) (E03: 12 → 18 Monate)

## Struktur

| Pfad | Rolle |
|------|--------|
| `data/mbse-model.json` | Zentrale Quelle (Knoten + Kanten) |
| `data/impact-rules.json` | What-if-Regeln (battery_life, idle_current) |
| `js/graph-engine.js` | Traversal, Impact-Farben, Zyklen |
| `js/impact.js` | UI Graph + Listenansicht |
| `js/audit.js` | Traceability-Prüfungen |
| `js/export.js` | JSON / PlantUML / SysML v2 Text |
| `tools/build-model.mjs` | Regeneriert das JSON aus strukturierten Artefakten |

```bash
node mbse/tools/build-model.mjs
```

**IDs:** `F01` = Lastenheft-Requirement; `FIND-F-01` = adversarial Finding.

## Export-Grenze (ehrlich)

Phase 1 liefert textuellen SysML-v2-Subset + JSON. Kein zertifizierter Cameo/MagicDraw/Capella-Roundtrip. Modellverluste stehen im Export-Tab.

---

## Roadmap Phase 2–4 (nicht in Phase 1)

### Priorität 3 — KI Requirements Engineer

Eingabe: Freitext-Anforderung. Die KI erzeugt Stakeholder Need, System Requirement, Akzeptanzkriterien, Funktionszuordnung, Verifikationsmethode, Risiken und Traceability-Links — alle mit stabilen IDs.

- Statische App + optional API-Key (OpenAI/Anthropic) **oder** Offline: JSON exportieren → Cursor/CI → re-import
- Geplant: `js/ai-review.js` — Eindeutigkeit, Testbarkeit, Konflikte mit dem bestehenden Graph
- Kein Server auf GitHub Pages nötig für Demo v1 (Key im Browser, Nutzer-Hinweis)
- Human-in-the-loop: keine Auto-Freigabe

### Priorität 4 — Digital Twin + Änderungs-Simulation

„Was passiert wenn …“ (z. B. Batterie halbieren): Laufzeit, Risiko, Kosten, Testauswirkungen.

- Parameter aus Requirements (E03, E02) koppeln an [`../simulation/js/model.js`](../simulation/js/model.js)
- Impact-Graph markiert, welche Tests/Risiken neu bewertet werden
- Dashboard: Laufzeit, Risiko-Ampel, Kosten-Schätzung, Test-Invalidierung

### Priorität 5 — Review- und Freigabe-Cockpit

Governance-Dashboard (`/mbse/#/governance` oder Showcase-Teaser):

- Traceability Coverage, Testabdeckung, Risikoabdeckung
- Offene ADRs / Reviews
- Ampelsystem + Auditbericht (Erweiterung von `audit.js`)
- Management-KPIs: Time-to-Impact, Change-Rework — nicht Folienzahl

---

## Abnahme Phase 1

- [x] Präsentation 7 Folien, Demo-Sprung E03, druckbar (`presentation.html`, `@media print`)
- [x] Kernbotschaft: Mehrwert = Konsistenz/Digital Thread, nicht Dokumentenmenge
- [x] E03 12→18 Monate färbt Wirkungskette
- [x] Audit mit Findings (u. a. Unit-Tests ohne verifies)
- [x] JSON-Export = Modell; SysML/PlantUML enthalten IDs und Trace-Kanten
- [x] Showcase `#/pitch` + `#/copilot` → `/mbse/`
