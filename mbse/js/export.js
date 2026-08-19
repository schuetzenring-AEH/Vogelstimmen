/**
 * Export: JSON (roundtrip), PlantUML, SysML v2 text.
 * Phase-1 honesty: SysML is a textual subset, not a certified Cameo roundtrip.
 */
import { TYPE_LABEL } from "./graph-engine.js";

export function exportJson(rawModel) {
  return JSON.stringify(rawModel, null, 2);
}

export function exportPlantUml(g) {
  const lines = [
    "@startuml vogelstimmen_trace",
    "skinparam shadowing false",
    "skinparam backgroundColor #1c2420",
    "skinparam defaultFontColor #e8efe6",
    "title Digital Thread — Requirement → Funktion → Block → Test",
    "",
  ];
  const stereo = {
    requirement: "requirement",
    function: "function",
    block: "block",
    test: "test",
    risk: "risk",
    usecase: "usecase",
    interface: "interface",
    stakeholder: "actor",
  };
  for (const n of g.nodes.values()) {
    const st = stereo[n.type] || "entity";
    const label = `${n.id}\\n${(n.title || "").replace(/"/g, "'").slice(0, 42)}`;
    lines.push(`rectangle "${label}" as ${pumlId(n.id)} <<${st}>>`);
  }
  lines.push("");
  for (const [, list] of g.out) {
    for (const e of list) {
      if (!g.nodes.has(e.from) || !g.nodes.has(e.to)) continue;
      lines.push(`${pumlId(e.from)} --> ${pumlId(e.to)} : ${e.type}`);
    }
  }
  lines.push("@enduml");
  return lines.join("\n");
}

function pumlId(id) {
  return "N_" + id.replace(/[^A-Za-z0-9_]/g, "_");
}

function sysmlName(id) {
  return id.replace(/[^A-Za-z0-9_]/g, "_");
}

export function exportSysml(g) {
  const losses = [
    "Kein vollständiges KerML-Metamodell (kein Part-Usage-Typing über Ports hinaus).",
    "Cameo/MagicDraw-Stereotypes und Profile-IDs fehlen — re-import ist manuell.",
    "Capella Logical/Physical Component Mapping ist nicht 1:1.",
    "Parametric constraints (minMonths, iIdleMax) nur als comment, nicht als constraint def.",
    "Dokument-Knoten als comment, nicht als requirement annotation package.",
  ];
  const lines = [
    "// SysML v2 textual subset — Vogelstimmen MBSE PoC",
    "// IDs are stable named elements. Not a certified tool roundtrip.",
    `package Vogelstimmen_MBSE {`,
    `  doc /* ${g.meta?.title || "Vogelstimmen"} rev ${g.meta?.revision || "?"} */`,
    "",
  ];
  const kind = {
    requirement: "requirement def",
    function: "action def",
    block: "part def",
    interface: "port def",
    usecase: "use case def",
    test: "requirement def",
    risk: "requirement def",
    stakeholder: "item def",
    adr: "requirement def",
    part: "part def",
    document: "item def",
    finding: "requirement def",
    software: "part def",
  };
  for (const n of g.nodes.values()) {
    const k = kind[n.type] || "item def";
    lines.push(`  ${k} ${sysmlName(n.id)} {`);
    lines.push(`    doc /* ${TYPE_LABEL[n.type] || n.type}: ${(n.title || "").replace(/\*\//g, "")} */`);
    lines.push(`    attribute id : String = "${n.id}";`);
    if (n.params) {
      for (const [pk, pv] of Object.entries(n.params)) {
        lines.push(`    // param ${pk} = ${JSON.stringify(pv)}`);
      }
    }
    lines.push(`  }`);
    lines.push("");
  }
  lines.push("  // Trace connections");
  let i = 0;
  for (const [, list] of g.out) {
    for (const e of list) {
      if (!g.nodes.has(e.from) || !g.nodes.has(e.to)) continue;
      i += 1;
      lines.push(`  connection trace_${i} : Trace {`);
      lines.push(`    end : ${sysmlName(e.from)};`);
      lines.push(`    end : ${sysmlName(e.to)};`);
      lines.push(`    doc /* ${e.type} ${e.from} → ${e.to} */`);
      lines.push(`  }`);
    }
  }
  lines.push("}");
  lines.push("");
  return { text: lines.join("\n"), losses, connectionCount: i, nodeCount: g.nodes.size };
}

export function download(filename, text, mime = "text/plain") {
  const blob = new Blob([text], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
