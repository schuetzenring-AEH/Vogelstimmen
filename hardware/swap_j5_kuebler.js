const fs = require("fs");
const crypto = require("crypto");

const PCB = "C:/Users/Schue/Projects/Vogelstimmen/hardware/vogelstimmen_v2.2.kicad_pcb";

function uuid() {
  return crypto.randomUUID();
}

function findFootprintBlock(text, libId, reference) {
  const marker = `(footprint "${libId}"`;
  let idx = 0;
  while (true) {
    const start = text.indexOf(marker, idx);
    if (start < 0) return null;
    let depth = 0;
    let end = start;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "(") depth++;
      else if (text[i] === ")") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    const block = text.slice(start, end);
    if (block.includes(`(property "Reference" "${reference}"`)) {
      return { start, end };
    }
    idx = start + 1;
  }
}

const AT = { x: 185.5, y: 84.725 };
const OLD_PADS = {
  1: { x: 185.5, y: 84.725 },
  2: { x: 185.5, y: 87.265 },
};
const NEW_PADS = {
  1: { x: AT.x - 5.08, y: AT.y },
  2: { x: AT.x + 5.08, y: AT.y },
};

function near(x, y, tx, ty, tol = 0.35) {
  return Math.hypot(x - tx, y - ty) < tol;
}

function buildPcbFootprint() {
  const fpUuid = "f7cadf9e-c670-4e50-ac75-56ee8c46bbe1";
  const refUuid = "da9f7c40-cfb7-479e-b3b5-8b4c686371c6";
  const pad1Uuid = "7d2e4925-26d0-452f-a856-8a7482bfc269";
  const pad2Uuid = "2221c1a0-d79b-4310-b308-291dd94498c9";

  return `	(footprint "vogelstimmen:K07.92"
		(layer "F.Cu")
		(uuid "${fpUuid}")
		(at ${AT.x} ${AT.y})
		(descr "Kübler K07.92 PCB mount, 2 coil pins, 10.16mm pitch")
		(tags "Kübler K07.92 counter THT")
		(property "Reference" "J5"
			(at 0 -10 0)
			(layer "F.SilkS")
			(uuid "${refUuid}")
			(effects
				(font
					(size 1 1)
					(thickness 0.15)
				)
			)
		)
		(property "Value" "K07.92"
			(at 0 10 0)
			(layer "F.Fab")
			(uuid "${uuid()}")
			(effects
				(font
					(size 1 1)
					(thickness 0.15)
				)
			)
		)
		(property "Datasheet" ""
			(at 0 0 0)
			(layer "F.Fab")
			(hide yes)
			(uuid "${uuid()}")
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(property "Description" "Kübler K07.92 5V electromechanical impulse counter"
			(at 0 0 0)
			(layer "F.Fab")
			(hide yes)
			(uuid "${uuid()}")
			(effects
				(font
					(size 1.27 1.27)
				)
			)
		)
		(path "/b0000001-0001-4000-8000-000000000050")
		(sheetname "/")
		(sheetfile "vogelstimmen_v2.kicad_sch")
		(attr through_hole)
		(duplicate_pad_numbers_are_jumpers no)
		(fp_line
			(start -16.5 -7.5)
			(end 16.5 -7.5)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_line
			(start 16.5 -7.5)
			(end 16.5 7.5)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_line
			(start 16.5 7.5)
			(end -16.5 7.5)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_line
			(start -16.5 7.5)
			(end -16.5 -7.5)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_line
			(start -8 -7.5)
			(end -8 -9)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_line
			(start -8 -9)
			(end 8 -9)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_line
			(start 8 -9)
			(end 8 -7.5)
			(stroke
				(width 0.12)
				(type solid)
			)
			(layer "F.SilkS")
			(uuid "${uuid()}")
		)
		(fp_text user "ANZEIGE"
			(at 0 -8.2 0)
			(layer "F.SilkS")
			(uuid "${uuid()}")
			(effects
				(font
					(size 0.7 0.7)
					(thickness 0.1)
				)
			)
		)
		(fp_text user "+"
			(at -5.08 2.2 0)
			(layer "F.SilkS")
			(uuid "${uuid()}")
			(effects
				(font
					(size 0.8 0.8)
					(thickness 0.12)
				)
			)
		)
		(fp_rect
			(start -17 -9.5)
			(end 17 8.5)
			(stroke
				(width 0.05)
				(type solid)
			)
			(fill no)
			(layer "F.CrtYd")
			(uuid "${uuid()}")
		)
		(fp_line
			(start -16.35 -7.35)
			(end 16.35 -7.35)
			(stroke
				(width 0.1)
				(type solid)
			)
			(layer "F.Fab")
			(uuid "${uuid()}")
		)
		(fp_line
			(start 16.35 -7.35)
			(end 16.35 7.35)
			(stroke
				(width 0.1)
				(type solid)
			)
			(layer "F.Fab")
			(uuid "${uuid()}")
		)
		(fp_line
			(start 16.35 7.35)
			(end -16.35 7.35)
			(stroke
				(width 0.1)
				(type solid)
			)
			(layer "F.Fab")
			(uuid "${uuid()}")
		)
		(fp_line
			(start -16.35 7.35)
			(end -16.35 -7.35)
			(stroke
				(width 0.1)
				(type solid)
			)
			(layer "F.Fab")
			(uuid "${uuid()}")
		)
		(pad "1" thru_hole rect
			(at -5.08 0)
			(size 1.8 1.4)
			(drill oval 1.2 0.8)
			(layers "*.Cu" "*.Mask")
			(remove_unused_layers no)
			(net "/5V")
			(pinfunction "Pin_1")
			(pintype "passive")
			(uuid "${pad1Uuid}")
		)
		(pad "2" thru_hole oval
			(at 5.08 0)
			(size 1.8 1.4)
			(drill oval 1.2 0.8)
			(layers "*.Cu" "*.Mask")
			(remove_unused_layers no)
			(net "/GND")
			(pinfunction "Pin_2")
			(pintype "passive")
			(uuid "${pad2Uuid}")
		)
		(embedded_fonts no)
	)`;
}

function retargetSegments(text) {
  let n = 0;
  const out = text.replace(/\(segment\r?\n([\s\S]*?)\r?\n\t\)/g, (full, body) => {
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
  console.log("Retargeted segments:", n);
  return out;
}

let pcb = fs.readFileSync(PCB, "utf8");

const existing = findFootprintBlock(pcb, "vogelstimmen:K07.92", "J5");
const old = findFootprintBlock(
  pcb,
  "Connector_PinHeader_2.54mm:PinHeader_1x02_P2.54mm_Vertical",
  "J5"
);

if (existing) {
  console.log("J5 already uses K07.92");
} else if (!old) {
  throw new Error("J5 PinHeader footprint not found");
} else {
  let s = old.start;
  const e = old.end;
  if (s > 0 && pcb[s - 1] === "\t") s--;
  const fp = buildPcbFootprint();
  pcb = pcb.slice(0, s) + fp + pcb.slice(e);
  console.log("Replaced J5 with vogelstimmen:K07.92");
}

pcb = retargetSegments(pcb);
fs.writeFileSync(PCB, pcb, "utf8");

console.log("Pad1 /5V :", NEW_PADS[1]);
console.log("Pad2 /GND:", NEW_PADS[2]);
console.log("Done.");
