/**
 * Traceability audit — findings with severity, plus coverage KPIs.
 */
import { findCycles } from "./graph-engine.js";

function hasOut(g, id) {
  return (g.out.get(id) || []).length > 0;
}
function hasIn(g, id) {
  return (g.inn.get(id) || []).length > 0;
}

export function runAudit(g) {
  const findings = [];

  for (const n of g.nodes.values()) {
    if (n.type === "requirement") {
      const downs = (g.out.get(n.id) || []).filter((e) =>
        ["satisfies", "allocates", "verifies", "derives", "interfaces", "documents", "mitigates"].includes(e.type),
      );
      if (!downs.length) {
        findings.push({
          id: `AUD-REQ-${n.id}`,
          severity: "high",
          check: "requirement_no_downstream",
          item: n.id,
          title: `${n.id} hat keinen Downstream-Link (Funktion/Block/Test/Ableitung)`,
        });
      }
    }
    if (n.type === "test") {
      const ups = (g.inn.get(n.id) || []).filter((e) => e.type === "verifies");
      if (!ups.length) {
        findings.push({
          id: `AUD-TC-${n.id}`,
          severity: "high",
          check: "test_no_requirement",
          item: n.id,
          title: `${n.id} ist nicht an ein Requirement/Artefakt per verifies gebunden`,
        });
      }
    }
    if (n.type === "risk") {
      const links = [...(g.inn.get(n.id) || []), ...(g.out.get(n.id) || [])]
        .filter((e) => e.type === "mitigates");
      if (!links.length) {
        findings.push({
          id: `AUD-RSK-${n.id}`,
          severity: "medium",
          check: "risk_no_mitigation",
          item: n.id,
          title: `${n.id} ohne Mitigation-Link`,
        });
      }
    }
    if (n.id.startsWith("SYS-") && n.type === "requirement") {
      const derived = (g.inn.get(n.id) || []).filter((e) => e.type === "derives");
      if (!derived.length) {
        findings.push({
          id: `AUD-SYS-${n.id}`,
          severity: "medium",
          check: "sys_no_derivation",
          item: n.id,
          title: `${n.id} ohne Ableitung aus Lastenheft/ADR`,
        });
      }
    }
    if (n.type === "software") continue;
    if (!hasIn(g, n.id) && !hasOut(g, n.id)) {
      findings.push({
        id: `AUD-ORPH-${n.id}`,
        severity: "medium",
        check: "orphan",
        item: n.id,
        title: `${n.id} ist verwaist (kein Up- oder Downstream)`,
      });
    }
  }

  const cycles = findCycles(g);
  for (const cyc of cycles) {
    findings.push({
      id: `AUD-CYC-${cyc.slice(0, 3).join("-")}`,
      severity: "high",
      check: "cycle",
      item: cyc.join(" → "),
      title: `Zyklus: ${cyc.join(" → ")}`,
    });
  }

  const reqs = [...g.nodes.values()].filter((n) => n.type === "requirement");
  const withDown = reqs.filter((n) =>
    (g.out.get(n.id) || []).some((e) =>
      ["satisfies", "allocates", "verifies", "derives", "interfaces", "documents", "mitigates"].includes(e.type),
    ),
  );
  const tests = [...g.nodes.values()].filter((n) => n.type === "test");
  const testsLinked = tests.filter((n) =>
    (g.inn.get(n.id) || []).some((e) => e.type === "verifies"),
  );
  const risks = [...g.nodes.values()].filter((n) => n.type === "risk");
  const risksLinked = risks.filter((n) =>
    [...(g.inn.get(n.id) || []), ...(g.out.get(n.id) || [])].some((e) => e.type === "mitigates"),
  );

  const high = findings.filter((f) => f.severity === "high").length;
  const medium = findings.filter((f) => f.severity === "medium").length;
  const coverage = reqs.length ? Math.round((withDown.length / reqs.length) * 100) : 0;
  let score = "green";
  if (high > 0 || coverage < 80) score = "red";
  else if (medium > 0 || coverage < 95) score = "yellow";

  const kpis = {
    nodeCount: g.nodes.size,
    edgeCount: [...g.out.values()].reduce((n, a) => n + a.length, 0),
    requirementCount: reqs.length,
    traceabilityCoveragePct: coverage,
    requirementsWithDownstream: withDown.length,
    orphanCount: findings.filter((f) => f.check === "orphan").length,
    cycleCount: cycles.length,
    testCoveragePct: tests.length ? Math.round((testsLinked.length / tests.length) * 100) : 0,
    riskCoveragePct: risks.length ? Math.round((risksLinked.length / risks.length) * 100) : 0,
    auditScore: score,
    high,
    medium,
  };

  findings.sort((a, b) => {
    const o = { high: 0, medium: 1, low: 2 };
    return (o[a.severity] ?? 9) - (o[b.severity] ?? 9) || a.item.localeCompare(b.item);
  });

  return { findings, kpis, cycles };
}

export function auditToMarkdown(report) {
  const lines = [
    "# Traceability-Audit",
    "",
    `Score: **${report.kpis.auditScore}** · Coverage ${report.kpis.traceabilityCoveragePct}% · Findings ${report.findings.length}`,
    "",
    "## KPIs",
    "",
    `| KPI | Wert |`,
    `|-----|------|`,
    `| Knoten | ${report.kpis.nodeCount} |`,
    `| Kanten | ${report.kpis.edgeCount} |`,
    `| Requirements mit Downstream | ${report.kpis.requirementsWithDownstream}/${report.kpis.requirementCount} |`,
    `| Traceability Coverage | ${report.kpis.traceabilityCoveragePct}% |`,
    `| Test-Bindung | ${report.kpis.testCoveragePct}% |`,
    `| Risiko-Bindung | ${report.kpis.riskCoveragePct}% |`,
    `| Verwaist | ${report.kpis.orphanCount} |`,
    `| Zyklen | ${report.kpis.cycleCount} |`,
    "",
    "## Findings (priorisiert)",
    "",
  ];
  for (const f of report.findings) {
    lines.push(`- **${f.severity.toUpperCase()}** \`${f.item}\` — ${f.title}`);
  }
  if (!report.findings.length) lines.push("_Keine Findings._");
  lines.push("");
  return lines.join("\n");
}
