# Engineering Copilot — Folienentwurf (Krones)

**Zielgruppe:** Vorstand, IM-Leitung, Entwicklungsleitung  
**Format:** Erstgespräch · ca. 15–20 Minuten · **Ask = Mandat „Go explore“** (kein Budget)  
**Demo:** Vogelstimmenkasten als **exemplarischer Referenz-Rahmen** — nicht als Produkt  
**Live-Moment:** 1× Impact-Demo (Requirement E03: 12 → 18 Monate)

Vollbild: [`../mbse-app/presentation.html`](../mbse-app/presentation.html)

---

## Folie 1 — Der Elefant im Raum

### Auf dem Bildschirm

**Transformation über Transformation**

- SAP S/3 → S/4  
- PLM & ALM im Umbau  
- Teamcenter als künftige Single Source of Truth (Konfiguration)  
- MBCE / MBSE als Konfigurationsvorlagen  
- **Und:** MBSE ist bei uns noch nicht etabliert — zu komplex, zu aufwendig  

> *„Wir merken alle: Das ist extrem viel Arbeit — und niemand ist sicher, ob wir das so durchziehen.“*

### Sprechertext (~2 Min)

„Ich komme heute **nicht** mit dem fünften Großprojekt.

Wir stehen gleichzeitig in SAP S/4, PLM/ALM, Teamcenter-Richtung und MBCE-Vorlagen. MBSE haben wir **noch nicht** verankert — nicht weil wir es nicht wollen, sondern weil Aufwand und Usability bisher nicht stimmten.

Meine These: Wir scheitern nicht am Fehlen von Dokumenten — sondern daran, dass **Änderungsfolgen zu spät und zu teuer** sichtbar werden. Genau das belastet jede Konfigurationsentscheidung in SAP und künftig in Teamcenter.“

<!-- note: Nicht defensiv werden. Ehrlichkeit baut Vertrauen. Keine Tool-Namen überbetonen außer SAP/Teamcenter — die kennen sie. -->

---

## Folie 2 — Warum MBSE bei uns (noch) nicht fliegt

### Auf dem Bildschirm

**Nicht Methodik — sondern Pflegeaufwand**

| Was wir wollen | Was passiert |
|----------------|--------------|
| Durchgängiger Digital Thread | Verknüpfungen veralten still |
| Teamcenter als SSOT | Ohne Links kein SSOT — nur Ablage |
| Konfigurationsvorlagen (MBCE) | Templates ohne lebendige Traceability |

**Kernproblem:** Traceability **pflegen** kostet mehr als Traceability **nutzen**.

### Sprechertext (~2 Min)

„MBSE scheitert selten an der Idee. Es scheitert an der **Usability der Pflege**. Wer pflegt manuell die Matrix Requirement → Funktion → Architektur → Test → Risiko? Wenn das niemand zuverlässig tut, ist Teamcenter zwar Single Source of Truth — aber **ohne Wahrheit in den Beziehungen**.“

---

## Folie 3 — Der Mythos „Unsere Leute arbeiten nie so sauber“

### Auf dem Bildschirm

**Die falsche Lösung:** Disziplin erzwingen  
**Die richtige Lösung:** System unterstützen

- Menschen **entscheiden und geben frei**  
- System **erzeugt Entwürfe, Verknüpfungen und prüft Lücken**  
- Audit zeigt: *Was fehlt?* — nicht *Wer war schuld?*

### Sprechertext (~2 Min)

„Im Flur höre ich: ‚Unsere MA arbeiten eh nie so sauber.‘ Das ist kein Gegenargument gegen Digital Thread — **das ist das Hauptargument für einen Engineering-Assistenten**. Wir dürfen MBSE nicht als Zusatzdisziplin verkaufen. Es muss **marginal** sein: Ich ändere ein Requirement — das System zeigt mir sofort, was betroffen ist.“

---

## Folie 4 — Was der KI-Engineering-Assistent ist (und nicht ist)

| Ist | Ist nicht |
|-----|-----------|
| Co-Pilot für **Impact & Konsistenz** | Ersatz für Engineering |
| Erzeugt + verknüpft Artefakte **zur Freigabe** | Auto-Freigabe ohne Review |
| Audit: Lücken, Zyklen, Wirkungsketten | Chatbot für Schaltpläne |
| Entlastet Teamcenter-/PLM-Aufbau | Parallel-Welt neben SAP |

**Rolle von KI bei uns heute:** noch **keine** — genau hier setzen wir an.

Der Mehrwert ist nicht die Menge der Dokumente, sondern Konsistenz und ein Digital Thread — erstmals wirtschaftlich, weil bei richtiger Tool-Unterstützung kaum Mehraufwand entsteht.

---

## Folie 5 — Live-Demo: Vogelstimmen (exemplarisch, bewusst klein)

**Referenz-Rahmen — nicht unser Produkt**

| Vorher | Nachher |
|--------|---------|
| E03: Batterielaufzeit **≥ 12 Monate** | E03: **≥ 18 Monate** |

- 🟡 Energieversorgung / Architektur  
- 🔴 PCB / Ruhestrom / relevante Tests  
- 🟢 Software nicht betroffen  

Demo: [`../mbse-app/index.html?demo=e03`](../mbse-app/index.html?demo=e03)

---

## Folie 6 — Einordnung in unsere Landschaft (ohne falsche Timeline)

```
Geschäft & Logistik          SAP S/4
        ↕
Produkt & Konfiguration      Teamcenter (Ziel-SSOT)
        ↕
Engineering-Assistent        Impact · Links · Audit · Export
        ↕
Methodik & Regeln            MBCE / MBSE-Vorlagen
```

Ehrlich: Teamcenter-Zeitplan ist **noch nicht** überall gesichert. PoC liefert **TC-ready Datenmodell**, keine Abhängigkeit vom Go-Live-Datum.

---

## Folie 7 — Was ich heute bitte (Ask)

**Mandat zur Erkundung** — kein Budget, keine Tool-Entscheidung

1. Prinzip bestätigen: Impact-first Digital Thread statt Dokumentenmenge  
2. Nächster Schritt: Erkundung an **einer Produktlinie** / Maschinenfamilie  
3. Vogelstimmen bleibt Referenz-Demo; Krones-Pilot liefert Messung  

| KPI | Richtung |
|-----|----------|
| Time-to-Impact | Tage/Wochen → Minuten |
| Traceability-Coverage | messbar, Lücken offenlegen |
| Change-Rework | weniger Test-/Doku-Nacharbeit |

---

## Anhang A — Einwände

| Einwand | Kurzantwort |
|---------|-------------|
| „Noch ein IT-Monster“ | Kein Parallel-Tool — Workflow in PLM/TC |
| „KI halluziniert“ | Human-in-the-loop, Audit, keine Auto-Freigabe |
| „SAP hat Priorität“ | Weniger Konfigurations-Nacharbeit = weniger S/4-Reibung |
| „Automation nicht dabei“ | Phase 2 — gleicher Graph bis PLC |
| „Das ist ein Spielzeug“ | Bewusst klein — **Muster**, nicht Domäne |
| „MBSE haben wir schon versucht“ | Damals: Pflegeaufwand. Jetzt: Assistent + Audit |

---

## Anhang B — Metriken

- **Time-to-Impact** — Zeit bis alle Betroffenen einer Req-Änderung bekannt sind  
- **Traceability-Coverage** — % Requirements mit nachweisbarer Downstream-Kette  
- **Orphan-Rate** — verwaiste Tests, Funktionen, Risiken  
- **Change-Rework-Rate** — wie oft brechen Tests/Doku bei Änderungen  

---

## Anhang C — Demo-Checkliste

- [ ] URL `/mbse/?demo=e03` vor Meeting testen  
- [ ] Fallback-Screenshot Folie 5  
- [ ] Beamer: Browser Vollbild, Cache leeren  
