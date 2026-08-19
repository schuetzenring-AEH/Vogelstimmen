/**
 * Vogelstimmen MBSE Showcase — router + markdown library
 */
const DOCS = [
  { id: "mbse_reise", path: "../docs/mbse_reise.md", title: "00 Abdeckungskarte V-Modell" },
  { id: "stakeholder", path: "../docs/stakeholder.md", title: "01 Stakeholder" },
  { id: "anforderungen", path: "../docs/anforderungen.md", title: "02 Lastenheft" },
  { id: "pflichtenheft", path: "../docs/pflichtenheft.md", title: "03 Pflichtenheft" },
  { id: "use_cases", path: "../docs/use_cases.md", title: "04 Use Cases" },
  { id: "funktionsstruktur", path: "../docs/funktionsstruktur.md", title: "05 Funktionsstruktur" },
  { id: "systemarchitektur", path: "../docs/systemarchitektur.md", title: "06 Systemarchitektur" },
  { id: "mbse_sysml", path: "../docs/mbse_sysml.md", title: "07 SysML-Sicht" },
  { id: "pbs_icd", path: "../docs/pbs_icd.md", title: "08 PBS & ICD" },
  { id: "entscheidungen", path: "../docs/entscheidungen.md", title: "09 Designentscheidungen ADR" },
  { id: "risiko_fmea", path: "../docs/risiko_fmea.md", title: "10 Risiko & FMEA" },
  { id: "schaltplan", path: "../docs/schaltplan.md", title: "11 Schaltplan-Doku" },
  { id: "digitaler_zwilling", path: "../docs/digitaler_zwilling.md", title: "12 Digitaler Zwilling" },
  { id: "traceability", path: "../docs/traceability.md", title: "13 Traceability RTM" },
  { id: "digital_thread", path: "../docs/digital_thread.md", title: "14 Digital Thread" },
  { id: "vv_testplan", path: "../docs/vv_testplan.md", title: "15 V&V Testplan" },
  { id: "adversarial_v25", path: "../hardware/V2.5-final/docs/adversarial_review_v25.md", title: "16 Adversarial Review" },
  { id: "review_checkliste_m04", path: "../docs/review_checkliste_m04.md", title: "17 Checkliste M04" },
  { id: "fertigung_readme", path: "../hardware/V2.5-final/README.md", title: "18 Fertigungspaket" },
  { id: "bom_verfuegbarkeit", path: "../docs/bom_verfuegbarkeit.md", title: "19 BOM-Verfügbarkeit" },
  { id: "montage_ibn", path: "../docs/montage_ibn.md", title: "20 Montage & IBN" },
  { id: "service_betrieb", path: "../docs/service_betrieb.md", title: "21 Service & Betrieb" },
  { id: "konfiguration_baseline", path: "../docs/konfiguration_baseline.md", title: "22 Konfiguration / Baseline" },
  { id: "zwischenstand", path: "../docs/zwischenstand.md", title: "23 Zwischenstand" },
  { id: "reviewer_handoff", path: "../docs/reviewer_handoff.md", title: "24 Reviewer Handoff" },
  { id: "kicad_anleitung", path: "../docs/kicad_anleitung.md", title: "25 KiCad-Anleitung" },
  { id: "sim_readme", path: "../simulation/README.md", title: "26 Simulation README" },
  { id: "root_readme", path: "../README.md", title: "27 Projekt-README" },
  { id: "mbse_pitch", path: "../docs/mbse_pitch.md", title: "28 MBSE Pitch" },
  { id: "mbse_pitch_krones", path: "../docs/mbse_pitch_krones.md", title: "29 Pitch Krones" },
];

const ROUTES = new Set([
  "home", "vmodell", "pitch", "copilot", "stakeholder", "requirements", "usecases", "functions",
  "architektur", "sysml", "interfaces", "entscheidungen", "risiko",
  "design", "twin", "thread", "trace", "vv", "fertigung", "service", "bibliothek",
]);

function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function route() {
  const hash = (location.hash || "#/home").replace(/^#\/?/, "");
  const [page, ...rest] = hash.split("/");
  const name = ROUTES.has(page) ? page : "home";
  $all(".page").forEach((el) => el.classList.toggle("active", el.id === `page-${name}`));
  $all(".nav a[data-route]").forEach((a) => {
    a.classList.toggle("active", a.dataset.route === name);
  });
  if (name === "bibliothek") {
    const docId = rest[0] || $("#doc-select")?.value || "mbse_reise";
    loadDoc(docId);
  }
  if (name === "twin") ensureSimFrame();
  if (name === "pitch") ensurePitchFrame();
  if (name === "copilot" || name === "home") loadMbseKpis();
  if (name !== "twin" && name !== "pitch") window.scrollTo(0, 0);
}

async function loadDoc(id) {
  const meta = DOCS.find((d) => d.id === id) || DOCS[0];
  const sel = $("#doc-select");
  if (sel && sel.value !== meta.id) sel.value = meta.id;
  const out = $("#md-out");
  const status = $("#md-status");
  if (!out) return;
  out.innerHTML = "<p>Lade …</p>";
  if (status) status.textContent = meta.path;
  try {
    const res = await fetch(meta.path);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const text = await res.text();
    out.innerHTML = window.marked.parse(text, { mangle: false, headerIds: true });
    history.replaceState(null, "", `#/bibliothek/${meta.id}`);
  } catch (e) {
    out.innerHTML = `<p style="color:#e35d5d">Dokument nicht ladbar: ${e.message}. Bitte START.bat nutzen (lokaler Server).</p>`;
  }
}

function ensureSimFrame() {
  const frame = $("#sim-frame");
  if (!frame || frame.dataset.loaded) return;
  frame.src = "../simulation/index.html";
  frame.dataset.loaded = "1";
}

function ensurePitchFrame() {
  const frame = $("#pitch-frame");
  if (!frame || frame.dataset.loaded) return;
  frame.src = "../mbse/presentation.html";
  frame.dataset.loaded = "1";
}

async function loadMbseKpis() {
  const boxes = $all("[data-mbse-kpi]");
  if (!boxes.length || window.__mbseKpiLoaded) return;
  try {
    const res = await fetch("../mbse/data/mbse-model.json");
    if (!res.ok) throw new Error(String(res.status));
    const model = await res.json();
    const nodes = model.nodes || [];
    const edges = model.edges || [];
    const reqs = nodes.filter((n) => n.type === "requirement");
    const from = new Set(edges.filter((e) => ["satisfies", "allocates", "verifies", "derives"].includes(e.type)).map((e) => e.from));
    const withDown = reqs.filter((r) => from.has(r.id)).length;
    const coverage = reqs.length ? Math.round((withDown / reqs.length) * 100) : 0;
    const linked = new Set();
    for (const e of edges) { linked.add(e.from); linked.add(e.to); }
    const orphans = nodes.filter((n) => n.type !== "software" && !linked.has(n.id)).length;
    window.__mbseKpiLoaded = true;
    boxes.forEach((el) => {
      const k = el.dataset.mbseKpi;
      if (k === "coverage") el.textContent = `${coverage}%`;
      if (k === "orphans") el.textContent = String(orphans);
      if (k === "nodes") el.textContent = String(nodes.length);
      if (k === "docs") el.textContent = String(nodes.filter((n) => n.type === "document").length);
    });
  } catch {
    boxes.forEach((el) => { if (!el.textContent || el.textContent === "—") el.textContent = "n/a"; });
  }
}

function initDocSelect() {
  const sel = $("#doc-select");
  if (!sel) return;
  sel.innerHTML = DOCS.map((d) => `<option value="${d.id}">${d.title}</option>`).join("");
  sel.addEventListener("change", () => loadDoc(sel.value));
}

function initCoverageFilter() {
  const buttons = $all("[data-cov-filter]");
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.covFilter;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      $all("[data-cov]").forEach((row) => {
        if (f === "all") row.hidden = false;
        else row.hidden = row.dataset.cov !== f;
      });
    });
  });
}

function init() {
  initDocSelect();
  initCoverageFilter();
  window.addEventListener("hashchange", route);
  route();
}

document.addEventListener("DOMContentLoaded", init);
