/**
 * Verhaltensmodell — DC-Arbeitspunkt + Phasen
 */
import {
  PARTS, SYS, HENGSTLER_Rcoil, buckEta, U1_IQ, U2_I_IDLE, U2_I_PLAY,
} from "./parts.js";
import { META } from "./catalog.js";

function fmtOk(vgs, max) {
  return Math.abs(vgs) <= max + 0.05;
}

export class BoardSim {
  constructor() {
    this.buttons = Array(8).fill(false);
    this.latchOn = false;
    this.playing = false;
    this.trackLeft = 0;
    this.bootLeft = 0;
    this.setPulseLeft = 0;
    this.cntPulseLeft = 0;
    this.counter = 0;
    this.t = 0;
    this.lastTrigger = null;
    this.enforceShortPressMiss = true;
    this.heldThroughBoot = false;
    this.q3GateV = 0;
    this.message = "Idle — Batterie an, Latch aus";
  }

  press(i) {
    if (i < 0 || i > 7) return;
    this.buttons[i] = true;
    this.lastTrigger = i;
    if (!this.latchOn) {
      this.setPulseLeft = 0.05;
      this.latchOn = true;
      this.bootLeft = SYS.boot_s;
      this.playing = false;
      this.heldThroughBoot = true;
      this.cntPulseLeft = SYS.cnt_oneshot_s;
      this.counter += 1;
      this.message = `Taster ${i + 1}: SET → Latch AN, One-Shot Zähler +1, Boot…`;
    } else if (this.bootLeft <= 0) {
      this.playing = true;
      this.trackLeft = SYS.track_s;
      this.message = `Taster ${i + 1}: Retrigger Track`;
    }
  }

  release(i) {
    if (i < 0 || i > 7) return;
    this.buttons[i] = false;
    if (!this.buttons.some(Boolean)) this.heldThroughBoot = false;
  }

  reset() {
    this.buttons.fill(false);
    this.latchOn = false;
    this.playing = false;
    this.trackLeft = 0;
    this.bootLeft = 0;
    this.setPulseLeft = 0;
    this.cntPulseLeft = 0;
    this.t = 0;
    this.lastTrigger = null;
    this.heldThroughBoot = false;
    this.q3GateV = 0;
    this.message = "Reset — Idle";
  }

  step(dt) {
    this.t += dt;
    if (this.setPulseLeft > 0) this.setPulseLeft = Math.max(0, this.setPulseLeft - dt);
    if (this.cntPulseLeft > 0) this.cntPulseLeft = Math.max(0, this.cntPulseLeft - dt);

    // Hardware: Taste gehalten + Latch aus → Q6 SET erneut (Kaltstart)
    if (!this.latchOn && this.buttons.some(Boolean)) {
      this.setPulseLeft = 0.05;
      this.latchOn = true;
      this.bootLeft = SYS.boot_s;
      this.playing = false;
      this.cntPulseLeft = SYS.cnt_oneshot_s;
      this.counter += 1;
      this.message = `Taste gehalten → erneutes SET + Zähler +1 (IO${(this.lastTrigger ?? 0) + 1})`;
    }

    if (this.latchOn && this.bootLeft > 0) {
      this.bootLeft = Math.max(0, this.bootLeft - dt);
      if (this.bootLeft === 0) {
        const anyHeld = this.buttons.some(Boolean);
        if (anyHeld || !this.enforceShortPressMiss) {
          this.playing = true;
          this.trackLeft = SYS.track_s;
          this.message = `Boot fertig → Play IO${(this.lastTrigger ?? 0) + 1}`;
        } else {
          this.playing = false;
          this.message = "Boot fertig, Taste weg → kein Play; BUSY=HIGH löst Latch";
        }
      }
    }

    if (this.playing) {
      this.trackLeft = Math.max(0, this.trackLeft - dt);
      if (this.trackLeft === 0) {
        this.playing = false;
        this.message = "Track Ende → BUSY HIGH → Release (RC ~470 ms)";
      }
    }

    const VbusyTarget = this.busyTarget();
    const tau = (PARTS.R13?.R ?? 100e3) * (PARTS.C4?.C ?? 4.7e-6);
    this.q3GateV += (VbusyTarget - this.q3GateV) * Math.min(1, dt / Math.max(tau, 1e-6));

    let snap = this.solve();
    if (this.latchOn && this.bootLeft <= 0 && !this.playing && this.q3GateV > PARTS.Q3.VgsTh) {
      this.latchOn = false;
      this.setPulseLeft = 0;
      this.cntPulseLeft = 0;
      this.message = "Latch AUS (BUSY Release) — Spule bereits gezählt";
      snap = this.solve();
    }
    return snap;
  }

  phase() {
    if (!this.latchOn && this.setPulseLeft <= 0) return "idle";
    if (this.cntPulseLeft > 0) return "cnt_pulse";
    if (this.setPulseLeft > 0 && this.bootLeft > SYS.boot_s - 0.02) return "set_pulse";
    if (this.latchOn && this.bootLeft > 0) return "power_up";
    if (this.playing) return "playing";
    if (this.latchOn && !this.playing) return "release";
    return "off_settle";
  }

  busyTarget() {
    if (!this.latchOn) return 0;
    if (this.bootLeft > 0) return 0;
    if (this.playing) return 0;
    return 3.3;
  }

  solve() {
    const Vbat = SYS.Vbat;
    const anyBtn = this.buttons.some(Boolean);
    const Vz = PARTS.D11.Vz;
    const R6 = PARTS.R6.R;
    const R7 = PARTS.R7.R;

    const Vq5g = Vbat - Vz;
    const I_r6 = Vq5g / (R6 + R7);
    const Vgs_q5 = Vq5g - Vbat;
    const q5_on = Math.abs(Vgs_q5) > PARTS.Q5.VgsTh;
    const Vprot = q5_on ? Vbat - I_r6 * (PARTS.Q5.RdsOn + PARTS.F1.R) : 0;

    let VbtnOr = Vprot;
    let I_r9 = 0;
    let I_dio = 0;
    if (anyBtn && Vprot > 0) {
      VbtnOr = PARTS.D1.Vf;
      I_r9 = (Vprot - VbtnOr) / PARTS.R9.R;
      I_dio = I_r9;
    }

    let Vq6g = Vprot;
    let I_r11 = 0;
    let I_d14 = 0;
    if (Vprot > 0 && anyBtn) {
      Vq6g = Vprot - Vz;
      I_d14 = Math.max(0, (Vprot - Vz - VbtnOr) / PARTS.R11.R);
      I_r11 = I_d14;
    }
    const Vgs_q6 = Vq6g - Vprot;
    const q6_on = Vprot > 0 && Vgs_q6 < -PARTS.Q6.VgsTh;

    let VsetDrv = 0;
    let VsetPulse = 0;
    let VlatchSet = 0;
    let I_r10 = 0;
    let I_r4 = 0;
    let I_r2 = 0;
    let I_d13 = 0;

    const Vsw_guess = this.latchOn && q5_on ? Vprot : 0;

    if (q6_on && (this.setPulseLeft > 0 || anyBtn)) {
      VsetDrv = Vprot;
      VsetPulse = Vprot;
      VlatchSet = Vprot - PARTS.D13.Vf;
      I_r10 = 0.001;
      I_d13 = I_r10;
    }

    let Vbusy = 0;
    if (this.latchOn && Vsw_guess > 0) {
      Vbusy = this.busyTarget();
    }

    const q3_on = this.q3GateV > PARTS.Q3.VgsTh;
    if (q3_on) {
      VlatchSet = 0;
      if (Vsw_guess > 0) I_r4 = Vsw_guess / PARTS.R4.R;
    } else if (this.latchOn && Vsw_guess > 0) {
      const R4 = PARTS.R4.R;
      const R2 = PARTS.R2.R;
      VlatchSet = Vsw_guess * (R2 / (R4 + R2));
      I_r4 = (Vsw_guess - VlatchSet) / R4;
      I_r2 = VlatchSet / R2;
    } else if (VlatchSet > 0) {
      I_r2 = VlatchSet / PARTS.R2.R;
    }

    const q2_on = VlatchSet > PARTS.Q2.VgsTh;

    let Vq1g = Vprot;
    let I_r1 = 0;
    let I_r8 = 0;
    let I_d12 = 0;
    if (Vprot > 0 && q2_on) {
      Vq1g = Vprot - Vz;
      I_d12 = (Vprot - Vz) / PARTS.R8.R;
      I_r8 = I_d12;
      I_r1 = (Vprot - Vq1g) / PARTS.R1.R;
    }
    const Vgs_q1 = Vq1g - Vprot;
    const q1_on = this.latchOn && q2_on && Vgs_q1 < -PARTS.Q1.VgsTh;
    const Vsw = q1_on ? Vprot - 0.01 : 0;

    let V5 = 0;
    let I5 = 0;
    let I_u1_in = 0;
    let I_cnt = 0;
    let I_u2 = 0;
    let I_led = 0;
    let I_spk = 0;
    const q7_on = this.cntPulseLeft > 0 && Vsw > 0;
    const VcntGate = q7_on ? Math.min(12, Vsw) : 0;
    const VcntLo = q7_on ? 0.05 : (Vsw > 0 ? Vsw : 0);
    const VcntPulse = q7_on ? VcntGate : 0;

    if (Vsw > 0) {
      I_led = SYS.Iled_total;
      // E-CNT-03: Spule nur während One-Shot (~80 ms) an 12V_SW, nicht Dauer an 5V
      if (q7_on) {
        I_cnt = Vsw / HENGSTLER_Rcoil;
      }
      if (this.bootLeft <= 0) {
        if (this.playing) {
          I_u2 = U2_I_PLAY;
          I_spk = SYS.Ispk_avg;
        } else {
          I_u2 = U2_I_IDLE;
        }
      } else {
        I_u2 = U2_I_IDLE * 0.5;
      }
      I5 = I_u2 + I_spk;
      V5 = 5.0;
      const eta = buckEta(I5);
      I_u1_in = I5 > 0 ? (V5 * I5) / (Vsw * eta) + U1_IQ : U1_IQ;
    }

    const I_q1 = q1_on ? I_u1_in + I_led + I_r4 + I_r1 + I_r8 + I_cnt : 0;
    const I_latch_idle = I_r9 + I_r11 + I_d14;
    const Ibat = I_r6 + I_latch_idle + I_q1 + (PARTS.D9.Ileak || 0);
    const I_gnd_return = Ibat; // Gesamtrückfluss über GND

    const IO = [];
    for (let i = 0; i < 8; i++) {
      IO[i] = this.buttons[i] ? 0 : (V5 > 0 ? 3.3 : 0);
    }

    const nets = {
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
      Q3_GATE: this.q3GateV,
      BUSY: Vbusy,
      CNT_PULSE: VcntPulse,
      CNT_GATE: VcntGate,
      CNT_LO: VcntLo,
      IO,
    };

    const Ibusy = Vbusy > 0 ? Vbusy / (PARTS.R13?.R ?? 100e3) : 0;
    const I_r13 = Ibusy;
    const V12led = Vsw > 0 ? Math.max(0, Vsw - I_led * PARTS.R12.R) : 0;
    const netI = {
      "/BAT+": Ibat,
      "/12V_PROT": I_q1 + I_r6 + I_latch_idle,
      "/RPP_OUT": Ibat,
      "/12V_SW": I_q1,
      "/12V_LED": I_led,
      "/5V": I5,
      "/GND": I_gnd_return,
      "/BTN_OR": I_r9,
      "/Q6_GATE": I_r11,
      "/SET_DRV": I_r10,
      "/SET_PULSE": I_r10,
      "/LATCH_SET": Math.max(I_r2, I_r4, I_d13),
      "/LATCH_GATE": I_r8,
      "/Q1_GATE": Math.max(I_r1, I_r8),
      "/Q5_GATE": I_r6,
      "/Q5_G_PD": I_r6,
      "/Q3_GATE": Ibusy,
      "/BUSY": Ibusy,
      "/SW": I5,
      "/CNT_PULSE": q7_on ? (VcntPulse / (PARTS.R20?.R ?? 100e3)) : 0,
      "/CNT_GATE": q7_on ? 0.1e-3 : 0,
      "/CNT_LO": I_cnt,
      "/VOS": 0,
      "/V33": V5 > 0 ? 0.5e-3 : 0,
      "/SPK+": I_spk,
      "/SPK-": I_spk,
    };
    for (let i = 0; i < 8; i++) {
      netI[`/IO${i}`] = this.buttons[i] ? I_dio : 0;
      netI[`/IO${i}_M`] = this.buttons[i] ? I_dio : 0;
    }

    const x = {
      I_r6, I_r7: I_r6, I_r9, I_r11, I_r10, I_r1, I_r2,
      I_r3: Vbusy > 0 ? Vbusy / PARTS.R3.R : 0,
      I_r4, I_r8, I_r13, I_d14, I_d12, I_d13, I_dio,
      I_q5: Ibat - (PARTS.D9.Ileak || 0), I_q1, I_q6: I_r10,
      I_q2: I_r8, I_q3: q3_on ? I_r4 : 0,
      I_q7: I_cnt, I_u1_in, I5, I_cnt, I_u2, I_led, I_spk, I_f1: Ibat,
      V12led, VcntGate, VcntLo, VcntPulse,
      q5_on, q1_on, q6_on, q2_on, q3_on, q7_on,
      Vgs_q5, Vgs_q1, Vgs_q6,
    };

    return {
      t: this.t,
      phase: this.phase(),
      buttons: [...this.buttons],
      latchOn: this.latchOn,
      playing: this.playing,
      trackLeft: this.trackLeft,
      bootLeft: this.bootLeft,
      setPulseLeft: this.setPulseLeft,
      cntPulseLeft: this.cntPulseLeft,
      counter: this.counter,
      lastTrigger: this.lastTrigger,
      shortPressMiss: this.enforceShortPressMiss,
      nets,
      netI,
      parts: this.buildParts(nets, x),
      Ibat,
      message: this.message,
    };
  }

  buildParts(nets, x) {
    const out = [];
    const add = (ref, V, I, state, ok = true, warn, extra = {}) => {
      const p = PARTS[ref];
      const meta = META[ref];
      out.push({
        ref,
        value: p?.value ?? meta?.role?.slice(0, 24) ?? ref,
        kind: p?.kind ?? meta?.kind ?? "?",
        state,
        V,
        I,
        P: Math.abs(V * I),
        note: p?.note ?? "",
        ok,
        warn,
        block: meta?.block ?? null,
        role: meta?.role ?? p?.note ?? "",
        Vgs: extra.Vgs,
      });
    };

    add("R6", nets.Q5_GATE, x.I_r6, "Idle-Pfad Gate");
    add("R7", nets.Q5_GATE - x.I_r6 * PARTS.R6.R, x.I_r7, "Serie Gate Q5");
    add("R9", nets["12V_PROT"] - nets.BTN_OR, x.I_r9, x.I_r9 ? "Taster aktiv" : "Idle 0 A");
    add("R11", Math.abs(nets.BTN_OR - nets.Q6_GATE), x.I_r11, "Serie Gate Q6");
    add("R10", Math.abs(nets.SET_DRV - nets.SET_PULSE), x.I_r10, "SET Serie");
    add("R1", nets["12V_PROT"] - nets.Q1_GATE, x.I_r1, "Pull-up Q1");
    add("R2", nets.LATCH_SET, x.I_r2, "Pull-down Q2");
    add("R3", nets.BUSY, x.I_r3, "BUSY Pull-down");
    add("R4", nets["12V_SW"] - nets.LATCH_SET, x.I_r4, "Hold");
    add("R5", nets["5V"], 0, "VOS direkt 5V (0 Ω)");
    add("R8", nets.Q1_GATE, x.I_r8, "Serie Gate Q1");
    add("R12", nets["12V_SW"] - x.V12led, x.I_led, x.I_led ? "LED-Strombegrenzung" : "Idle");
    add("R13", nets.BUSY - nets.Q3_GATE, x.I_r13, nets.BUSY > 0 ? "BUSY → Q3_GATE" : "Idle");

    add("D11", PARTS.D11.Vz, x.I_r6, `Clamp VGS=${x.Vgs_q5.toFixed(2)} V`, fmtOk(x.Vgs_q5, PARTS.Q5.VgsMax), undefined, { Vgs: x.Vgs_q5 });
    add("D12", PARTS.D12.Vz, x.I_d12, `Clamp VGS=${x.Vgs_q1.toFixed(2)} V`, fmtOk(x.Vgs_q1, PARTS.Q1.VgsMax), undefined, { Vgs: x.Vgs_q1 });
    add("D14", PARTS.D14.Vz, x.I_d14, `Clamp VGS=${x.Vgs_q6.toFixed(2)} V`, fmtOk(x.Vgs_q6, PARTS.Q6.VgsMax), undefined, { Vgs: x.Vgs_q6 });
    add("D9", nets["12V_PROT"], PARTS.D9.Ileak, "TVS Leckage");
    add("D13", PARTS.D13.Vf, x.I_d13, "SET Steering");
    add("D10", nets["12V_SW"], x.I_cnt > 0 ? 0 : 0, x.q7_on ? "Freilauf bereit" : "Freilauf (Ruhe)");
    add("D23", nets.CNT_PULSE, x.q7_on ? nets.CNT_PULSE / (PARTS.R20?.R ?? 100e3) : 0, x.q7_on ? "Clamp aktiv" : "Idle");

    for (let i = 1; i <= 8; i++) {
      const on = this.buttons[i - 1];
      add(`D${i}`, on ? PARTS.D1.Vf : 0, on ? x.I_dio : 0, on ? "leitet" : "sperrt");
      add(`D${i + 14}`, on ? PARTS.D15.Vf : 0, on ? x.I_dio : 0, on ? "Serie leitet" : "sperrt");
    }

    add("Q5", nets.BAT - nets["12V_PROT"], x.I_q5, x.q5_on ? "EIN" : "AUS", fmtOk(x.Vgs_q5, PARTS.Q5.VgsMax), undefined, { Vgs: x.Vgs_q5 });
    add("Q1", nets["12V_PROT"] - nets["12V_SW"], x.I_q1, x.q1_on ? "EIN" : "AUS", fmtOk(x.Vgs_q1, PARTS.Q1.VgsMax), undefined, { Vgs: x.Vgs_q1 });
    add("Q6", nets["12V_PROT"] - nets.SET_DRV, x.I_q6, x.q6_on ? "EIN (SET)" : "AUS", fmtOk(x.Vgs_q6, PARTS.Q6.VgsMax), undefined, { Vgs: x.Vgs_q6 });
    add("Q2", nets.LATCH_GATE, x.I_q2, x.q2_on ? "EIN" : "AUS");
    add("Q3", nets.Q3_GATE, x.I_q3, x.q3_on ? "Release" : "AUS");
    add("Q7", nets.CNT_GATE, x.I_q7, x.q7_on ? `One-Shot EIN ${(this.cntPulseLeft * 1e3).toFixed(0)} ms` : "AUS");

    add("F1", x.I_f1 * PARTS.F1.R, x.I_f1, "PTC");
    add("C1", nets["12V_PROT"], 0, "DC geladen");
    add("C2", nets["12V_SW"], 0, "DC geladen");
    add("C3", nets["5V"], 0, "DC geladen");
    add("C4", nets.Q3_GATE, 0, this.q3GateV > 0.1 ? `RC ${(this.q3GateV).toFixed(2)} V` : "entladen");
    add("C20", nets["12V_SW"] - nets.CNT_PULSE, x.q7_on ? 0.01e-3 : 0, x.q7_on ? "Rising-Edge kopiert" : "Ruhe");
    add("L1", nets["5V"], x.I5, "Buck Mittelstrom");
    add("R20", nets.CNT_PULSE, x.q7_on ? nets.CNT_PULSE / PARTS.R20.R : 0, "One-Shot Entlade");
    add("R21", Math.abs(nets.CNT_PULSE - nets.CNT_GATE), x.q7_on ? 0.1e-3 : 0, "Serie Gate Q7");

    add("U1", nets["12V_SW"] > 0 ? nets["12V_SW"] : 0, x.I_u1_in, nets["5V"] > 0 ? `Buck η≈${(buckEta(x.I5) * 100).toFixed(0)}%` : "aus");
    add("U2", nets["5V"], x.I_u2, this.playing ? "PLAY" : nets["5V"] > 0 ? "Idle powered" : "aus");
    add("J5", nets["12V_SW"], x.I_cnt, x.q7_on ? `Spule ${(x.I_cnt * 1e3).toFixed(1)} mA @12V (~80 ms)` : nets["12V_SW"] > 0 ? "Session an, Spule AUS" : "aus");
    add("J6", x.V12led, x.I_led, x.I_led ? "LEDs an (12V_LED)" : "aus");
    add("J1", nets.BAT, x.I_f1, "Batterie");
    add("J2", nets["5V"] > 0 && this.playing ? 2.5 : 0, x.I_spk, this.playing ? "SPK aktiv" : "ruhe");
    add("J3", nets["5V"] > 0 ? 3.3 : 0, 0, "Taster IO");
    add("J4", 0, 0, "Taster GND");
    add("TP1", nets["12V_PROT"], 0, "TP 12V_PROT");
    add("TP2", nets["5V"], 0, "TP 5V");
    add("TP3", 0, 0, "TP GND");
    add("TP4", nets.BUSY, 0, "TP BUSY");
    add("TP5", nets["5V"] > 0 && this.playing ? 2.5 : 0, 0, "TP SPK+");

    return out.sort((a, b) => a.ref.localeCompare(b.ref, undefined, { numeric: true }));
  }
}
