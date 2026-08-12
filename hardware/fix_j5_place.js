const fs = require("fs");
const PCB = "C:/Users/Schue/Projects/Vogelstimmen/hardware/vogelstimmen_v2.2.kicad_pcb";
let t = fs.readFileSync(PCB, "utf8");

// Fix zone clearance 0.5 -> 0.2
t = t.replace(
  /(\(connect_pads\r?\n\t\t\t\(clearance )0\.5(\))/g,
  "$10.2$2"
);
t = t.replace(/(\(thermal_gap )0\.5(\))/g, "$10.25$2");
t = t.replace(/(\(thermal_bridge_width )0\.5(\))/g, "$10.25$2");

// Move J5 footprint at-line and retarget pad tracks
const OLD = { x: 185.5, y: 84.725 };
const NEW = { x: 192.0, y: 92.0 };
const dx = NEW.x - OLD.x;
const dy = NEW.y - OLD.y;

const OLD_PADS = {
  1: { x: OLD.x - 5.08, y: OLD.y },
  2: { x: OLD.x + 5.08, y: OLD.y },
};
const NEW_PADS = {
  1: { x: NEW.x - 5.08, y: NEW.y },
  2: { x: NEW.x + 5.08, y: NEW.y },
};

function near(x, y, tx, ty, tol = 0.4) {
  return Math.hypot(x - tx, y - ty) < tol;
}

// Update J5 (at ...)
t = t.replace(
  /\(footprint "vogelstimmen:K07\.92"\r?\n\t\t\(layer "F\.Cu"\)\r?\n\t\t\(uuid "[^"]+"\)\r?\n\t\t\(at [0-9.-]+ [0-9.-]+\)/,
  (m) => m.replace(/\(at [0-9.-]+ [0-9.-]+\)/, `(at ${NEW.x} ${NEW.y})`)
);

// ANZEIGE text size 0.7 -> 0.8
t = t.replace(
  /\(fp_text user "ANZEIGE"\r?\n\t\t\t\(at 0 -8\.2 0\)\r?\n\t\t\t\(layer "F\.SilkS"\)\r?\n\t\t\t\(uuid "[^"]+"\)\r?\n\t\t\t\(effects\r?\n\t\t\t\t\(font\r?\n\t\t\t\t\t\(size 0\.7 0\.7\)/,
  (m) => m.replace("(size 0.7 0.7)", "(size 0.8 0.8)")
);

let n = 0;
t = t.replace(/\(segment\r?\n([\s\S]*?)\r?\n\t\)/g, (full, body) => {
  let b = body;
  let changed = false;
  const mapPt = (x, y) => {
    if (near(x, y, OLD_PADS[1].x, OLD_PADS[1].y)) {
      changed = true;
      return NEW_PADS[1];
    }
    if (near(x, y, OLD_PADS[2].x, OLD_PADS[2].y)) {
      changed = true;
      return NEW_PADS[2];
    }
    return { x, y };
  };
  b = b.replace(/\(start ([0-9.-]+) ([0-9.-]+)\)/, (_, xs, ys) => {
    const p = mapPt(+xs, +ys);
    return `(start ${p.x} ${p.y})`;
  });
  b = b.replace(/\(end ([0-9.-]+) ([0-9.-]+)\)/, (_, xs, ys) => {
    const p = mapPt(+xs, +ys);
    return `(end ${p.x} ${p.y})`;
  });
  if (changed) n++;
  return `(segment\n${b}\n\t)`;
});

fs.writeFileSync(PCB, t);
console.log("J5 moved by", dx, dy, "->", NEW);
console.log("Pads", NEW_PADS);
console.log("Segments retargeted", n);
console.log("Zone clearance fixed to 0.2");
