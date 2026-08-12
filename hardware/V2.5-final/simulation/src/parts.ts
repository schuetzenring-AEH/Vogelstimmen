/**
 * Datenblatt-Parameter Vogelstimmenkasten Rev 2.4
 * Quellen: docs/datasheets/* + Hersteller-PDFs (Stand 2026-08)
 */

export type PartKind = "R" | "C" | "L" | "D" | "Z" | "TVS" | "PFET" | "NFET" | "PTC" | "IC" | "MOD" | "CNT" | "CONN" | "TP";

export interface PartSpec {
  ref: string;
  kind: PartKind;
  value: string;
  package?: string;
  lcsc?: string;
  model: "ohmic" | "switch_pfet" | "switch_nfet" | "diode" | "zener" | "tvs" | "ptc" | "cap" | "ind" | "buck" | "audio" | "counter" | "passive";
  /** Ohmic resistance [Ω] when applicable */
  R?: number;
  /** Capacitance [F] */
  C?: number;
  /** Inductance [H] */
  L?: number;
  /** Diode / zener forward [V] */
  Vf?: number;
  /** Zener / clamp voltage [V] */
  Vz?: number;
  /** FET Rds(on) typ [Ω] */
  RdsOn?: number;
  /** FET VGS(th) typ [V] */
  VgsTh?: number;
  /** Absolute max |VGS| [V] */
  VgsMax?: number;
  /** Absolute max |VDS| [V] */
  VdsMax?: number;
  /** Leakage estimate [A] when off / below clamp */
  Ileak?: number;
  /** Behavioral notes + datasheet refs */
  note: string;
  source: string;
}

/** Batterie / System */
export const SYS = {
  Vbat: 12.0,
  /** Externe LED-Last an J6 (8× LED + Vorwiderstand, Annahme) */
  Iled_total: 0.08,
  /** Lautsprecher-Last Schätzung bei Wiedergabe (BTL, Mittel) */
  Ispk_avg: 0.12,
  /** Track-Dauer Default [s] */
  track_s: 4.0,
  /** DY-SV17F Boot bis BUSY aktiv [s] (CON3 30 ms Config + Start) */
  boot_s: 0.15,
  /** CON3 Mode-Fenster [s] */
  con3_config_s: 0.03,
};

export const PARTS: Record<string, PartSpec> = {
  R1: { ref: "R1", kind: "R", value: "100k", package: "0402", model: "ohmic", R: 100e3, note: "Q1 Gate Pull-up → 12V_PROT", source: "BOM / E24" },
  R2: { ref: "R2", kind: "R", value: "100k", package: "0402", model: "ohmic", R: 100e3, note: "Q2 Gate Pull-down", source: "BOM / E24" },
  R3: { ref: "R3", kind: "R", value: "10k", package: "0402", model: "ohmic", R: 10e3, note: "BUSY / CON3 Pull-down (Mode 0)", source: "BOM / DY-SV17F Mode 0" },
  R4: { ref: "R4", kind: "R", value: "10k", package: "0402", model: "ohmic", R: 10e3, note: "Selbsthaltung 12V_SW → LATCH_SET", source: "BOM / E-LATCH" },
  R5: { ref: "R5", kind: "R", value: "100k", package: "0402", model: "ohmic", R: 100e3, note: "TPS62163 VOS → 5V (TI empfohlen)", source: "TPS62163 DS" },
  R6: { ref: "R6", kind: "R", value: "470k", package: "0402", model: "ohmic", R: 470e3, note: "Q5 Gate→GND; Idle ≈12 µA (E-RPP-01)", source: "BOM / E-RPP-01" },
  R7: { ref: "R7", kind: "R", value: "4.7k", package: "0402", model: "ohmic", R: 4.7e3, note: "Serie Gate Q5 / Zenerstrom", source: "BOM / E-VGS-01" },
  R8: { ref: "R8", kind: "R", value: "4.7k", package: "0402", model: "ohmic", R: 4.7e3, note: "Serie Q2→Q1.Gate", source: "BOM / E-VGS-01" },
  R9: { ref: "R9", kind: "R", value: "10k", package: "0402", model: "ohmic", R: 10e3, note: "Pull-up BTN_OR an 12V_PROT", source: "BOM / E-LATCH-02" },
  R10: { ref: "R10", kind: "R", value: "1k", package: "0402", model: "ohmic", R: 1e3, note: "Serie SET_DRV (Konflikt Q3)", source: "BOM / E-LATCH-02" },
  R11: { ref: "R11", kind: "R", value: "4.7k", package: "0402", model: "ohmic", R: 4.7e3, note: "Serie Gate Q6", source: "BOM / E-LATCH-02" },

  C1: { ref: "C1", kind: "C", value: "10µF/25V", package: "0805", model: "cap", C: 10e-6, note: "Puffer 12V_PROT", source: "BOM" },
  C2: { ref: "C2", kind: "C", value: "10µF/25V", package: "0805", model: "cap", C: 10e-6, note: "Buck CIN", source: "TPS62163 DS" },
  C3: { ref: "C3", kind: "C", value: "22µF/10V", package: "0805", model: "cap", C: 22e-6, note: "Buck COUT", source: "TPS62163 DS" },

  L1: { ref: "L1", kind: "L", value: "2.2µH", package: "1008", lcsc: "C88527", model: "ind", L: 2.2e-6, note: "TDK VLS252010HBX-2R2M-1, Isat≈1.76 A", source: "TDK / LCSC C88527" },

  D1: { ref: "D1", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Active-Low OR IO0→BTN_OR", source: "onsemi 1N4148WS typ" },
  D2: { ref: "D2", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO1", source: "onsemi 1N4148WS typ" },
  D3: { ref: "D3", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO2", source: "onsemi 1N4148WS typ" },
  D4: { ref: "D4", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO3", source: "onsemi 1N4148WS typ" },
  D5: { ref: "D5", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO4", source: "onsemi 1N4148WS typ" },
  D6: { ref: "D6", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO5", source: "onsemi 1N4148WS typ" },
  D7: { ref: "D7", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO6", source: "onsemi 1N4148WS typ" },
  D8: { ref: "D8", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO7", source: "onsemi 1N4148WS typ" },
  D10: { ref: "D10", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Freilauf Kübler (K→5V)", source: "onsemi 1N4148WS" },
  D13: { ref: "D13", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "SET_PULSE → LATCH_SET", source: "E-LATCH-02" },

  D11: { ref: "D11", kind: "Z", value: "BZX84C6V2", package: "SOT-23", lcsc: "C179522", model: "zener", Vz: 6.2, Vf: 0.7, Ileak: 0.1e-6, note: "VGS-Clamp Q5; Vz=6.2 V ±~5 %, IR≤3 µA @4 V", source: "BZX84C6V2 / Nexperia BZX84" },
  D12: { ref: "D12", kind: "Z", value: "BZX84C6V2", package: "SOT-23", lcsc: "C179522", model: "zener", Vz: 6.2, Vf: 0.7, Ileak: 0.1e-6, note: "VGS-Clamp Q1", source: "BZX84C6V2" },
  D14: { ref: "D14", kind: "Z", value: "BZX84C6V2", package: "SOT-23", lcsc: "C179522", model: "zener", Vz: 6.2, Vf: 0.7, Ileak: 0.1e-6, note: "VGS-Clamp Q6", source: "BZX84C6V2" },

  D9: { ref: "D9", kind: "TVS", value: "SMAJ15A", package: "SMA", lcsc: "C113958", model: "tvs", Vz: 16.7, Ileak: 1e-6, note: "VRWM=15 V, VBR=16.7–18.5 V, Vc=24.4 V @16.4 A, IR≈1 µA", source: "Littelfuse SMAJ15A" },

  Q5: {
    ref: "Q5", kind: "PFET", value: "SI2301CDS", package: "SOT-23", lcsc: "C10487", model: "switch_pfet",
    RdsOn: 0.09, VgsTh: 0.7, VgsMax: 8, VdsMax: 20, Ileak: 1e-6,
    note: "Verpolungsschutz; RDS(on) typ 90 mΩ @−4.5 V; VGS max ±8 V",
    source: "Vishay Si2301CDS",
  },
  Q1: {
    ref: "Q1", kind: "PFET", value: "SI2301CDS", package: "SOT-23", lcsc: "C10487", model: "switch_pfet",
    RdsOn: 0.09, VgsTh: 0.7, VgsMax: 8, VdsMax: 20, Ileak: 1e-6,
    note: "High-Side Latch → 12V_SW",
    source: "Vishay Si2301CDS",
  },
  Q6: {
    ref: "Q6", kind: "PFET", value: "SI2301CDS", package: "SOT-23", lcsc: "C10487", model: "switch_pfet",
    RdsOn: 0.09, VgsTh: 0.7, VgsMax: 8, VdsMax: 20, Ileak: 1e-6,
    note: "Kaltstart-SET; Idle VGS≈0 → aus",
    source: "Vishay Si2301CDS / E-LATCH-02",
  },
  Q2: {
    ref: "Q2", kind: "NFET", value: "2N7002LT1G", package: "SOT-23", lcsc: "C16338", model: "switch_nfet",
    RdsOn: 2.5, VgsTh: 1.5, VgsMax: 20, VdsMax: 60, Ileak: 1e-6,
    note: "Latch-Logik; RDS(on) max 7.5 Ω @10 V / typ ~2–3 Ω @5 V Gate",
    source: "onsemi 2N7002L",
  },
  Q3: {
    ref: "Q3", kind: "NFET", value: "2N7002LT1G", package: "SOT-23", lcsc: "C16338", model: "switch_nfet",
    RdsOn: 2.5, VgsTh: 1.5, VgsMax: 20, VdsMax: 60, Ileak: 1e-6,
    note: "BUSY-Release → LATCH_SET nach GND",
    source: "onsemi 2N7002L",
  },

  F1: {
    ref: "F1", kind: "PTC", value: "1A/24V", package: "1206", lcsc: "C2760272", model: "ptc",
    R: 0.15, note: "SMD1206-100C-24V; Idle ≈ Rhold niedrig", source: "BNstar / LCSC C2760272",
  },

  U1: {
    ref: "U1", kind: "IC", value: "TPS62163DSGR", package: "WSON-8", lcsc: "C97534", model: "buck",
    note: "12→5 V fest, 1 A; IQ typ 17 µA (PSM); η≈90 % @ moderate Last VIN=12 V",
    source: "TI SLVSAM2E",
  },
  U2: {
    ref: "U2", kind: "MOD", value: "DY-SV17F", package: "Modul", model: "audio",
    note: "Mode 0; BUSY LOW=Play HIGH=Ende; Idle 14 mA (Messung); Betrieb ≤60 mA (Spec); SPK extra; V33 max 80 mA",
    source: "arduino12; compacttool.ru; DY-SV17F PDF",
  },
  J5: {
    ref: "J5", kind: "CNT", value: "K07.90", package: "THT", model: "counter",
    note: "1.130.900.008 4.5 V DC / 10 Hz; P≈50 mW → Rcoil≈405 Ω; @5 V ≈12.3 mA",
    source: "Kübler K04–K07",
  },
};

/** Kübler Spulenwiderstand aus 50 mW @ 4.5 V */
export const KUEBLER_Rcoil = (4.5 * 4.5) / 0.05; // ≈405 Ω

/** Buck Effizienz grob (VIN=12, VOUT=5) */
export function buckEta(iOut: number): number {
  if (iOut < 1e-4) return 0.5;
  if (iOut < 0.01) return 0.75;
  if (iOut < 0.1) return 0.9;
  return 0.92;
}

export const U1_IQ = 17e-6; // TI typ
/**
 * DY-SV17F @5 V:
 * Idle 14 mA — Messung (LTK5128+Flash), Sleep wirkungslos
 *   https://github.com/arduino12/mp3_player_module_wire
 * Betrieb ≤60 mA — Händler-Spec
 *   https://compacttool.ru/mp3wav-pleer-dy-sv17f-s-mono-audiousilitelem-5vt
 * SPK-Last extra (SYS.Ispk_avg); V33 max 80 mA = Ausgang, nicht Iq
 */
export const U2_I_IDLE = 14e-3;
export const U2_I_PLAY = 60e-3;
