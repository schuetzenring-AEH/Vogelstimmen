const fs = require("fs");
const p = "C:/Users/Schue/Projects/Vogelstimmen/hardware/vogelstimmen_v2.2.kicad_pcb";
const t = fs.readFileSync(p, "utf8");

const segs = (t.match(/\(segment/g) || []).length;
const vias = (t.match(/\n\t\(via/g) || []).length || (t.match(/\r\n\t\(via/g) || []).length;
const widths = {};
for (const m of t.matchAll(/\(segment[\s\S]*?\(width ([0-9.]+)\)/g)) {
  widths[m[1]] = (widths[m[1]] || 0) + 1;
}

const edge = t.match(/\(gr_rect\s*\r?\n\s*\(start ([0-9.]+) ([0-9.]+)\)\s*\r?\n\s*\(end ([0-9.]+) ([0-9.]+)\)[\s\S]*?Edge\.Cuts/);
let board = null;
if (edge) {
  const x1 = +edge[1], y1 = +edge[2], x2 = +edge[3], y2 = +edge[4];
  board = { x1, y1, x2, y2, w: +(x2 - x1).toFixed(2), h: +(y2 - y1).toFixed(2) };
}

const fps = [];
const parts = t.split(/\n\t\(footprint /);
for (let i = 1; i < parts.length; i++) {
  const name = parts[i].match(/^"([^"]+)"/);
  const ref = parts[i].match(/\(property "Reference" "([^"]+)"/);
  const at = parts[i].match(/\(at ([0-9.+-]+) ([0-9.+-]+)(?: ([0-9.+-]+))?\)/);
  if (name && ref && at) {
    fps.push({
      ref: ref[1],
      fp: name[1],
      x: +at[1],
      y: +at[2],
      r: at[3] ? +at[3] : 0,
    });
  }
}
fps.sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));

console.log("=== BOARD ===");
console.log(board);
console.log("=== TRACKS ===");
console.log({ segments: segs, vias, widths });
console.log("=== PLACEMENT ===");
for (const f of fps) {
  console.log(
    `${f.ref.padEnd(4)} ${String(f.x).padStart(7)} ${String(f.y).padStart(7)} r${String(f.r).padStart(3)}  ${f.fp}`
  );
}
