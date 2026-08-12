/**
 * Datenblatt-Parameter Vogelstimmenkasten Rev 3.0
 * Quellen: docs/datasheets/*, hardware/V3.0 (Stand 2026-08)
 */

export const SYS = {
  Vbat: 12.0,
  Iled_total: 0.08,
  /** Mittlere Lautsprecher-Last an SPK± (zusätzlich zu U2-Modulstrom); Class-D ~1 W Mittel ≈0,2 A @5 V */
  Ispk_avg: 0.12,
  track_s: 4.0,
  boot_s: 0.15,
  con3_config_s: 0.03,
  /** E-CNT-03: Rising-Edge One-Shot auf 12V_SW → Hengstler-Spule (~80 ms) */
  cnt_oneshot_s: 0.08,
};

export const PARTS = {
  R1: { ref: "R1", kind: "R", value: "100k", package: "0603", model: "ohmic", R: 100e3, note: "Q1 Gate Pull-up", source: "BOM" },
  R2: { ref: "R2", kind: "R", value: "100k", package: "0603", model: "ohmic", R: 100e3, note: "Q2 Gate Pull-down", source: "BOM" },
  R3: { ref: "R3", kind: "R", value: "10k", package: "0603", model: "ohmic", R: 10e3, note: "BUSY/CON3 Pull-down Mode 0", source: "DY-SV17F" },
  R4: { ref: "R4", kind: "R", value: "10k", package: "0603", model: "ohmic", R: 10e3, note: "Selbsthaltung", source: "E-LATCH" },
  R5: { ref: "R5", kind: "R", value: "0R", package: "0603", model: "ohmic", R: 0, note: "TPS62163 VOS direkt 5V (F-02)", source: "TI DS" },
  R12: { ref: "R12", kind: "R", value: "10", package: "0603", model: "ohmic", R: 10, note: "LED-Strombegrenzung 12V_LED (F-04)", source: "Respin" },
  R13: { ref: "R13", kind: "R", value: "100k", package: "0603", model: "ohmic", R: 100e3, note: "BUSY -> Q3_GATE RC (F-03)", source: "Respin" },
  R6: { ref: "R6", kind: "R", value: "470k", package: "0603", model: "ohmic", R: 470e3, note: "Q5 Gate->GND Idle ~12 uA", source: "E-RPP-01" },
  R7: { ref: "R7", kind: "R", value: "4.7k", package: "0603", model: "ohmic", R: 4.7e3, note: "Serie Gate Q5", source: "E-VGS-01" },
  R8: { ref: "R8", kind: "R", value: "4.7k", package: "0603", model: "ohmic", R: 4.7e3, note: "Serie Gate Q1", source: "E-VGS-01" },
  R9: { ref: "R9", kind: "R", value: "10k", package: "0603", model: "ohmic", R: 10e3, note: "Pull-up BTN_OR", source: "E-LATCH-02" },
  R10: { ref: "R10", kind: "R", value: "1k", package: "0603", model: "ohmic", R: 1e3, note: "Serie SET", source: "E-LATCH-02" },
  R11: { ref: "R11", kind: "R", value: "4.7k", package: "0603", model: "ohmic", R: 4.7e3, note: "Serie Gate Q6", source: "E-LATCH-02" },
  R20: { ref: "R20", kind: "R", value: "100k", package: "0603", lcsc: "C25803", model: "ohmic", R: 100e3, note: "One-Shot Entlade/Clamp GND (E-CNT-03)", source: "V3.0" },
  R21: { ref: "R21", kind: "R", value: "100R", package: "0603", lcsc: "C25796", model: "ohmic", R: 100, note: "One-Shot Serie Gate Q7 (E-CNT-03)", source: "V3.0" },

  C1: { ref: "C1", kind: "C", value: "10uF/25V", package: "0805", model: "cap", C: 10e-6, note: "Puffer 12V_PROT", source: "BOM" },
  C2: { ref: "C2", kind: "C", value: "10uF/25V", package: "0805", model: "cap", C: 10e-6, note: "Buck CIN", source: "TI DS" },
  C3: { ref: "C3", kind: "C", value: "22uF/10V", package: "0805", model: "cap", C: 22e-6, note: "Buck COUT", source: "TI DS" },
  C4: { ref: "C4", kind: "C", value: "4.7uF/16V", package: "0805", model: "cap", C: 4.7e-6, note: "Q3_GATE RC Blanking (F-03)", source: "Respin" },
  C20: { ref: "C20", kind: "C", value: "1uF/25V", package: "0603", lcsc: "C23630", model: "cap", C: 1e-6, note: "One-Shot Kopplung 12V_SW→CNT_PULSE (E-CNT-03)", source: "V3.0" },
  L1: { ref: "L1", kind: "L", value: "2.2uH", package: "1008", lcsc: "C88527", model: "ind", L: 2.2e-6, note: "TDK Isat~1.76A", source: "TDK" },

  D1: { ref: "D1", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO0", source: "onsemi" },
  D2: { ref: "D2", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO1", source: "onsemi" },
  D3: { ref: "D3", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO2", source: "onsemi" },
  D4: { ref: "D4", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO3", source: "onsemi" },
  D5: { ref: "D5", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO4", source: "onsemi" },
  D6: { ref: "D6", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO5", source: "onsemi" },
  D7: { ref: "D7", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO6", source: "onsemi" },
  D8: { ref: "D8", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "OR IO7", source: "onsemi" },
  D10: { ref: "D10", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Freilauf Hengstler Spule (K→12V_SW)", source: "onsemi" },
  D23: { ref: "D23", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "One-Shot Clamp CNT_PULSE→GND (E-CNT-03)", source: "V3.0" },
  D13: { ref: "D13", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "SET Steering", source: "E-LATCH-02" },
  D15: { ref: "D15", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO0_M-IO0", source: "F-01" },
  D16: { ref: "D16", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO1_M-IO1", source: "F-01" },
  D17: { ref: "D17", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO2_M-IO2", source: "F-01" },
  D18: { ref: "D18", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO3_M-IO3", source: "F-01" },
  D19: { ref: "D19", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO4_M-IO4", source: "F-01" },
  D20: { ref: "D20", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO5_M-IO5", source: "F-01" },
  D21: { ref: "D21", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO6_M-IO6", source: "F-01" },
  D22: { ref: "D22", kind: "D", value: "1N4148WS", package: "SOD-323", lcsc: "C118873", model: "diode", Vf: 0.7, Ileak: 25e-9, note: "Serie IO7_M-IO7", source: "F-01" },

  D11: { ref: "D11", kind: "Z", value: "BZX84C6V2", package: "SOT-23", lcsc: "C179522", model: "zener", Vz: 6.2, Vf: 0.7, Ileak: 0.1e-6, note: "VGS-Clamp Q5", source: "BZX84 / Nexperia" },
  D12: { ref: "D12", kind: "Z", value: "BZX84C6V2", package: "SOT-23", lcsc: "C179522", model: "zener", Vz: 6.2, Vf: 0.7, Ileak: 0.1e-6, note: "VGS-Clamp Q1", source: "BZX84" },
  D14: { ref: "D14", kind: "Z", value: "BZX84C6V2", package: "SOT-23", lcsc: "C179522", model: "zener", Vz: 6.2, Vf: 0.7, Ileak: 0.1e-6, note: "VGS-Clamp Q6", source: "BZX84" },
  D9: { ref: "D9", kind: "TVS", value: "SMAJ15A", package: "SMA", lcsc: "C113958", model: "tvs", Vz: 16.7, Ileak: 1e-6, note: "VRWM 15V, VBR 16.7-18.5, Vc 24.4V", source: "Littelfuse SMAJ" },

  Q5: { ref: "Q5", kind: "PFET", value: "SI2301CDS", package: "SOT-23", lcsc: "C10487", model: "switch_pfet", RdsOn: 0.09, VgsTh: 0.7, VgsMax: 8, VdsMax: 20, Ileak: 1e-6, note: "Verpolungsschutz RDS 90mOhm typ", source: "Vishay Si2301CDS" },
  Q1: { ref: "Q1", kind: "PFET", value: "SI2301CDS", package: "SOT-23", lcsc: "C10487", model: "switch_pfet", RdsOn: 0.09, VgsTh: 0.7, VgsMax: 8, VdsMax: 20, Ileak: 1e-6, note: "High-Side 12V_SW", source: "Vishay Si2301CDS" },
  Q6: { ref: "Q6", kind: "PFET", value: "SI2301CDS", package: "SOT-23", lcsc: "C10487", model: "switch_pfet", RdsOn: 0.09, VgsTh: 0.7, VgsMax: 8, VdsMax: 20, Ileak: 1e-6, note: "Kaltstart-SET", source: "E-LATCH-02" },
  Q2: { ref: "Q2", kind: "NFET", value: "2N7002LT1G", package: "SOT-23", lcsc: "C16338", model: "switch_nfet", RdsOn: 2.5, VgsTh: 1.5, VgsMax: 20, VdsMax: 60, Ileak: 1e-6, note: "Latch-Logik RDS max 7.5 Ohm", source: "onsemi 2N7002L" },
  Q3: { ref: "Q3", kind: "NFET", value: "2N7002LT1G", package: "SOT-23", lcsc: "C16338", model: "switch_nfet", RdsOn: 2.5, VgsTh: 1.5, VgsMax: 20, VdsMax: 60, Ileak: 1e-6, note: "BUSY Release", source: "onsemi 2N7002L" },
  Q7: { ref: "Q7", kind: "NFET", value: "AO3400", package: "SOT-23", lcsc: "C20917", model: "switch_nfet", RdsOn: 0.03, VgsTh: 0.85, VgsMax: 12, VdsMax: 30, Ileak: 1e-6, note: "One-Shot Low-Side Hengstler CNT_LO (E-CNT-03)", source: "AOS AO3400" },

  F1: { ref: "F1", kind: "PTC", value: "1A/24V", package: "1206", lcsc: "C2760272", model: "ptc", R: 0.15, note: "SMD1206-100C-24V", source: "LCSC C2760272" },
  U1: { ref: "U1", kind: "IC", value: "TPS62163DSGR", package: "WSON-8", lcsc: "C97534", model: "buck", note: "12->5V 1A, IQ typ 17uA", source: "TI SLVSAM2E" },
  U2: {
    ref: "U2", kind: "MOD", value: "DY-SV17F", package: "Modul", model: "audio",
    note: "Mode0; BUSY LOW=Play HIGH=Ende; Idle 14 mA (gemessen); Betrieb bis 60 mA (Händler); SPK-Last extra; V33 max 80 mA",
    source: "arduino12 Messwert; compacttool.ru Spec; DY-SV17F PDF",
  },
  J5: {
    ref: "J5", kind: "CNT", value: "Hengstler 0.635.128", package: "THT 4pin", model: "counter",
    note: "Typ 635.1 12V 6-digit; Spule 1860 Ohm ~80 mW; 4 Pins 15.24x25.4; One-Shot an 12V_SW",
    source: "Hengstler mini-i 634/635 DS",
  },
};

/** Hengstler 0.635.128 Spule @12 V: 1860 Ω (~80 mW) */
export const HENGSTLER_Rcoil = 1860;
/** @deprecated Alias — früher Kübler an 5 V */
export const KUEBLER_Rcoil = HENGSTLER_Rcoil;

export function buckEta(iOut) {
  if (iOut < 1e-4) return 0.5;
  if (iOut < 0.01) return 0.75;
  if (iOut < 0.1) return 0.9;
  return 0.92;
}

export const U1_IQ = 17e-6;
/**
 * DY-SV17F Ströme (5 V an V5):
 * - Idle 14 mA: Messung inkl. LTK5128 + Flash, Sleep-Befehl wirkungslos
 *   https://github.com/arduino12/mp3_player_module_wire
 * - Betrieb bis 60 mA: Händler-Spezifikation „рабочем режиме“
 *   https://compacttool.ru/mp3wav-pleer-dy-sv17f-s-mono-audiousilitelem-5vt
 * - Lautsprecher-Mittel/Peaks separat (SYS.Ispk_avg); laut Bericht Spitzen ≫60 mA möglich
 * - V33-Ausgang max. 80 mA (Modul-PDF) — nicht Versorgungsstrom
 */
export const U2_I_IDLE = 14e-3;
export const U2_I_PLAY = 60e-3;
