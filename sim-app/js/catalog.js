/**
 * Baugruppen + Bauteil-Metadaten: Kurztext, Detailtext, Spec-Check
 * Detail = Fachsatz (Bauteilbezeichnung) + kursive Alltagserklärung (<em>).
 */

/** Fachlich korrekt, danach kursive Alltagssprache (HTML). */
function explain(tech, easy) {
  return `${tech}\n\n<em>${easy}</em>`;
}

export const BLOCKS = {
  B1: {
    id: "B1",
    name: "Eingangsschutz",
    task:
      "B1 erzeugt aus J1 das Netz 12V_PROT: Q5 (SI2301) Verpolungsschutz, F1 (PTC 1 A/24 V) Strombegrenzung, D9 (SMAJ15A) TVS, C1 Puffer.",
    detail: explain(
      "B1 bildet 12V_PROT aus der 12‑V‑Batterie an J1: Q5 (SI2301, P‑MOSFET High‑Side) sperrt bei Verpolung, F1 (PTC 1 A/24 V) begrenzt Dauerüberstrom, D9 (SMAJ15A, VRWM 15 V) klemmt Transienten gegen GND, C1 (10 µF/25 V) puffert 12V_PROT.",
      "Die Batterie kommt hier an. Plus und Minus vertauscht? Dann bleibt die Platine tot, ohne zu verbrennen. Zu viel Strom oder kurze Spannungsspitzen werden abgefangen. 12V_PROT ist die abgesicherte 12‑Volt‑Leitung — auch im Schlaf der Box an.",
    ),
  },
  B2: {
    id: "B2",
    name: "Latch (Ein/Aus)",
    task:
      "B2 schaltet 12V_SW: SET über Q6/D1–D8, HOLD über R4, RELEASE über BUSY→R13/C4→Q3. Idle ohne Latch‑Ruhestrom.",
    detail: explain(
      "B2 ist ein Hardware‑Latch ohne MCU: Tastendruck (IOx→GND, D1–D8, BTN_OR) steuert Q6 (SI2301) → SET auf LATCH_SET → Q2 (2N7002) → Q1 (SI2301) schließt 12V_SW. HOLD: R4 von 12V_SW auf LATCH_SET. RELEASE: U2.BUSY High über R13/C4 (~470 ms) auf Q3.Gate, Q3 zieht LATCH_SET auf GND.",
      "Ein Tastendruck weckt die Box, die Vogelstimme hält sie wach, und wenn die Datei zu Ende ist, geht sie von selbst aus. Im Schlaf fließt hier praktisch kein Strom — deshalb hält die Batterie im Wald so lange.",
    ),
  },
  B3: {
    id: "B3",
    name: "Buck‑Wandler 12 V → 5 V",
    task:
      "U1 (TPS62163) wandelt 12V_SW in 5,0 V nur für U2. EN=12V_SW; der Hengstler hängt nicht an U1.",
    detail: explain(
      "U1 (TPS62163DSGR, fest 5,0 V, VIN/EN = 12V_SW) speist mit L1 (2,2 µH), C2 (10 µF/25 V VIN) und C3 (22 µF/10 V VOUT) ausschließlich das Netz 5 V für U2 (DY‑SV17F). Der Hengstler 0.635.128 liegt an 12V_SW + One‑Shot B5, nicht an 5 V.",
      "Das Soundmodul braucht 5 Volt, die Batterie liefert 12. Dieser Chip wandelt das sparsam um und läuft nur, wenn die Box wach ist. Der Besucherzähler bekommt seinen Impuls extra aus 12 Volt, nicht von hier.",
    ),
  },
  B4: {
    id: "B4",
    name: "Audio‑Wiedergabe",
    task:
      "U2 DY‑SV17F in I/O stand‑alone Mode 0 (CON1=GND, CON2=V33, CON3=R3→GND): IO0–IO7 triggern 00001–00008.mp3, BUSY steuert B2.",
    detail: explain(
      "U2 (DY‑SV17F) arbeitet in I/O stand‑alone Mode 0: CON1 (Pin 10)=GND, CON2 (Pin 11)=V33, CON3/BUSY (Pin 12) über R3 10 kΩ nach GND. Fallende Flanke an IO0–IO7 startet 00001.mp3–00008.mp3; BUSY ist Low während Play, High danach (Release über Q3). V5 (Pin 13) aus U1; SPK± (Pin 17/18) nach J2, BTL.",
      "Acht Taster, acht Vogelstimmen. Kurzer Druck reicht, der Ton spielt zu Ende. Ist die Datei fertig, sagt das Modul der Box Bescheid — dann geht alles wieder aus. Stimmen lädt man per USB wie auf einen Stick.",
    ),
  },
  B5: {
    id: "B5",
    name: "Impulszähler (One‑Shot)",
    task:
      "Rising‑Edge 12V_SW → C20/R20/R21/D23/Q7: ~80 ms Spulenimpuls auf Hengstler 0.635.128 (J5). Danach Spule aus.",
    detail: explain(
      "B5 erzeugt beim Rising‑Edge von 12V_SW einen One‑Shot: C20 (1 µF) koppelt auf CNT_PULSE, R20 (100 kΩ) nach GND setzt τ≈100 ms (effektiv ~80 ms), R21 (100 Ω) steuert Q7 (AO3400). Q7.Drain = CNT_LO = J5 Pin2 (Spule−); J5 Pin1 (Spule+) = 12V_SW. D10 Freilauf, D23 Clamp gegen −Vf am Gate‑Knoten.",
      "Jedes Aufwachen zählt +1, aber die Spule bekommt nur einen kurzen Stoß — nicht die ganze Stimme lang. Das spart Batterie. Danach stehen die Räder, bis der nächste Besucher kommt.",
    ),
  },
  B6: {
    id: "B6",
    name: "Taster‑Interface",
    task:
      "J3 = IO0–IO7, J4 = GND. D15–D22 Serie zu U2 (F‑01), D1–D8 Wired‑OR auf BTN_OR für Latch‑SET.",
    detail: explain(
      "J3 (MPT 0,5/8) führt IO0–IO7, J4 die Taster‑GND. Pro Kanal: D15–D22 (1N4148WS, A=IOx_M, K=IOx) trennen U2 vom 12‑V‑BTN_OR; D1–D8 (K=IOx, A=BTN_OR) OR‑verknüpfen den Active‑Low‑Tastendruck auf Q6.",
      "Ein Druck weckt die Box und wählt die Stimme. Die Dioden sind Einbahnstraßen: die acht Taster stören sich nicht gegenseitig, und 12 Volt aus der Einschaltlogik laufen nicht ins Soundmodul.",
    ),
  },
  B7: {
    id: "B7",
    name: "Lautsprecher",
    task:
      "J2 führt U2 SPK+ / SPK− (BTL). Keine Ader auf GND legen.",
    detail: explain(
      "U2 Pin 18 (SPK+) und Pin 17 (SPK−) liegen an J2 (MPT 0,5/2). Der Class‑D‑Ausgang ist BTL (Bridge‑Tied Load): beide Adern führen gegenphasiges Signal, keine darf mit GND verbunden werden. TP5 = SPK+.",
      "Beide Lautsprecherdrähte führen Ton — nicht nur einer plus Masse. Eine Seite aufs Gehäuse oder Batterie‑Minus zu legen kann den Verstärker zerstören.",
    ),
  },
  B8: {
    id: "B8",
    name: "Taster‑LEDs",
    task:
      "J6 speist die Taster‑LEDs aus 12V_SW über R12 (10 Ω) als 12V_LED — nur bei Latch‑ON.",
    detail: explain(
      "R12 (10 Ω) liegt zwischen 12V_SW und 12V_LED an J6 (MPT 0,5/2). Die LED‑Last ist nur aktiv, solange Q1 12V_SW führt; im Idle an 12V_PROT hängt sie nicht.",
      "Die Taster leuchten nur, während jemand zuhört — nicht heimlich im Schlaf. So bleibt die Batterie für echte Besuche übrig.",
    ),
  },
};

function diodeSeries(io) {
  const d = 15 + io;
  const file = String(io + 1).padStart(5, "0");
  return {
    block: "B4",
    kind: "D",
    role: `D${d} (1N4148WS) Serie IO${io}_M (U2) → IO${io} (J3), Anode Modul, Kathode Feld (F‑01).`,
    detail: explain(
      `D${d} (1N4148WS): Anode an IO${io}_M (U2 Pin ${io + 1}), Kathode an IO${io} (J3). Sperrt Rückspeisung von BTN_OR (12‑V‑Domain) in das DY‑SV17F; bei Tastendruck leitet sie (Vf ≈ 0,7 V) und erzeugt die fallende Flanke für ${file}.mp3.`,
      `Einbahnstraße zum Soundmodul: der Tastendruck kommt an, die 12‑Volt‑Einschaltlogik aber nicht umgekehrt in den Chip.`,
    ),
    limits: { Vmax: 75, Imax: 0.15 },
  };
}
function diodeOR(n) {
  return {
    block: "B6",
    kind: "D",
    role: `D${n} (1N4148WS): Kathode IO${n - 1}, Anode BTN_OR — Wired‑OR für Latch‑SET.`,
    detail: explain(
      `D${n} (1N4148WS): Kathode an IO${n - 1} (J3), Anode an BTN_OR. Active‑Low an IO${n - 1} zieht BTN_OR über Vf ≈ 0,7 V herunter und steuert Q6 (SET); parallel startet U2 ${String(n).padStart(5, "0")}.mp3. R9 hält BTN_OR idle auf 12V_PROT.`,
      `Sammelt nur diesen einen Taster auf den gemeinsamen „irgendwer hat gedrückt“‑Punkt. Ohne die Diode würden sich alle acht Tasterleitungen kurzschließen.`,
    ),
    limits: { Vmax: 75, Imax: 0.15 },
  };
}

/** true = Klemme/Stiftleiste oder Passiv → blau auf dem Board */
export function isBluePart(ref, kind) {
  if (!ref) return false;
  if (/^J\d/.test(ref) && ref !== "J5") return true;
  if (/^TP\d/.test(ref)) return true;
  if (/^H\d/.test(ref)) return true;
  if (kind === "R" || kind === "C" || kind === "L" || kind === "PTC") return true;
  if (/^R\d/.test(ref) || /^C\d/.test(ref) || /^L\d/.test(ref) || ref === "F1") return true;
  return false;
}

export const META = {
  R1: {
    block: "B2", kind: "R",
    role: "R1 100 kΩ Pull‑up Q1.Gate an 12V_PROT — VGS≈0 im Idle, Q1 sperrt.",
    detail: explain(
      "R1 (100 kΩ) verbindet Gate und Source‑Potenzial von Q1 (SI2301) über 12V_PROT, sodass VGS ≈ 0 V bleibt, bis Q2 über R8 das Gate nach GND zieht (D12 klemmt |VGS| auf ~6,2 V).",
      "Hält den großen Ein‑Schalter im Schlaf eindeutig aus, damit die Batterie nicht heimlich entladen wird.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R2: {
    block: "B2", kind: "R",
    role: "R2 100 kΩ Pull‑down LATCH_SET / Q2.Gate nach GND; Teiler mit R4.",
    detail: explain(
      "R2 (100 kΩ) liegt von LATCH_SET (Gate Q2, 2N7002) nach GND. Mit R4 (10 kΩ von 12V_SW) bildet er den HOLD‑Teiler über der Schwellspannung von Q2; ohne SET/HOLD ist LATCH_SET = 0 V.",
      "Ohne Tastendruck und ohne Selbsthaltung liegt die Ein‑Leitung fest auf 0 Volt — die Box bleibt aus.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R3: {
    block: "B2", kind: "R",
    role: "R3 10 kΩ CON3/BUSY (U2 Pin 12) nach GND: Mode 0 beim Boot, danach BUSY‑Pulldown.",
    detail: explain(
      "R3 (10 kΩ) zieht U2 Pin 12 (CON3/BUSY) nach GND. In den ersten ~30 ms nach V5‑Power liest das DY‑SV17F CON3=0 (zusammen mit CON1=0, CON2=1 → I/O stand‑alone Mode 0). Danach ist Pin 12 BUSY‑Ausgang; R3 bleibt als definierter Pulldown.",
      "Sagt dem Soundmodul: acht einzelne Taster, nicht Seriellbetrieb. Danach darf derselbe Pin „Stück läuft / Stück fertig“ melden.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R4: {
    block: "B2", kind: "R",
    role: "R4 10 kΩ HOLD: 12V_SW → LATCH_SET, Selbsthaltung nach SET.",
    detail: explain(
      "R4 (10 kΩ) speist LATCH_SET aus 12V_SW, sobald Q1 leitet. Der Teiler R4/R2 hält Q2 oberhalb Vth; Q3 kann LATCH_SET hart auf GND ziehen und HOLD überwinden (Release).",
      "Sobald die Box wach ist, hält sie sich selbst an — auch nach Loslassen der Taste — bis die Stimme zu Ende ist.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R5: {
    block: "B3", kind: "R",
    role: "R5 0 Ω: VOS von U1 (TPS62163) direkt an 5 V / C3 (F‑02).",
    detail: explain(
      "R5 ist ein 0‑Ω‑Jumper von U1‑Pin VOS auf die 5‑V‑Schiene an C3. Die Festspannungsvariante TPS62163 verlangt VOS kurz und ohne Vorwiderstand am VOUT (TI F‑02).",
      "Eine durchgängige Brücke, kein richtiger Widerstand: der Wandler misst seine 5 Volt direkt am Ausgang, wie der Hersteller es vorschreibt.",
    ),
    limits: { Vmax: 50, Imax: 0.5, Pmax: 0.063 },
  },
  R12: {
    block: "B8", kind: "R",
    role: "R12 10 Ω zwischen 12V_SW und 12V_LED (J6), Strombegrenzung Taster‑LEDs (F‑04).",
    detail: explain(
      "R12 (10 Ω) liegt in Serie 12V_SW → 12V_LED (J6). Er begrenzt den Sammelstrom der acht Taster‑LEDs bei Latch‑ON; zusätzliche Vorwiderstände können in der externen Verkabelung liegen.",
      "Bremst den Strom zu den Taster‑Lämpchen, damit sie leuchten ohne durchzubrennen — und nur, solange die Box wach ist.",
    ),
    limits: { Vmax: 50, Imax: 1.0, Pmax: 0.125 },
  },
  R13: {
    block: "B2", kind: "R",
    role: "R13 100 kΩ BUSY → Q3_GATE; mit C4 RC‑Blanking τ≈470 ms (F‑03).",
    detail: explain(
      "R13 (100 kΩ) verbindet U2.BUSY mit Q3_GATE. C4 (4,7 µF) nach GND ergibt τ = R13·C4 ≈ 470 ms: Q3 (2N7002) leitet erst, wenn BUSY dauerhaft High ist — kein Release beim Kaltstart‑BUSY‑Spike.",
      "Verzögert das Ausschalten um knapp eine halbe Sekunde. Sonst könnte die Box direkt nach dem Aufwachen wieder zuklappen, bevor der Ton startet.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R6: {
    block: "B1", kind: "R",
    role: "R6 470 kΩ Gate‑Pfad Q5 nach GND; Idle ≈12 µA (E‑RPP‑01).",
    detail: explain(
      "R6 (470 kΩ) schließt den Gate‑Zweig von Q5 (SI2301) über D11 (BZX84 6,2 V) nach GND. Bei korrekter Polung entsteht VGS ≈ −6,2 V (Clamp), I_idle ≈ 12 V/470 kΩ ≈ 25 µA‑Pfad, dominant der Box‑Idle (E‑RPP‑01, nicht 10 kΩ).",
      "Schaltet den Verpolungsschutz bei richtiger Batterie ein. Der große Wert sorgt dafür, dass im Schlaf nur ein winziger Strom fließt — das hält die Batterie über Monate.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R7: {
    block: "B1", kind: "R",
    role: "R7 4,7 kΩ Serie im Gate von Q5, begrenzt D11‑Zenerstrom.",
    detail: explain(
      "R7 (4,7 kΩ) liegt im Gate‑Zweig von Q5 vor D11 (BZX84C6V2). Beim Anlegen von BAT+ begrenzt er den Clamp‑Strom der Zener; zusammen mit R6 bildet er das Gate‑Netzwerk des Verpolungs‑FETs.",
      "Bremst den Strom in die Schutzdiode, wenn die Batterie gerade angeschlossen wird — damit nichts knallt.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R8: {
    block: "B2", kind: "R",
    role: "R8 4,7 kΩ Serie Q2.Drain → Q1.Gate, begrenzt D12‑Clampstrom.",
    detail: explain(
      "R8 (4,7 kΩ) liegt zwischen Drain von Q2 (2N7002) und Gate von Q1 (SI2301). D12 (6,2 V) klemmt |VGS| von Q1; R8 begrenzt den Clamp‑ und Pulsstrom.",
      "Höfliche Bremse, wenn der Latch den großen Ein‑Schalter anzieht, und die Schutzdiode greift.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R9: {
    block: "B2", kind: "R",
    role: "R9 10 kΩ Pull‑up BTN_OR an 12V_PROT — Q6 idle VGS≈0.",
    detail: explain(
      "R9 (10 kΩ) zieht BTN_OR (Anoden D1–D8) auf 12V_PROT. Dann ist VGS von Q6 ≈ 0 V, Q6 sperrt, SET‑Pfad Idle ≈ 0 A. Tastendruck: IOx=0 → Diode leitet → BTN_OR ≈ 0,7 V, I(R9)≈1 mA nur während des Drucks.",
      "Hält den Punkt „irgendeine Taste“ im Schlaf auf 12 Volt, damit die Box nicht von selbst aufwacht.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R10: {
    block: "B2", kind: "R",
    role: "R10 1 kΩ Serie SET_DRV → LATCH_SET, begrenzt SET/Release‑Konflikt über D13/Q3.",
    detail: explain(
      "R10 (1 kΩ) liegt im SET‑Pfad (Q6.Drain / D13) nach LATCH_SET. Falls SET und Q3‑Release kurz überlappen, begrenzt R10 den Querstrom gegen GND.",
      "Falls Einschalten und Ausschalten sich kurz in die Quere kommen, fließt nur ein begrenzter Strom — nichts verbrennt.",
    ),
    limits: { Vmax: 50, Imax: 0.1, Pmax: 0.063 },
  },
  R11: {
    block: "B2", kind: "R",
    role: "R11 4,7 kΩ Serie BTN_OR → Q6.Gate, begrenzt D14‑Zenerstrom.",
    detail: explain(
      "R11 (4,7 kΩ) liegt zwischen BTN_OR und Gate von Q6 (SI2301). D14 (BZX84 6,2 V) klemmt |VGS| von Q6 auf ~6,2 V; R11 begrenzt den Zenerstrom analog R7 an Q5.",
      "Bremst den Strom in die Schutzdiode am Kaltstart‑Schalter, sobald jemand eine Taste drückt.",
    ),
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },

  C1: {
    block: "B1", kind: "C",
    role: "C1 10 µF/25 V Puffer an 12V_PROT.",
    detail: explain(
      "C1 (10 µF/25 V) liegt an 12V_PROT gegen GND. Er liefert lokale Ladung bei Lastsprüngen und TVS‑Ereignissen und hält die geschützte Eingangsschiene induktivitätsarm.",
      "Kleiner Zwischenspeicher an der Batterieseite: fängt kurze Stromstöße ab, damit die Spannung nicht einbricht.",
    ),
    limits: { Vmax: 25, Imax: 2 },
  },
  C2: {
    block: "B3", kind: "C",
    role: "C2 10 µF/25 V VIN‑Kondensator U1 (TPS62163).",
    detail: explain(
      "C2 (10 µF/25 V X7R) sitzt an VIN/GND von U1. Der synchrone Buck zieht impulsartigen Eingangsstrom; C2 begrenzt VIN‑Einbrüche an den Schaltkanten.",
      "Puffer direkt am 5‑Volt‑Chip, damit das schnelle Schalten die 12‑Volt‑Seite nicht durcheinanderbringt.",
    ),
    limits: { Vmax: 25, Imax: 2 },
  },
  C3: {
    block: "B3", kind: "C",
    role: "C3 22 µF/10 V VOUT/COUT der 5‑V‑Schiene (U2).",
    detail: explain(
      "C3 (22 µF/10 V) liegt an 5 V gegen GND, nah an VOS/R5. Er glättet die Buck‑Welligkeit für U2; der Hengstler hängt nicht an diesem Netz.",
      "Glättet die 5 Volt für das Soundmodul, damit der Verstärker sauber versorgt ist und nicht brummt.",
    ),
    limits: { Vmax: 10, Imax: 2 },
  },
  C4: {
    block: "B2", kind: "C",
    role: "C4 4,7 µF/16 V Q3_GATE→GND, RC mit R13 ≈470 ms (F‑03).",
    detail: explain(
      "C4 (4,7 µF/16 V) liegt von Q3_GATE nach GND. Mit R13 (100 kΩ) von BUSY ergibt sich Blanking ~470 ms, bevor Q3 LATCH_SET auf GND zieht.",
      "Zeitglied: wartet knapp eine halbe Sekunde, bevor „Stück zu Ende“ wirklich die Box ausschaltet — sonst stirbt der erste Tastendruck am Start.",
    ),
    limits: { Vmax: 16, Imax: 0.05 },
  },
  L1: {
    block: "B3", kind: "L",
    role: "L1 2,2 µH Buck‑Induktivität U1, Isat ≈1,76 A.",
    detail: explain(
      "L1 (2,2 µH, TDK, Isat ≈1,76 A) liegt zwischen SW von U1 (TPS62163) und 5 V/C3. Sie speichert Energie in der Ton‑Phase und gibt sie in der Freilaufphase an VOUT ab.",
      "Die Spule im Wandler: speichert Energie kurz im Magnetfeld und gibt sie als 5 Volt wieder ab — so geht wenig als Wärme verloren.",
    ),
    limits: { Vmax: 20, Imax: 1.76 },
  },

  D1: diodeOR(1), D2: diodeOR(2), D3: diodeOR(3), D4: diodeOR(4),
  D5: diodeOR(5), D6: diodeOR(6), D7: diodeOR(7), D8: diodeOR(8),
  D15: diodeSeries(0), D16: diodeSeries(1), D17: diodeSeries(2), D18: diodeSeries(3),
  D19: diodeSeries(4), D20: diodeSeries(5), D21: diodeSeries(6), D22: diodeSeries(7),

  D10: {
    block: "B5", kind: "D",
    role: "D10 Freilauf: K=12V_SW, A=CNT_LO parallel zur Hengstler‑Spule.",
    detail: explain(
      "D10 (1N4148WS): Kathode an 12V_SW, Anode an CNT_LO (J5 Pin2). Nach dem One‑Shot sperrt Q7; die Spuleninduktivität kommutiert über D10, statt VDS an Q7 aufzublasen.",
      "Wenn der Zählimpuls endet, will die Spule den Strom fortsetzen. Diese Diode lässt ihn harmlos auslaufen — sonst gäbe es einen Spannungsstoß.",
    ),
    limits: { Vmax: 75, Imax: 0.15 },
  },
  D23: {
    block: "B5", kind: "D",
    role: "D23 Clamp: A=GND, K=CNT_PULSE — unterdrückt −V nach Falling‑Edge 12V_SW über C20.",
    detail: explain(
      "D23 (1N4148WS): Anode GND, Kathode CNT_PULSE. Beim Falling‑Edge von 12V_SW würde C20 (1 µF) CNT_PULSE unter GND ziehen; D23 hält den Knoten ≥ −Vf und schützt Q7.Gate.",
      "Verhindert, dass beim Ausschalten der Box am Impulsknoten eine negative Spannung entsteht — Schutz für den Spulenschalter.",
    ),
    limits: { Vmax: 75, Imax: 0.15 },
  },
  C20: {
    block: "B5", kind: "C",
    role: "C20 1 µF Kopplung 12V_SW → CNT_PULSE (One‑Shot‑Kern).",
    detail: explain(
      "C20 (1 µF) liegt zwischen 12V_SW und CNT_PULSE. DC von 12V_SW kommt nicht durch; nur dV/dt (Latch‑ON) erzeugt den Puls, den R20 nach GND entlädt (τ≈R20·C20).",
      "Lässt nur den Moment des Einschaltens durch. Daraus wird der kurze Zählimpuls — nicht die ganze Stimme lang 12 Volt auf der Spule.",
    ),
    limits: { Vmax: 25 },
  },
  R20: {
    block: "B5", kind: "R",
    role: "R20 100 kΩ CNT_PULSE→GND, legt One‑Shot‑Breite und Idle‑0 V am Gate‑Netz fest.",
    detail: explain(
      "R20 (100 kΩ) entlädt CNT_PULSE nach GND. Mit C20 1 µF folgt τ≈100 ms (effektiv ~80 ms Gate‑High an Q7). Ohne R20 bliebe C20 geladen, Q7 leitend, Spule dauerbestromt.",
      "Bestimmt, wie lange der Zählimpuls dauert, und zieht die Steuerleitung danach wieder auf 0 Volt.",
    ),
    limits: { Vmax: 50, Pmax: 0.1 },
  },
  R21: {
    block: "B5", kind: "R",
    role: "R21 100 Ω Serie CNT_PULSE → Q7.Gate.",
    detail: explain(
      "R21 (100 Ω) liegt zwischen CNT_PULSE und Gate von Q7 (AO3400). Er begrenzt Ig‑Spitzen und dämpft Ringing gegen Ciss.",
      "Kleine Bremse vor dem Spulenschalter, damit der Impuls nicht zu hart am Steueranschluss ankommt.",
    ),
    limits: { Vmax: 50, Pmax: 0.1 },
  },
  Q7: {
    block: "B5", kind: "NFET",
    role: "Q7 AO3400 Low‑Side: Drain CNT_LO (J5−), Source GND, nur ~80 ms leitend.",
    detail: explain(
      "Q7 (AO3400, N‑MOSFET): Drain = CNT_LO = Hengstler Spule− (J5 Pad2), Source = GND, Gate über R21 an CNT_PULSE. Spule+ (J5 Pad1) = 12V_SW. Leitend nur während des One‑Shots; Idle und Rest der Session: sperrt.",
      "Elektronischer Schalter unter der Zählerspule: nur für den kurzen Stoß zu, sonst offen. Jedes Aufwachen = ein Zählschritt.",
    ),
    limits: { VdsMax: 30, VgsMax: 12, Imax: 5 },
  },
  D13: {
    block: "B2", kind: "D",
    role: "D13 Steering: SET_DRV → LATCH_SET, blockt Rückwirkung von Q3.",
    detail: explain(
      "D13 (1N4148WS) liegt in Durchlassrichtung von SET_PULSE/SET_DRV nach LATCH_SET. SET darf LATCH_SET hochziehen; Q3‑Release speist nicht unkontrolliert in Q6.Drain zurück.",
      "Einbahnstraße vom Tastendruck‑Impuls zur Ein‑Leitung: einschalten ja, Rückwärtswirkung vom Ausschalter nein.",
    ),
    limits: { Vmax: 75, Imax: 0.15 },
  },

  D11: {
    block: "B1", kind: "Z",
    role: "D11 BZX84 6,2 V VGS‑Clamp Q5 (SI2301 |VGS|max ±8 V).",
    detail: explain(
      "D11 (BZX84C6V2): Kathode an Q5.Source (BAT+/12V‑Pfad), Anode an Q5.Gate. Begrenzt |VGS| auf ≈6,2 V unter dem Absolutmaximum ±8 V des SI2301, während RDS(on)‑Pfad weiter 12 V führt.",
      "Die Batterie hat 12 Volt, der Transistor darf an der Steuerung nur etwa 8. Diese Diode hält die Differenz bei 6,2 Volt fest — sonst stirbt der Chip.",
    ),
    limits: { Vz: 6.2, VgsMax: 8, Imax: 0.05, Pmax: 0.35 },
  },
  D12: {
    block: "B2", kind: "Z",
    role: "D12 BZX84 6,2 V VGS‑Clamp Q1, analog D11.",
    detail: explain(
      "D12 (BZX84C6V2): Kathode 12V_PROT (Q1.Source), Anode Q1.Gate. Wenn Q2 über R8 das Gate nach GND zieht, klemmt D12 |VGS| auf ~6,2 V.",
      "Dieselbe Schutzklemme wie am Batterieeingang, aber am großen Ein‑Schalter der Box.",
    ),
    limits: { Vz: 6.2, VgsMax: 8, Imax: 0.05, Pmax: 0.35 },
  },
  D14: {
    block: "B2", kind: "Z",
    role: "D14 BZX84 6,2 V VGS‑Clamp Q6 (Kaltstart‑SET).",
    detail: explain(
      "D14 (BZX84C6V2) klemmt |VGS| von Q6 (SI2301) auf ~6,2 V, wenn BTN_OR low geht. Idle: VGS≈0, Zener nur Leckage.",
      "Schutz am Kaltstart‑Schalter, damit ein Tastendruck den Chip nicht überlastet.",
    ),
    limits: { Vz: 6.2, VgsMax: 8, Imax: 0.05, Pmax: 0.35 },
  },
  D9: {
    block: "B1", kind: "TVS",
    role: "D9 SMAJ15A an 12V_PROT gegen GND, VRWM 15 V.",
    detail: explain(
      "D9 (SMAJ15A): VRWM 15 V, VBR ≈16,7 V, an 12V_PROT gegen GND. Klemmt µs‑Transienten (Kabel, Lastabwurf) im Ampere‑Bereich; Normalbetrieb nur Leckstrom ≪ R6‑Idle.",
      "Blitzableiter für die Platine: kurze Überspannungen gehen nach Masse, nicht in Latch und Wandler. Kein Ersatz für dauerhaft falsche Speisespannung.",
    ),
    limits: { Vmax: 15, Vbr: 16.7, Imax: 16.4, Pmax: 400 },
  },

  Q5: {
    block: "B1", kind: "PFET",
    role: "Q5 SI2301 High‑Side‑Verpolungsschutz, VDS 20 V, VGS ±8 V, D11‑Clamp.",
    detail: explain(
      "Q5 (SI2301CDS, P‑MOSFET): Source BAT+, Drain → F1 → 12V_PROT. Bei korrekter Polarität VGS ≈ −6,2 V (D11), RDS(on) typ. ~90 mΩ. Verpolung: Body‑Diode/Gate sperren den Pfad.",
      "Elektronisches Ventil am Batterieplus: richtig herum fast verlustfrei durch, Plus/Minus vertauscht zu. Besser als eine Diode, die ständig Spannung verschenkt.",
    ),
    limits: { VdsMax: 20, VgsMax: 8, Imax: 3.1 },
  },
  Q1: {
    block: "B2", kind: "PFET",
    role: "Q1 SI2301 Lastschalter 12V_PROT → 12V_SW (Buck, B5, LEDs, HOLD).",
    detail: explain(
      "Q1 (SI2301): Source 12V_PROT, Drain 12V_SW. Ein: speist U1, One‑Shot/J5, R12/J6, R4. Aus: diese Netze floating, Laststrom 0. Ansteuerung Q2/R8/D12/R1.",
      "Der große Ein‑Schalter der Box. An = alles Wichtige bekommt Strom. Aus = Sound, Zähler und Lämpchen hängen in der Luft — Schlaf der Batterie.",
    ),
    limits: { VdsMax: 20, VgsMax: 8, Imax: 3.1 },
  },
  Q6: {
    block: "B2", kind: "PFET",
    role: "Q6 SI2301 Kaltstart‑SET aus BTN_OR, idle VGS≈0 (E‑LATCH‑02).",
    detail: explain(
      "Q6 (SI2301): Source 12V_PROT, Drain SET_DRV (über R10/D13 auf LATCH_SET). Gate über R11/D14 an BTN_OR. Idle BTN_OR=12V_PROT → VGS≈0 → kein SET‑Ruhestrom. Taste: BTN_OR low → Q6 leitet, Latch setzt, auch ohne 5 V.",
      "Weckt die Box aus dem Tastendruck, noch bevor 5 Volt und Soundmodul existieren. Im Schlaf verbraucht er nichts.",
    ),
    limits: { VdsMax: 20, VgsMax: 8, Imax: 3.1 },
  },
  Q2: {
    block: "B2", kind: "NFET",
    role: "Q2 2N7002: LATCH_SET High → zieht Q1.Gate über R8 nach GND.",
    detail: explain(
      "Q2 (2N7002): Gate LATCH_SET, Source GND, Drain über R8/D12 an Q1.Gate. Vth typ. 1–2,5 V; HOLD‑Teiler und SET liegen darüber. Schaltet nur Gate‑Strom, nicht die Last.",
      "Kleines Zwischenhirn: wenn die Ein‑Leitung „an“ sagt, zieht es den großen Schalter Q1 auf Ein.",
    ),
    limits: { VdsMax: 60, VgsMax: 20, Imax: 0.115 },
  },
  Q3: {
    block: "B2", kind: "NFET",
    role: "Q3 2N7002 Release: Q3_GATE (BUSY über R13/C4) High → LATCH_SET = GND.",
    detail: explain(
      "Q3 (2N7002): Gate = Q3_GATE (BUSY→R13, C4 nach GND), Drain = LATCH_SET, Source = GND. Play: BUSY Low, Q3 aus. Track‑Ende: BUSY High, nach ~470 ms leitet Q3, Latch fällt, 12V_SW = 0.",
      "Schaltet die Box aus, wenn das Soundmodul „fertig“ gemeldet hat — verzögert, damit der Start nicht als Fertig zählt.",
    ),
    limits: { VdsMax: 60, VgsMax: 20, Imax: 0.115 },
  },

  F1: {
    block: "B1", kind: "PTC",
    role: "F1 PTC 1 A/24 V in Serie BAT+ nach Q5/12V_PROT.",
    detail: explain(
      "F1 (PTC, 1 A Hold, 24 V): niederohmig im Normalbetrieb (~0,15 Ω modellhaft), R steigt bei Überstrom thermisch. Nach Abkühlung rückstellend — nicht die 6‑V‑Variante.",
      "Sicherung, die sich nach einem Fehler wieder erholt. Zu viel Strom: sie wird hochohmig. Abgekühlt: sie leitet wieder — praktisch im Wald, wo niemand eine Schmelzsicherung tauschen kann.",
    ),
    limits: { Vmax: 24, Imax: 1.0 },
  },
  U1: {
    block: "B3", kind: "IC",
    role: "U1 TPS62163: 3–17 V IN, fest 5,0 V / 1 A OUT, EN=12V_SW, nur U2.",
    detail: explain(
      "U1 (TPS62163DSGR): VIN/EN = 12V_SW, SW→L1→5 V, VOS über R5=0 Ω an C3, FB intern (Fixed‑5V). Speist ausschließlich U2. Hengstler nicht an 5 V (kein Soft‑Start‑Race mit Typ 0.635.132).",
      "Der 5‑Volt‑Chip. Läuft nur bei wacher Box und versorgt nur das Soundmodul. Der Besucherzähler hängt bewusst nicht hier.",
    ),
    limits: { VinMax: 17, VinMin: 3, IoutMax: 1.0, Vout: 5 },
  },
  U2: {
    block: "B4", kind: "MOD",
    role: "U2 DY‑SV17F: Mode 0, IO0–IO7, BUSY Pin 12, V5 Pin 13, SPK± Pin 17/18.",
    detail: explain(
      "U2 (DY‑SV17F): V5 = 5 V (U1), GND Pin 9, CON1 Pin 10 = GND, CON2 Pin 11 = V33 Pin 14, CON3/BUSY Pin 12 über R3. IO0–IO7 = Pin 1–8 über D15–D22. Idle ≈14 mA, Play ≤60 mA + SPK. Latch aus: Modul stromlos. USB nicht parallel zu V5 nutzen (Backfeed).",
      "Das Soundmodul: acht Taster, acht Dateien, Lautsprecher dran. Fertig‑Meldung schaltet die Box aus. Stimmen per USB laden, während die Batterie die 5 Volt nicht gleichzeitig speist.",
    ),
    limits: { Vmax: 5.5, Iidle: 0.014, Iwork: 0.06, Iv33max: 0.08 },
  },
  J5: {
    block: "B5", kind: "CNT",
    role: "J5 Hengstler 0.635.128: Pad1 = 12V_SW, Pad2 = CNT_LO (Q7), 12 V / 1860 Ω, ~80 ms.",
    detail: explain(
      "J5 (Hengstler 0.635.128, Typ 635.1): 6 Stellen, 12 V, Rcoil 1860 Ω ≈80 mW, Footprint 15,24×25,4 mm. Pad1 (+) = 12V_SW, Pad2 (−) = CNT_LO = Q7.Drain. One‑Shot ~80 ms, danach Icoil=0. Nicht 0.635.132 (5 V).",
      "Mechanisches Zählwerk mit sechs Rädern. Jeder Besuch = +1, aber die Spule zieht nur einen kurzen Moment Strom. Von oben ablesbar.",
    ),
    limits: { Vnom: 12, Vtol: [10.2, 13.2], Ityp: 0.0065, Ptyp: 0.08, pulse_s: 0.08 },
  },

  J1: {
    block: "B1", kind: "CONN",
    role: "J1 Phoenix MPT 0,5/2: BAT+ / GND vor Q5.",
    detail: explain(
      "J1 (Phoenix MPT 0,5/2‑2,54): Pin1 = BAT+ → Q5.Source, Pin2 = GND. Nennstrom der Klemme 6 A, elektrisch direkt vor dem Verpolungsschutz B1.",
      "Schraubklemme für die 12‑Volt‑Batterie. Polarität beachten — genau dafür existiert der Eingangsschutz.",
    ),
    limits: { Vmax: 16, Imax: 2 },
  },
  J2: {
    block: "B7", kind: "CONN",
    role: "J2 MPT 0,5/2: SPK+ / SPK− (BTL), nicht mit GND verbinden.",
    detail: explain(
      "J2 (Phoenix MPT 0,5/2): Pin1 = SPK+ (U2 Pin 18), Pin2 = SPK− (U2 Pin 17). BTL‑Ausgang; eine Ader auf GND ist ein Class‑D‑Kurzschluss.",
      "Lautsprecherklemme. Beide Adern führen Signal — keine davon an Gehäuse oder Batterie‑Minus legen.",
    ),
    limits: { Vmax: 5, Imax: 1 },
  },
  J3: {
    block: "B6", kind: "CONN",
    role: "J3 MPT 0,5/8: IO0–IO7 zu U2 (über D15–D22) und D1–D8.",
    detail: explain(
      "J3 (Phoenix MPT 0,5/8): acht Signale IO0–IO7. Jedes Netz liegt an D15–D22.Kathode (Feldseite) und D1–D8.Kathode sowie am Taster gegen J4/GND. Active‑Low, Datei 00001–00008.",
      "Acht Schrauben für die acht Taster‑Signale. Jede Klemme ist eine Stimme; die andere Tasterader kommt nach J4 (Minus).",
    ),
    limits: { Vmax: 5, Imax: 0.05 },
  },
  J4: {
    block: "B6", kind: "CONN",
    role: "J4 MPT 0,5/8: Taster‑GND, nicht SPK−.",
    detail: explain(
      "J4 (Phoenix MPT 0,5/8) bündelt die acht Taster‑Rückleiter auf GND. Die Taster schließen IOx (J3) nach J4. Nicht identisch mit J2 SPK−.",
      "Acht Schrauben für die Minus‑Adern der Taster. Der Lautsprecher hat eine eigene Klemme (J2).",
    ),
    limits: { Vmax: 5, Imax: 0.05 },
  },
  J6: {
    block: "B8", kind: "CONN",
    role: "J6 MPT 0,5/2: 12V_LED (über R12) und GND, nur Latch‑ON.",
    detail: explain(
      "J6 (Phoenix MPT 0,5/2): 12V_LED aus 12V_SW über R12 (10 Ω) plus GND. LED‑Strom nur bei Q1 ein; Idle an J6 = 0 V.",
      "Zwei Schrauben für die Taster‑Beleuchtung. Lampen an nur während der Stimme, nicht im Schlaf.",
    ),
    limits: { Vmax: 16, Imax: 0.5 },
  },
  TP1: {
    block: "B1", kind: "TP",
    role: "TP1 = 12V_PROT (nach Q5/F1, vor Q1).",
    detail: explain(
      "TP1 liegt auf 12V_PROT. Soll bei korrekter Batterie ≈ BAT+, auch im Idle. 0 V: Verpolung (Q5 sperrt), offene Klemme oder leere Batterie. Bezug TP3. Nicht 12V_SW.",
      "Messpunkt nach dem Batterieschutz. Hier liegen immer 12 Volt, sobald die Batterie richtig hängt — auch wenn niemand den Kasten benutzt.",
    ),
    limits: { Vmax: 16 },
  },
  TP2: {
    block: "B3", kind: "TP",
    role: "TP2 = 5 V (U1 VOUT), nur Latch‑ON.",
    detail: explain(
      "TP2 liegt am Netz 5 V (C3/U1). Latch aus: 0 V. Latch ein: ≈5,0 V für U2. Zählerstrom nicht hier, sondern an CNT_LO/J5 messen.",
      "Messpunkt 5 Volt. Nur bei wacher Box Spannung — so sieht man, ob Ein‑ und Ausschalten klappt.",
    ),
    limits: { Vmax: 6 },
  },
  TP3: {
    block: "B1", kind: "TP",
    role: "TP3 = GND, Bezug aller Spannungen; nicht SPK−.",
    detail: explain(
      "TP3 ist Geräte‑GND. Schwarze Messleitung hier, rot an TP1/TP2/TP4. SPK− (J2/U2 Pin 17) ist BTL‑Signal, kein GND.",
      "Messpunkt Geräte‑Minus. Nicht mit der Lautsprecherader verwechseln — die führt Ton, nicht ruhiges Minus.",
    ),
    limits: { Vmax: 0.1 },
  },
  TP4: {
    block: "B2", kind: "TP",
    role: "TP4 = BUSY (U2 Pin 12): Play Low, Ende High ≈3,3 V.",
    detail: explain(
      "TP4 liegt auf BUSY (U2 Pin 12). Play: 0 V → Q3 aus. Idle powered / Track‑Ende: ≈3,3 V → über R13/C4 Release. Latch aus: TP4 tot (kein V5).",
      "Zeigt, ob das Modul noch spielt oder fertig ist. Box bleibt an, obwohl die Stimme endete? Hier zuerst messen.",
    ),
    limits: { Vmax: 5 },
  },
  TP5: {
    block: "B7", kind: "TP",
    role: "TP5 = SPK+, Diagnose, kein DC‑Kurzschluss gegen TP3 im Betrieb.",
    detail: explain(
      "TP5 liegt auf SPK+ (U2 Pin 18 / J2.1). Nur oszilloskopisch; Durchgangsmessung TP5–TP3 während Play ist ein BTL‑Kurzschluss.",
      "Messpunkt Lautsprecher‑Plus. Nicht mit dem Multimeter gegen Masse kurzschließen, während die Box spielt.",
    ),
    limits: { Vmax: 5 },
  },
};

export function fmtLimitI(a) {
  if (a == null) return "—";
  if (a < 1e-3) return `${(a * 1e6).toFixed(0)} µA`;
  if (a < 1) return `${(a * 1e3).toFixed(0)} mA`;
  return `${a.toFixed(2)} A`;
}

export function fmtLimitV(v) {
  if (v == null) return "—";
  return `${v} V`;
}

/**
 * Spec-Check anhand Sim-Werten
 */
export function checkCompliance(ref, reading, nets, extras = {}) {
  const m = META[ref];
  if (!m?.limits) return { ok: true, checks: [] };
  const L = m.limits;
  const checks = [];
  const V = Math.abs(reading?.V ?? 0);
  const I = Math.abs(reading?.I ?? 0);
  const P = Math.abs(reading?.P ?? 0);

  const push = (name, limit, actual, ok) => {
    checks.push({ name, limit, actual, ok });
  };

  if (L.Vmax != null && m.kind !== "Z" && m.kind !== "TVS") {
    push("|U|", `≤ ${fmtLimitV(L.Vmax)}`, `${V.toFixed(2)} V`, V <= L.Vmax + 0.05);
  }
  if (L.VdsMax != null) {
    push("|VDS|", `≤ ${fmtLimitV(L.VdsMax)}`, `${V.toFixed(2)} V`, V <= L.VdsMax + 0.05);
  }
  if (L.VgsMax != null && extras.Vgs != null) {
    push("|VGS|", `≤ ${fmtLimitV(L.VgsMax)}`, `${Math.abs(extras.Vgs).toFixed(2)} V`, Math.abs(extras.Vgs) <= L.VgsMax + 0.05);
  }
  if (L.Imax != null) {
    push("|I|", `≤ ${fmtLimitI(L.Imax)}`, fmtLimitI(I), I <= L.Imax * 1.01);
  }
  if (L.Pmax != null && L.Pmax < 10) {
    push("P", `≤ ${(L.Pmax * 1e3).toFixed(0)} mW`, `${(P * 1e3).toFixed(3)} mW`, P <= L.Pmax * 1.05);
  }
  if (L.VinMax != null && nets) {
    const vin = nets["12V_SW"] || 0;
    push("VIN", `${L.VinMin ?? 0}…${L.VinMax} V`, `${vin.toFixed(2)} V`, vin === 0 || (vin >= (L.VinMin ?? 0) - 0.1 && vin <= L.VinMax + 0.1));
  }
  if (L.Vout != null && nets) {
    const v5 = nets["5V"] || 0;
    push("VOUT", `≈ ${L.Vout} V`, `${v5.toFixed(2)} V`, v5 === 0 || Math.abs(v5 - L.Vout) < 0.25);
  }
  if (L.Iwork != null && reading?.state === "PLAY") {
    push("I Modul (Spec)", `≤ ${fmtLimitI(L.Iwork)} (+ SPK extra)`, fmtLimitI(I), I <= L.Iwork * 1.15);
  }
  if (L.Iidle != null && reading?.state === "Idle powered") {
    push("I Idle (Messung)", `≈ ${fmtLimitI(L.Iidle)}`, fmtLimitI(I), Math.abs(I - L.Iidle) < 0.01);
  }
  if (L.Vtol && nets) {
    const vsw = nets["12V_SW"] || 0;
    push("V Spule (12V_SW)", `${L.Vtol[0]}…${L.Vtol[1]} V`, `${vsw.toFixed(2)} V`, vsw === 0 || (vsw >= L.Vtol[0] && vsw <= L.Vtol[1]));
  }
  if (L.Vz != null) {
    push("Vz Clamp", `≈ ${L.Vz} V`, `${V.toFixed(2)} V`, Math.abs(V - L.Vz) < 0.8 || V < 0.1);
  }

  const ok = checks.length === 0 || checks.every((c) => c.ok);
  return { ok, checks };
}
