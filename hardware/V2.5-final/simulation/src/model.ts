/**
 * Verhaltensmodell — DC-Arbeitspunkt + Phasen (kein SPICE-Transient)
 * Diskrete Bauteile: Ohm / FET-Schalter / Diode / Zener
 * ICs: Buck, DY-SV17F, Kübler als Blöcke
 */

import {
  PARTS, SYS, KUEBLER_Rcoil, buckEta, U1_IQ, U2_I_IDLE, U2_I_PLAY, type PartSpec,
} from "./parts.js";

export type Phase =
  | "idle"
  | "set_pulse"
  | "power_up"
  | "playing"
  | "release"
  | "off_settle";

export interface NetVoltages {
  BAT: number;
  "12V_PROT": number;
  "12V_SW": number;
  "5V": number;
  GND: number;
  BTN_OR: number;
  Q6_GATE: number;
  SET_DRV: number;
  SET_PULSE: number;
  LATCH_SET: number;
  LATCH_GATE: number;
  Q1_GATE: number;
  Q5_GATE: number;
  BUSY: number;
  IO: number[];
}

export interface PartReading {
  ref: string;
  value: string;
  kind: string;
  state: string;
  V: number;
  I: number;
  P: number;
  note: string;
  ok: boolean;
  warn?: string;
}

export interface SimState {
  t: number;
  phase: Phase;
  buttons: boolean[];
  latchOn: boolean;
  playing: boolean;
  trackLeft: number;
  bootLeft: number;
  setPulseLeft: number;
  counter: number;
  lastTrigger: number | null;
  shortPressMiss: boolean;
  nets: NetVoltages;
  netI: Record<string, number>;
  parts: PartReading[];
  Ibat: number;
  message: string;
}

function fmtOk(vgs: number, max: number): boolean {
  return Math.abs(vgs) <= max + 0.05;
}

export class BoardSim {
  buttons = Array(8).fill(false) as boolean[];
  latchOn = false;
  playing = false;
  trackLeft = 0;
  bootLeft = 0;
  setPulseLeft = 0;
  counter = 0;
  t = 0;
  lastTrigger: number | null = null;
  /** Wenn true: kurzer Tastendruck vor Boot → kein Play (bekanntes Verhalten) */
  enforceShortPressMiss = true;
  heldThroughBoot = false;
  message = "Idle — Batterie an, Latch aus";

  press(i: number) {
    if (i < 0 || i > 7) return;
    this.buttons[i] = true;
    this.lastTrigger = i;
    if (!this.latchOn) {
      this.setPulseLeft = 0.05;
      this.latchOn = true;
      this.bootLeft = SYS.boot_s;
      this.playing = false;
      this.heldThroughBoot = true;
      this.message = `Taster ${i + 1}: SET → Latch AN, Boot…`;
    } else if (this.playing || this.bootLeft > 0) {
      // Retrigger / neuer Track
      if (this.bootLeft <= 0) {
        this.playing = true;
        this.trackLeft = SYS.track_s;
        this.message = `Taster ${i + 1}: Retrigger Track`;
      }
    }
  }

  release(i: number) {
    if (i < 0 || i > 7) return;
    this.buttons[i] = false;
    if (!this.buttons.some(Boolean)) {
      this.heldThroughBoot = false;
    }
  }

  tap(i: number, holdMs = 200) {
    this.press(i);
    // hold duration handled by caller via release timing; for discrete step API:
    void holdMs;
  }

  reset() {
    this.buttons.fill(false);
    this.latchOn = false;
    this.playing = false;
    this.trackLeft = 0;
    this.bootLeft = 0;
    this.setPulseLeft = 0;
    this.t = 0;
    this.lastTrigger = null;
    this.heldThroughBoot = false;
    this.message = "Reset — Idle";
  }

  /** Simulationsschritt dt [s] */
  step(dt: number): SimState {
    this.t += dt;
    if (this.setPulseLeft > 0) this.setPulseLeft = Math.max(0, this.setPulseLeft - dt);

    // Hardware: Taste gehalten + Latch aus → Q6 SET erneut (Kaltstart)
    if (!this.latchOn && this.buttons.some(Boolean)) {
      this.setPulseLeft = 0.05;
      this.latchOn = true;
      this.bootLeft = SYS.boot_s;
      this.playing = false;
      this.message = `Taste gehalten → erneutes SET (IO${(this.lastTrigger ?? 0) + 1})`;
    }

    if (this.latchOn && this.bootLeft > 0) {
      this.bootLeft = Math.max(0, this.bootLeft - dt);
      if (this.bootLeft === 0) {
        // Nach Boot: Play nur wenn Taste noch gehalten ODER Short-Press-Miss aus
        const anyHeld = this.buttons.some(Boolean);
        if (anyHeld || !this.enforceShortPressMiss) {
          this.playing = true;
          this.trackLeft = SYS.track_s;
          this.message = `Boot fertig → Play IO${(this.lastTrigger ?? 0) + 1}`;
        } else {
          this.playing = false;
          this.message = "Boot fertig, Taste weg → kein Play; BUSY=HIGH löst Latch (Kurzdruck)";
        }
      }
    }

    if (this.playing) {
      this.trackLeft = Math.max(0, this.trackLeft - dt);
      if (this.trackLeft === 0) {
        this.playing = false;
        this.message = "Track Ende → BUSY HIGH → Release";
      }
    }

    const snap = this.solve();

    // Release: BUSY high while powered and not playing and boot done → Q3 on → latch off
    if (this.latchOn && this.bootLeft <= 0 && !this.playing && snap.nets.BUSY > 2.0) {
      this.latchOn = false;
      this.setPulseLeft = 0;
      this.counter += 1; // Zähler hat während 5V-Pulse gezählt
      this.message = "Latch AUS (BUSY Release) — Zähler +1";
      return this.solve();
    }

    return snap;
  }

  private phase(): Phase {
    if (!this.latchOn && this.setPulseLeft <= 0) return "idle";
    if (this.setPulseLeft > 0 && this.bootLeft > SYS.boot_s - 0.02) return "set_pulse";
    if (this.latchOn && this.bootLeft > 0) return "power_up";
    if (this.playing) return "playing";
    if (this.latchOn && !this.playing) return "release";
    return "off_settle";
  }

  solve(): SimState {
    const Vbat = SYS.Vbat;
    const anyBtn = this.buttons.some(Boolean);
    const setPulse = this.setPulseLeft > 0 || (anyBtn && !this.latchOn);

    // --- Q5 Verpolungsschutz immer an bei richtiger Polung ---
    // Gate-Teiler: D11 clamp 6.2V, R7+R6 nach GND
    // Strom durch R6: (Vbat - Vz) fließt nicht durch R6 direkt…
    // Pfad: Source=Vbat, Zener K=Source A=Gate → V_G = Vbat - Vz = 5.8 V
    // Dann R7 von Gate nach R6-Knoten, R6 nach GND.
    // Genauer Idle-Pfad ohne Last: Strom I = V_G / (R7+R6) ≈ 5.8/(4.7k+470k) ≈ 12.2 µA
    // Aber Design-Doku: I ≈ Vbat/R6 wenn Gate≈0 ohne Zener; MIT Zener Gate≈Vbat-6.2
    const Vz = PARTS.D11.Vz!;
    const R6 = PARTS.R6.R!;
    const R7 = PARTS.R7.R!;
    const Vq5g = Vbat - Vz; // ≈5.8 V
    const I_r6 = Vq5g / (R6 + R7);
    const V_r6_node = I_r6 * R6;
    // eigentliches Gate liegt über R7 am Zener-Knoten ≈ Vq5g
    const Vgs_q5 = Vq5g - Vbat; // ≈ -6.2 V
    const q5_on = Math.abs(Vgs_q5) > PARTS.Q5.VgsTh!;
    const Vprot = q5_on ? Vbat - I_r6 * (PARTS.Q5.RdsOn! + PARTS.F1.R!) : 0;

    // BTN_OR
    let VbtnOr = Vprot;
    let I_r9 = 0;
    let I_dio = 0;
    if (anyBtn && Vprot > 0) {
      // Diode nach GND über Taster: BTN_OR ≈ Vf
      VbtnOr = PARTS.D1.Vf!;
      I_r9 = (Vprot - VbtnOr) / PARTS.R9.R!;
      I_dio = I_r9; // vereinfacht eine Diode führt
    } else if (Vprot > 0) {
      VbtnOr = Vprot;
      I_r9 = 0;
    }

    // Q6 Gate: R11 von BTN_OR, D14 Clamp Source=12V_PROT
    let Vq6g = VbtnOr;
    let I_r11 = 0;
    let I_d14 = 0;
    if (Vprot > 0) {
      if (anyBtn) {
        // Gate gezogen Richtung BTN_OR (≈0.7), Source=Vprot → |VGS| groß, Clamp greift
        // Teiler/Clamp: Gate ≈ Vprot - Vz
        Vq6g = Vprot - Vz;
        I_d14 = (Vprot - Vz - VbtnOr) / PARTS.R11.R!;
        I_r11 = I_d14;
      } else {
        Vq6g = Vprot; // VGS≈0
        I_r11 = 0;
      }
    }
    const Vgs_q6 = Vq6g - Vprot;
    const q6_on = Vprot > 0 && Vgs_q6 < -PARTS.Q6.VgsTh!;

    // SET path
    let VsetDrv = 0;
    let VsetPulse = 0;
    let VlatchSet = 0;
    let I_r10 = 0;
    let I_r4 = 0;
    let I_r2 = 0;
    let I_d13 = 0;

    const Vsw_guess = this.latchOn && q5_on ? Vprot : 0;

    // Latch hold / set
    if (q6_on && (this.setPulseLeft > 0 || anyBtn)) {
      VsetDrv = Vprot;
      VsetPulse = Vprot; // R10 klein
      VlatchSet = Vprot - PARTS.D13.Vf!;
      I_r10 = 0.001; // Gate-Ladung vernachlässigbar im DC
      I_d13 = I_r10;
    }

    // Hold über R4 wenn 12V_SW und Latch „soll an“
    // Release über Q3 wenn BUSY high
    let Vbusy = 0;
    if (this.latchOn && Vsw_guess > 0) {
      if (this.bootLeft > SYS.boot_s - SYS.con3_config_s) {
        Vbusy = 0; // Config-Fenster, R3 pull-down
      } else if (this.bootLeft > 0) {
        Vbusy = 0; // noch Boot, als LOW modelliert
      } else if (this.playing) {
        Vbusy = 0; // DS: LOW während Play
      } else {
        Vbusy = 3.3; // DS: HIGH nach Ende / Idle powered
      }
    }

    const q3_on = Vbusy > PARTS.Q3.VgsTh!;
    if (q3_on) {
      VlatchSet = 0;
      I_r2 = 0;
      if (Vsw_guess > 0) I_r4 = Vsw_guess / PARTS.R4.R!;
    } else if (this.latchOn && Vsw_guess > 0) {
      // Hold: R4 zieht LATCH_SET hoch, R2 nach GND
      const R4 = PARTS.R4.R!;
      const R2 = PARTS.R2.R!;
      VlatchSet = Vsw_guess * (R2 / (R4 + R2));
      // genauer: R4 von SW nach SET, R2 SET nach GND → V = SW * R2/(R4+R2) ≈ 10.9 V bei 12 V
      VlatchSet = Vsw_guess * (R2 / (R4 + R2));
      I_r4 = (Vsw_guess - VlatchSet) / R4;
      I_r2 = VlatchSet / R2;
    } else if (VlatchSet > 0) {
      I_r2 = VlatchSet / PARTS.R2.R!;
    }

    const q2_on = VlatchSet > PARTS.Q2.VgsTh!;

    // Q1 Gate
    let Vq1g = Vprot;
    let I_r1 = 0;
    let I_r8 = 0;
    let I_d12 = 0;
    if (Vprot > 0) {
      if (q2_on) {
        // Q2 zieht über R8 Richtung GND, D12 clamp
        Vq1g = Vprot - Vz;
        I_d12 = (Vprot - Vz) / PARTS.R8.R!; // vereinfacht Strom durch R8→Q2
        I_r8 = I_d12;
        I_r1 = (Vprot - Vq1g) / PARTS.R1.R!;
      } else {
        Vq1g = Vprot;
        I_r1 = 0;
      }
    }
    const Vgs_q1 = Vq1g - Vprot;
    const q1_on = this.latchOn && q2_on && Vgs_q1 < -PARTS.Q1.VgsTh!;

    const Vsw = q1_on ? Vprot - 0.01 : 0;

    // 5V Buck + Lasten
    let V5 = 0;
    let I5 = 0;
    let I_u1_in = 0;
    let I_kuebler = 0;
    let I_u2 = 0;
    let I_led = 0;
    let I_spk = 0;

    if (Vsw > 0) {
      I_led = SYS.Iled_total;
      if (this.bootLeft <= 0) {
        I_kuebler = 5.0 / KUEBLER_Rcoil;
        if (this.playing) {
          I_u2 = U2_I_PLAY;
          I_spk = SYS.Ispk_avg;
        } else {
          I_u2 = U2_I_IDLE;
        }
      } else {
        // während Boot noch geringe Last
        I_u2 = U2_I_IDLE * 0.5;
      }
      I5 = I_kuebler + I_u2 + I_spk;
      V5 = 5.0;
      const eta = buckEta(I5);
      I_u1_in = I5 > 0 ? (V5 * I5) / (Vsw * eta) + U1_IQ : U1_IQ;
    }

    // Batteriestrom
    const I_q1 = q1_on ? I_u1_in + I_led + I_r4 + I_r1 + I_r8 : 0;
    const I_latch_idle = I_r9 + I_r11 + I_d14;
    const Ibat = I_r6 + I_latch_idle + I_q1 + (PARTS.D9.Ileak ?? 0);

    const IO = this.buttons.map((b) => (b ? 0 : (V5 > 0 ? 3.3 : Vprot > 0 ? 0 : 0)));
    // IO pull-up internal only when module powered
    for (let i = 0; i < 8; i++) {
      if (!this.buttons[i]) IO[i] = V5 > 0 ? 3.3 : 0;
    }

    const nets: NetVoltages = {
      BAT: Vbat,
      "12V_PROT": Vprot,
      "12V_SW": Vsw,
      "5V": V5,
      GND: 0,
      BTN_OR: VbtnOr,
      Q6_GATE: Vq6g,
      SET_DRV: VsetDrv,
      SET_PULSE: VsetPulse,
      LATCH_SET: VlatchSet,
      LATCH_GATE: q2_on ? 0.05 : Vprot,
      Q1_GATE: Vq1g,
      Q5_GATE: Vq5g,
      BUSY: Vbusy,
      IO,
    };

    const Ibusy = Vbusy > 0 ? Vbusy / PARTS.R3.R! : 0;
    const netI: Record<string, number> = {
      "/BAT+": Ibat,
      "/12V_PROT": I_q1 + I_r6 + I_latch_idle,
      "/RPP_OUT": Ibat,
      "/12V_SW": I_q1,
      "/5V": I5,
      "/GND": Ibat,
      "/BTN_OR": I_r9,
      "/Q6_GATE": I_r11,
      "/SET_DRV": I_r10,
      "/SET_PULSE": I_r10,
      "/LATCH_SET": Math.max(I_r2, I_r4, I_d13),
      "/LATCH_GATE": I_r8,
      "/Q1_GATE": Math.max(I_r1, I_r8),
      "/Q5_GATE": I_r6,
      "/Q5_G_PD": I_r6,
      "/BUSY": Ibusy,
      "/SW": I5,
      "/VOS": 0,
      "/V33": V5 > 0 ? 0.5e-3 : 0,
      "/SPK+": I_spk,
      "/SPK-": I_spk,
    };
    for (let i = 0; i < 8; i++) {
      netI[`/IO${i}`] = this.buttons[i] ? I_dio : 0;
    }

    const parts = this.buildParts(nets, {
      I_r6, I_r7: I_r6, I_r9, I_r11, I_r10, I_r1, I_r2, I_r3: Ibusy,
      I_r4, I_r5: V5 > 0 ? 0 : 0, I_r8, I_d14, I_d12, I_d13, I_dio,
      I_q5: Ibat - (PARTS.D9.Ileak ?? 0), I_q1, I_q6: I_r10,
      I_q2: I_r8, I_q3: q3_on ? I_r4 : 0,
      I_u1_in, I5, I_kuebler, I_u2, I_led, I_spk, I_f1: Ibat,
      q5_on, q1_on, q6_on, q2_on, q3_on,
      Vgs_q5, Vgs_q1, Vgs_q6,
    });

    return {
      t: this.t,
      phase: this.phase(),
      buttons: [...this.buttons],
      latchOn: this.latchOn,
      playing: this.playing,
      trackLeft: this.trackLeft,
      bootLeft: this.bootLeft,
      setPulseLeft: this.setPulseLeft,
      counter: this.counter,
      lastTrigger: this.lastTrigger,
      shortPressMiss: this.enforceShortPressMiss,
      nets,
      netI,
      parts,
      Ibat,
      message: this.message,
    };
  }

  private buildParts(
    nets: NetVoltages,
    x: Record<string, number | boolean>,
  ): PartReading[] {
    const out: PartReading[] = [];
    const add = (
      ref: string,
      V: number,
      I: number,
      state: string,
      ok = true,
      warn?: string,
    ) => {
      const p = PARTS[ref] as PartSpec | undefined;
      out.push({
        ref,
        value: p?.value ?? ref,
        kind: p?.kind ?? "?",
        state,
        V,
        I,
        P: Math.abs(V * I),
        note: p?.note ?? "",
        ok,
        warn,
      });
    };

    add("R6", nets.Q5_GATE, x.I_r6 as number, "Idle-Pfad Gate", true);
    add("R7", nets.Q5_GATE - (x.I_r6 as number) * PARTS.R6.R!, x.I_r7 as number, "Serie Gate Q5");
    add("R9", nets["12V_PROT"] - nets.BTN_OR, x.I_r9 as number, x.I_r9 ? "Taster aktiv" : "Idle 0 A");
    add("R11", Math.abs(nets.BTN_OR - nets.Q6_GATE), x.I_r11 as number, "Serie Gate Q6");
    add("R10", Math.abs(nets.SET_DRV - nets.SET_PULSE), x.I_r10 as number, "SET Serie");
    add("R1", nets["12V_PROT"] - nets.Q1_GATE, x.I_r1 as number, "Pull-up Q1");
    add("R2", nets.LATCH_SET, x.I_r2 as number, "Pull-down Q2");
    add("R3", nets.BUSY, x.I_r3 as number, "BUSY Pull-down");
    add("R4", nets["12V_SW"] - nets.LATCH_SET, x.I_r4 as number, "Hold");
    add("R5", nets["5V"], 0, "VOS Sense ≈0 DC");
    add("R8", nets.Q1_GATE, x.I_r8 as number, "Serie Gate Q1");

    add("D11", PARTS.D11.Vz!, x.I_r6 as number, `Clamp VGS=${(x.Vgs_q5 as number).toFixed(2)} V`,
      fmtOk(x.Vgs_q5 as number, PARTS.Q5.VgsMax!));
    add("D12", PARTS.D12.Vz!, x.I_d12 as number, `Clamp VGS=${(x.Vgs_q1 as number).toFixed(2)} V`,
      fmtOk(x.Vgs_q1 as number, PARTS.Q1.VgsMax!));
    add("D14", PARTS.D14.Vz!, x.I_d14 as number, `Clamp VGS=${(x.Vgs_q6 as number).toFixed(2)} V`,
      fmtOk(x.Vgs_q6 as number, PARTS.Q6.VgsMax!));
    add("D9", nets["12V_PROT"], PARTS.D9.Ileak!, "TVS Leckage", true);
    add("D13", PARTS.D13.Vf!, x.I_d13 as number, "SET Steering");
    add("D10", nets["5V"], 0, "Freilauf (Ruhe)");

    for (let i = 1; i <= 8; i++) {
      const on = this.buttons[i - 1];
      add(`D${i}`, on ? PARTS.D1.Vf! : 0, on ? (x.I_dio as number) : 0, on ? "leitet" : "sperrt");
    }

    add("Q5", nets.BAT - nets["12V_PROT"], x.I_q5 as number, x.q5_on ? "EIN" : "AUS",
      fmtOk(x.Vgs_q5 as number, PARTS.Q5.VgsMax!),
      Math.abs(x.Vgs_q5 as number) > PARTS.Q5.VgsMax! ? "|VGS|>8 V!" : undefined);
    add("Q1", nets["12V_PROT"] - nets["12V_SW"], x.I_q1 as number, x.q1_on ? "EIN" : "AUS",
      fmtOk(x.Vgs_q1 as number, PARTS.Q1.VgsMax!));
    add("Q6", nets["12V_PROT"] - nets.SET_DRV, x.I_q6 as number, x.q6_on ? "EIN (SET)" : "AUS");
    add("Q2", nets.LATCH_GATE, x.I_q2 as number, x.q2_on ? "EIN" : "AUS");
    add("Q3", nets.LATCH_SET, x.I_q3 as number, x.q3_on ? "Release" : "AUS");

    add("F1", (x.I_f1 as number) * PARTS.F1.R!, x.I_f1 as number, "PTC");
    add("C1", nets["12V_PROT"], 0, "DC geladen");
    add("C2", nets["12V_SW"], 0, "DC geladen");
    add("C3", nets["5V"], 0, "DC geladen");
    add("L1", nets["5V"], x.I5 as number, "Buck SW→5V (Mittel)");

    add("U1", nets["12V_SW"] - nets["5V"], x.I_u1_in as number,
      nets["5V"] > 0 ? `Buck η≈${(buckEta(x.I5 as number) * 100).toFixed(0)} %` : "aus");
    add("U2", nets["5V"], x.I_u2 as number,
      this.playing ? "PLAY" : nets["5V"] > 0 ? "Idle powered" : "aus");
    add(
      "J5",
      nets["5V"],
      x.I_kuebler as number,
      nets["5V"] > 0 ? `Spule ${((x.I_kuebler as number) * 1e3).toFixed(1)} mA` : "aus",
    );

    add("J6", nets["12V_SW"], x.I_led as number, x.I_led ? "LEDs an" : "aus");

    return out.sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));
  }
}
