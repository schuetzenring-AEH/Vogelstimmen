/**
 * Baugruppen + Bauteil-Metadaten: Kurztext, Detailtext, Spec-Check
 */

export const BLOCKS = {
  B1: {
    id: "B1",
    name: "Eingangsschutz",
    task:
      "Schützt die gesamte Platine am Batterieeingang: verhindert Schäden bei verpolter 12‑V-Batterie, begrenzt Kurzschlussströme und fängt Spannungsspitzen ab. Daraus entsteht das dauerhaft anliegende Netz 12V_PROT.",
    detail:
      "Am Anfang jeder batteriebetriebenen Schaltung steht der Eingangsschutz. Die 12‑V-Bleiakku-Versorgung kann falsch herum angeschlossen werden, bei Lastwechseln kurzzeitig über der Nennspannung liegen oder bei einem Fehler hohe Ströme liefern.\n\n" +
      "B1 erfüllt drei Aufgaben nacheinander: (1) Verpolungsschutz mit dem P‑Kanal‑MOSFET Q5 — bei falscher Polarität sperrt er, bei richtiger leitet er mit sehr kleinem Widerstand. (2) Ein PTC‑Sicherungselement F1 begrenzt dauerhaften Überstrom, indem sein Widerstand bei Erwärmung stark ansteigt. (3) Die TVS‑Diode D9 leitet schnelle Überspannungsimpulse nach Masse ab, bevor empfindliche Bauteile zerstört werden. Kondensator C1 puffert kurze Stromspitzen.\n\n" +
      "Das Ergebnis ist das Netz 12V_PROT: annähernd Batteriespannung, aber abgesichert. Darauf aufbauend arbeiten Latch und übrige Logik — auch im „Schlaf“, wenn der Rest der Box noch ausgeschaltet ist.",
  },
  B2: {
    id: "B2",
    name: "Latch (Ein/Aus)",
    task:
      "Schaltet die Leistungsschiene 12V_SW nur bei Bedarf ein: ein Tastendruck startet (auch bei noch ausgeschaltetem Audio‑Modul), die Wiedergabe hält die Versorgung, und das BUSY‑Signal schaltet am Ende wieder ab — mit möglichst keinem Ruhestrom im Latch selbst.",
    detail:
      "Ein Waldlehrpfad‑Kasten soll monatelang an einer Batterie hängen. Deshalb darf im Ruhezustand praktisch kein Strom fließen. B2 realisiert das ohne Mikrocontroller‑Sleep: ein Hardware‑Latch entscheidet, ob die geschaltete 12‑V‑Schiene (12V_SW) lebt.\n\n" +
      "Einschalten (SET): Ein Taster zieht über Dioden das Netz BTN_OR nach unten. Der P‑FET Q6 leitet daraufhin kurz einen SET‑Impuls auf LATCH_SET. Q2 und Q1 schalten 12V_SW ein. Das funktioniert auch „kalt“, also bevor 5 V und das Audio‑Modul existieren.\n\n" +
      "Halten (HOLD): Solange 12V_SW da ist, hält Widerstand R4 den Latch‑Zustand. Während die Stimme spielt, bleibt BUSY low — Q3 sperrt und stört den Hold nicht.\n\n" +
      "Ausschalten (RELEASE): Am Dateiende wird BUSY high. Q3 zieht LATCH_SET auf Masse, Q1 sperrt, 12V_SW und damit Buck, Audio und Zähler fallen weg. Im Idle liegt am Latch‑Pfad dann kein Dauerwiderstand von 12 V nach Masse — Zielstrom ≈ 0 µA (zuzüglich des kleinen Idle‑Stroms im Eingangsschutz über R6).",
  },
  B3: {
    id: "B3",
    name: "Buck‑Wandler 12 V → 5 V",
    task:
      "Erzeugt aus der geschalteten 12‑V‑Schiene eine stabile 5‑V‑Versorgung für Audio‑Modul und Impulszähler. Nur aktiv, wenn der Latch 12V_SW eingeschaltet hat — dadurch kein Buck‑Ruhestrom im Standby.",
    detail:
      "Das Audio‑Modul braucht 5 V, die Batterie liefert 12 V. Ein linearer Regler würde die Spannungsdifferenz als Wärme vernichten. Der Schaltregler (Buck) TPS62163 taktet stattdessen mit hoher Frequenz und speichert Energie in Spule L1 — typisch mit Wirkungsgraden um 90 %.\n\n" +
      "Eingangs‑ und Ausgangskondensatoren (C2, C3) glätten Welligkeit. Der Chip ist fest auf 5,0 V ausgelegt; EN hängt an 12V_SW, sodass der Wandler nur läuft, wenn der Latch eingeschaltet hat. Im Batterie‑Idle ist B3 stromlos.\n\n" +
      "Für die Simulation genügt ein Verhaltensmodell (Ausgangsspannung, Wirkungsgrad, Ruhestrom im Betrieb). Die innere PWM‑Transient wird nicht nanosekundengenau nachgebildet.",
  },
  B4: {
    id: "B4",
    name: "Audio‑Wiedergabe",
    task:
      "Spielt die gewählte Vogelstimme ab (DY‑SV17F, IO‑Mode 0): Taster triggert Datei 00001…00008, der interne Verstärker treibt den Lautsprecher, BUSY meldet Ende an den Latch.",
    detail:
      "Herzstück der Box ist das Modul DY‑SV17F: Flash‑Speicher für MP3/WAV, Decoder und Class‑D‑Endstufe in einem. In Mode 0 (CON1=GND, CON2=3,3 V, CON3 über 10 kΩ nach GND) startet eine fallende Flanke an IO0…IO7 die passende Datei.\n\n" +
      "BUSY (Pin 12) ist die Brücke zur Stromspar‑Logik: während der Wiedergabe low, danach high — genau das Signal, mit dem B2 die Box wieder abschaltet. Der Versorgungsstrom liegt laut Messung bei etwa 14 mA im Idle (Modul unter Spannung, kein Play) und bis etwa 60 mA im Betrieb; die Lautsprecherleistung kommt zusätzlich.\n\n" +
      "Wichtig für Laien: Das Modul braucht einige zehn bis hundert Millisekunden Bootzeit. Ein sehr kurzer Tastendruck kann den Latch setzen, aber den Sound‑Trigger verpassen — deshalb gibt es in der Simulation die Option „Kurzdruck‑Miss“.",
  },
  B5: {
    id: "B5",
    name: "Impulszähler (One-Shot)",
    task:
      "Zählt jedes Aufwachen der Box einmal mechanisch (Hengstler 0.635.128). Beim Rising-Edge von 12V_SW erzeugt die Baugruppe C20/R20/R21/D23/Q7 einen ~80 ms-Impuls auf die Spule — danach bleibt die Spule für den Rest der Session aus.",
    detail:
      "Warum One-Shot? 12V_SW bleibt Minuten an (ganze Session). Würde die Spule dauerhaft an 12 V hängen, zöge sie ~6,5 mA die ganze Zeit und würde unnötig Energie verbrauchen (bei manchen Zählern auch thermisch kritisch). Der Zähler braucht aber nur einen kurzen Impuls (≥50 ms laut Datenblatt).\n\n" +
      "Ablauf: Latch schaltet → 12V_SW steigt. C20 koppelt diese Flanke als kurzer Puls auf CNT_PULSE. R21 steuert Q7 (AO3400) an; Q7 zieht CNT_LO (Spulen−) nach GND. Spulen+ liegt an 12V_SW. Nach ~R20·C20 ≈ 100 kΩ·1 µF ≈ 100 ms (effektiv ~80 ms) ist der Gate-Puls weg, Q7 sperrt, Spule aus. D23 klemmt negative Spitzen am Gate-Knoten; D10 ist Freilauf über der Spule.\n\n" +
      "Zähler: Hengstler 0.635.128 (Typ 635.1, 12 V, 6 Stellen, Spule 1860 Ω ≈80 mW, 4 Lötpins 15,24×25,4 mm). Jeder Latch-ON = +1 Count. Idle: 12V_SW tot → Spulenstrom 0.",
  },
  B6: {
    id: "B6",
    name: "Taster‑Interface",
    task:
      "Verbindet acht beleuchtete Außentaster mit dem Audio‑Modul (IO0…IO7) und bündelt denselben Tastendruck über Dioden zu einem gemeinsamen SET‑Signal für den Latch.",
    detail:
      "Jeder Taster hat zwei Kontakte gegen Masse: einen für die Modul‑IO (Soundwahl) und — über die Dioden D1…D8 — einen Pfad zum Wired‑OR‑Knoten BTN_OR. So genügt ein Druck, um gleichzeitig „welche Stimme?“ und „Box einschalten!“ auszulösen.\n\n" +
      "Die Dioden verhindern, dass ein gezogener IO‑Pin die anderen IOs kurzschließt (Entkopplung). Schraubklemmen J3/J4 (Phoenix MPT 0,5/8) nehmen die Einzelleitungen ohne Crimp. Interne Pull‑ups im DY‑SV17F halten unbetätigte IOs auf High.\n\n" +
      "Elektrisch ist das ein Active‑Low‑System: Ruhe = High, Taste = Low gegen GND.",
  },
  B7: {
    id: "B7",
    name: "Lautsprecher",
    task:
      "Führt den differentiellen Class‑D‑Ausgang (SPK+/SPK−) zum externen 4–8‑Ω‑Lautsprecher. Keine Seite darf mit Geräte‑GND verbunden werden (BTL).",
    detail:
      "Das Modul treibt den Lautsprecher im Brückenbetrieb (Bridge‑Tied Load): beide Adern führen ein gegenphasiges Signal. Würde man eine Seite auf Masse legen, entstünde ein Kurzschluss im Verstärker.\n\n" +
      "Steckverbinder J2 und Testpunkt TP5 dienen Installation und Messung. Die akustische Leistung — und damit der Strom aus der 5‑V‑Schiene — hängt stark von Lautstärke und Impedanz ab; die Simulation modelliert dafür einen mittleren Zusatzstrom.",
  },
  B8: {
    id: "B8",
    name: "Taster‑LEDs",
    task:
      "Versorgt die Beleuchtung der acht Taster aus 12V_SW, sodass die LEDs nur leuchten, während die Box wach ist / Wiedergabe läuft — nicht im Batterie‑Standby.",
    detail:
      "Die beleuchteten Taster sollen Feedback geben, ohne den Idle‑Strom zu ruinieren. Deshalb hängen ihre LED‑Anschlüsse nicht dauerhaft an 12V_PROT, sondern an der geschalteten Schiene 12V_SW über **R12 (10 Ω)** und Schraubklemme J6 (MPT 0,5/2) am Netz **12V_LED**.\n\n" +
      "Vorwiderstände und Parallelschaltung liegen typischerweise in der Taster‑Verkabelung (extern). In der Simulation erscheint die LED‑Last als ein summierter Strom an J6, sobald der Latch eingeschaltet hat.",
  },
};

function diodeSeries(io) {
  const d = 15 + io;
  return {
    block: "B4",
    kind: "D",
    role:
      `Serien-Schutzdiode IO${io}: trennt Modul-Pin IO${io}_M vom Feld-IO${io} und blockiert 12-V-Rückspeisung ins DY-SV17F (Respin F-01).`,
    detail:
      `D${d} (1N4148WS): Anode an IO${io}_M (U2), Kathode an IO${io} (Kabel/J3). D1–D8 bleiben für den Latch-OR.\n\n` +
      "Ruhezustand: Modul-Pull-up hält IO" + io + "_M auf High; die Diode sperrt Rückwärtsströme aus dem 12-V-Bereich.\n\n" +
      `Tastendruck: IO${io} geht auf 0 V, die Diode leitet (~0,7 V), das Modul erkennt die fallende Flanke.`,
    limits: { Vmax: 75, Imax: 0.15 },
  };
}
function diodeOR(n) {
  return {
    block: "B6",
    kind: "D",
    role:
      `Entkoppeldiode für Taster ${n}: leitet nur, wenn IO${n - 1} gegen Masse gezogen wird, und OR‑verknüpft diesen Druck auf den gemeinsamen Knoten BTN_OR zum Latch‑SET — ohne die anderen IOs kurzzuschließen.`,
    detail:
      `D${n} ist eine schnelle Schaltdiode (1N4148‑Typ). Kathode liegt am jeweiligen Modul‑IO, Anode am Sammelnetz BTN_OR.\n\n` +
      "Ruhezustand: IO hängt über den internen Pull‑up des Moduls auf High, die Diode sperrt, BTN_OR bleibt über R9 auf 12V_PROT.\n\n" +
      `Tastendruck: IO${n - 1} geht auf 0 V. Die Diode leitet, BTN_OR fällt auf etwa eine Diodenspannung (~0,7 V). Dadurch wird Q6 angesteuert und der Latch gesetzt. Gleichzeitig erkennt das Audio‑Modul die fallende Flanke und startet Datei 0000${n}.\n\n` +
      "Ohne diese Diode würden alle IO‑Leitungen galvanisch am OR‑Knoten hängen und sich gegenseitig stören.",
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
    role: "Zieht das Gate von Leistungsschalter Q1 im Ruhezustand fest auf 12V_PROT, damit Q1 sicher aus bleibt, solange die Latch‑Logik nicht aktiv zieht.",
    detail:
      "Ein MOSFET‑Gate ist hochohmig und kann durch Streuung oder Leckströme „schweben“. R1 (100 kΩ) definiert den Default: Gate = Source‑Potenzial → VGS ≈ 0 → P‑FET Q1 sperrt. Erst wenn Q2 über R8 das Gate nach unten zieht (und D12 auf ~6,2 V klemmt), schaltet Q1 ein. Der Querstrom durch R1 bleibt im Microampere‑Bereich.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R2: {
    block: "B2", kind: "R",
    role: "Pull‑down an LATCH_SET / Gate von Q2: definiert den Low‑Pegel, wenn weder SET noch Hold das Netz hochziehen, und bildet mit R4 den Hold‑Teiler.",
    detail:
      "LATCH_SET steuert den N‑FET Q2. R2 (100 kΩ) nach GND sorgt dafür, dass ohne aktives SET/Hold kein undefiniertes Gate‑Potenzial entsteht. Im Hold‑Zustand teilt R4 (von 12V_SW) mit R2 die Spannung so, dass Q2 sicher oberhalb seiner Schwellspannung bleibt.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R3: {
    block: "B2", kind: "R",
    role: "10 kΩ von BUSY/CON3 nach GND: setzt in den ersten ~30 ms nach Modul‑Power den Mode‑Pin auf Low (Mode 0) und dient danach als Pull‑down am BUSY‑Signal.",
    detail:
      "Pin 12 des DY‑SV17F ist doppelt belegt: kurz nach dem Einschalten Konfigurationspin CON3, danach BUSY‑Ausgang. Mode 0 verlangt CON3 = Low — genau das erledigt R3. Später beeinflusst R3 die Signalflanken und hält ungetriebene Zustände definiert. Der Strom durch R3 ist klein (BUSY ≈ 0…3,3 V).",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R4: {
    block: "B2", kind: "R",
    role: "Selbsthalte‑Widerstand: speist LATCH_SET aus 12V_SW, sobald der Latch einmal gesetzt wurde, damit die Box auch nach Loslassen des Tasters eingeschaltet bleibt.",
    detail:
      "Nach dem kurzen SET‑Impuls von Q6 muss der Latch‑Zustand stabil bleiben. R4 verbindet die nun vorhandene 12V_SW‑Schiene mit LATCH_SET. Zusammen mit R2 entsteht ein Spannungsteiler, der Q2 leitend hält. Q3 kann später LATCH_SET hart auf GND ziehen und so den Hold überwinden (Release).",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R5: {
    block: "B3", kind: "R",
    role: "0-Ω-Jumper: verbindet VOS des TPS62163 direkt mit der 5-V-Schiene (Respin F-02).",
    detail:
      "Der TPS62163 besitzt einen VOS-Pin für die Ausgangsspannungs-Rückführung. In Rev 2.5 ist R5 ein 0-Ω-Jumper statt 100 kΩ — der Sense-Pfad liegt direkt auf 5 V, wie von TI für feste 5-V-Varianten empfohlen.",
    limits: { Vmax: 50, Imax: 0.5, Pmax: 0.063 },
  },
  R12: {
    block: "B8", kind: "R",
    role: "10 Ω von 12V_SW nach 12V_LED: begrenzt den Strom in die acht Taster-LEDs (Respin F-04).",
    detail:
      "Ohne Vorwiderstand könnten parallele LEDs bei 12 V zu hohe Ströme ziehen. R12 sitzt zwischen der geschalteten 12-V-Schiene und der LED-Klemme J6. Der Spannungsabfall steigt mit dem LED-Strom — in der Simulation als Sammellast modelliert.",
    limits: { Vmax: 50, Imax: 1.0, Pmax: 0.125 },
  },
  R13: {
    block: "B2", kind: "R",
    role: "100 kΩ von BUSY nach Q3_GATE: treibt das RC-Blanking zusammen mit C4 (Respin F-03).",
    detail:
      "BUSY geht nicht mehr direkt auf Q3.Gate, sondern über R13 auf das Netz Q3_GATE. Zusammen mit C4 (4,7 µF nach GND) entsteht τ ≈ 470 ms — Q3 schaltet erst verzögert, wenn BUSY dauerhaft High ist. Verhindert Fehl-Release beim Kaltstart.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R6: {
    block: "B1", kind: "R",
    role: "Hochohmiger Ableitwiderstand vom (über Zener geklemmten) Gate‑Pfad von Q5 nach Masse — schaltet den Verpolungs‑FET bei korrekter Polung ein und bestimmt den Idle‑Strom (~12 µA bei 470 kΩ).",
    detail:
      "Ohne Weg nach Masse würde das Gate von Q5 nicht negativ gegenüber der Source vorgespannt. R6 schließt den Gleichstrompfad. Zusammen mit Zener D11 stellt sich am Gate etwa Batteriespannung minus 6,2 V ein; der Strom durch R6/R7 ist der dominante Ruhestrom der ganzen Box im Idle (Designentscheidung E‑RPP‑01: 470 kΩ statt 10 kΩ).",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R7: {
    block: "B1", kind: "R",
    role: "Vorwiderstand im Gate‑Zweig von Q5: begrenzt den Strom durch die Zenerdiode D11 beim Einschalten und entkoppelt Gate‑Kapazität etwas vom Clamp.",
    detail:
      "Wenn D11 bei |VGS|‑Begrenzung leitet, begrenzt R7 (4,7 kΩ) den Zenerstrom auf ein sicheres Milliamper‑Maß. Gleichzeitig bildet er mit R6 den serielle Pfad Gate‑Netzwerk. Ohne R7 könnte der Clamp‑Strom und Einschalt‑Transient das Gate unnötig belasten.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R8: {
    block: "B2", kind: "R",
    role: "Serie zwischen Drain von Q2 und Gate von Q1: begrenzt den Strom, wenn D12 klemmt, und entkoppelt die Latch‑Logik vom Leistungs‑Gate.",
    detail:
      "Q2 zieht das Gate von Q1 Richtung Masse. D12 verhindert, dass |VGS| von Q1 über ±8 V (SI2301‑Limit) hinausschießt. R8 bestimmt dabei den Clamp‑Strom (Größenordnung Milliampere) und schützt Q2 vor übermäßigem Pulsstrom.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R9: {
    block: "B2", kind: "R",
    role: "Pull‑up von BTN_OR an 12V_PROT: hält den Taster‑OR‑Knoten im Idle auf High, sodass Q6 aus bleibt und kein Latch‑Ruhestrom fließt.",
    detail:
      "BTN_OR ist der Wired‑OR‑Sammelpunkt der acht Tasterdioden. R9 zieht ihn im Ruhezustand auf 12V_PROT. Dann ist VGS von Q6 ≈ 0 → Q6 sperrt → Idle‑Strom im SET‑Pfad ≈ 0. Erst ein Tastendruck zieht BTN_OR über eine Diode nach unten; dann fließt Strom durch R9 (rund 1 mA) — aber nur solange die Taste gedrückt ist.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },
  R10: {
    block: "B2", kind: "R",
    role: "1 kΩ in Serie im SET‑Pfad: begrenzt den Konfliktstrom, falls SET und BUSY‑Release (Q3) kurzzeitig gleichzeitig aktiv sind.",
    detail:
      "Beim Ende einer Wiedergabe kann theoretisch noch SET‑Aktivität mit dem Release durch Q3 kollidieren. R10 begrenzt dann den Strom zwischen SET_DRV und dem von Q3 auf GND gezogenen LATCH_SET. Im Normalfall ist der SET‑Impuls ohnehin kurz.",
    limits: { Vmax: 50, Imax: 0.1, Pmax: 0.063 },
  },
  R11: {
    block: "B2", kind: "R",
    role: "Serie zwischen BTN_OR und Gate von Q6: begrenzt den Zenerstrom von D14 und formt die Gate‑Ansteuerung des Kaltstart‑P‑FETs.",
    detail:
      "Analog zu R7/R8 am Leistungs‑FET: R11 schützt Clamp und Gate, wenn BTN_OR low geht und D14 die Gate‑Source‑Spannung von Q6 auf etwa 6,2 V begrenzt. So bleibt |VGS| im erlaubten Bereich des SI2301.",
    limits: { Vmax: 50, Imax: 0.05, Pmax: 0.063 },
  },

  C1: {
    block: "B1", kind: "C",
    role: "Elko/Keramik‑Puffer an 12V_PROT: speichert Ladung für kurze Stromspitzen und stabilisiert die geschützte Eingangsschiene.",
    detail:
      "Kondensatoren widersprechen schnellen Spannungsänderungen. C1 (10 µF/25 V) am geschützten Eingang glättet Transienten und liefert lokal Energie, wenn TVS oder Last kurz Strom fordern. Die Spannungsfestigkeit 25 V bietet Reserve über 12 V Batterienennspannung.",
    limits: { Vmax: 25, Imax: 2 },
  },
  C2: {
    block: "B3", kind: "C",
    role: "Eingangskondensator des Buck‑Reglers: hält VIN am TPS62163 bei Schaltkanten lokal stabil.",
    detail:
      "Schaltregler ziehen impulsartig Strom vom Eingang. C2 sitzt deshalb möglichst nah an VIN/GND des ICs. Zu wenig Kapazität erhöht Spannungs­einbrüche und Störungen; 10 µF/25 V X7R ist typisch für diesen Wandler.",
    limits: { Vmax: 25, Imax: 2 },
  },
  C3: {
    block: "B3", kind: "C",
    role: "Ausgangskondensator der 5‑V‑Schiene: glättet die Buck‑Welligkeit für das Audio‑Modul.",
    detail:
      "Am Buck‑Ausgang glättet C3 (22 µF/10 V) die Sägezahn‑Welligkeit der Spulenstrom‑Umsetzung. Der Hengstler hängt nicht an 5 V (One‑Shot an 12V_SW). Audio‑Elektronik ist empfindlich gegen Supply‑Noise; ausreichend COUT ist Teil der TI‑Empfehlung.",
    limits: { Vmax: 10, Imax: 2 },
  },
  C4: {
    block: "B2", kind: "C",
    role: "4,7 µF/16 V von Q3_GATE nach GND: RC-Blanking mit R13 (~470 ms, Respin F-03).",
    detail:
      "C4 verzögert den Anstieg von Q3_GATE, wenn BUSY nach Track-Ende auf High geht. Erst wenn C4 geladen ist, schaltet Q3 und löst den Latch. Verhindert Race zwischen Kaltstart-BUSY und Release-Logik.",
    limits: { Vmax: 16, Imax: 0.05 },
  },
  L1: {
    block: "B3", kind: "L",
    role: "Energiespeicher‑Spule des Bucks: nimmt in der Einschaltphase Energie auf und gibt sie in der Freilaufphase an den 5‑V‑Ausgang ab.",
    detail:
      "Induktivität 2,2 µH mit Sättigungsstrom ≈1,76 A (TDK). Die Spule ist das Herz der Spannungswandlung: Spannung an der Induktivität heißt Stromänderung. Unterhalb von Isat bleibt L näherungsweise konstant; darüber sinkt die Induktivität und der Wirkungsgrad leidet.",
    limits: { Vmax: 20, Imax: 1.76 },
  },

  D1: diodeOR(1), D2: diodeOR(2), D3: diodeOR(3), D4: diodeOR(4),
  D5: diodeOR(5), D6: diodeOR(6), D7: diodeOR(7), D8: diodeOR(8),
  D15: diodeSeries(0), D16: diodeSeries(1), D17: diodeSeries(2), D18: diodeSeries(3),
  D19: diodeSeries(4), D20: diodeSeries(5), D21: diodeSeries(6), D22: diodeSeries(7),

  D10: {
    block: "B5", kind: "D",
    role: "Freilaufdiode parallel zur Hengstler-Spule (Kathode an 12V_SW, Anode an CNT_LO): nimmt den Induktionsstrom auf, wenn Q7 die Spule abschaltet.",
    detail:
      "Nach dem One-Shot-Impuls sperrt Q7. Die Spuleninduktivität will den Strom fortsetzen — ohne D10 entstünde eine hohe Gegenspannung an CNT_LO. D10 führt die Energie zurück auf 12V_SW, bis der Strom abgeklungen ist.",
    limits: { Vmax: 75, Imax: 0.15 },
  },
  D23: {
    block: "B5", kind: "D",
    role: "Clamp am One-Shot-Knoten CNT_PULSE: begrenzt negative Spannungsspitzen nach dem Rising-Edge über C20 gegen GND.",
    detail:
      "Beim Abfall von 12V_SW (Session-Ende) würde C20 sonst CNT_PULSE unter GND ziehen. D23 (Kathode an CNT_PULSE, Anode GND) hält den Knoten ≥ −Vf und schützt Q7-Gate.",
    limits: { Vmax: 75, Imax: 0.15 },
  },
  C20: {
    block: "B5", kind: "C",
    role: "1 µF-Koppelkondensator: wandelt die Rising-Edge von 12V_SW in einen kurzen Puls auf CNT_PULSE um (Kern des One-Shot).",
    detail:
      "Gleichspannung von 12V_SW kommt nicht durch C20. Nur die Flanke erzeugt einen Stromimpuls, der R20 lädt und über R21 Q7 einschaltet. Zeitkonstante ≈ R20·C20 ≈ 100 ms.",
    limits: { Vmax: 25 },
  },
  R20: {
    block: "B5", kind: "R",
    role: "100 kΩ Entladewiderstand CNT_PULSE→GND: legt die One-Shot-Pulsbreite fest und zieht das Gate-Netz im Ruhezustand auf 0 V.",
    detail:
      "Zusammen mit C20 bestimmt R20, wie lange CNT_PULSE (und damit Q7) nach der Flanke noch High bleibt. Ohne R20 würde die Ladung hängen bleiben.",
    limits: { Vmax: 50, Pmax: 0.1 },
  },
  R21: {
    block: "B5", kind: "R",
    role: "100 Ω Serie zwischen CNT_PULSE und Q7-Gate: begrenzt Gate-Stromspitzen und dämpft Ringing.",
    detail:
      "Schützt das AO3400-Gate und entkoppelt leicht den RC-Knoten vom Gate-C.",
    limits: { Vmax: 50, Pmax: 0.1 },
  },
  Q7: {
    block: "B5", kind: "NFET",
    role: "Low-Side-Schalter (AO3400) für die Hengstler-Spule: Drain = CNT_LO (Spulen−), Source = GND. Nur während des ~80 ms-One-Shot leitend.",
    detail:
      "Spulen+ liegt dauerhaft an 12V_SW (sobald Latch an). Q7 schließt den Stromkreis nur kurz. Danach sperrt er — Spulenstrom 0 für den Rest der Session. Idle: 12V_SW tot → kein Pfad.",
    limits: { VdsMax: 30, VgsMax: 12, Imax: 5 },
  },
  D13: {
    block: "B2", kind: "D",
    role: "Steuerdiode vom SET‑Impuls auf LATCH_SET: lässt den SET‑Pegel passieren, blockt aber Rückwirkungen aus dem Hold‑/Release‑Netz.",
    detail:
      "D13 entkoppelt SET_PULSE von LATCH_SET. Der SET‑Pfad darf LATCH_SET hochziehen; umgekehrt soll ein Release durch Q3 nicht unkontrolliert zurück in den Q6‑Drain speisen. Klassische Steering‑Diode in Latch‑Schaltungen.",
    limits: { Vmax: 75, Imax: 0.15 },
  },

  D11: {
    block: "B1", kind: "Z",
    role: "6,2‑V‑Zener zwischen Source und Gate von Q5: begrenzt |VGS| auf einen sicheren Wert unter dem ±8‑V‑Absolutmaximum des SI2301.",
    detail:
      "Würde man das Gate von Q5 einfach über Widerstände an 0 V legen, während die Source auf 12 V liegt, entstünde VGS ≈ −12 V — oberhalb der Spezifikation (±8 V). D11 klemmt die Differenz auf etwa 6,2 V. Die Lastspannung bleibt 12 V; geschützt wird nur die Gate‑Oxid‑Struktur des MOSFET.",
    limits: { Vz: 6.2, VgsMax: 8, Imax: 0.05, Pmax: 0.35 },
  },
  D12: {
    block: "B2", kind: "Z",
    role: "6,2‑V‑VGS‑Clamp an Leistungsschalter Q1 — gleiche Schutzfunktion wie D11, bezogen auf die 12V_PROT‑Source.",
    detail:
      "Wenn Q2 das Gate von Q1 nach unten zieht, verhindert D12 eine unzulässige Gate‑Source‑Spannung. Polarität: Kathode an Source (12V_PROT), Anode an Gate. Zusammen mit R8 bleibt der Clamp‑Strom beherrschbar.",
    limits: { Vz: 6.2, VgsMax: 8, Imax: 0.05, Pmax: 0.35 },
  },
  D14: {
    block: "B2", kind: "Z",
    role: "6,2‑V‑VGS‑Clamp am Kaltstart‑FET Q6, damit der Taster‑SET den SI2301 nicht überlastet.",
    detail:
      "Q6 sieht im SET‑Fall ebenfalls eine große Source‑Gate‑Differenz gegen 12V_PROT. D14 begrenzt auf ~6,2 V analog zu D11/D12. Im Idle ist VGS ≈ 0, die Zener bleibt stromlos (nur Leckage).",
    limits: { Vz: 6.2, VgsMax: 8, Imax: 0.05, Pmax: 0.35 },
  },
  D9: {
    block: "B1", kind: "TVS",
    role: "Suppressor‑Diode (SMAJ15A) an 12V_PROT: leitet kurze Überspannungsimpulse ab, bevor sie Latch und Wandler erreichen.",
    detail:
      "TVS‑Dioden reagieren in Nanosekunden. Die SMAJ15A hält bis 15 V Arbeits­spannung (VRWM), bricht ab etwa 16,7 V durch und klemmt starke Impulse (bis in den Ampere‑Bereich für Mikrosekunden). Im Normalbetrieb fließt nur Mikroampere‑Leckstrom — vernachlässigbar gegenüber R6.",
    limits: { Vmax: 15, Vbr: 16.7, Imax: 16.4, Pmax: 400 },
  },

  Q5: {
    block: "B1", kind: "PFET",
    role: "High‑Side‑P‑MOSFET als ideales Verpolungsventil: leitet bei korrekter Batteriepolarität mit niedrigem RDS(on), sperrt bei Vertauschung von Plus und Minus.",
    detail:
      "Im Gegensatz zu einer Schottky‑Diode im Pluspfad (Spannungsverlust ~0,3…0,5 V) schaltet der SI2301 mit typisch ~90 mΩ. Body‑Diode und Gate‑Beschaltung sorgen dafür, dass sich der FET bei richtiger Polung selbst einschaltet. Absolutwerte: VDS max 20 V, VGS max ±8 V — deshalb Zener D11.",
    limits: { VdsMax: 20, VgsMax: 8, Imax: 3.1 },
  },
  Q1: {
    block: "B2", kind: "PFET",
    role: "Haupt‑Leistungsschalter: verbindet 12V_PROT mit 12V_SW, sobald der Latch gesetzt ist, und trennt die Last im Idle vollständig.",
    detail:
      "Q1 ist der „große Schalter“ der Box. Ein = 12V_SW speist Buck, LEDs und Hold. Aus = diese Verbraucher hängen in der Luft und ziehen keinen Batteriestrom. Ansteuerung über Q2/R8/D12/R1 wie oben. Gleiches FET‑Modell wie Q5 (SI2301).",
    limits: { VdsMax: 20, VgsMax: 8, Imax: 3.1 },
  },
  Q6: {
    block: "B2", kind: "PFET",
    role: "Kaltstart‑SET‑Schalter: erzeugt aus einem Tastendruck einen Plus‑Impuls auf den Latch, ohne im Idle Strom zu verbrauchen (VGS≈0).",
    detail:
      "Frühere N‑FET‑Inverter‑Lösungen zogen im Idle dauerhaft Strom. Q6 als P‑FET bleibt aus, solange BTN_OR = 12V_PROT. Nur bei Taste (BTN_OR low) leitet er und setzt den Latch — auch wenn 5 V noch fehlt. Das ist der Kern von E‑LATCH‑02.",
    limits: { VdsMax: 20, VgsMax: 8, Imax: 3.1 },
  },
  Q2: {
    block: "B2", kind: "NFET",
    role: "Logik‑FET des Latch: bei High an LATCH_SET zieht er über R8 das Gate von Q1 herunter und schaltet damit die Leistung ein.",
    detail:
      "2N7002: kleiner N‑Kanal‑MOSFET für Signalströme. Gate an LATCH_SET, Drain über R8/D12 am Q1‑Gate, Source an GND. Schwellspannung typisch 1…2,5 V — Hold‑Teiler und SET‑Pegel liegen klar darüber. RDS(on) ist hier unkritisch, weil nur Gate‑Ströme fließen.",
    limits: { VdsMax: 60, VgsMax: 20, Imax: 0.115 },
  },
  Q3: {
    block: "B2", kind: "NFET",
    role: "Release‑FET: wenn BUSY (über R13/C4 verzögert) Q3_GATE anhebt, zieht Q3 LATCH_SET auf GND und löscht den Latch.",
    detail:
      "BUSY High → über R13 lädt C4 am Netz Q3_GATE → Gate von Q3 über Schwellspannung → Drain zieht LATCH_SET nieder → Q2 sperrt → Q1 sperrt → Box aus. Während der Wiedergabe ist BUSY Low, Q3 bleibt aus. RC-Blanking ~470 ms (F-03).",
    limits: { VdsMax: 60, VgsMax: 20, Imax: 0.115 },
  },

  F1: {
    block: "B1", kind: "PTC",
    role: "Rückstellende Sicherung (PTC 1 A/24 V): erhöht bei Überstrom ihren Widerstand und begrenzt so den Fehlerstrom aus der Batterie.",
    detail:
      "Im Gegensatz zu einer Schmelzsicherung „heilt“ ein PTC nach Abkühlung. Typ C2760272 ist für 24 V ausgelegt (nicht die 6‑V‑Variante!). Im Normalbetrieb ist der Widerstand niedrig (hier modellhaft ~0,15 Ω); bei Überlast steigt er stark an.",
    limits: { Vmax: 24, Imax: 1.0 },
  },
  U1: {
    block: "B3", kind: "IC",
    role: "TPS62163: synchroner 1‑A‑Buck mit fester 5‑V‑Ausgangsspannung, speist nur das Audio‑Modul aus 12V_SW (nicht den Zähler).",
    detail:
      "Eingangsbereich 3…17 V, typischer Ruhestrom im Power‑Save ~17 µA (nur relevant wenn EN aktiv). Festspannungsvariante, FB intern verdrahtet. EN = 12V_SW: kein Betrieb im Idle. Der Hengstler hängt an 12V_SW + One‑Shot, nicht an 5 V (Soft‑Start‑Race bei 5‑V‑Zählern).",
    limits: { VinMax: 17, VinMin: 3, IoutMax: 1.0, Vout: 5 },
  },
  U2: {
    block: "B4", kind: "MOD",
    role: "DY‑SV17F‑Modul: speichert und spielt Vogelstimmen, wertet acht Taster‑IOs aus und liefert BUSY sowie den Lautsprecher‑Ausgang.",
    detail:
      "Betriebsstrom Idle ≈14 mA (Messung inkl. Verstärkerchip), Betrieb bis ≈60 mA laut Händlerangabe; Lautsprecherstrom zusätzlich. V33 darf bis 80 mA als Hilfsspannung abgeben (hier vor allem Mode‑Pin CON2). Mode 0 = Independent Trigger. Ohne externe 5 V (Latch aus) ist das Modul vollständig stromlos — das ist gewollt.",
    limits: { Vmax: 5.5, Iidle: 0.014, Iwork: 0.06, Iv33max: 0.08 },
  },
  J5: {
    block: "B5", kind: "CNT",
    role: "Hengstler 0.635.128 (Typ 635.1): 6‑stelliger elektromechanischer Printzähler, 12 V, Spule 1860 Ω ≈80 mW. Pad1=+ (12V_SW), Pad2=− (CNT_LO via Q7).",
    detail:
      "Beim Latch‑ON erzeugt die One‑Shot‑Baugruppe einen ~80 ms‑Impuls: Q7 zieht CNT_LO nach GND → Spule zählt +1. Danach Spule aus bis Session‑Ende. Idle: 12V_SW tot → Strom 0. Footprint 4 Pins 15,24×25,4 mm (nicht der 5‑V‑Typ 0.635.132).",
    limits: { Vnom: 12, Vtol: [10.2, 13.2], Ityp: 0.0065, Ptyp: 0.08, pulse_s: 0.08 },
  },

  J1: {
    block: "B1", kind: "CONN",
    role: "Batterieanschluss: Phoenix MPT 0,5/2 — Plus und Masse der 12‑V‑Versorgung zum Eingangsschutz.",
    detail:
      "Mechanische Schnittstelle: Phoenix MPT 0,5/2-2,54 (E-CONN-01). Elektrisch direkt vor Q5. Polarität beachten — genau dafür existiert B1. Nennstrom der Klemme 6 A.",
    limits: { Vmax: 16, Imax: 2 },
  },
  J2: {
    block: "B7", kind: "CONN",
    role: "Lautsprecher‑Klemme MPT 0,5/2: SPK+ / SPK− vom Class‑D‑Ausgang, galvanisch nicht mit GND verbinden.",
    detail:
      "BTL‑Ausgang: beide Leitungen führen Signal. Falsches Auflegen einer Ader auf Gehäuse/GND kann den Verstärker zerstören. Kabelquerschnitt und Länge für 4–8 Ω‑Last wählen.",
    limits: { Vmax: 5, Imax: 1 },
  },
  J3: {
    block: "B6", kind: "CONN",
    role: "Schraubklemme MPT 0,5/8 der acht Taster‑Signale (IO0…IO7) zum Audio‑Modul und zu den OR‑Dioden.",
    detail:
      "Jedes IO‑Signal fährt parallel zum Modulpin und zur Kathode der zugehörigen Diode D1…D8. Einzelleitungen ohne Crimp (E-CONN-01).",
    limits: { Vmax: 5, Imax: 0.05 },
  },
  J4: {
    block: "B6", kind: "CONN",
    role: "Schraubklemme MPT 0,5/8 der Taster‑Masseleitungen — gemeinsames GND für die acht Tasterkontakte.",
    detail:
      "Die Taster schalten IO gegen GND. J4 bündelt die GND‑Adern. Saubere Masseführung vermeidet Brummen und Fehltrigger.",
    limits: { Vmax: 5, Imax: 0.05 },
  },
  J6: {
    block: "B8", kind: "CONN",
    role: "LED‑Versorgungsklemme MPT 0,5/2: 12V_LED und GND für die parallel geschalteten Taster‑LEDs (via R12).",
    detail:
      "Nur aktiv bei eingeschaltetem Latch. R12 (10 Ω) begrenzt den Strom von 12V_SW zum Netz 12V_LED. Externe Vorwiderstände in der Taster-Verkabelung ergänzen die Begrenzung. In der Simulation als Sammellast modelliert.",
    limits: { Vmax: 16, Imax: 0.5 },
  },
  TP1: {
    block: "B1", kind: "TP",
    role: "Messpunkt 12V_PROT — Spannung nach Verpolungs‑FET, PTC und vor dem Latch.",
    detail: "Zum Prüfen mit Multimeter/Oszilloskop: Batterie ok? Schutzkette leitend? Soll ≈ BAT+ bei richtiger Polung.",
    limits: { Vmax: 16 },
  },
  TP2: {
    block: "B3", kind: "TP",
    role: "Messpunkt 5 V — Buck‑Ausgang für das Audio‑Modul.",
    detail: "Nur bei aktivem Latch ≈5,0 V. Im Idle 0 V — so prüft man, ob Ein‑/Ausschalten funktioniert. Zählerstrom misst man an CNT_LO / J5, nicht hier.",
    limits: { Vmax: 6 },
  },
  TP3: {
    block: "B1", kind: "TP",
    role: "Messpunkt Geräte‑GND als Bezug für alle Spannungen.",
    detail: "Bezugspotenzial der gesamten Schaltung. Nicht mit SPK− verwechseln.",
    limits: { Vmax: 0.1 },
  },
  TP4: {
    block: "B2", kind: "TP",
    role: "Messpunkt BUSY — zeigt Wiedergabe (Low) bzw. Ende/Idle powered (High ≈3,3 V).",
    detail: "Direkt mit Release‑Logik Q3 verknüpft. Hilft bei der Fehlersuche, wenn die Box nicht selbstständig abschaltet.",
    limits: { Vmax: 5 },
  },
  TP5: {
    block: "B7", kind: "TP",
    role: "Messpunkt SPK+ — Audio‑Signalseite zum Lautsprecher.",
    detail: "Nur zur Diagnose; Impedanz und Gleichanteil beachten. Keine DC‑Kurzschlussmessung gegen GND während Betrieb.",
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
    const v5 = nets["5V"] || 0;
    push("V Spule", `${L.Vtol[0]}…${L.Vtol[1]} V (4,5 V −10/+20 %)`, `${v5.toFixed(2)} V`, v5 === 0 || (v5 >= L.Vtol[0] && v5 <= L.Vtol[1]));
  }
  if (L.Vz != null) {
    push("Vz Clamp", `≈ ${L.Vz} V`, `${V.toFixed(2)} V`, Math.abs(V - L.Vz) < 0.8 || V < 0.1);
  }

  const ok = checks.length === 0 || checks.every((c) => c.ok);
  return { ok, checks };
}
