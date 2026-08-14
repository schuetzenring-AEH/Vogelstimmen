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
  { id: "entscheidungen_v30", path: "../hardware/V3.0/docs/entscheidungen_v30.md", title: "09b ADRs Rev 3.0" },
  { id: "risiko_fmea", path: "../docs/risiko_fmea.md", title: "10 Risiko & FMEA" },
  { id: "schaltplan", path: "../hardware/V3.0/docs/schaltplan.md", title: "11 Schaltplan-Doku Rev 3.0" },
  { id: "schaltplan_hist", path: "../docs/schaltplan.md", title: "11b Schaltplan historisch (2.4)" },
  { id: "digitaler_zwilling", path: "../docs/digitaler_zwilling.md", title: "12 Digitaler Zwilling" },
  { id: "traceability", path: "../docs/traceability.md", title: "13 Traceability RTM" },
  { id: "digital_thread", path: "../docs/digital_thread.md", title: "14 Digital Thread" },
  { id: "vv_testplan", path: "../docs/vv_testplan.md", title: "15 V&V Testplan" },
  { id: "adversarial_v25", path: "../hardware/V2.5-final/docs/adversarial_review_v25.md", title: "16 Adversarial Review" },
  { id: "review_checkliste_m04", path: "../docs/review_checkliste_m04.md", title: "17 Checkliste M04" },
  { id: "fertigung_readme", path: "../hardware/V3.0/README.md", title: "18 Fertigungspaket Rev 3.0" },
  { id: "fertigung_v25", path: "../hardware/V2.5-final/README.md", title: "18b Fertigungspaket Rev 2.5 (Archiv)" },
  { id: "pcb_v30", path: "../docs/pcb_v3.0.md", title: "18c Platine Topview & BOM Rev 3.0" },
  { id: "bom_jlcpcb", path: "../docs/bom_jlcpcb.md", title: "19a BOM JLCPCB-Export" },
  { id: "bom_verfuegbarkeit", path: "../docs/bom_verfuegbarkeit.md", title: "19 BOM-Verfügbarkeit" },
  { id: "datasheets", path: "../docs/datasheets/README.md", title: "19b Datenblätter Rev 3.0" },
  { id: "montage_ibn", path: "../docs/montage_ibn.md", title: "20 Montage & IBN" },
  { id: "service_betrieb", path: "../docs/service_betrieb.md", title: "21 Service & Betrieb" },
  { id: "konfiguration_baseline", path: "../docs/konfiguration_baseline.md", title: "22 Konfiguration / Baseline" },
  { id: "zwischenstand", path: "../docs/zwischenstand.md", title: "23 Zwischenstand" },
  { id: "reviewer_handoff", path: "../docs/reviewer_handoff.md", title: "24 Reviewer Handoff" },
  { id: "kicad_anleitung", path: "../docs/kicad_anleitung.md", title: "25 KiCad-Anleitung" },
  { id: "sim_readme", path: "../simulation/README.md", title: "26 Simulation README" },
  { id: "root_readme", path: "../README.md", title: "27 Projekt-README" },
];

const ROUTES = new Set([
  "home", "vmodell", "stakeholder", "requirements", "usecases", "functions",
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
    const heading = rest.slice(1).join("/") || "";
    loadDoc(docId, heading);
  } else if (name !== "twin") {
    window.scrollTo(0, 0);
  }
  if (name === "twin") ensureSimFrame();
}

function scrollDocHeading(root, id) {
  if (!id || !root) return;
  const needle = id.toLowerCase();
  const h = [...root.querySelectorAll("h1, h2, h3")].find((el) => {
    const t = el.textContent.trim().toLowerCase();
    const hid = (el.id || "").toLowerCase();
    return t.startsWith(needle) || hid.startsWith(needle) || hid.includes(needle);
  });
  if (h) {
    h.scrollIntoView({ behavior: "smooth", block: "start" });
    h.style.outline = "2px solid var(--accent, #d4a017)";
    setTimeout(() => { h.style.outline = ""; }, 1600);
  }
}

async function loadDoc(id, heading) {
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
    history.replaceState(null, "", `#/bibliothek/${meta.id}${heading ? `/${heading}` : ""}`);
    if (heading) requestAnimationFrame(() => scrollDocHeading(out, heading));
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

function initNavToggle() {
  const nav = $(".nav");
  const btn = $("#nav-toggle");
  if (!nav || !btn) return;
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "Schließen" : "Menü";
  });
  $all(".nav-body a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "Menü";
    });
  });
}

function init() {
  initDocSelect();
  initCoverageFilter();
  initNavToggle();
  window.addEventListener("hashchange", route);
  route();
}

document.addEventListener("DOMContentLoaded", init);
