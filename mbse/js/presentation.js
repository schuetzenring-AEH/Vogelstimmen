const SLIDES = [
  {
    kicker: "01 · Der Elefant im Raum",
    title: "Transformation über Transformation",
    html: `
      <div class="grid2">
        <div class="card"><h3>Bereits im Flug</h3>
          <ul>
            <li>SAP S/3 → S/4</li>
            <li>PLM &amp; ALM im Umbau</li>
            <li>Teamcenter als künftige SSOT (Konfiguration)</li>
            <li>MBCE / MBSE als Konfigurationsvorlagen</li>
          </ul>
        </div>
        <div class="card"><h3>Was noch nicht fliegt</h3>
          <ul>
            <li>Kein etabliertes MBSE — Aufwand und Usability</li>
            <li>KI hat in diesem Kontext noch keine Rolle</li>
            <li>Automatisierung zieht noch nicht mit</li>
          </ul>
        </div>
      </div>
      <p class="quote">Ich komme nicht mit dem fünften Großprojekt — ich komme mit einem Risikoreduzierer.</p>`,
    notes: "Nicht defensiv. Ehrlichkeit baut Vertrauen. Kein festes Teamcenter-Datum nennen.",
  },
  {
    kicker: "02 · Warum MBSE nicht fliegt",
    title: "Nicht Methodik — sondern Pflegeaufwand",
    html: `
      <table>
        <thead><tr><th>Was wir wollen</th><th>Was passiert</th></tr></thead>
        <tbody>
          <tr><td>Durchgängiger Digital Thread</td><td>Verknüpfungen veralten still</td></tr>
          <tr><td>Teamcenter als SSOT</td><td>Ohne Links kein SSOT — nur Ablage</td></tr>
          <tr><td>MBCE-Vorlagen</td><td>Templates ohne lebendige Traceability</td></tr>
        </tbody>
      </table>
      <p>Traceability <strong>pflegen</strong> kostet mehr als Traceability <strong>nutzen</strong>.</p>`,
    notes: "IM-Leitung: SSOT ohne Graph ist nur ein DMS.",
  },
  {
    kicker: "03 · Der Mythos",
    title: "„Unsere Leute arbeiten nie so sauber“",
    html: `
      <div class="grid2">
        <div class="card"><h3>Falsche Lösung</h3><p>Disziplin erzwingen. Jede Nacht Matrizen pflegen. Adoption stirbt an Erwartung.</p></div>
        <div class="card"><h3>Richtige Lösung</h3><p>System erzeugt Entwürfe, Verknüpfungen und prüft Lücken. Mensch entscheidet und gibt frei.</p></div>
      </div>
      <p class="quote">Das ist kein Gegenargument gegen den Digital Thread — das ist das Hauptargument für einen Engineering-Assistenten.</p>`,
    notes: "Langsam sprechen. Emotional wichtigste Folie.",
  },
  {
    kicker: "04 · Was der Assistent ist",
    title: "Co-Pilot für Impact und Konsistenz",
    html: `
      <table>
        <thead><tr><th>Ist</th><th>Ist nicht</th></tr></thead>
        <tbody>
          <tr><td>Co-Pilot für Impact, Konsistenz, Audit</td><td>Ersatz für Engineering</td></tr>
          <tr><td>Erzeugt Artefakte zur Freigabe</td><td>Auto-Freigabe ohne Review</td></tr>
          <tr><td>Entlastet Teamcenter-/PLM-Aufbau</td><td>Chatbot oder Parallel-Welt neben SAP</td></tr>
        </tbody>
      </table>
      <p>Der Mehrwert ist <strong>nicht die Menge der Dokumente</strong> — sondern ein durchgängiger Digital Thread, den ein KI-Assistent mitträgt. Bei richtiger Tool-Unterstützung entsteht kaum Mehraufwand gegenüber „nur dokumentieren“.</p>`,
    notes: "Vorstand: Freigabe bleibt beim Menschen. IM: Security/On-Prem als Follow-up.",
  },
  {
    kicker: "05 · Live-Beweis",
    title: "Vogelstimmen — absichtlich klein, vollständig",
    html: `
      <p>Referenz-Rahmen, nicht unser Produkt. Kette: Stakeholder → Requirement → Funktion → Architektur → Test → Risiko.</p>
      <div class="grid2">
        <div class="card"><h3>Vorher</h3><p>E03 Batterielaufzeit <strong>≥ 12 Monate</strong></p></div>
        <div class="card"><h3>Nachher</h3><p>E03 <strong>≥ 18 Monate</strong></p></div>
      </div>
      <ul>
        <li>🟡 Energieversorgung / Architektur</li>
        <li>🔴 PCB / Ruhestrom / relevante Tests</li>
        <li>🟢 Software nicht betroffen</li>
      </ul>
      <a class="cta" href="index.html?demo=e03">Demo starten — Impact in 30 Sekunden</a>
      <p>Übertragbar auf eine Produktlinie — nicht auf Vogelgeräusche.</p>`,
    notes: "Einziges Live-Element. Fallback: Screenshot wenn Netz spinnt.",
  },
  {
    kicker: "06 · Einordnung",
    title: "In die Landschaft, ohne falsche Timeline",
    html: `
<pre class="arch">Geschäft &amp; Logistik          SAP S/4
        ↕
Produkt &amp; Konfiguration      Teamcenter (Ziel-SSOT)
        ↕
Engineering-Assistent        Impact · Links · Audit · Export
        ↕
Methodik &amp; Regeln            MBCE / MBSE-Vorlagen</pre>
      <p>Der Assistent ersetzt weder SAP noch Teamcenter. Er reduziert das Risiko teurer Konfigurationsfehler. PoC liefert ein <strong>TC-ready Datenmodell</strong>, keine Abhängigkeit vom Go-Live-Datum.</p>`,
    notes: "Kein festes TC-Datum. SAP-Priorität: Assistent reduziert Nacharbeit.",
  },
  {
    kicker: "07 · Ask",
    title: "Mandat zur Erkundung — kein Budget",
    html: `
      <ol>
        <li>Prinzip: Impact-first Digital Thread statt Dokumentenmenge</li>
        <li>Nächster Schritt: Erkundung an <strong>einer Produktlinie</strong></li>
        <li>Vogelstimmen bleibt Referenz-Demo; der Krones-Pilot liefert Messung</li>
      </ol>
      <table>
        <thead><tr><th>KPI</th><th>Richtung</th></tr></thead>
        <tbody>
          <tr><td>Time-to-Impact</td><td>Tage/Wochen → Minuten</td></tr>
          <tr><td>Traceability-Coverage</td><td>messbar, Lücken offenlegen</td></tr>
          <tr><td>Change-Rework</td><td>weniger Test-/Doku-Nacharbeit</td></tr>
        </tbody>
      </table>
      <p class="quote">Nicht: noch ein Programm. Sondern: Transformation absichern.</p>`,
    notes: "Pause. Nicht weiterreden. Ask stehen lassen.",
  },
];

let i = 0;
let notesOn = false;

function render() {
  const root = document.getElementById("slides");
  root.innerHTML = SLIDES.map((s, idx) => `
    <section class="slide ${idx === i ? "on" : ""}" data-i="${idx}">
      <p class="kicker">${s.kicker}</p>
      <h1>${s.title}</h1>
      ${s.html}
      <div class="notes ${notesOn ? "on" : ""}">${s.notes}</div>
    </section>`).join("");
  document.getElementById("bar").style.width = `${((i + 1) / SLIDES.length) * 100}%`;
  document.getElementById("pos").textContent = `${i + 1} / ${SLIDES.length}`;
}

function go(d) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i + d));
  render();
}

document.getElementById("prev").onclick = () => go(-1);
document.getElementById("next").onclick = () => go(1);
document.getElementById("notes-btn").onclick = () => { notesOn = !notesOn; render(); };
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(1); }
  if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(-1); }
  if (e.key === "n") { notesOn = !notesOn; render(); }
});
let touchX = null;
document.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].screenX; }, { passive: true });
document.addEventListener("touchend", (e) => {
  if (touchX == null) return;
  const dx = e.changedTouches[0].screenX - touchX;
  if (dx < -50) go(1);
  if (dx > 50) go(-1);
  touchX = null;
}, { passive: true });

render();
