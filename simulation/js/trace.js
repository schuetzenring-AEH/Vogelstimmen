/**
 * RFP-Kette je Bauteil: Requirement → Function → Physical
 * plus Datenblatt und Designentscheidung (ADR).
 */
const DS = "../docs/datasheets/";
const ADR_V30 = "../showcase/index.html#/bibliothek/entscheidungen_v30";
const ADR_HIST = "../showcase/index.html#/bibliothek/entscheidungen";
const adr = (id, title, why, v30 = false) => ({
  href: `${v30 ? ADR_V30 : ADR_HIST}/${id}`,
  title,
  why,
});
const REQ_DOC = "../showcase/index.html#/bibliothek/anforderungen";
const RTM_DOC = "../showcase/index.html#/bibliothek/traceability";
const LCSC = (c) => `https://www.lcsc.com/product-detail/${c}.html`;

const REQ = {
  F01: "8 Taster anschließbar",
  F02: "Feste Zuordnung Taster→Stimme",
  F03: "Wiedergabe < 500 ms nach Druck",
  F04: "Tonsequenz ~10 s",
  F05: "Lautstärke 2–3 m, 3 W",
  F06: "Audio per USB austauschbar",
  F07: "Retrigger: neue Stimme ersetzt alte",
  F08: "Keine gleichzeitige Wiedergabe",
  F09: "Mono-Lautsprecher",
  F10: "Impulszähler zählt Sessions",
  F11: "Taster-LEDs während Wiedergabe",
  E01: "Betrieb über 12 V Batterie",
  E02: "Ruhestrom < 100 µA",
  E03: "Batterie ≥ 1 Jahr",
  E04: "Aufwachen per Taster",
  E05: "Auto-Abschaltung nach Wiedergabe",
  E06: "Verstärker im Modul integriert",
  U01: "−10 °C bis +60 °C",
  U04: "Keine beweglichen Teile (kein SD)",
  U05: "Kein Netzanschluss",
  H01: "Printzähler 12 V DC auf PCB",
  H02: "SMD durch JLCPCB bestückt",
  H03: "Manuell: THT + Modul + Zähler",
  H05: "Testpunkte 12 V, 5 V, GND, BUSY, Audio",
  H06: "Zähler von oben ablesbar",
  H07: "VGS-Schutz SI2301 per Zener 6,2 V",
  M01: "BOM vorab bei LCSC verifiziert",
  M02: "Spannungsprüfung aller ICs",
};

const SF = {
  "SF-01": "Benutzereingabe erfassen",
  "SF-02": "System einschalten",
  "SF-03": "Versorgungsspannung bereitstellen",
  "SF-04": "Vogelstimme abspielen",
  "SF-05": "Wiedergabe wechseln",
  "SF-06": "System automatisch abschalten",
  "SF-07": "Nutzung zählen",
  "SF-08": "Betriebszustand anzeigen",
  "SF-09": "Audiodateien verwalten",
  "SF-10": "Eingangsschutz gewährleisten",
  "SF-11": "Ruhestrom minimieren",
  "SF-12": "Schallwandlung",
};

const ADR = {
  "E-AUDIO-01": adr("E-AUDIO-01", "DY-SV17F statt WT588D, kein MCU",
    "WT588D war nicht beschaffbar. Fertigmodul mit 8 Triggern, USB-Stick-Upload und eingebautem Verstärker — ohne Firmware auf der Platine."),
  "E-AUDIO-02": adr("E-AUDIO-02", "Mode 0 (Flanke) statt Mode 1",
    "Kurzer Druck startet die ~10 s Sequenz. Mode 1 würde den Taster die ganze Zeit gedrückt brauchen."),
  "E-AUDIO-03": adr("E-AUDIO-03", "CON2 = V33, nicht 5 V",
    "Mode-Pins dürfen max. 3,3 V High sehen. 5 V an CON2 wäre außerhalb der Spec."),
  "E-AUDIO-04": adr("E-AUDIO-04", "U2-Sockel Pflicht; USB nur Werkstatt",
    "USB speist das Modul intern. Zusammen mit Board-5 V = Backfeed in den Buck. Deshalb Sockel, USB nur bei Latch aus, kein Gehäuseloch im Wald."),
  "E-LATCH-01": adr("E-LATCH-01", "Hardware-Latch für ≈0 µA Ruhestrom",
    "Das Modul hat im IO-Modus keinen µA-Sleep. Q1 schaltet die ganze 12-V-Lastschiene tot — Buck, Audio, LEDs, Zählerspule."),
  "E-LATCH-02": adr("E-LATCH-02", "Kaltstart-SET mit P-FET Q6",
    "Taster sind Active-Low. Ein N-FET-Inverter hätte im Idle ~255 µA gezogen. P-FET Q6 ist im Idle aus → ≈0 µA."),
  "E-RPP-01": adr("E-RPP-01", "R6 = 470 kΩ, Idle < 100 µA",
    "10 kΩ am Verpolungs-Gate zog ~580 µA, obwohl der Latch aus war. 470 kΩ → ~12 µA, E02 erfüllt."),
  "E-VGS-01": adr("E-VGS-01", "Zener-Clamp ±8 V an SI2301",
    "Ohne Clamp läge −12 V am Gate (Limit ±8 V). 6,2-V-Zener an Q5, Q1 und Q6 plus 4,7 kΩ Serie."),
  "E-BUCK-01": adr("E-BUCK-01", "TPS62163, 5 V nur für U2",
    "VIN bis 17 V (Rev 1: 6-V-Buck an 12 V verbrannt). 5 V nur Audio; Zähler hängt an 12V_SW, nicht am Buck."),
  "E-UVLO-01": adr("E-UVLO-01", "Kein UVLO-IC / kein EN-Teiler",
    "Rev 1: SGM809 an 12 V verbrannt. Idle ~12 µA; leere Batterie = Box stirbt von selbst. Kein extra Teiler an EN."),
  "E-SPK-01": adr("E-SPK-01", "Lautsprecher BTL, keine Seite an GND",
    "Class-D-Brücke: SPK+ und SPK− sind beide aktiv. SPK− an GND schließt einen Ausgang kurz."),
  "E-LED-01": adr("E-LED-01", "Alle Taster-LEDs gemeinsam an 12V_SW",
    "Alle acht LEDs leuchten zusammen, solange die Box wach ist. Eine Leitung pro Taster wären ~16 extra Teile."),
  "E-CONN-01": adr("E-CONN-01", "Phoenix MPT-0,5 statt Stiftleisten",
    "Bestandskabel sind Einzellitzen. Schraubklemmen halten im Schrank; Dupont-Stecker nicht."),
  "E-RESPIN-01": adr("E-RESPIN-01", "Respin F-01…F-05",
    "Blocker: 12-V-OR vom Modul trennen (D15–D22), VOS direkt (R5=0 Ω), BUSY-Blanking, LED-R12, SPK-Bahnen breiter."),
  "E-RESPIN-02": adr("E-RESPIN-02", "Restrisiko F-06…F-09",
    "Bewusst akzeptiert: kurze Tasterkabel im Schrank, kein Jumpstart, USB-Regel statt Ideal-Diode auf der PCB."),
  "E-R0603": adr("E-R0603", "Alle Widerstände 0603 + Basic-LCSC",
    "Rev 2.5: 0402-Pads mit 0603-Teilen → JLCPCB-Reject. Jetzt Footprint = Package.", true),
  "E-CNT-02": adr("E-CNT-02", "Kübler gestrichen",
    "K07.90 war zum Ordern nicht lieferbar. Ohne Zähler kein F10 — deshalb Wechsel auf Hengstler.", true),
  "E-CNT-03": adr("E-CNT-03", "One-Shot ~80 ms auf 12V_SW",
    "Ein Impuls pro Latch-ON (Session), nicht die ganze Play-Zeit Spulenstrom. C20/R20 ≈ 80 ms, über 50 ms Datenblatt-Min.", true),
  "E-CNT-04": adr("E-CNT-04", "Hengstler 0.635.128 (12 V PCB)",
    "12-V-Printzähler an 12V_SW. Der 5-V-Typ 0.635.132 würde den Buck-Soft-Start verlieren (Race).", true),
  "E-BOM-PKG": adr("E-BOM-PKG", "LCSC-Package = Footprint vor Bestellung",
    "Rev 1 falsches SOIC, Rev 2.5 0402/0603. Jede BOM-Zeile gegen LCSC-Gehäuse prüfen, sonst Order-Gate.", true),
};

function ids(map, list) {
  return (list || []).map((id) => ({ id, text: map[id] || id, href: id.startsWith("SF") ? RTM_DOC : REQ_DOC }));
}

function t(datasheet, adrs, reqs, sfs, chain) {
  return {
    datasheet,
    adrs: (adrs || []).map((id) => ({ id, ...(ADR[id] || { href: ADR_HIST, title: id }) })),
    reqs: ids(REQ, reqs),
    sfs: ids(SF, sfs),
    chain,
    rtm: RTM_DOC,
  };
}

const DS_4148 = { href: `${DS}1N4148WS.pdf`, label: "1N4148WS (onsemi)", extra: { href: LCSC("C118873"), label: "LCSC C118873" } };
const DS_SI2301 = { href: `${DS}Si2301CDS.pdf`, label: "SI2301CDS (Vishay)", extra: { href: LCSC("C10487"), label: "LCSC C10487" } };
const DS_2N7002 = { href: `${DS}2N7002L.pdf`, label: "2N7002L (onsemi)", extra: { href: LCSC("C16338"), label: "LCSC C16338" } };
const DS_BZX = { href: `${DS}BZX84C6V2_Nexperia.pdf`, label: "BZX84C6V2 (Nexperia)", extra: { href: LCSC("C179522"), label: "LCSC C179522" } };
const DS_R = (c, val) => ({ href: LCSC(c), label: `${val} 0603 Basic ${c}` });

const TRACE = {
  J1: t(
    { href: `${DS}Phoenix_MPT_0.5_2_1725656.pdf`, label: "Phoenix MPT 0,5/2 (1725656)" },
    ["E-CONN-01"],
    ["E01", "U05", "H03"],
    ["SF-03", "SF-10"],
    "E01 → SF-10 / SF-03 → B1 → J1 (BAT)",
  ),
  Q5: t(DS_SI2301, ["E-RPP-01", "E-VGS-01"], ["E01", "E02", "H07"], ["SF-10", "SF-11"], "E01/E02 → SF-10 → B1 → Q5"),
  D11: t(DS_BZX, ["E-VGS-01"], ["H07", "E01"], ["SF-10", "SF-02"], "H07 → SF-10 → B1 → D11"),
  R6: t(DS_R("C23178", "470 kΩ"), ["E-RPP-01", "E-R0603"], ["E02", "E03"], ["SF-11", "SF-10"], "E02 → SF-11 → B1 → R6"),
  R7: t(DS_R("C23162", "4,7 kΩ"), ["E-VGS-01", "E-R0603"], ["H07", "E02"], ["SF-10"], "H07 → SF-10 → B1 → R7"),
  F1: t({ href: LCSC("C2760272"), label: "PTC 1 A/24 V 1206 C2760272" }, ["E-BOM-PKG"], ["E01", "U05"], ["SF-10"], "E01 → SF-10 → B1 → F1"),
  D9: t({ href: `${DS}SMAJ15A.pdf`, label: "SMAJ15A TVS", extra: { href: LCSC("C113958"), label: "LCSC C113958" } }, ["E-BOM-PKG"], ["E01", "U05"], ["SF-10"], "E01 → SF-10 → B1 → D9"),
  C1: t({ href: LCSC("C440198"), label: "10 µF/25 V 0805 C440198" }, ["E-BOM-PKG"], ["E01"], ["SF-10"], "E01 → SF-10 → B1 → C1"),
  TP1: t({ href: RTM_DOC, label: "H05 Testpunkte (RTM)" }, ["E-BOM-PKG"], ["H05"], ["SF-03", "SF-10"], "H05 → SF-10 → B1 → TP1"),
  TP3: t({ href: RTM_DOC, label: "H05 Testpunkte (RTM)" }, ["E-BOM-PKG"], ["H05"], ["SF-03"], "H05 → SF-03 → B1 → TP3"),

  Q1: t(DS_SI2301, ["E-LATCH-01", "E-VGS-01"], ["E02", "E04", "E05", "F03"], ["SF-02", "SF-06", "SF-11"], "E02/E04 → SF-02/SF-11 → B2 → Q1"),
  Q2: t(DS_2N7002, ["E-LATCH-01"], ["E02", "E04", "E05"], ["SF-02", "SF-06", "SF-11"], "E02 → SF-11 → B2 → Q2"),
  Q3: t(DS_2N7002, ["E-LATCH-01", "E-RESPIN-01"], ["E05", "F03"], ["SF-06"], "E05 → SF-06 → B2 → Q3"),
  Q6: t(DS_SI2301, ["E-LATCH-02", "E-VGS-01"], ["E04", "E02", "F03"], ["SF-02"], "E04 → SF-02 → B2 → Q6"),
  R1: t(DS_R("C25803", "100 kΩ"), ["E-LATCH-01", "E-R0603"], ["E02"], ["SF-11", "SF-02"], "E02 → SF-11 → B2 → R1"),
  R2: t(DS_R("C25803", "100 kΩ"), ["E-LATCH-01", "E-R0603"], ["E02", "E04"], ["SF-02", "SF-11"], "E04 → SF-02 → B2 → R2"),
  R3: t(DS_R("C25804", "10 kΩ"), ["E-AUDIO-02", "E-R0603"], ["F07", "F08"], ["SF-04"], "E-AUDIO-02 → B4 → R3 (CON3 Mode 0)"),
  R4: t(DS_R("C25804", "10 kΩ"), ["E-LATCH-01", "E-R0603"], ["E02", "E04"], ["SF-02", "SF-11"], "E04 → SF-02 → B2 → R4 (Hold)"),
  R8: t(DS_R("C23162", "4,7 kΩ"), ["E-VGS-01", "E-R0603"], ["H07", "E02"], ["SF-02", "SF-10"], "H07 → SF-02 → B2 → R8"),
  R9: t(DS_R("C25804", "10 kΩ"), ["E-LATCH-02", "E-R0603"], ["E04", "E02"], ["SF-02"], "E04 → SF-02 → B2 → R9"),
  R10: t(DS_R("C21190", "1 kΩ"), ["E-LATCH-02", "E-R0603"], ["E04"], ["SF-02"], "E04 → SF-02 → B2 → R10"),
  R11: t(DS_R("C23162", "4,7 kΩ"), ["E-LATCH-02", "E-VGS-01", "E-R0603"], ["E04", "H07"], ["SF-02"], "E04 → SF-02 → B2 → R11"),
  D12: t(DS_BZX, ["E-VGS-01"], ["H07", "E02"], ["SF-02", "SF-10"], "H07 → SF-02 → B2 → D12"),
  D13: t(DS_4148, ["E-LATCH-02"], ["E04"], ["SF-02"], "E04 → SF-02 → B2 → D13"),
  D14: t(DS_BZX, ["E-VGS-01", "E-LATCH-02"], ["H07", "E04"], ["SF-02"], "E04 → SF-02 → B2 → D14"),
  R13: t(DS_R("C25803", "100 kΩ"), ["E-RESPIN-01", "E-R0603"], ["E05", "F03"], ["SF-06"], "E05 → SF-06 → B2 → R13 (F-03)"),
  C4: t({ href: LCSC("C1779"), label: "4,7 µF/16 V 0805 C1779" }, ["E-RESPIN-01"], ["E05", "F03"], ["SF-06"], "E05 → SF-06 → B2 → C4 (F-03)"),
  TP4: t({ href: RTM_DOC, label: "H05 Testpunkte (RTM)" }, ["E-LATCH-01"], ["H05", "E05"], ["SF-06"], "H05/E05 → SF-06 → B2 → TP4"),

  U1: t(
    { href: `${DS}TPS62163.pdf`, label: "TPS62163 (TI)", extra: { href: LCSC("C97534"), label: "LCSC C97534" } },
    ["E-BUCK-01", "E-UVLO-01", "E-BOM-PKG"],
    ["E01", "F03", "M02"],
    ["SF-03"],
    "E01/F03 → SF-03 → B3 → U1 (5 V nur für U2)",
  ),
  L1: t({ href: LCSC("C88527"), label: "2,2 µH 1008 C88527" }, ["E-BOM-PKG"], ["E01", "F03"], ["SF-03"], "E01 → SF-03 → B3 → L1"),
  C2: t({ href: LCSC("C440198"), label: "10 µF/25 V 0805 C440198" }, ["E-BOM-PKG"], ["E01", "F03"], ["SF-03"], "E01 → SF-03 → B3 → C2"),
  C3: t({ href: LCSC("C45783"), label: "22 µF/10 V 0805 C45783" }, ["E-BOM-PKG"], ["E01", "F03"], ["SF-03"], "E01 → SF-03 → B3 → C3"),
  R5: t(DS_R("C21189", "0 Ω"), ["E-RESPIN-01", "E-R0603"], ["F03", "E01"], ["SF-03"], "F-02 → SF-03 → B3 → R5 (VOS=5 V)"),
  TP2: t({ href: RTM_DOC, label: "H05 Testpunkte (RTM)" }, ["E-BOM-PKG"], ["H05", "E01"], ["SF-03"], "H05 → SF-03 → B3 → TP2"),

  U2: t(
    { href: `${DS}DY-SV17F.pdf`, label: "DY-SV17F Modulhandbuch" },
    ["E-AUDIO-01", "E-AUDIO-02", "E-AUDIO-03", "E-AUDIO-04", "E-RESPIN-02"],
    ["F02", "F03", "F04", "F06", "F07", "F08", "E06", "U04", "H03"],
    ["SF-04", "SF-05", "SF-09", "SF-12"],
    "F02/F04/F07 → SF-04/SF-05 → B4 → U2",
  ),

  J5: t(
    { href: `${DS}Hengstler_634_635.pdf`, label: "Hengstler 634/635 (0.635.128)" },
    ["E-CNT-04", "E-CNT-03", "E-CNT-02"],
    ["F10", "H01", "H06", "H03"],
    ["SF-07"],
    "F10 → SF-07 → B5 → J5",
  ),
  C20: t({ href: LCSC("C15849"), label: "1 µF/50 V 0603 C15849" }, ["E-CNT-03", "E-BOM-PKG"], ["F10", "E02"], ["SF-07", "SF-11"], "F10 → SF-07 → B5 → C20"),
  R20: t(DS_R("C25803", "100 kΩ"), ["E-CNT-03", "E-R0603"], ["F10", "E02"], ["SF-07", "SF-11"], "F10 → SF-07 → B5 → R20"),
  R21: t(DS_R("C22775", "100 Ω"), ["E-CNT-03", "E-R0603"], ["F10"], ["SF-07"], "F10 → SF-07 → B5 → R21"),
  D23: t(DS_4148, ["E-CNT-03"], ["F10"], ["SF-07"], "F10 → SF-07 → B5 → D23"),
  Q7: t({ href: `${DS}AO3400.pdf`, label: "AO3400 (AOS)", extra: { href: LCSC("C20917"), label: "LCSC C20917" } }, ["E-CNT-03"], ["F10", "E02"], ["SF-07", "SF-11"], "F10 → SF-07 → B5 → Q7"),
  D10: t(DS_4148, ["E-CNT-03"], ["F10"], ["SF-07"], "F10 → SF-07 → B5 → D10"),

  J3: t(
    { href: `${DS}Phoenix_MPT_0.5_8_1725711.pdf`, label: "Phoenix MPT 0,5/8 (1725711)" },
    ["E-CONN-01"],
    ["F01", "F02", "E04", "H03"],
    ["SF-01", "SF-02"],
    "F01 → SF-01 → B6 → J3",
  ),
  J4: t(
    { href: `${DS}Phoenix_MPT_0.5_8_1725711.pdf`, label: "Phoenix MPT 0,5/8 (1725711)" },
    ["E-CONN-01"],
    ["F01", "H03"],
    ["SF-01"],
    "F01 → SF-01 → B6 → J4",
  ),

  J2: t(
    { href: `${DS}Phoenix_MPT_0.5_2_1725656.pdf`, label: "Phoenix MPT 0,5/2 (1725656)" },
    ["E-CONN-01", "E-SPK-01"],
    ["F05", "F09", "E06", "H03"],
    ["SF-12", "SF-04"],
    "F09/F05 → SF-12 → B7 → J2",
  ),
  TP5: t({ href: RTM_DOC, label: "H05 Testpunkte (RTM)" }, ["E-CONN-01"], ["H05", "F09"], ["SF-12"], "H05 → SF-12 → B7 → TP5"),

  J6: t(
    { href: `${DS}Phoenix_MPT_0.5_2_1725656.pdf`, label: "Phoenix MPT 0,5/2 (1725656)" },
    ["E-CONN-01", "E-RESPIN-01", "E-LED-01"],
    ["F11", "H03"],
    ["SF-08"],
    "F11 → SF-08 → B8 → J6",
  ),
  R12: t(DS_R("C22859", "10 Ω"), ["E-RESPIN-01", "E-LED-01", "E-R0603"], ["F11"], ["SF-08"], "F11 → SF-08 → B8 → R12 (F-04)"),
};

for (let n = 1; n <= 8; n++) {
  TRACE[`D${n}`] = t(
    DS_4148,
    ["E-LATCH-02"],
    ["F01", "E04"],
    ["SF-01", "SF-02"],
    `F01/E04 → SF-01/SF-02 → B6 → D${n}`,
  );
}
for (let io = 0; io <= 7; io++) {
  TRACE[`D${15 + io}`] = t(
    DS_4148,
    ["E-RESPIN-01"],
    ["F02", "F07", "U01"],
    ["SF-01", "SF-04"],
    `F-01 → SF-04 → B4 → D${15 + io} (IO${io})`,
  );
}

export function getTrace(ref) {
  return TRACE[ref] || null;
}

export function renderTraceHtml(ref) {
  const tr = getTrace(ref);
  if (!tr) {
    return `<p class="trace-missing">Keine RFP-Kette für ${ref} hinterlegt.</p>`;
  }
  const dsLinks = [tr.datasheet, tr.datasheet?.extra].filter(Boolean);
  const dsHtml = dsLinks
    .map((d) => `<a class="trace-chip ds" href="${d.href}" target="_blank" rel="noopener">${d.label}</a>`)
    .join(" ");
  const adrHtml = tr.adrs
    .map((a) => `<div class="trace-adr-item"><a class="trace-chip adr" href="${a.href}" target="_blank" rel="noopener">${a.id}</a> <span class="trace-hint">${a.title}</span>${a.why ? `<p class="trace-why">${a.why}</p>` : ""}</div>`)
    .join("");
  const reqHtml = tr.reqs
    .map((r) => `<a class="trace-chip req" href="${r.href}" target="_blank" rel="noopener">${r.id}</a> ${r.text}`)
    .join("<br>");
  const sfHtml = tr.sfs
    .map((s) => `<a class="trace-chip sf" href="${s.href}" target="_blank" rel="noopener">${s.id}</a> ${s.text}`)
    .join("<br>");
  return `<div class="trace-block">
    <h4>Datenblatt</h4>
    <div class="trace-links">${dsHtml || "—"}</div>
    <h4>Designentscheidung</h4>
    <div class="trace-adr">${adrHtml || "—"}</div>
    <h4>RFP-Kette</h4>
    <p class="rfp-chain"><a href="${tr.rtm}" target="_blank" rel="noopener">${tr.chain}</a></p>
    <div class="trace-rfp">
      <div><span class="label">Anforderungen</span>${reqHtml || "—"}</div>
      <div><span class="label">Funktionen</span>${sfHtml || "—"}</div>
    </div>
  </div>`;
}
