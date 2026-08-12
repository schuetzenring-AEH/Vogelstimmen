/**
 * Vogelstimmen PCB v2.2 — reposition footprints, strip tracks/vias
 */
const fs = require("fs");

const PATH = "C:/Users/Schue/Projects/Vogelstimmen/hardware/vogelstimmen_v2.2.kicad_pcb";

// Board: (123.5, 69.5) .. (210, 130) = 86.5 x 60.5 mm
// Optimized placement (USB left, power chain bottom-left → latch → buck)

const POS = {
  // Mounting holes (keep enclosure spacing)
  H1: { x: 127.5, y: 73.5, r: 0 },
  H2: { x: 206.0, y: 73.5, r: 0 },
  H3: { x: 127.5, y: 126.0, r: 0 },
  H4: { x: 206.0, y: 126.0, r: 0 },

  // U2 DY-SV17F — USB to left edge (rot 90)
  U2: { x: 139.5, y: 98.0, r: 90 },

  // BUSY FET near U2
  Q3: { x: 154.0, y: 86.0, r: 0 },
  R3: { x: 154.0, y: 91.5, r: 0 },

  // Buck cluster
  U1: { x: 172.0, y: 82.0, r: 0 },
  C2: { x: 167.0, y: 82.0, r: 0 },
  L1: { x: 177.5, y: 82.0, r: 0 },
  C3: { x: 182.5, y: 82.0, r: 0 },
  R5: { x: 177.5, y: 77.5, r: 0 },

  // Counter near 5V
  J5: { x: 195.0, y: 80.0, r: 0 },
  D10: { x: 195.0, y: 88.0, r: 90 },

  // Speaker near U2
  J2: { x: 152.0, y: 112.0, r: 0 },

  // Latch
  Q1: { x: 168.0, y: 98.0, r: 0 },
  Q2: { x: 175.0, y: 98.0, r: 0 },
  R1: { x: 168.0, y: 103.5, r: 0 },
  R4: { x: 172.5, y: 103.5, r: 0 },
  R2: { x: 178.0, y: 103.5, r: 0 },

  // Diode OR row (toward buttons)
  D1: { x: 158.0, y: 112.0, r: 90 },
  D2: { x: 162.0, y: 112.0, r: 90 },
  D3: { x: 166.0, y: 112.0, r: 90 },
  D4: { x: 170.0, y: 112.0, r: 90 },
  D5: { x: 174.0, y: 112.0, r: 90 },
  D6: { x: 178.0, y: 112.0, r: 90 },
  D7: { x: 182.0, y: 112.0, r: 90 },
  D8: { x: 186.0, y: 112.0, r: 90 },

  // Input protection chain
  J1: { x: 133.0, y: 122.0, r: 90 },
  R6: { x: 138.5, y: 116.0, r: 0 },
  Q5: { x: 143.0, y: 116.0, r: 0 },
  F1: { x: 148.5, y: 116.0, r: 0 },
  D9: { x: 154.0, y: 116.0, r: 0 },
  C1: { x: 160.0, y: 116.0, r: 0 },

  // Button headers bottom edge
  J3: { x: 168.0, y: 124.5, r: 90 },
  J4: { x: 185.0, y: 124.5, r: 90 },

  // LED connector
  J6: { x: 200.0, y: 122.0, r: 90 },

  // Test points
  TP1: { x: 160.0, y: 108.0, r: 0 }, // 12V_PROT
  TP2: { x: 188.0, y: 88.0, r: 0 },  // 5V
  TP3: { x: 200.0, y: 100.0, r: 0 }, // GND
  TP4: { x: 154.0, y: 80.0, r: 0 },  // BUSY
  TP5: { x: 152.0, y: 118.0, r: 0 }, // SPK+
};

function fmtAt(p) {
  if (p.r) return `(at ${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.r})`;
  return `(at ${p.x.toFixed(1)} ${p.y.toFixed(1)})`;
}

function stripTopLevel(kind, text) {
  // Remove top-level (segment ...) (via ...) blocks (tab-indented once)
  const re = new RegExp(`\\n\\t\\(${kind}\\b[\\s\\S]*?\\n\\t\\)`, "g");
  // Above may fail on nested parens — use paren counter
  let out = "";
  let i = 0;
  const marker = `\t(${kind}`;
  while (i < text.length) {
    const idx = text.indexOf(marker, i);
    if (idx === -1) {
      out += text.slice(i);
      break;
    }
    // only if starts at beginning of line (after newline or start)
    if (idx > 0 && text[idx - 1] !== "\n") {
      out += text.slice(i, idx + 1);
      i = idx + 1;
      continue;
    }
    out += text.slice(i, idx);
    // scan balanced parens from idx
    let depth = 0;
    let j = idx;
    for (; j < text.length; j++) {
      if (text[j] === "(") depth++;
      else if (text[j] === ")") {
        depth--;
        if (depth === 0) {
          j++;
          break;
        }
      }
    }
    // skip following newline
    if (text[j] === "\n") j++;
    i = j;
  }
  return out;
}

function repositionFootprints(text) {
  const parts = text.split(/\n\t\(footprint /);
  if (parts.length < 2) throw new Error("no footprints");
  let out = parts[0];
  for (let n = 1; n < parts.length; n++) {
    let chunk = parts[n];
    // chunk starts with "Lib:Name" ... until next split already done
    // Find Reference
    const refM = chunk.match(/\(property "Reference" "([^"]+)"/);
    if (!refM) {
      out += "\n\t(footprint " + chunk;
      continue;
    }
    const ref = refM[1];
    const pos = POS[ref];
    if (!pos) {
      console.warn("No position for", ref);
      out += "\n\t(footprint " + chunk;
      continue;
    }
    // Replace first footprint-level (at ...) — after uuid line typically
    // Match only the placement at near the start (before first property)
    const headEnd = chunk.indexOf('(property "Reference"');
    const head = chunk.slice(0, headEnd);
    const tail = chunk.slice(headEnd);
    const newHead = head.replace(
      /\(at [0-9.+-]+ [0-9.+-]+(?: [0-9.+-]+)?\)/,
      fmtAt(pos)
    );
    if (newHead === head) console.warn("at not replaced for", ref);
    else console.log(ref, "->", fmtAt(pos));
    out += "\n\t(footprint " + newHead + tail;
  }
  return out;
}

function updateZones(text) {
  // Replace zone outlines with board inset rectangle corners
  // Keep net etc., replace (pts ... ) of polygon outline if present
  // Simpler: set zone polygon to board inset
  const inset = 0.3;
  const x1 = 123.5 + inset;
  const y1 = 69.5 + inset;
  const x2 = 210 - inset;
  const y2 = 130 - inset;
  const pts = `(pts
			(xy ${x1} ${y1}) (xy ${x2} ${y1}) (xy ${x2} ${y2}) (xy ${x1} ${y2})
		)`;

  // For each zone, replace first (polygon (layer ...) (pts ...)) pts — hard
  // Instead strip filled polygons content by replacing huge pts with simple rect
  return text.replace(
    /\(zone\n([\s\S]*?)\(polygon\n([\s\S]*?)\(pts\n[\s\S]*?\)\n\t\t\)/g,
    (m, a, b) => `(zone\n${a}(polygon\n${b}${pts}\n\t\t)`
  );
}

let text = fs.readFileSync(PATH, "utf8");
console.log("Loaded", text.length, "bytes");

text = stripTopLevel("segment", text);
text = stripTopLevel("via", text);
text = stripTopLevel("arc", text);
console.log("Stripped tracks/vias, size", text.length);

text = repositionFootprints(text);
text = updateZones(text);

// Add version text if not present
if (!text.includes("Rev 2.2 Placement")) {
  const note = `
	(gr_text "Rev 2.2 Placement"
		(at 166.75 67.5 0)
		(layer "Cmts.User")
		(uuid "c22c0001-0000-4000-8000-000000000001")
		(effects
			(font
				(size 1.5 1.5)
				(thickness 0.2)
			)
		)
	)
`;
  text = text.replace(/\n\t\(gr_rect\n/, note + "\n\t(gr_rect\n");
}

fs.writeFileSync(PATH, text, "utf8");
console.log("Wrote", PATH);
