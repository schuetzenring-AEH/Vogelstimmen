#!/usr/bin/env node
/**
 * Bootstrap MBSE model from structured Vogelstimmen artefacts.
 * Source of truth after generation: ../data/mbse-model.json
 *
 * Namespace: F01 = Lastenheft-Requirement, FIND-F-01 = adversarial finding.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dir, "..", "data");

const nodes = [];
const edges = [];
const seen = new Set();

function add(node) {
  if (seen.has(node.id)) return;
  seen.add(node.id);
  nodes.push(node);
}

function link(from, to, type, extra = {}) {
  if (!from || !to) return;
  edges.push({ from, to, type, ...extra });
}

function req(id, title, extra = {}) {
  add({
    id,
    type: "requirement",
    title,
    namespace: id.startsWith("SYS") ? "pflichtenheft" : "lastenheft",
    doc: id.startsWith("SYS") ? "pflichtenheft" : "anforderungen",
    ...extra,
  });
}

function many(ids, fn) {
  ids.forEach(fn);
}

/* —— Stakeholders —— */
const SH = [
  ["SH-01", "Besucher (Waldlehrpfad)", "Vogelstimmen hören, einfache Bedienung"],
  ["SH-02", "Betreiber (Kolping / Lehrpfad)", "Zuverlässig, wartungsarm, Batterie hält"],
  ["SH-03", "Wartung / Service", "Tausch, Audio per USB, Zähler ablesen"],
  ["SH-04", "Entwicklung", "Nachvollziehbare Spec, Review, Fertigung"],
  ["SH-05", "Fertigung (JLCPCB + Hand)", "Klare BOM/CPL/Gerber"],
  ["SH-06", "Reviewer (adversarial)", "Blocker finden vor Serie"],
];
SH.forEach(([id, title, need]) => add({ id, type: "stakeholder", title, need, doc: "stakeholder" }));

/* —— Requirements —— */
const F = [
  ["F01", "8 Taster anschließbar", ["pcb"]],
  ["F02", "Feste Zuordnung Taster→Stimme", []],
  ["F03", "Wiedergabe < 500 ms nach Druck", ["latency"]],
  ["F04", "Tonsequenz ~10 s", []],
  ["F05", "Lautstärke 2–3 m, 3 W", ["audio"]],
  ["F06", "Audio per USB austauschbar", []],
  ["F07", "Retrigger: neue Stimme ersetzt alte", []],
  ["F08", "Keine gleichzeitige Wiedergabe", []],
  ["F09", "Mono-Lautsprecher", ["audio"]],
  ["F10", "Impulszähler zählt Sessions", []],
  ["F11", "Taster-LEDs während Wiedergabe", []],
];
F.forEach(([id, title, tags]) => req(id, title, { tags, verification: [] }));

req("E01", "Betrieb über 12 V Batterie", { tags: ["energy"] });
req("E02", "Ruhestrom < 100 µA", { tags: ["energy"], params: { iIdleMax_uA: 100, metric: "idle_current" } });
req("E03", "Batterie ≥ 1 Jahr", {
  tags: ["energy"],
  params: { minMonths: 12, metric: "battery_life" },
  verification: ["V-ANA", "TC-S01"],
});
req("E04", "Aufwachen per Taster", { tags: ["energy"] });
req("E05", "Auto-Abschaltung nach Wiedergabe", { tags: ["energy"] });
req("E06", "Verstärker im Modul integriert", { tags: ["audio"] });

req("U01", "−10 °C bis +60 °C", { tags: ["environment"] });
req("U02", "Feuchtigkeit tolerieren", { tags: ["environment"] });
req("U03", "Wartungsfrei ≥ 1 Jahr", { tags: ["energy"] });
req("U04", "Keine beweglichen Teile", []);
req("U05", "Kein Netzanschluss", { tags: ["energy"] });

req("H01", "Printzähler 12 V DC auf PCB", { tags: ["pcb"] });
req("H02", "SMD durch JLCPCB bestückt", { tags: ["pcb"] });
req("H03", "Manuell: THT + DY-SV17F + Zähler", { tags: ["pcb"] });
req("H04", "4× M3 Montagelöcher", { tags: ["pcb"] });
req("H05", "Testpunkte 12 V, 5 V, GND, BUSY, Audio", { tags: ["pcb"] });
req("H06", "Zähler von oben ablesbar", []);
req("H07", "VGS-Schutz SI2301 per Zener 6,2 V", { tags: ["energy", "pcb"] });

req("M01", "BOM vorab bei LCSC verifiziert", []);
req("M02", "Spannungsprüfung aller ICs", []);
req("M03", "LTspice Simulation Stromversorgung", { tags: ["energy"] });
req("M04", "Review-Checkliste vor Bestellung", []);

const SYS = [
  ["SYS-01", "Platine speist sich ausschließlich aus 12 V DC an J1", ["E01"]],
  ["SYS-02", "Im Idle ist 12V_SW und 5V abgetrennt (Latch AUS)", ["E02", "E05"]],
  ["SYS-03", "Tastendruck setzt Latch auch ohne 5 V (Kaltstart Q6)", ["E04"]],
  ["SYS-04", "Nach Track-Ende löst BUSY den Latch (mit RC-Blanking)", ["E05"]],
  ["SYS-05", "Modul-IOs sehen kein 12-V-OR-Netz", ["FIND-F-01"]],
  ["SYS-06", "Pro Latch-ON genau ein Zählimpuls (~80 ms) an Hengstler", ["E-CNT-03"]],
  ["SYS-07", "SPK-Leiterbahnen ≥ 0,4 mm (Haupt 0,8 mm)", ["FIND-F-05"]],
  ["SYS-08", "USB-Programmierung nur ohne Board-5V / Modul abgezogen", ["FIND-F-09"]],
];
SYS.forEach(([id, title, src]) => {
  req(id, title, { tags: id === "SYS-01" || id === "SYS-02" ? ["energy"] : [] });
  src.forEach((s) => link(s, id, "derives"));
});
link("SYS-01", "B1", "allocates");
link("SYS-01", "IF-BAT", "interfaces");
link("SYS-02", "SF-11", "satisfies");
link("SYS-02", "B2", "allocates");
link("SYS-03", "SF-02", "satisfies");
link("SYS-03", "E-LATCH-02", "derives");
link("SYS-04", "SF-06", "satisfies");
link("SYS-04", "B2", "allocates");
link("SYS-05", "B6", "allocates");
link("SYS-06", "SF-07", "satisfies");
link("SYS-06", "B5", "allocates");
link("SYS-07", "B7", "allocates");
link("SYS-08", "IF-USB", "interfaces");

/* —— Use cases —— */
const UC = [
  ["UC-01", "Vogelstimme starten", ["F01", "F02", "F03", "F04", "F05", "E04"]],
  ["UC-02", "Stimme während Play wechseln", ["F07", "F08"]],
  ["UC-03", "Nutzungszähler ablesen", ["F10", "H06"]],
  ["UC-04", "Audiodateien aktualisieren", ["F06", "FIND-F-09"]],
  ["UC-05", "Batterie warten", ["E01", "E03"]],
];
UC.forEach(([id, title, reqs]) => {
  add({ id, type: "usecase", title, doc: "use_cases" });
  reqs.forEach((r) => link(r, id, "satisfies"));
});

link("SH-01", "F01", "derives");
link("SH-01", "F03", "derives");
link("SH-01", "F05", "derives");
link("SH-01", "UC-01", "satisfies");
link("SH-02", "E02", "derives");
link("SH-02", "E03", "derives");
link("SH-02", "U03", "derives");
link("SH-02", "F10", "derives");
link("SH-03", "F06", "derives");
link("SH-03", "H01", "derives");
link("SH-03", "H06", "derives");
link("SH-04", "M01", "derives");
link("SH-04", "M04", "derives");
link("SH-05", "H02", "derives");
link("SH-05", "H03", "derives");
link("SH-06", "M04", "derives");

/* —— Functions —— */
const SF = [
  ["SF-01", "Benutzereingabe erfassen", "Tastendruck erkennen und Kanal zuordnen"],
  ["SF-02", "System einschalten", "Latch aktivieren und Versorgung freigeben"],
  ["SF-03", "Versorgungsspannung bereitstellen", "12 V auf 5 V wandeln für Modul", ["energy"]],
  ["SF-04", "Vogelstimme abspielen", "Zugewiesene Audio-Datei wiedergeben"],
  ["SF-05", "Wiedergabe wechseln", "Laufende Stimme beenden und neue starten"],
  ["SF-06", "System automatisch abschalten", "Nach Wiedergabe Latch lösen", ["energy"]],
  ["SF-07", "Nutzung zählen", "Session am Impulszähler erfassen"],
  ["SF-08", "Betriebszustand anzeigen", "Taster-LEDs während Wiedergabe"],
  ["SF-09", "Audiodateien verwalten", "MP3/WAV per USB laden"],
  ["SF-10", "Eingangsschutz gewährleisten", "Verpolung und Überspannung abfangen", ["energy"]],
  ["SF-11", "Ruhestrom minimieren", "Im Idle Verbraucherpfad vollständig trennen", ["energy"]],
  ["SF-12", "Schallwandlung", "Mono-Audio über Lautsprecher"],
];
SF.forEach(([id, title, detail, tags = []]) => add({ id, type: "function", title, detail, tags, doc: "funktionsstruktur" }));

const R_TO_SF = {
  F01: ["SF-01"], F02: ["SF-01", "SF-04"], F03: ["SF-02", "SF-03", "SF-04"],
  F04: ["SF-04"], F05: ["SF-04", "SF-12"], F06: ["SF-09"], F07: ["SF-05"],
  F08: ["SF-04", "SF-05"], F09: ["SF-12"], F10: ["SF-07"], F11: ["SF-08"],
  E01: ["SF-03", "SF-10"], E02: ["SF-11"], E03: ["SF-11"],
  E04: ["SF-01", "SF-02"], E05: ["SF-06"], E06: ["SF-04", "SF-12"],
  U01: ["SF-03", "SF-04", "SF-10", "SF-11"], U02: ["SF-10"],
  U03: ["SF-09", "SF-11"], U04: ["SF-04", "SF-09"], U05: ["SF-03", "SF-10"],
  H01: ["SF-07"], H02: ["SF-03", "SF-10", "SF-11"], H03: ["SF-01", "SF-04", "SF-07"],
  H04: ["SF-07"], H05: ["SF-03", "SF-04", "SF-06"], H06: ["SF-07"],
  H07: ["SF-02", "SF-10"],
  M01: ["SF-03", "SF-10", "SF-11"], M02: ["SF-03", "SF-10"], M03: ["SF-03", "SF-11"],
};
Object.entries(R_TO_SF).forEach(([r, sfs]) => sfs.forEach((sf) => link(r, sf, "satisfies")));
for (let i = 1; i <= 12; i++) link("M04", `SF-${String(i).padStart(2, "0")}`, "satisfies");

/* —— Blocks —— */
const BLK = [
  ["B1", "Eingangsschutz", "Verpolung, TVS, VGS-Clamp", ["energy", "pcb"]],
  ["B2", "Latch / Power-Gate", "Ein/Aus, Hold, Release, Idle 0 µA", ["energy", "pcb"]],
  ["B3", "Buck 5 V (TPS62163)", "12 V → 5 V nur bei Latch AN", ["energy", "pcb"]],
  ["B4", "Audio DY-SV17F", "Wiedergabe, IO-Trigger, Class-D", ["audio"]],
  ["B5", "Zähler Hengstler", "Session-Impulse an 12V_SW", ["pcb"]],
  ["B6", "Taster-Interface", "J3/J4 + Dioden-OR + Serie D15–D22", ["pcb"]],
  ["B7", "Lautsprecher", "SPK+/SPK− BTL", ["audio", "pcb"]],
  ["B8", "LED-Versorgung", "12V_SW → R12 → J6", ["pcb"]],
];
BLK.forEach(([id, title, detail, tags]) => add({ id, type: "block", title, detail, tags, doc: "systemarchitektur" }));

const SF_TO_B = {
  "SF-01": ["B6", "B4"], "SF-02": ["B2", "B6"], "SF-03": ["B1", "B3"],
  "SF-04": ["B4"], "SF-05": ["B4"], "SF-06": ["B2", "B4"],
  "SF-07": ["B5"], "SF-08": ["B8"], "SF-09": ["B4"],
  "SF-10": ["B1"], "SF-11": ["B2"], "SF-12": ["B4", "B7"],
};
Object.entries(SF_TO_B).forEach(([sf, bs]) => bs.forEach((b) => link(sf, b, "allocates")));

const R_TO_B = {
  F01: ["B6"], F02: ["B4", "B6"], F03: ["B2", "B3", "B4"], F04: ["B4"],
  F05: ["B4", "B7"], F06: ["B4"], F07: ["B4"], F08: ["B4"], F09: ["B7"],
  F10: ["B5"], F11: ["B8"], E01: ["B1", "B3"], E02: ["B2"], E03: ["B2"],
  E04: ["B2", "B6"], E05: ["B2", "B4"], E06: ["B4"], U04: ["B4"], U05: ["B1"],
  H01: ["B5"], H03: ["B4", "B5", "B6"], H06: ["B5"], H07: ["B1", "B2"], M03: ["B3"],
};
Object.entries(R_TO_B).forEach(([r, bs]) => bs.forEach((b) => link(r, b, "allocates")));

/* —— Interfaces —— */
const IF = [
  ["IF-BAT", "Batterie J1", "B1", ["energy"]],
  ["IF-SPK", "Lautsprecher J2", "B7", ["audio"]],
  ["IF-BTN", "Taster J3/J4", "B6", []],
  ["IF-LED", "LEDs J6", "B8", []],
  ["IF-USB", "Micro-USB an U2", "B4", []],
  ["IF-M3", "4× M3 Montagelöcher", "PCB-01", ["pcb"]],
  ["IF-VIEW", "Zähleranzeige oben", "B5", []],
];
IF.forEach(([id, title, blk, tags]) => {
  add({ id, type: "interface", title, tags, doc: "pbs_icd" });
  link(blk, id, "interfaces");
});
link("E01", "IF-BAT", "interfaces");
link("F05", "IF-SPK", "interfaces");
link("F01", "IF-BTN", "interfaces");
link("F11", "IF-LED", "interfaces");
link("F06", "IF-USB", "interfaces");
link("H04", "IF-M3", "interfaces");
link("H06", "IF-VIEW", "interfaces");

/* —— PCB + software sentinel (stays green on energy what-if) —— */
add({
  id: "PCB-01",
  type: "part",
  title: "Leiterplatte Rev 2.5 (2L 1,6 mm)",
  tags: ["pcb", "energy"],
  doc: "schaltplan",
});
["B1", "B2", "B3", "B5", "B6", "B7", "B8"].forEach((b) => link(b, "PCB-01", "allocates"));
add({
  id: "SW-NONE",
  type: "software",
  title: "Keine Firmware (kein MCU)",
  tags: ["software"],
  detail: "Bewusst kein Mikrocontroller — Software-Impact bei Energie-Änderungen = 0.",
});

/* —— Key parts —— */
const PARTS = [
  ["U1", "TPS62163 Buck", "B3", ["energy"]],
  ["U2", "DY-SV17F", "B4", ["audio"]],
  ["Q1", "Latch P-FET", "B2", ["energy"]],
  ["Q5", "Verpolungsschutz SI2301", "B1", ["energy"]],
  ["J5", "Hengstler 0.635.128", "B5", []],
  ["J1", "Phoenix MPT 2 — Batterie", "B1", ["energy"]],
];
PARTS.forEach(([id, title, blk, tags]) => {
  add({ id, type: "part", title, tags, doc: "schaltplan" });
  link(blk, id, "allocates");
});

/* —— ADRs —— */
const ADR = [
  ["E-LATCH-01", "MOSFET-Latch statt MCU-Sleep", ["energy"], "B2"],
  ["E-LATCH-02", "Kaltstart SET über Q6 ohne 5 V", ["energy"], "B2"],
  ["E-BUCK-01", "TPS62163, EN an 12V_SW, kein UVLO-Teiler", ["energy"], "B3"],
  ["E-UVLO-01", "Kein UVLO-IC (Lektion Rev 1)", ["energy"], "B3"],
  ["E-CNT-03", "Hengstler 12 V + One-Shot an 12V_SW", [], "B5"],
  ["E-CNT-04", "Idle Spulenstrom 0", ["energy"], "B5"],
  ["E-VGS-01", "Zener 6,2 V an P-FET Gates", ["energy"], "B2"],
  ["E-AUDIO-01", "DY-SV17F Mode 0, kein eigener MCU", ["audio"], "B4"],
];
ADR.forEach(([id, title, tags, blk]) => {
  add({ id, type: "adr", title, tags, doc: "entscheidungen" });
  link(id, blk, "allocates");
});
link("E02", "E-LATCH-01", "derives");
link("E03", "E-BUCK-01", "derives");
link("E04", "E-LATCH-02", "derives");
link("F10", "E-CNT-03", "derives");

/* —— Findings (distinct from F01 requirements) —— */
const FIND = [
  ["FIND-F-01", "12 V Phantom Supply an Modul-IO", "R-01", "B6"],
  ["FIND-F-02", "VOS mit 100k → falsche 5 V", "R-02", "B3"],
  ["FIND-F-03", "Kurzdruck → kein Play", "R-03", "B2"],
  ["FIND-F-04", "LED-Kurzschluss an J6", "R-04", "B8"],
  ["FIND-F-05", "SPK zu dünn", "R-05", "B7"],
  ["FIND-F-09", "USB + Board-5V Backfeed", "R-07", "B4"],
];
FIND.forEach(([id, title, risk, blk]) => {
  add({ id, type: "finding", title, namespace: "adversarial", doc: "adversarial_review_v24" });
  link(id, risk, "mitigates");
  link(id, blk, "allocates");
});

/* —— Risks —— */
const RSK = [
  ["R-01", "12 V an Modul-IO (Phantom Supply)", 216, "behoben", []],
  ["R-02", "VOS mit 100k → falsche 5 V", 224, "behoben", ["energy"]],
  ["R-03", "Kurzdruck → kein Play / tot", 210, "mitigiert", []],
  ["R-04", "LED-Kurzschluss an J6", 96, "mitigiert", []],
  ["R-05", "SPK zu dünn → Hitze/Drop", 100, "behoben", ["audio"]],
  ["R-06", "SI2301 VDS vs. TVS Clamp", 96, "akzeptiert", ["energy"]],
  ["R-07", "USB + Board-5V Backfeed", 72, "prozess", []],
  ["R-08", "Feuchte / Kondenswasser", 150, "auflage", ["environment"]],
  ["R-09", "Falsche Bestückung Diode", 96, "offen", ["pcb"]],
  ["R-10", "Batterie-Laufzeit unter Plan (Selbstentladung/Nutzung)", 80, "analyse", ["energy"]],
];
RSK.forEach(([id, title, rpn, status, tags]) => {
  add({ id, type: "risk", title, rpn, status, tags, doc: "risiko_fmea", derived: id === "R-10" });
});
link("U02", "R-08", "mitigates");
link("E03", "R-10", "mitigates");
link("E02", "R-10", "mitigates");
link("SF-11", "R-10", "mitigates");
link("B2", "R-10", "mitigates");

/* —— Tests —— */
const TC = [
  ["TC-U01", "DRC PCB", "unit", [], "PASS"],
  ["TC-U02", "ERC Schaltplan", "unit", [], "PASS"],
  ["TC-U03", "BOM↔CPL↔PCB Refs", "unit", ["M01"], "PASS"],
  ["TC-I01", "F-01 Netze IOx_M", "integration", ["FIND-F-01", "SYS-05"], "PASS"],
  ["TC-I02", "F-02 R5=0R", "integration", ["FIND-F-02"], "PASS"],
  ["TC-I03", "Sim Idle-Strom", "integration", ["E02", "SYS-02"], "PASS"],
  ["TC-T01", "Sim UC-01 Happy Path", "subsystem", ["UC-01", "F03"], "PASS"],
  ["TC-T02", "Adversarial Disposition", "subsystem", ["M04"], "PASS"],
  ["TC-S01", "Idle I_BAT real <100 µA", "system", ["E02", "E03"], "OPEN"],
  ["TC-S02", "Taste halten → Play <0,5 s", "system", ["F03", "UC-01"], "OPEN"],
  ["TC-S03", "BUSY/Q3_GATE Oszi Release", "system", ["E05", "FIND-F-03"], "OPEN"],
  ["TC-S04", "R12 Temp / I_LED", "system", ["F11", "FIND-F-04"], "OPEN"],
  ["TC-S05", "5 V unter Play+LED", "system", ["E01"], "OPEN"],
  ["TC-S06", "Retrigger UC-02", "system", ["F07", "UC-02"], "OPEN"],
  ["TC-S07", "Zähler +1 pro Session", "system", ["F10", "UC-03"], "OPEN"],
  ["TC-A01", "Abnahme Lastenheft §11", "acceptance", ["UC-01"], "OPEN"],
  ["TC-A02", "USB-Audio UC-04", "acceptance", ["F06", "UC-04"], "OPEN"],
];
TC.forEach(([id, title, level, src, status]) => {
  const tags = [];
  if (["TC-I03", "TC-S01", "TC-S05"].includes(id)) tags.push("energy");
  add({ id, type: "test", title, level, status, tags, doc: "vv_testplan" });
  src.forEach((s) => link(s, id, "verifies"));
});
link("E03", "TC-S01", "verifies");
link("E02", "TC-I03", "verifies");

add({
  id: "V-ANA",
  type: "test",
  title: "Analyse / Rechnung (Verifikationsmethode)",
  level: "analysis",
  tags: ["energy"],
  doc: "traceability",
});
link("E03", "V-ANA", "verifies");
link("U01", "V-ANA", "verifies");

/* —— Documents —— */
const DOCS = [
  ["DOC-stakeholder", "Stakeholder", "stakeholder"],
  ["DOC-anforderungen", "Lastenheft", "anforderungen"],
  ["DOC-pflichtenheft", "Pflichtenheft", "pflichtenheft"],
  ["DOC-use_cases", "Use Cases", "use_cases"],
  ["DOC-funktionsstruktur", "Funktionsstruktur", "funktionsstruktur"],
  ["DOC-systemarchitektur", "Systemarchitektur", "systemarchitektur"],
  ["DOC-pbs_icd", "PBS & ICD", "pbs_icd"],
  ["DOC-entscheidungen", "ADRs", "entscheidungen"],
  ["DOC-risiko", "Risiko / FMEA", "risiko_fmea"],
  ["DOC-traceability", "Traceability RTM", "traceability"],
  ["DOC-digital_thread", "Digital Thread", "digital_thread"],
  ["DOC-vv", "V&V Testplan", "vv_testplan"],
  ["DOC-schaltplan", "Schaltplan-Doku", "schaltplan"],
];
DOCS.forEach(([id, title, doc]) => add({ id, type: "document", title, doc }));
link("E03", "DOC-traceability", "documents");
link("E02", "DOC-traceability", "documents");
link("SF-11", "DOC-funktionsstruktur", "documents");
link("B2", "DOC-systemarchitektur", "documents");
link("R-10", "DOC-risiko", "documents");
link("TC-S01", "DOC-vv", "documents");
link("SH-02", "DOC-stakeholder", "documents");

/* Known gap for audit: H04 traces oddly to SF-07 in source RTM — keep.
   Orphan by design: SW-NONE has no edges except none — add no links.
   TC-U01/U02 have no requirement links (unit DRC/ERC). */

const model = {
  meta: {
    id: "vogelstimmen-mbse",
    title: "Vogelstimmenkasten — MBSE Modellkern",
    revision: "2.5-poc",
    generated: new Date().toISOString().slice(0, 10),
    sources: [
      "docs/traceability.md",
      "docs/pflichtenheft.md",
      "docs/vv_testplan.md",
      "docs/risiko_fmea.md",
      "docs/use_cases.md",
      "docs/pbs_icd.md",
      "docs/stakeholder.md",
      "docs/systemarchitektur.md",
    ],
    note: "F01 = Lastenheft-Requirement; FIND-F-01 = adversarial Finding. R-10 derived for battery-life impact.",
  },
  nodes,
  edges,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "mbse-model.json"), JSON.stringify(model, null, 2) + "\n");
console.log(`Wrote ${nodes.length} nodes, ${edges.length} edges → data/mbse-model.json`);
