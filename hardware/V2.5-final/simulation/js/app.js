import { BoardSim } from "./model.js";
import { PARTS, SYS } from "./parts.js";
import { BLOCKS, META, isBluePart, checkCompliance, fmtLimitI, fmtLimitV } from "./catalog.js";
import { renderSystemDiagram, renderInnerDiagram } from "./diagrams.js";

const BLUE = "#3a7ab8";
const BLUE_DIM = "#2a5a88";

const PHASE_LABEL = {
  idle: "Idle (Latch aus)",
  set_pulse: "SET-Impuls",
  power_up: "Power-Up / Boot",
  playing: "Wiedergabe",
  release: "Release (BUSY HIGH)",
  off_settle: "Aus",
};

function fmtI(a) {
  const x = Math.abs(a);
  if (x < 1e-9) return "0";
  if (x < 1e-6) return `${(a * 1e9).toFixed(1)} nA`;
  if (x < 1e-3) return `${(a * 1e6).toFixed(1)} µA`;
  if (x < 1) return `${(a * 1e3).toFixed(2)} mA`;
  return `${a.toFixed(3)} A`;
}

function fmtV(v) {
  if (Math.abs(v) < 0.0005) return "0 V";
  if (Math.abs(v) < 1) return `${(v * 1e3).toFixed(0)} mV`;
  return `${v.toFixed(2)} V`;
}

function heatColor(i, maxI) {
  const t = Math.min(1, Math.abs(i) / (maxI || 1e-6));
  const r = Math.round(40 + t * 180);
  const g = Math.round(120 - t * 80);
  const b = Math.round(90 - t * 40);
  return `rgb(${r},${g},${b})`;
}

/** Stromfluss: grau (Ruhe) / grün (<1 mA) / gelb (<50 mA) / rot (≥50 mA) */
function flowStroke(iAbs) {
  if (iAbs < 1e-6) return { color: "#7a8c82", glow: false, widthBoost: 0 };
  if (iAbs < 1e-3) return { color: "#2ee66a", glow: true, widthBoost: 0.12 };
  if (iAbs < 50e-3) return { color: "#ffc107", glow: true, widthBoost: 0.2 };
  return { color: "#ff4d4d", glow: true, widthBoost: 0.35 };
}

export async function boot() {
  if (!PARTS.R13 || !PARTS.C4 || !PARTS.R12) {
    throw new Error(
      "Veraltete js/parts.js im Browser-Cache. Bitte Strg+Shift+R oder Cache leeren.",
    );
  }

  // Relativ zu js/app.js → funktioniert unter /simulation/ und root-serve
  const layoutUrl = new URL("../pcb_layout.json", import.meta.url);
  const tracksUrl = new URL("../pcb_tracks.json", import.meta.url);
  const [layout, trackData] = await Promise.all([
    fetch(layoutUrl).then((r) => {
      if (!r.ok) throw new Error(`pcb_layout.json: ${r.status}`);
      return r.json();
    }),
    fetch(tracksUrl).then((r) => {
      if (!r.ok) throw new Error(`pcb_tracks.json: ${r.status}`);
      return r.json();
    }),
  ]);
  const sim = new BoardSim();
  let selected = "R6";
  let running = true;
  let speed = 1;
  let holdMs = 400;

  const el = {
    board: document.getElementById("board"),
    table: document.getElementById("part-table"),
    nets: document.getElementById("nets"),
    phase: document.getElementById("phase"),
    msg: document.getElementById("msg"),
    ibat: document.getElementById("ibat"),
    counter: document.getElementById("counter"),
    detail: document.getElementById("detail"),
    track: document.getElementById("track"),
    miss: document.getElementById("miss"),
    hold: document.getElementById("hold"),
    speed: document.getElementById("speed"),
  };

  const btnBox = document.getElementById("buttons");
  for (let i = 0; i < 8; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "btn-bird";
    b.textContent = `T${i + 1}`;
    b.dataset.i = String(i);
    const pulse = () => {
      sim.press(i);
      b.classList.add("down");
      try { render(sim.solve()); } catch (err) { showSimError(err); return; }
      window.setTimeout(() => {
        sim.release(i);
        b.classList.remove("down");
        try { render(sim.solve()); } catch (err) { showSimError(err); }
      }, holdMs);
    };
    b.addEventListener("click", (e) => {
      e.preventDefault();
      pulse();
    });
    btnBox.appendChild(b);
  }

  document.getElementById("reset").onclick = () => {
    sim.reset();
    try { render(sim.solve()); } catch (err) { showSimError(err); }
  };
  el.miss.onchange = () => {
    sim.enforceShortPressMiss = el.miss.checked;
  };
  el.hold.oninput = () => {
    holdMs = Number(el.hold.value);
    document.getElementById("hold-val").textContent = `${holdMs} ms`;
  };
  el.speed.oninput = () => {
    speed = Number(el.speed.value);
    document.getElementById("speed-val").textContent = `${speed.toFixed(1)}×`;
  };
  document.getElementById("pause").onclick = () => {
    running = !running;
    document.getElementById("pause").textContent = running ? "Pause" : "Weiter";
  };

  const ox = layout.origin_mm[0];
  const oy = layout.origin_mm[1];
  const w = layout.size_mm[0];
  const h = layout.size_mm[1];
  const pad = 4;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `${ox - pad} ${oy - pad} ${w + 2 * pad} ${h + 2 * pad}`);
  svg.classList.add("pcb");

  const edge = document.createElementNS(svgNS, "rect");
  edge.setAttribute("x", String(ox));
  edge.setAttribute("y", String(oy));
  edge.setAttribute("width", String(w));
  edge.setAttribute("height", String(h));
  edge.setAttribute("class", "pcb-edge");
  svg.appendChild(edge);

  // Leiterbahnen unter den Bauteilen
  const trackLayer = document.createElementNS(svgNS, "g");
  trackLayer.setAttribute("class", "tracks");
  const trackNodes = [];

  // Rückseite zuerst (etwas blasser)
  const ordered = [...trackData.tracks].sort((a, b) => {
    const la = a.layer === "B.Cu" ? 0 : 1;
    const lb = b.layer === "B.Cu" ? 0 : 1;
    return la - lb;
  });

  for (const t of ordered) {
    if (t.type === "via") {
      const g = document.createElementNS(svgNS, "g");
      g.setAttribute("class", "via");
      g.dataset.net = t.net;
      const title = document.createElementNS(svgNS, "title");
      title.textContent = `Via ${t.net}`;
      g.appendChild(title);
      const outer = document.createElementNS(svgNS, "circle");
      outer.setAttribute("cx", String(t.x));
      outer.setAttribute("cy", String(t.y));
      outer.setAttribute("r", "0.55");
      outer.setAttribute("class", "via-outer");
      outer.style.stroke = "#6a7a70";
      const inner = document.createElementNS(svgNS, "circle");
      inner.setAttribute("cx", String(t.x));
      inner.setAttribute("cy", String(t.y));
      inner.setAttribute("r", "0.22");
      inner.setAttribute("class", "via-inner");
      g.appendChild(outer);
      g.appendChild(inner);
      trackLayer.appendChild(g);
      trackNodes.push({ el: g, ring: outer, net: t.net, type: "via" });
      continue;
    }
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", String(t.x1));
    line.setAttribute("y1", String(t.y1));
    line.setAttribute("x2", String(t.x2));
    line.setAttribute("y2", String(t.y2));
    // sichtbarer: mind. 0.35 mm, Power-Netze dicker
    const power = /12V|BAT|5V|GND|SW|SPK|RPP/.test(t.net || "");
    const baseW = Math.max(t.w || 0.25, power ? 0.45 : 0.35);
    line.style.stroke = "#6a7a70";
    line.style.strokeWidth = String(baseW);
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("class", t.layer === "B.Cu" ? "track track-b" : "track track-f");
    line.dataset.net = t.net;
    const tip = document.createElementNS(svgNS, "title");
    tip.textContent = t.net;
    line.appendChild(tip);
    trackLayer.appendChild(line);
    trackNodes.push({ el: line, net: t.net, type: "seg", baseW, back: t.layer === "B.Cu" });
  }
  svg.appendChild(trackLayer);

  const partNodes = new Map();
  for (const p of layout.parts) {
    if (/^H\d/.test(p.ref)) continue; // Montagelöcher nicht anklickbar
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "fp");
    g.dataset.ref = p.ref;
    const meta = META[p.ref];
    const blue = isBluePart(p.ref, meta?.kind);
    if (blue) g.classList.add("fp-blue");
    const size =
      p.ref.startsWith("U") || p.ref === "J5" ? 6
        : p.ref.startsWith("J") || p.ref.startsWith("TP") ? 3.6
          : p.ref.startsWith("Q") || p.ref.startsWith("D") ? 3.2
            : 2.4;
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(p.x - size / 2));
    rect.setAttribute("y", String(p.y - size / 2));
    rect.setAttribute("width", String(size));
    rect.setAttribute("height", String(size));
    rect.setAttribute("rx", "0.4");
    if (blue) rect.style.fill = BLUE;
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", String(p.x));
    label.setAttribute("y", String(p.y - size / 2 - 0.6));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "fp-label");
    label.textContent = p.ref;
    g.appendChild(rect);
    g.appendChild(label);
    g.addEventListener("click", () => {
      selected = p.ref;
      render(sim.solve());
    });
    svg.appendChild(g);
    partNodes.set(p.ref, { g, rect, label, blue });
  }
  el.board.appendChild(svg);

  let lastDetailKey = "";
  const helpOverlay = document.getElementById("help-overlay");
  const helpTitle = document.getElementById("help-title");
  const helpSub = document.getElementById("help-sub");
  const helpBlock = document.getElementById("help-block");
  const helpPart = document.getElementById("help-part");
  const helpSysDiag = document.getElementById("help-sys-diag");
  const helpInnerDiag = document.getElementById("help-inner-diag");

  function openHelp(ref) {
    const meta = META[ref];
    const blockId = meta?.block;
    const block = BLOCKS[blockId];
    const ds = PARTS[ref];
    helpTitle.textContent = `${ref}${ds?.value ? ` — ${ds.value}` : ""}`;
    helpSub.textContent = block
      ? `Baugruppe ${block.id} · ${block.name}`
      : "Keine Baugruppe zugeordnet";
    helpSysDiag.innerHTML = blockId
      ? renderSystemDiagram(blockId)
      : "<p class=\"diag-legend\">Keine Baugruppe — Systemübersicht nicht hervorgehoben.</p>" + renderSystemDiagram(null);
    helpInnerDiag.innerHTML = blockId
      ? renderInnerDiagram(blockId)
      : "<p>Kein internes Funktionsschaubild.</p>";
    helpBlock.textContent = block?.detail || block?.task || "Keine Detailbeschreibung für die Baugruppe.";
    helpPart.textContent = meta?.detail || meta?.role || "Keine Detailbeschreibung für dieses Bauteil.";
    helpOverlay.classList.add("open");
    helpOverlay.setAttribute("aria-hidden", "false");
  }

  function closeHelp() {
    helpOverlay.classList.remove("open");
    helpOverlay.setAttribute("aria-hidden", "true");
  }

  document.getElementById("help-close").onclick = closeHelp;
  helpOverlay.addEventListener("click", (e) => {
    if (e.target === helpOverlay) closeHelp();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeHelp();
  });
  el.detail.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-help-ref]");
    if (!btn) return;
    e.preventDefault();
    openHelp(btn.getAttribute("data-help-ref"));
  });

  function netCurrent(netI, netName) {
    if (!netName) return 0;
    if (netI[netName] != null) return Math.abs(netI[netName]);
    const bare = netName.startsWith("/") ? netName.slice(1) : netName;
    if (netI[`/${bare}`] != null) return Math.abs(netI[`/${bare}`]);
    if (netI[bare] != null) return Math.abs(netI[bare]);
    return 0;
  }

  function showSimError(err) {
    console.error(err);
    el.msg.textContent = `Simulationsfehler: ${err.message}`;
    el.msg.style.color = "#e35d5d";
  }

  function render(s) {
    el.phase.textContent = PHASE_LABEL[s.phase] || s.phase;
    el.msg.textContent = s.message;
    el.ibat.textContent = fmtI(s.Ibat);
    el.counter.textContent = String(s.counter);
    el.track.textContent = s.playing ? `${s.trackLeft.toFixed(1)} s` : "—";

    el.nets.innerHTML = [
      ["BAT", s.nets.BAT],
      ["12V_PROT", s.nets["12V_PROT"]],
      ["12V_SW", s.nets["12V_SW"]],
      ["5V", s.nets["5V"]],
      ["BTN_OR", s.nets.BTN_OR],
      ["LATCH_SET", s.nets.LATCH_SET],
      ["BUSY", s.nets.BUSY],
      ["Q5_GATE", s.nets.Q5_GATE],
      ["Q1_GATE", s.nets.Q1_GATE],
      ["Q6_GATE", s.nets.Q6_GATE],
    ]
      .map(([n, v]) => `<div><span>${n}</span><strong>${fmtV(v)}</strong></div>`)
      .join("");

    // Leiterbahnen einfärben (style.stroke — nicht Attribute, CSS-sicher)
    const ni = s.netI || {};
    for (const tn of trackNodes) {
      const iAbs = netCurrent(ni, tn.net);
      const { color, glow, widthBoost } = flowStroke(iAbs);
      if (tn.type === "via") {
        tn.ring.style.stroke = color;
        tn.el.style.opacity = glow ? "1" : "0.65";
      } else {
        tn.el.style.stroke = color;
        tn.el.style.strokeWidth = String(tn.baseW + widthBoost);
        tn.el.style.opacity = tn.back ? (glow ? "0.85" : "0.4") : glow ? "1" : "0.7";
        tn.el.classList.toggle("flow", glow);
      }
      tn.el.dataset.i = String(iAbs);
    }

    const maxI = Math.max(...s.parts.map((p) => Math.abs(p.I)), 1e-6);
    for (const [ref, node] of partNodes) {
      const p = s.parts.find((x) => x.ref === ref);
      const meta = META[ref];
      const blue = node.blue || isBluePart(ref, meta?.kind);
      if (blue) {
        node.rect.style.fill = ref === selected ? "#4a9ad8" : BLUE;
      } else if (ref === "U2") {
        node.rect.style.fill = s.playing ? "#c45c26" : s.nets["5V"] > 0 ? "#2f6f4e" : "#3a3a3a";
      } else if (ref === "J5") {
        node.rect.style.fill = s.nets["5V"] > 0 ? "#2f6f4e" : "#3a3a3a";
      } else if (p) {
        node.rect.style.fill = heatColor(p.I, maxI * 0.3);
      } else {
        node.rect.style.fill = BLUE_DIM;
      }
      const comp = p ? checkCompliance(ref, p, s.nets, { Vgs: p.Vgs }) : { ok: true };
      node.g.classList.toggle("sel", ref === selected);
      node.g.classList.toggle("warn", p ? !p.ok || !comp.ok : false);
      node.g.classList.toggle("active", p ? Math.abs(p.I) > 1e-6 || /EIN|PLAY|leitet/.test(p.state) : false);
    }

    const tableParts = s.parts.filter((p) => !/^H\d/.test(p.ref));
    el.table.innerHTML = tableParts
      .map((p) => {
        const block = p.block || META[p.ref]?.block || "—";
        const comp = checkCompliance(p.ref, p, s.nets, { Vgs: p.Vgs });
        return `<tr class="${p.ref === selected ? "sel" : ""} ${comp.ok ? "" : "bad"}" data-ref="${p.ref}">
        <td>${p.ref}</td><td>${block}</td><td>${p.value}</td><td>${p.state}</td>
        <td>${fmtV(p.V)}</td><td>${fmtI(p.I)}</td>
        <td>${comp.ok ? "OK" : "!" }</td>
      </tr>`;
      })
      .join("");

    el.table.querySelectorAll("tr").forEach((tr) => {
      tr.addEventListener("click", () => {
        selected = tr.dataset.ref;
        render(sim.solve());
      });
    });

    // Detail nur bei Änderung neu schreiben (sonst ?-Klick unbenutzbar)
    const detailKey = [
      selected,
      s.phase,
      s.parts.find((p) => p.ref === selected)?.state,
      Math.round((s.parts.find((p) => p.ref === selected)?.I || 0) * 1e6),
      Math.round((s.parts.find((p) => p.ref === selected)?.V || 0) * 100),
    ].join("|");
    if (detailKey !== lastDetailKey) {
      lastDetailKey = detailKey;
      el.detail.innerHTML = renderDetail(selected, s);
    }
  }

  function renderDetail(ref, s) {
    const sp = s.parts.find((p) => p.ref === ref);
    const ds = PARTS[ref];
    const meta = META[ref];
    const block = BLOCKS[meta?.block || sp?.block];
    const reading = sp || {
      ref,
      value: ds?.value || ref,
      state: "—",
      V: 0,
      I: 0,
      P: 0,
      note: meta?.role || "",
      Vgs: undefined,
    };
    const comp = checkCompliance(ref, reading, s.nets, { Vgs: reading.Vgs });
    const L = meta?.limits || {};

    const limitRows = [];
    if (L.Vmax != null) limitRows.push(["U max", fmtLimitV(L.Vmax)]);
    if (L.VdsMax != null) limitRows.push(["VDS max", fmtLimitV(L.VdsMax)]);
    if (L.VgsMax != null) limitRows.push(["VGS max", `±${fmtLimitV(L.VgsMax)}`]);
    if (L.Vz != null) limitRows.push(["Vz", fmtLimitV(L.Vz)]);
    if (L.VinMax != null) limitRows.push(["VIN", `${L.VinMin}…${L.VinMax} V`]);
    if (L.Vout != null) limitRows.push(["VOUT", `${L.Vout} V fest`]);
    if (L.Imax != null) limitRows.push(["I max", fmtLimitI(L.Imax)]);
    if (L.Iidle != null) limitRows.push(["I Idle", fmtLimitI(L.Iidle)]);
    if (L.Iwork != null) limitRows.push(["I Betrieb", `≤ ${fmtLimitI(L.Iwork)}`]);
    if (L.IoutMax != null) limitRows.push(["Iout max", fmtLimitI(L.IoutMax)]);
    if (L.Pmax != null && L.Pmax < 10) limitRows.push(["P max", `${(L.Pmax * 1e3).toFixed(0)} mW`]);
    if (L.Vtol) limitRows.push(["V Betrieb", `${L.Vtol[0]}…${L.Vtol[1]} V`]);

    const checkHtml = comp.checks.length
      ? `<table class="spec-check"><thead><tr><th>Prüfung</th><th>Limit</th><th>Ist</th><th></th></tr></thead><tbody>
          ${comp.checks
            .map(
              (c) => `<tr class="${c.ok ? "ok" : "fail"}"><td>${c.name}</td><td>${c.limit}</td><td>${c.actual}</td><td>${c.ok ? "OK" : "FAIL"}</td></tr>`,
            )
            .join("")}
        </tbody></table>
        <p class="comp-verdict ${comp.ok ? "ok" : "fail"}">${comp.ok ? "Spezifikationen eingehalten" : "Spezifikation verletzt"}</p>`
      : `<p class="comp-verdict ok">Keine Spannungs-/Stromlimits hinterlegt</p>`;

    const helpBtn = `<button type="button" class="help-btn" data-help-ref="${ref}" title="Ausführliche Erklärung">?</button>`;

    return `<h3>${ref} — ${reading.value || ds?.value || ""}</h3>
      <div class="meta-block">
        <div>
          <div class="meta-head"><span class="label">Baugruppe</span>${helpBtn}</div>
          <div class="meta-text">${block ? `${block.id} · ${block.name}` : "—"}</div>
        </div>
        <div>
          <div class="meta-head"><span class="label">Aufgabe der Baugruppe</span>${helpBtn}</div>
          <div class="meta-text">${block?.task || "—"}</div>
        </div>
        <div>
          <div class="meta-head"><span class="label">Aufgabe des Bauteils</span>${helpBtn}</div>
          <div class="meta-text">${meta?.role || reading.note || ds?.note || "—"}</div>
        </div>
      </div>
      <ul>
        <li>Zustand: <strong>${reading.state}</strong></li>
        <li>U ≈ <strong>${fmtV(reading.V)}</strong>${reading.Vgs != null ? ` · VGS ≈ <strong>${reading.Vgs.toFixed(2)} V</strong>` : ""}</li>
        <li>I ≈ <strong>${fmtI(reading.I)}</strong></li>
        <li>P ≈ <strong>${(reading.P * 1e3).toFixed(3)} mW</strong></li>
        ${ds?.source ? `<li>Quelle: ${ds.source}</li>` : ""}
      </ul>
      <h4>Spezifikation</h4>
      <ul class="spec-list">${limitRows.map(([k, v]) => `<li>${k}: <strong>${v}</strong></li>`).join("") || "<li>—</li>"}</ul>
      <h4>Einhaltung (Sim)</h4>
      ${checkHtml}`;
  }

  let last = performance.now();
  function loop(now) {
    const dtReal = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (running) {
      try {
        const s = sim.step(dtReal * speed);
        render(s);
      } catch (err) {
        showSimError(err);
        running = false;
        document.getElementById("pause").textContent = "Weiter";
      }
    }
    requestAnimationFrame(loop);
  }

  render(sim.solve());
  requestAnimationFrame(loop);

  window.sim = sim;
  window.SYS = SYS;
}
