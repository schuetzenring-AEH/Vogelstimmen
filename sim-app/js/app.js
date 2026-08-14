import { BoardSim } from "./model.js";
import { PARTS, SYS } from "./parts.js";
import { BLOCKS, META, isBluePart, checkCompliance, fmtLimitI, fmtLimitV } from "./catalog.js";
import { renderSystemDiagram, renderInnerDiagram } from "./diagrams.js";
import { renderTraceHtml } from "./trace.js";

const BLUE = "#3a7ab8";
const BLUE_DIM = "#2a5a88";

const PHASE_LABEL = {
  idle: "Idle (Latch aus)",
  set_pulse: "SET-Impuls",
  cnt_pulse: "Zähler-One-Shot (~80 ms)",
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

const PHOTO = {
  // Maße = sichtbarer Kunststoffkörper in mm, zentriert auf KiCad-Ursprung.
  // U2: Foto bereits 90° CW (USB links). Footprint-Rotation nicht nochmal anwenden.
  U2: { file: "dysv17f_top.png", w: 26.0, h: 23.0, fit: "slice", rot: 0 },
  // J5: Gehäuse 25,2×31 (Seide). Ziffernfenster als Anteil der Fotofläche.
  J5: {
    file: "hengstler_0635128_top.png",
    w: 25.2,
    h: 31.0,
    rot: 0,
    fit: "none",
    // Fenster auf die Foto-Rollen: größer, etwas tiefer, leicht nach links.
    digits: { top: 0.165, height: 0.20, width: 0.86, left: 0.055 },
  },
  // Phoenix MPT: KiCad-Ursprung = Pin 1, Foto auf Pad-/Seiden-Mitte (anchor bbox).
  J3: { file: "phoenix_mpt_8_top.png", w: 21.0, h: 8.4, fit: "slice", anchor: "bbox" },
  J4: { file: "phoenix_mpt_8_top.png", w: 21.0, h: 8.4, fit: "slice", anchor: "bbox" },
  J1: { file: "phoenix_mpt_2_top.png", w: 6.6, h: 8.4, fit: "slice", anchor: "bbox" },
  J2: { file: "phoenix_mpt_2_top.png", w: 6.6, h: 8.4, fit: "slice", anchor: "bbox" },
  J6: { file: "phoenix_mpt_2_top.png", w: 6.6, h: 8.4, fit: "slice", anchor: "bbox" },
};

function photoSpec(p) {
  const spec = PHOTO[p.ref];
  if (!spec) return null;
  if (typeof spec === "string") return { file: spec };
  return spec;
}

function assetUrl(name) {
  return new URL(`../assets/${name}`, import.meta.url).href;
}

/** 6-stelliges Fenster auf dem Hengstler, Position relativ zum Gehäuse (25,2×31 mm). */
function makeHengstlerDigits(svgNS, p, layer, spec) {
  const g = document.createElementNS(svgNS, "g");
  g.setAttribute("class", "cnt-digits");
  g.setAttribute("transform", `translate(${p.x} ${p.y})`);
  const W = spec.w || 25.2;
  const H = spec.h || 31;
  const d = spec.digits || { top: 0.165, height: 0.20, width: 0.86, left: 0.055 };
  const winW = W * d.width;
  const winH = H * d.height;
  const left = d.left != null ? d.left : (1 - d.width) / 2;
  const winY = -H / 2 + H * d.top;
  const winX = -W / 2 + W * left;
  const cellW = winW / 6;
  const fontPx = winH * 0.82;
  const texts = [];
  for (let i = 0; i < 6; i++) {
    const x = winX + i * cellW;
    const drum = document.createElementNS(svgNS, "rect");
    drum.setAttribute("x", String(x + 0.06));
    drum.setAttribute("y", String(winY));
    drum.setAttribute("width", String(cellW - 0.12));
    drum.setAttribute("height", String(winH));
    drum.setAttribute("rx", "0.15");
    drum.setAttribute("class", "cnt-drum");
    g.appendChild(drum);
    const t = document.createElementNS(svgNS, "text");
    t.setAttribute("x", String(x + cellW / 2));
    t.setAttribute("y", String(winY + winH * 0.82));
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("class", "cnt-digit");
    t.style.fontSize = `${fontPx}px`;
    t.textContent = "0";
    g.appendChild(t);
    texts.push(t);
  }
  layer.appendChild(g);
  return texts;
}

function setHengstlerDigits(texts, value) {
  if (!texts) return;
  const s = String(Math.max(0, value | 0)).padStart(6, "0").slice(-6);
  texts.forEach((t, i) => {
    if (t.textContent !== s[i]) {
      t.textContent = s[i];
      t.classList.remove("cnt-tick");
      void t.getBoundingClientRect();
      t.classList.add("cnt-tick");
    }
  });
}

function pointInBox(x, y, b) {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

function segHidden(t, boxes) {
  if (t.layer === "B.Cu") return true;
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const x = t.x1 + (t.x2 - t.x1) * k;
    const y = t.y1 + (t.y2 - t.y1) * k;
    if (boxes.some((b) => pointInBox(x, y, b))) return true;
  }
  return false;
}

function partBox(p, fallback = 2.4) {
  const bw = p.w || fallback;
  const bh = p.h || fallback;
  const bx = p.bx != null ? p.bx : p.x - bw / 2;
  const by = p.by != null ? p.by : p.y - bh / 2;
  return { bx, by, bw, bh };
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

  const photo = document.createElementNS(svgNS, "image");
  photo.setAttribute("href", assetUrl("topview.png"));
  photo.setAttribute("x", String(ox));
  photo.setAttribute("y", String(oy));
  photo.setAttribute("width", String(w));
  photo.setAttribute("height", String(h));
  photo.setAttribute("preserveAspectRatio", "none");
  photo.setAttribute("class", "pcb-photo");
  svg.appendChild(photo);

  const edge = document.createElementNS(svgNS, "rect");
  edge.setAttribute("x", String(ox));
  edge.setAttribute("y", String(oy));
  edge.setAttribute("width", String(w));
  edge.setAttribute("height", String(h));
  edge.setAttribute("class", "pcb-edge");
  svg.appendChild(edge);

  const coverBoxes = layout.parts
    .filter((p) => PHOTO[p.ref] || (p.w || 0) * (p.h || 0) >= 12)
    .map((p) => {
      const b = partBox(p);
      return { x: b.bx, y: b.by, w: b.bw, h: b.bh, ref: p.ref };
    });

  const photoLayer = document.createElementNS(svgNS, "g");
  photoLayer.setAttribute("class", "part-photos");
  const counterLayer = document.createElementNS(svgNS, "g");
  counterLayer.setAttribute("class", "cnt-overlay");
  const frameLayer = document.createElementNS(svgNS, "g");
  frameLayer.setAttribute("class", "parts");
  const partNodes = new Map();
  for (const p of layout.parts) {
    if (/^H\d/.test(p.ref)) continue;
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "fp");
    g.dataset.ref = p.ref;
    const meta = META[p.ref];
    const blue = isBluePart(p.ref, meta?.kind);
    if (blue) g.classList.add("fp-blue");
    let { bx, by, bw, bh } = partBox(
      p,
      p.ref.startsWith("U") || p.ref === "J5" ? 6
        : p.ref.startsWith("J") || p.ref.startsWith("TP") ? 3.6
          : p.ref.startsWith("Q") || p.ref.startsWith("D") ? 3.2
            : 2.4,
    );
    if (p.ref === "J5") {
      bx = p.x - 12.6;
      by = p.y - 15.5;
      bw = 25.2;
      bh = 31;
    }
    const spec = photoSpec(p);
    if (spec) {
      const rot = spec.rot != null ? spec.rot : (p.rot || 0);
      const scale = spec.scale || 1;
      let bodyW;
      let bodyH;
      if (spec.w && spec.h) {
        bodyW = spec.w * scale;
        bodyH = spec.h * scale;
      } else {
        bodyW = (Math.abs(rot) % 180 === 0 ? bw : bh) * scale;
        bodyH = (Math.abs(rot) % 180 === 0 ? bh : bw) * scale;
      }
      const cx = spec.anchor === "bbox"
        ? bx + bw / 2 + (spec.dx || 0)
        : p.x + (spec.dx || 0);
      const cy = spec.anchor === "bbox"
        ? by + bh / 2 + (spec.dy || 0)
        : p.y + (spec.dy || 0);
      const img = document.createElementNS(svgNS, "image");
      img.setAttribute("href", assetUrl(spec.file));
      img.setAttribute("x", String(cx - bodyW / 2));
      img.setAttribute("y", String(cy - bodyH / 2));
      img.setAttribute("width", String(bodyW));
      img.setAttribute("height", String(bodyH));
      const fit = spec.fit === "none" ? "none" : spec.fit === "slice" ? "xMidYMid slice" : "xMidYMid meet";
      img.setAttribute("preserveAspectRatio", fit);
      if (rot) img.setAttribute("transform", `rotate(${rot} ${cx} ${cy})`);
      img.setAttribute("class", "fp-photo");
      photoLayer.appendChild(img);
    }
    let digits = null;
    if (p.ref === "J5") {
      digits = makeHengstlerDigits(svgNS, p, counterLayer, spec || PHOTO.J5);
    }
    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", String(bx));
    rect.setAttribute("y", String(by));
    rect.setAttribute("width", String(bw));
    rect.setAttribute("height", String(bh));
    rect.setAttribute("rx", "0.35");
    rect.style.fill = "transparent";
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", String(p.x));
    label.setAttribute("y", String(by - 0.55));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "fp-label");
    label.textContent = p.ref;
    g.appendChild(rect);
    g.appendChild(label);
    g.addEventListener("click", () => {
      selected = p.ref;
      render(sim.solve());
    });
    frameLayer.appendChild(g);
    partNodes.set(p.ref, { g, rect, label, blue, digits });
  }

  // Stromlinien über dem Foto: durchgezogen auf freiem Kupfer, gepunktet unter Bauteil / B.Cu
  const trackLayer = document.createElementNS(svgNS, "g");
  trackLayer.setAttribute("class", "tracks");
  const trackNodes = [];
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
    const power = /12V|BAT|5V|GND|SW|SPK|RPP/.test(t.net || "");
    const baseW = Math.max(t.w || 0.25, power ? 0.45 : 0.35);
    const hidden = segHidden(t, coverBoxes);
    line.style.stroke = "#6a7a70";
    line.style.strokeWidth = String(baseW);
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("class", hidden ? "track hidden-cu" : "track");
    line.dataset.net = t.net;
    const tip = document.createElementNS(svgNS, "title");
    tip.textContent = `${t.net}${t.layer === "B.Cu" ? " (Unterseite)" : hidden ? " (unter Bauteil)" : ""}`;
    line.appendChild(tip);
    trackLayer.appendChild(line);
    trackNodes.push({
      el: line,
      net: t.net,
      type: "seg",
      baseW,
      back: t.layer === "B.Cu",
      hidden,
    });
  }

  svg.appendChild(photoLayer);
  svg.appendChild(trackLayer);
  svg.appendChild(counterLayer);
  svg.appendChild(frameLayer);
  el.board.appendChild(svg);

  let lastDetailKey = "";
  const helpOverlay = document.getElementById("help-overlay");
  const helpTitle = document.getElementById("help-title");
  const helpSub = document.getElementById("help-sub");
  const helpBlock = document.getElementById("help-block");
  const helpPart = document.getElementById("help-part");
  const helpTrace = document.getElementById("help-trace");
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
    helpBlock.innerHTML = block?.detail || block?.task || "Keine Detailbeschreibung für die Baugruppe.";
    helpPart.innerHTML = meta?.detail || meta?.role || "Keine Detailbeschreibung für dieses Bauteil.";
    if (helpTrace) helpTrace.innerHTML = renderTraceHtml(ref);
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
    const j5n = partNodes.get("J5");
    if (j5n?.digits) setHengstlerDigits(j5n.digits, s.counter);
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
        const hidden = tn.hidden || tn.back;
        tn.el.style.opacity = hidden ? (glow ? "0.9" : "0.45") : glow ? "1" : "0.75";
        tn.el.classList.toggle("flow", glow);
        tn.el.classList.toggle("hidden-cu", hidden);
      }
      tn.el.dataset.i = String(iAbs);
    }

    const maxI = Math.max(...s.parts.map((p) => Math.abs(p.I)), 1e-6);
    for (const [ref, node] of partNodes) {
      const p = s.parts.find((x) => x.ref === ref);
      const meta = META[ref];
      const blue = node.blue || isBluePart(ref, meta?.kind);
      if (blue) {
        node.rect.style.stroke = ref === selected ? "#4a9ad8" : BLUE;
        node.rect.style.fill = "transparent";
      } else if (ref === "U2") {
        node.rect.style.stroke = s.playing ? "#c45c26" : s.nets["5V"] > 0 ? "#2f6f4e" : "#8aa392";
        node.rect.style.fill = "transparent";
      } else if (ref === "J5") {
        node.rect.style.stroke = s.nets["12V_SW"] > 0 ? "#2f6f4e" : "#8aa392";
        node.rect.style.fill = "transparent";
      } else if (p) {
        node.rect.style.stroke = heatColor(p.I, maxI * 0.3);
        node.rect.style.fill = "transparent";
      } else {
        node.rect.style.stroke = BLUE_DIM;
        node.rect.style.fill = "transparent";
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
      ${checkHtml}
      ${renderTraceHtml(ref)}`;
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
