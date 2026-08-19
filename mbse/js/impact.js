import {
  computeImpact, chainOf, TYPE_LABEL, TYPE_LAYER, showcaseHref, nodeOf,
} from "./graph-engine.js";

const COLOR = { red: "#e35d5d", yellow: "#d4a017", green: "#6fbf8a" };

export function renderReqList(g, el, selected, onPick, filter = "") {
  const q = filter.trim().toLowerCase();
  const reqs = [...g.nodes.values()]
    .filter((n) => n.type === "requirement")
    .filter((n) => !q || `${n.id} ${n.title}`.toLowerCase().includes(q))
    .sort((a, b) => a.id.localeCompare(b.id, "de"));
  el.innerHTML = reqs.map((n) => `
    <button type="button" class="req-item ${n.id === selected ? "on" : ""}" data-id="${n.id}">
      <strong>${n.id}</strong>
      <small>${n.title}</small>
    </button>`).join("");
  el.querySelectorAll("[data-id]").forEach((b) => {
    b.addEventListener("click", () => onPick(b.dataset.id));
  });
}

export function renderWhatIf(g, id, el, state, onApply) {
  const n = nodeOf(g, id);
  if (!n) { el.innerHTML = ""; return; }
  const p = n.params || {};
  if (p.metric === "battery_life") {
    const v = state.newValue ?? p.minMonths;
    el.innerHTML = `
      <label>What-if ${n.id}: ≥
        <input type="number" id="wf-val" min="1" max="60" value="${v}" /> Monate
      </label>
      <button type="button" class="btn-primary" id="wf-go">Änderung anwenden</button>
      <button type="button" class="btn" id="wf-reset">Reset 12</button>`;
    el.querySelector("#wf-go").onclick = () => {
      const nv = Number(el.querySelector("#wf-val").value);
      onApply({ metric: "battery_life", newValue: nv, changed: nv !== p.minMonths });
    };
    el.querySelector("#wf-reset").onclick = () => onApply({ metric: "battery_life", newValue: 12, changed: false });
    return;
  }
  if (p.metric === "idle_current") {
    const v = state.newValue ?? p.iIdleMax_uA;
    el.innerHTML = `
      <label>What-if ${n.id}: I_idle ≤
        <input type="number" id="wf-val" min="0" max="500" value="${v}" /> µA
      </label>
      <button type="button" class="btn-primary" id="wf-go">Änderung anwenden</button>`;
    el.querySelector("#wf-go").onclick = () => {
      const nv = Number(el.querySelector("#wf-val").value);
      onApply({ metric: "idle_current", newValue: nv, changed: nv !== p.iIdleMax_uA });
    };
    return;
  }
  el.innerHTML = `<span class="note">Klick zeigt die Kette. What-if für E03 (Monate) und E02 (µA).</span>`;
}

export function renderList(impact, el) {
  const block = (label, items, cls) => {
    if (!items.length) return "";
    return `<div class="impact-group"><h3>${label} (${items.length})</h3>
      ${items.map((i) => `<a class="chip ${cls}" href="#n-${i.id}">${i.id} · ${TYPE_LABEL[i.type] || i.type}</a>`).join("")}
    </div>`;
  };
  el.innerHTML =
    block("Direkt betroffen", impact.groups.red, "red") +
    block("Möglicherweise betroffen", impact.groups.yellow, "yellow") +
    `<p class="note">${impact.counts.green} Elemente unverändert (grün).</p>`;
}

export function renderDetail(g, id, impact, el) {
  const n = nodeOf(g, id);
  if (!n) return;
  const st = impact.status.get(id) || "green";
  const chain = chainOf(g, impact.startId);
  const line = (type) => (chain[type] || []).slice(0, 12)
    .map((x) => `<a class="chip ${impact.status.get(x.id)}" href="${showcaseHref(x)}">${x.id}</a>`).join(" ") || "—";
  el.innerHTML = `
    <h2>${n.id}</h2>
    <p>${n.title || ""}</p>
    <p class="note">${TYPE_LABEL[n.type] || n.type} · Status <strong style="color:${COLOR[st]}">${st}</strong></p>
    <div class="kpi-row">
      <div class="kpi red"><span>Direkt</span><strong>${impact.counts.red}</strong></div>
      <div class="kpi yellow"><span>Review</span><strong>${impact.counts.yellow}</strong></div>
      <div class="kpi green"><span>Unverändert</span><strong>${impact.counts.green}</strong></div>
    </div>
    <p class="mono" style="font-size:0.75rem">Requirement → Funktion → Block → Interface → Test</p>
    <p><span class="note">Funktionen</span><br>${line("function")}</p>
    <p><span class="note">Blöcke</span><br>${line("block")}</p>
    <p><span class="note">Interfaces</span><br>${line("interface")}</p>
    <p><span class="note">Tests</span><br>${line("test")}</p>
    <p><span class="note">Risiken</span><br>${line("risk")}</p>
    <p><span class="note">Dokumente</span><br>${line("document")}</p>
    <p><a href="${showcaseHref(n)}">In Doku öffnen</a></p>
  `;
}

export function drawGraph(g, impact, container) {
  const focus = new Set(
    [...impact.status.entries()].filter(([, s]) => s !== "green").map(([id]) => id),
  );
  focus.add(impact.startId);
  const ids = focus.size > 2 ? focus : new Set(impact.status.keys());
  const elements = [];
  for (const id of ids) {
    const n = g.nodes.get(id);
    if (!n) continue;
    const st = impact.status.get(id) || "green";
    elements.push({
      data: {
        id,
        label: `${id}\n${(n.title || "").slice(0, 28)}`,
        layer: TYPE_LAYER[n.type] ?? 4,
        color: COLOR[st],
      },
    });
  }
  for (const [, list] of g.out) {
    for (const e of list) {
      if (!ids.has(e.from) || !ids.has(e.to)) continue;
      elements.push({ data: { id: `${e.from}->${e.to}-${e.type}`, source: e.from, target: e.to, label: e.type } });
    }
  }

  if (typeof window.cytoscape !== "function") {
    container.innerHTML = `<p class="note" style="padding:1rem">Graph-Bibliothek nicht geladen — Listenansicht nutzen.</p>`;
    return null;
  }
  container.innerHTML = "";
  return window.cytoscape({
    container,
    elements,
    style: [
      {
        selector: "node",
        style: {
          label: "data(label)",
          "text-wrap": "wrap",
          "text-max-width": "90px",
          "font-size": 8,
          "font-family": "Consolas, monospace",
          color: "#e8efe6",
          "background-color": "#1c2820",
          "border-width": 2,
          "border-color": "data(color)",
          width: 56,
          height: 36,
          shape: "round-rectangle",
        },
      },
      {
        selector: "edge",
        style: {
          width: 1.2,
          "line-color": "#4a5c50",
          "target-arrow-color": "#4a5c50",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "font-size": 6,
          color: "#7a8c82",
        },
      },
    ],
    layout: {
      name: "breadthfirst",
      directed: true,
      padding: 16,
      spacingFactor: 1.15,
      roots: `#${cssEscape(impact.startId)}`,
    },
    userZoomingEnabled: true,
    userPanningEnabled: true,
    wheelSensitivity: 0.3,
  });
}

function cssEscape(id) {
  if (window.CSS?.escape) return window.CSS.escape(id);
  return id.replace(/[^A-Za-z0-9_-]/g, "\\$&");
}

export { computeImpact };
