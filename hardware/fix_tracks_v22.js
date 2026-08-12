/**
 * Set all copper track/arc widths to 0.5 mm in vogelstimmen_v2.2.kicad_pcb
 * Run AFTER saving the PCB in KiCad.
 */
const fs = require("fs");
const p = "C:/Users/Schue/Projects/Vogelstimmen/hardware/vogelstimmen_v2.2.kicad_pcb";
let t = fs.readFileSync(p, "utf8");

function setWidths(kind) {
  let n = 0;
  const out = [];
  let i = 0;
  const marker = `\t(${kind}`;
  while (i < t.length) {
    const idx = t.indexOf(marker, i);
    if (idx === -1) {
      out.push(t.slice(i));
      break;
    }
    if (idx > 0 && t[idx - 1] !== "\n") {
      out.push(t.slice(i, idx + 1));
      i = idx + 1;
      continue;
    }
    out.push(t.slice(i, idx));
    let depth = 0;
    let j = idx;
    for (; j < t.length; j++) {
      if (t[j] === "(") depth++;
      else if (t[j] === ")") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    let block = t.slice(idx, j);
    const before = block;
    block = block.replace(/\(width [0-9.]+\)/, "(width 0.5)");
    if (block !== before) n++;
    out.push(block);
    i = j;
  }
  t = out.join("");
  return n;
}

const segs = (t.match(/\n\t\(segment /g) || []).length;
const arcs = (t.match(/\n\t\(arc /g) || []).length;
console.log(`Found ${segs} segments, ${arcs} arcs`);
if (segs === 0 && arcs === 0) {
  console.error("ERROR: No tracks in file. Save the PCB in KiCad (Ctrl+S) first, then re-run.");
  process.exit(2);
}

const ns = setWidths("segment");
const na = setWidths("arc");
fs.writeFileSync(p, t, "utf8");
console.log(`Updated ${ns} segments, ${na} arcs -> 0.5 mm`);
console.log("Done. In KiCad: reload from disk if prompted, then press B to refill zones.");
