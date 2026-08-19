/**
 * MBSE graph engine — load, traverse, impact colors, cycle detection.
 */
export const EDGE_DOWN = new Set([
  "derives", "satisfies", "allocates", "verifies", "mitigates", "documents", "interfaces",
]);

export function loadModel(raw) {
  const nodes = new Map((raw.nodes || []).map((n) => [n.id, { ...n }]));
  const out = new Map();
  const inn = new Map();
  for (const e of raw.edges || []) {
    if (!out.has(e.from)) out.set(e.from, []);
    if (!inn.has(e.to)) inn.set(e.to, []);
    out.get(e.from).push(e);
    inn.get(e.to).push(e);
  }
  return { meta: raw.meta || {}, nodes, out, inn, raw };
}

export function nodeOf(g, id) {
  return g.nodes.get(id);
}

export function requirements(g) {
  return [...g.nodes.values()]
    .filter((n) => n.type === "requirement")
    .sort((a, b) => a.id.localeCompare(b.id, "de"));
}

function walk(g, start, dir, types = EDGE_DOWN) {
  const adj = dir === "down" ? g.out : g.inn;
  const pick = dir === "down" ? (e) => e.to : (e) => e.from;
  const seen = new Set();
  const dist = new Map();
  const q = [start];
  seen.add(start);
  dist.set(start, 0);
  while (q.length) {
    const cur = q.shift();
    const hops = dist.get(cur);
    for (const e of adj.get(cur) || []) {
      if (!types.has(e.type)) continue;
      const nxt = pick(e);
      if (!g.nodes.has(nxt) || seen.has(nxt)) continue;
      seen.add(nxt);
      dist.set(nxt, hops + 1);
      q.push(nxt);
    }
  }
  return { ids: seen, dist };
}

export function downstream(g, id) {
  return walk(g, id, "down");
}

export function upstream(g, id) {
  return walk(g, id, "up");
}

/** Tarjan-style simple directed-cycle finder on the full graph. */
export function findCycles(g) {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map();
  const stack = [];
  const cycles = [];
  for (const id of g.nodes.keys()) color.set(id, WHITE);

  function dfs(u) {
    color.set(u, GRAY);
    stack.push(u);
    for (const e of g.out.get(u) || []) {
      const v = e.to;
      if (!g.nodes.has(v)) continue;
      const c = color.get(v);
      if (c === GRAY) {
        const i = stack.indexOf(v);
        cycles.push(stack.slice(i).concat(v));
      } else if (c === WHITE) {
        dfs(v);
      }
    }
    stack.pop();
    color.set(u, BLACK);
  }

  for (const id of g.nodes.keys()) {
    if (color.get(id) === WHITE) dfs(id);
  }
  return cycles;
}

export function chainOf(g, startId) {
  const { dist } = downstream(g, startId);
  const byType = {};
  for (const [id, d] of dist) {
    if (id === startId) continue;
    const n = g.nodes.get(id);
    if (!n) continue;
    (byType[n.type] ||= []).push({ ...n, dist: d });
  }
  for (const k of Object.keys(byType)) {
    byType[k].sort((a, b) => a.dist - b.dist || a.id.localeCompare(b.id));
  }
  return byType;
}

/**
 * Impact coloring:
 *  red    = direct (1 hop) or rule.direct
 *  yellow = transitive / rule.review / matching tags
 *  green  = unchanged
 */
export function computeImpact(g, startId, rules, opts = {}) {
  const { dist } = downstream(g, startId);
  const start = g.nodes.get(startId);
  const metric = opts.metric || start?.params?.metric;
  const rule = (rules?.metrics && metric && rules.metrics[metric]) || null;
  const changed = opts.changed === true || (opts.newValue != null && start?.params && metric);

  const status = new Map();
  for (const id of g.nodes.keys()) status.set(id, "green");

  if (!changed && opts.mode !== "trace") {
    status.set(startId, "red");
    for (const [id, d] of dist) {
      if (id === startId) continue;
      status.set(id, d === 1 ? "red" : "yellow");
    }
    return summarize(g, startId, status, dist, rule, opts);
  }

  const direct = new Set(rule?.direct || []);
  const review = new Set(rule?.review || []);
  direct.add(startId);

  for (const [id, d] of dist) {
    if (id === startId) {
      status.set(id, "red");
      continue;
    }
    const n = g.nodes.get(id);
    if (direct.has(id) || d === 1) status.set(id, "red");
    else if (review.has(id) || d > 1) status.set(id, "yellow");
    const tags = n?.tags || [];
    if (status.get(id) === "green" && tags.includes("energy") && metric === "battery_life") {
      status.set(id, "yellow");
    }
  }
  for (const id of direct) if (g.nodes.has(id)) status.set(id, "red");
  for (const id of review) {
    if (g.nodes.has(id) && status.get(id) !== "red") status.set(id, "yellow");
  }
  for (const id of rule?.untouchedHint || []) {
    if (status.get(id) !== "red") status.set(id, "green");
  }
  return summarize(g, startId, status, dist, rule, opts);
}

function summarize(g, startId, status, dist, rule, opts) {
  const groups = { red: [], yellow: [], green: [] };
  for (const [id, st] of status) {
    const n = g.nodes.get(id);
    if (!n) continue;
    groups[st].push({
      id,
      type: n.type,
      title: n.title,
      dist: dist.get(id) ?? null,
      tags: n.tags || [],
    });
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => (a.dist ?? 99) - (b.dist ?? 99) || a.id.localeCompare(b.id));
  }
  return {
    startId,
    metric: rule ? Object.keys(rule).length && opts.metric : g.nodes.get(startId)?.params?.metric,
    rule,
    opts,
    status,
    groups,
    counts: {
      red: groups.red.length,
      yellow: groups.yellow.length,
      green: groups.green.length,
    },
  };
}

export const TYPE_LAYER = {
  stakeholder: 0,
  requirement: 1,
  usecase: 2,
  function: 3,
  block: 4,
  interface: 5,
  adr: 4,
  part: 5,
  risk: 6,
  test: 6,
  finding: 3,
  document: 7,
  software: 5,
};

export const TYPE_LABEL = {
  stakeholder: "Stakeholder",
  requirement: "Requirement",
  usecase: "Use Case",
  function: "Funktion",
  block: "Architektur",
  interface: "Interface",
  adr: "ADR",
  part: "Bauteil",
  risk: "Risiko",
  test: "Test",
  finding: "Finding",
  document: "Dokument",
  software: "Software",
};

export function showcaseHref(node) {
  const map = {
    stakeholder: "stakeholder",
    anforderungen: "anforderungen",
    pflichtenheft: "pflichtenheft",
    use_cases: "use_cases",
    funktionsstruktur: "funktionsstruktur",
    systemarchitektur: "systemarchitektur",
    pbs_icd: "pbs_icd",
    entscheidungen: "entscheidungen",
    risiko_fmea: "risiko_fmea",
    traceability: "traceability",
    digital_thread: "digital_thread",
    vv_testplan: "vv_testplan",
    schaltplan: "schaltplan",
    adversarial_review_v24: "adversarial_v25",
  };
  const doc = node?.doc && map[node.doc] ? map[node.doc] : null;
  if (!doc) return "../showcase/index.html#/bibliothek";
  return `../showcase/index.html#/bibliothek/${doc}/${encodeURIComponent(node.id)}`;
}
