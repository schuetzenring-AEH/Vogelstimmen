import { loadModel, requirements } from "./graph-engine.js";
import { runAudit, auditToMarkdown } from "./audit.js";
import { exportJson, exportPlantUml, exportSysml, download } from "./export.js";
import {
  renderReqList, renderWhatIf, renderList, renderDetail, drawGraph, computeImpact,
} from "./impact.js";

const $ = (s) => document.querySelector(s);

async function boot() {
  const [model, rules] = await Promise.all([
    fetch("data/mbse-model.json").then((r) => {
      if (!r.ok) throw new Error("mbse-model.json nicht ladbar");
      return r.json();
    }),
    fetch("data/impact-rules.json").then((r) => r.json()),
  ]);
  const g = loadModel(model);
  const audit = runAudit(g);
  window.__mbse = { g, model, rules, audit };

  const params = new URLSearchParams(location.search);
  let selected = (params.get("demo") || params.get("req") || "E03").toUpperCase();
  if (!g.nodes.has(selected)) selected = "E03";
  let what = { metric: g.nodes.get(selected)?.params?.metric, changed: params.get("demo") === "e03", newValue: params.get("demo") === "e03" ? 18 : undefined };
  let cy = null;

  function applyImpact() {
    const n = g.nodes.get(selected);
    const opts = {
      metric: what.metric || n?.params?.metric,
      newValue: what.newValue,
      changed: !!what.changed,
      mode: what.changed ? "whatif" : "trace",
    };
    const impact = computeImpact(g, selected, rules, opts);
    renderReqList(g, $("#req-list"), selected, pick, $("#req-search").value);
    renderWhatIf(g, selected, $("#whatif"), what, (w) => { what = { ...what, ...w }; applyImpact(); });
    renderList(impact, $("#list-view"));
    renderDetail(g, selected, impact, $("#detail"));
    if (cy) { try { cy.destroy(); } catch { /* ignore */ } }
    if (!$("#list-mode").checked) {
      cy = drawGraph(g, impact, $("#cy"));
      cy?.on("tap", "node", (evt) => {
        const id = evt.target.id();
        if (g.nodes.get(id)?.type === "requirement") pick(id);
        else renderDetail(g, id, impact, $("#detail"));
      });
    }
  }

  function pick(id) {
    selected = id;
    const n = g.nodes.get(id);
    what = { metric: n?.params?.metric, changed: false, newValue: n?.params?.minMonths ?? n?.params?.iIdleMax_uA };
    applyImpact();
  }

  $("#req-search").addEventListener("input", () => {
    renderReqList(g, $("#req-list"), selected, pick, $("#req-search").value);
  });
  $("#list-mode").addEventListener("change", () => {
    $("#list-view").classList.toggle("on", $("#list-mode").checked);
    $("#cy").style.display = $("#list-mode").checked ? "none" : "block";
    applyImpact();
  });

  if (window.matchMedia("(max-width: 980px)").matches) {
    $("#list-mode").checked = true;
    $("#list-view").classList.add("on");
    $("#cy").style.display = "none";
  }

  document.querySelectorAll(".tabs [data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tabs [data-tab]").forEach((b) => b.classList.toggle("on", b === btn));
      const tab = btn.dataset.tab;
      $("#view-impact").style.display = tab === "impact" ? "grid" : "none";
      $("#view-audit").classList.toggle("on", tab === "audit");
      $("#view-export").classList.toggle("on", tab === "export");
    });
  });

  renderAudit(audit);
  renderExport(g, model, audit);
  applyImpact();

  if (params.get("demo") === "e03") {
    what = { metric: "battery_life", newValue: 18, changed: true };
    selected = "E03";
    applyImpact();
  }
}

function renderAudit(audit) {
  const k = audit.kpis;
  $("#view-audit").innerHTML = `
    <h2>Traceability-Audit</h2>
    <p class="note">Prüft Downstream-Links, verwaiste Elemente, Zyklen, Test- und Risiko-Bindung.</p>
    <div class="kpi-row">
      <div class="kpi ${k.auditScore}"><span>Score</span><strong>${k.auditScore}</strong></div>
      <div class="kpi"><span>Coverage</span><strong>${k.traceabilityCoveragePct}%</strong></div>
      <div class="kpi"><span>Knoten / Kanten</span><strong>${k.nodeCount} / ${k.edgeCount}</strong></div>
      <div class="kpi"><span>Findings</span><strong>${audit.findings.length}</strong></div>
    </div>
    <p>
      <button class="btn" id="dl-audit-json">Audit JSON</button>
      <button class="btn" id="dl-audit-md">Audit Markdown</button>
    </p>
    <table>
      <thead><tr><th>Prio</th><th>Element</th><th>Prüfung</th><th>Beschreibung</th></tr></thead>
      <tbody>
        ${audit.findings.map((f) => `<tr class="${f.severity}"><td>${f.severity}</td><td class="mono">${f.item}</td><td>${f.check}</td><td>${f.title}</td></tr>`).join("")}
      </tbody>
    </table>`;
  $("#dl-audit-json").onclick = () => download("audit-report.json", JSON.stringify(audit, null, 2), "application/json");
  $("#dl-audit-md").onclick = () => download("audit-report.md", auditToMarkdown(audit), "text/markdown");
}

function renderExport(g, model, audit) {
  const sys = exportSysml(g);
  const puml = exportPlantUml(g);
  $("#view-export").innerHTML = `
    <h2>Export</h2>
    <p class="lead note">Die Website ist Editor/Frontend. Die Wahrheit liegt im JSON-Modell. SysML v2 ist ein textuelles Subset — kein zertifizierter Cameo-Roundtrip.</p>
    <p>
      <button class="btn-primary" id="dl-json">JSON-Modell</button>
      <button class="btn" id="dl-puml">PlantUML</button>
      <button class="btn" id="dl-sysml">SysML v2</button>
      <button class="btn" id="dl-loss">Modellverluste</button>
    </p>
    <h3>Roundtrip / Verluste</h3>
    <ul class="loss-list">
      ${sys.losses.map((l) => `<li>${l}</li>`).join("")}
      <li>JSON-Export = geladenes Modell (${g.nodes.size} Knoten, ${sys.connectionCount} Trace-Kanten) — kein Datenverlust.</li>
      <li>Audit-Findings: ${audit.findings.length} (Coverage ${audit.kpis.traceabilityCoveragePct}%).</li>
    </ul>
    <h3>SysML v2 (Auszug)</h3>
    <pre class="export mono" id="sysml-preview"></pre>`;
  $("#sysml-preview").textContent = sys.text.slice(0, 2500) + "\n…";
  $("#dl-json").onclick = () => download("mbse-model.json", exportJson(model), "application/json");
  $("#dl-puml").onclick = () => download("traceability.puml", puml, "text/plain");
  $("#dl-sysml").onclick = () => download("model.sysml", sys.text, "text/plain");
  $("#dl-loss").onclick = () => download(
    "modellverluste.md",
    `# Modellverluste\n\n${sys.losses.map((l) => `- ${l}`).join("\n")}\n`,
    "text/markdown",
  );
}

boot().catch((err) => {
  document.body.insertAdjacentHTML("afterbegin",
    `<p style="background:#5a2020;padding:1rem;margin:0">Start fehlgeschlagen: ${err.message}. Bitte lokalen Server nutzen, nicht file://.</p>`);
  console.error(err);
});
