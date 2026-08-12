/**
 * SVG-Blockschaltbilder für Hilfe-Dialog
 * — Systemübersicht (aktive Baugruppe highlighted)
 * — Detail der Innerstruktur + externe Schnittstellen
 */

const SYS_NODES = [
  { id: "BAT", label: "12V\nBatterie", x: 28, y: 70, ext: true },
  { id: "B1", label: "B1\nEingangs-\nschutz", x: 110, y: 70 },
  { id: "B2", label: "B2\nLatch", x: 200, y: 70 },
  { id: "B3", label: "B3\nBuck\n12→5V", x: 290, y: 70 },
  { id: "B4", label: "B4\nAudio", x: 380, y: 48 },
  { id: "B5", label: "B5\nZähler", x: 380, y: 100 },
  { id: "B6", label: "B6\nTaster", x: 200, y: 150 },
  { id: "B7", label: "B7\nSPK", x: 470, y: 48 },
  { id: "B8", label: "B8\nLEDs", x: 290, y: 150 },
  { id: "BTN", label: "8×\nTaster", x: 110, y: 150, ext: true },
  { id: "SPK", label: "Laut-\nsprecher", x: 540, y: 48, ext: true },
];

const SYS_EDGES = [
  { from: "BAT", to: "B1", label: "BAT+" },
  { from: "B1", to: "B2", label: "12V_PROT" },
  { from: "B2", to: "B3", label: "12V_SW" },
  { from: "B2", to: "B8", label: "12V_SW" },
  { from: "B3", to: "B4", label: "5V" },
  { from: "B3", to: "B5", label: "5V" },
  { from: "B4", to: "B7", label: "SPK±" },
  { from: "B7", to: "SPK", label: "" },
  { from: "BTN", to: "B6", label: "" },
  { from: "B6", to: "B4", label: "IOx", path: "M220,140 C220,100 360,90 365,70" },
  { from: "B6", to: "B2", label: "SET", path: "M200,135 L200,95" },
  { from: "B4", to: "B2", label: "BUSY", path: "M365,55 C300,20 220,30 210,55" },
];

/** Innere Funktionsbilder pro Baugruppe */
export const BLOCK_INNER = {
  B1: {
    title: "Funktion innerhalb B1",
    nodes: [
      { id: "j1", label: "J1\nBAT", x: 40, y: 80, port: "in" },
      { id: "q5", label: "Q5\nP-FET\nVerpolung", x: 130, y: 80 },
      { id: "d11", label: "D11\nZener\nVGS", x: 130, y: 30 },
      { id: "r67", label: "R7/R6\nGate", x: 130, y: 130 },
      { id: "f1", label: "F1\nPTC", x: 220, y: 80 },
      { id: "d9", label: "D9\nTVS", x: 280, y: 130 },
      { id: "c1", label: "C1\nPuffer", x: 280, y: 30 },
      { id: "out", label: "12V_PROT", x: 360, y: 80, port: "out" },
    ],
    edges: [
      ["j1", "q5", ""],
      ["q5", "f1", ""],
      ["f1", "out", ""],
      ["d11", "q5", "clamp"],
      ["r67", "q5", ""],
      ["out", "d9", ""],
      ["out", "c1", ""],
    ],
    interfaces: [
      { dir: "in", name: "BAT+ / GND", via: "J1", note: "12 V Batterie" },
      { dir: "out", name: "12V_PROT", via: "→ B2, B6/R9", note: "geschützte Dauerversorgung" },
      { dir: "out", name: "GND", via: "Systemmasse", note: "Bezug" },
    ],
  },
  B2: {
    title: "Funktion innerhalb B2",
    nodes: [
      { id: "btn", label: "BTN_OR\nvon B6", x: 40, y: 40, port: "in" },
      { id: "q6", label: "Q6\nSET\nP-FET", x: 120, y: 40 },
      { id: "set", label: "LATCH_SET\nR4 Hold", x: 210, y: 80 },
      { id: "q2", label: "Q2\nN-FET", x: 290, y: 80 },
      { id: "q1", label: "Q1\nP-FET\n12V_SW", x: 380, y: 80 },
      { id: "busy", label: "BUSY\nvon B4", x: 40, y: 130, port: "in" },
      { id: "q3", label: "Q3\nRelease", x: 120, y: 130 },
      { id: "prot", label: "12V_PROT\nvon B1", x: 290, y: 20, port: "in" },
      { id: "sw", label: "12V_SW", x: 460, y: 80, port: "out" },
    ],
    edges: [
      ["btn", "q6", "low"],
      ["q6", "set", "SET"],
      ["set", "q2", ""],
      ["q2", "q1", "Gate"],
      ["prot", "q1", ""],
      ["q1", "sw", ""],
      ["busy", "q3", "high"],
      ["q3", "set", "GND"],
      ["sw", "set", "Hold R4"],
    ],
    interfaces: [
      { dir: "in", name: "12V_PROT", via: "B1", note: "immer an" },
      { dir: "in", name: "BTN_OR / SET", via: "B6", note: "Taster-Kaltstart" },
      { dir: "in", name: "BUSY", via: "B4", note: "Release am Track-Ende" },
      { dir: "out", name: "12V_SW", via: "→ B3, B8, R4", note: "geschaltete Leistung" },
    ],
  },
  B3: {
    title: "Funktion innerhalb B3",
    nodes: [
      { id: "sw", label: "12V_SW\nvon B2", x: 50, y: 70, port: "in" },
      { id: "cin", label: "C2\nCIN", x: 120, y: 30 },
      { id: "u1", label: "U1\nTPS62163\nBuck", x: 200, y: 70 },
      { id: "l1", label: "L1\n2,2µH", x: 290, y: 70 },
      { id: "cout", label: "C3\nCOUT", x: 360, y: 30 },
      { id: "r5", label: "R5\nVOS", x: 360, y: 110 },
      { id: "v5", label: "5V", x: 440, y: 70, port: "out" },
    ],
    edges: [
      ["sw", "u1", "VIN/EN"],
      ["cin", "u1", ""],
      ["u1", "l1", "SW"],
      ["l1", "v5", ""],
      ["v5", "cout", ""],
      ["v5", "r5", ""],
      ["r5", "u1", "sense"],
    ],
    interfaces: [
      { dir: "in", name: "12V_SW / GND", via: "B2", note: "nur bei Latch AN" },
      { dir: "out", name: "5V", via: "→ B4, B5", note: "fest 5,0 V / bis 1 A" },
    ],
  },
  B4: {
    title: "Funktion innerhalb B4",
    nodes: [
      { id: "v5", label: "5V\nvon B3", x: 50, y: 70, port: "in" },
      { id: "io", label: "IO0…7\nvon B6", x: 50, y: 130, port: "in" },
      { id: "u2", label: "U2\nDY-SV17F\nDecoder+Amp", x: 180, y: 80 },
      { id: "mode", label: "CON1…3\nMode 0", x: 180, y: 20 },
      { id: "busy", label: "BUSY", x: 320, y: 40, port: "out" },
      { id: "spk", label: "SPK±", x: 320, y: 120, port: "out" },
    ],
    edges: [
      ["v5", "u2", "V5"],
      ["io", "u2", "Trigger"],
      ["mode", "u2", ""],
      ["u2", "busy", ""],
      ["u2", "spk", "BTL"],
    ],
    interfaces: [
      { dir: "in", name: "5V / GND", via: "B3", note: "Versorgung" },
      { dir: "in", name: "IO0…IO7", via: "B6", note: "Taster-Trigger Mode 0" },
      { dir: "out", name: "BUSY", via: "→ B2 (Q3)", note: "Low=Play, High=Ende" },
      { dir: "out", name: "SPK±", via: "→ B7", note: "Class-D Audio" },
      { dir: "out", name: "V33", via: "intern/CON2", note: "Mode-Hilfsspannung" },
    ],
  },
  B5: {
    title: "Funktion innerhalb B5",
    nodes: [
      { id: "v5", label: "5V\nvon B3", x: 60, y: 50, port: "in" },
      { id: "j5", label: "J5\nK07.90\nSpule+Zählwerk", x: 180, y: 80 },
      { id: "d10", label: "D10\nFreilauf", x: 180, y: 150 },
      { id: "gnd", label: "GND", x: 300, y: 80, port: "out" },
      { id: "disp", label: "Anzeige\n7 Digits", x: 300, y: 30, port: "out" },
    ],
    edges: [
      ["v5", "j5", "+"],
      ["j5", "gnd", "−"],
      ["d10", "j5", "parallel"],
      ["j5", "disp", "mech."],
    ],
    interfaces: [
      { dir: "in", name: "5V / GND", via: "B3", note: "Impuls = Power-Zyklus" },
      { dir: "out", name: "Ziffernanzeige", via: "Sichtfenster", note: "mechanisch" },
    ],
  },
  B6: {
    title: "Funktion innerhalb B6",
    nodes: [
      { id: "btn", label: "8× Taster\nextern", x: 50, y: 80, port: "in" },
      { id: "j34", label: "J3/J4\nMPT 0,5/8", x: 140, y: 80 },
      { id: "io", label: "IO0…7\n→ B4", x: 250, y: 40, port: "out" },
      { id: "d", label: "D1…D8\nWired-OR", x: 250, y: 120 },
      { id: "or", label: "BTN_OR\n→ B2", x: 360, y: 120, port: "out" },
    ],
    edges: [
      ["btn", "j34", ""],
      ["j34", "io", "IO"],
      ["j34", "d", ""],
      ["d", "or", "low"],
    ],
    interfaces: [
      { dir: "in", name: "Tasterkontakte", via: "Gehäuse", note: "Active-Low gegen GND" },
      { dir: "out", name: "IO0…IO7", via: "→ B4", note: "Soundwahl" },
      { dir: "out", name: "BTN_OR", via: "→ B2/Q6", note: "Latch-SET" },
    ],
  },
  B7: {
    title: "Funktion innerhalb B7",
    nodes: [
      { id: "spk", label: "SPK±\nvon B4", x: 60, y: 70, port: "in" },
      { id: "j2", label: "J2\nMPT 0,5/2", x: 180, y: 70 },
      { id: "tp5", label: "TP5\nSPK+", x: 180, y: 130 },
      { id: "ls", label: "4–8 Ω\nLautsprecher", x: 320, y: 70, port: "out" },
    ],
    edges: [
      ["spk", "j2", "BTL"],
      ["j2", "ls", ""],
      ["spk", "tp5", "Mess"],
    ],
    interfaces: [
      { dir: "in", name: "SPK+ / SPK−", via: "B4", note: "differentiell, nicht an GND!" },
      { dir: "out", name: "Lautsprecher", via: "J2", note: "extern 4–8 Ω ≤5 W" },
    ],
  },
  B8: {
    title: "Funktion innerhalb B8",
    nodes: [
      { id: "sw", label: "12V_SW\nvon B2", x: 60, y: 60, port: "in" },
      { id: "j6", label: "J6\nMPT 0,5/2", x: 180, y: 80 },
      { id: "led", label: "8× Taster-\nLEDs extern", x: 320, y: 80, port: "out" },
      { id: "gnd", label: "GND", x: 60, y: 120, port: "in" },
    ],
    edges: [
      ["sw", "j6", "+"],
      ["gnd", "j6", "−"],
      ["j6", "led", ""],
    ],
    interfaces: [
      { dir: "in", name: "12V_SW / GND", via: "B2", note: "nur wenn Latch AN" },
      { dir: "out", name: "LED-Versorgung", via: "J6", note: "Vorwiderstände extern" },
    ],
  },
};

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function nodeBox(n, activeId) {
  const w = n.ext ? 56 : 64;
  const h = n.ext ? 44 : 52;
  const x = n.x - w / 2;
  const y = n.y - h / 2;
  const isActive = n.id === activeId;
  const isExt = !!n.ext;
  let fill = "#2a3830";
  let stroke = "#6e8a74";
  let sw = 1.2;
  if (isExt) {
    fill = "#1a221c";
    stroke = "#8a9a90";
  }
  if (isActive) {
    fill = "#3d4f28";
    stroke = "#d4a017";
    sw = 2.4;
  }
  const lines = String(n.label).split("\n");
  const text = lines
    .map(
      (ln, i) =>
        `<text x="${n.x}" y="${n.y - (lines.length - 1) * 5 + i * 11}" text-anchor="middle" class="diag-label">${esc(ln)}</text>`,
    )
    .join("");
  return `<g class="diag-node${isActive ? " active" : ""}${isExt ? " ext" : ""}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
    ${text}
  </g>`;
}

function findNode(nodes, id) {
  return nodes.find((n) => n.id === id);
}

function edgeLine(a, b, label, path) {
  if (path) {
    return `<path d="${path}" class="diag-edge" fill="none"/>
      ${label ? `<text class="diag-edge-label" x="${(a.x + b.x) / 2}" y="${(a.y + b.y) / 2 - 6}">${esc(label)}</text>` : ""}`;
  }
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="diag-edge"/>
    ${label ? `<text class="diag-edge-label" x="${mx}" y="${my - 5}">${esc(label)}</text>` : ""}`;
}

/** Übergeordnetes System-Blockschaltbild */
export function renderSystemDiagram(activeBlockId) {
  const nodes = SYS_NODES.map((n) => nodeBox(n, activeBlockId)).join("");
  const edges = SYS_EDGES.map((e) => {
    const a = findNode(SYS_NODES, e.from);
    const b = findNode(SYS_NODES, e.to);
    if (!a || !b) return "";
    return edgeLine(a, b, e.label, e.path);
  }).join("");

  return `<svg class="diag-svg diag-system" viewBox="0 0 580 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System-Blockschaltbild">
    <defs>
      <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill="#8aa392"/>
      </marker>
    </defs>
    <style>
      .diag-edge { stroke:#8aa392; stroke-width:1.4; marker-end:url(#arr); }
      .diag-edge-label { fill:#9aada0; font-size:8px; font-family: IBM Plex Mono, monospace; text-anchor:middle; }
      .diag-label { fill:#e8efe6; font-size:9px; font-family: Source Serif 4, Georgia, serif; }
    </style>
    ${edges}
    ${nodes}
  </svg>
  <p class="diag-legend">Gold umrandet = aktuelle Baugruppe · gestrichelte/dunkle Boxen = externe Welt</p>`;
}

/** Detailbild einer Baugruppe */
export function renderInnerDiagram(blockId) {
  const spec = BLOCK_INNER[blockId];
  if (!spec) return "<p>Kein Detailbild hinterlegt.</p>";

  const maxX = Math.max(...spec.nodes.map((n) => n.x)) + 50;
  const maxY = Math.max(...spec.nodes.map((n) => n.y)) + 40;

  const nodeSvg = spec.nodes
    .map((n) => {
      const w = 72;
      const h = 48;
      const x = n.x - w / 2;
      const y = n.y - h / 2;
      let fill = "#314338";
      let stroke = "#6e8a74";
      if (n.port === "in") {
        fill = "#24384a";
        stroke = "#5a8ab0";
      }
      if (n.port === "out") {
        fill = "#3a3420";
        stroke = "#c4a35a";
      }
      const lines = String(n.label).split("\n");
      const text = lines
        .map(
          (ln, i) =>
            `<text x="${n.x}" y="${n.y - (lines.length - 1) * 5 + i * 10}" text-anchor="middle" class="diag-label">${esc(ln)}</text>`,
        )
        .join("");
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>${text}`;
    })
    .join("");

  const edgeSvg = spec.edges
    .map(([from, to, label]) => {
      const a = findNode(spec.nodes, from);
      const b = findNode(spec.nodes, to);
      if (!a || !b) return "";
      return edgeLine(a, b, label);
    })
    .join("");

  const ifRows = spec.interfaces
    .map((i) => {
      const badge = i.dir === "in" ? "IN" : "OUT";
      const cls = i.dir === "in" ? "if-in" : "if-out";
      return `<tr class="${cls}"><td><span class="if-badge">${badge}</span></td><td><strong>${esc(i.name)}</strong></td><td>${esc(i.via)}</td><td>${esc(i.note)}</td></tr>`;
    })
    .join("");

  return `<svg class="diag-svg diag-inner" viewBox="0 0 ${maxX} ${maxY}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(spec.title)}">
    <defs>
      <marker id="arr2" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
        <path d="M0,0 L7,3 L0,6 Z" fill="#8aa392"/>
      </marker>
    </defs>
    <style>
      .diag-edge { stroke:#8aa392; stroke-width:1.3; marker-end:url(#arr2); }
      .diag-edge-label { fill:#9aada0; font-size:8px; font-family: IBM Plex Mono, monospace; text-anchor:middle; }
      .diag-label { fill:#e8efe6; font-size:8.5px; font-family: Source Serif 4, Georgia, serif; }
    </style>
    ${edgeSvg}
    ${nodeSvg}
  </svg>
  <p class="diag-legend"><span class="swatch in"></span> Eingang (Schnittstelle) · <span class="swatch out"></span> Ausgang · innen = Bauteile/Funktion</p>
  <h5 class="if-title">Schnittstellen nach außen</h5>
  <table class="if-table">
    <thead><tr><th></th><th>Signal / Netz</th><th>Anbindung</th><th>Bedeutung</th></tr></thead>
    <tbody>${ifRows}</tbody>
  </table>`;
}
