# PBS & ICD — Produktstruktur und Schnittstellen Rev 3.0

---

## 1. Product Breakdown Structure (PBS)

```
Vogelstimmenkasten (Gesamtsystem, Bestand + Neu)
├─ Mechanik (Bestand — nicht neu konstruiert)
│  ├─ Gehäuse
│  ├─ 8× Taster (beleuchtet)
│  └─ Lautsprecher
├─ Energie
│  └─ 12V Bleibatterie (Bestand)
├─ Elektronik Rev 3.0 (dieses Projekt)
│  ├─ PCB + SMD 0603 (JLCPCB)
│  ├─ DY-SV17F Modul (U2)
│  ├─ Hengstler 0.635.128 (J5) + One-Shot (C20/R20/R21/D23/Q7/D10)
│  └─ Phoenix MPT J1–J4, J6
└─ Dokumentation / Twin
   ├─ MBSE-Docs
   └─ HTML-Simulation (simulation/)
```

**Hinweis:** Keine neue CAD-Mechanik in diesem Repo — Einbau in bestehendes Gehäuse (Offene Punkte O2/O6).

---

## 2. Logische vs. physische Architektur

| Logisch (B1–B8) | Physisch |
|-----------------|----------|
| B1 Eingangsschutz | Q5, D11, F1, D9, C1, J1 |
| B2 Latch | Q1, Q2, Q3, Q6, D12–D14, R1–R4, R8–R11, R13, C4 |
| B3 Buck | U1, L1, C2, C3, R5 |
| B4 Audio | U2, D15–D22 |
| B5 Zähler | J5, D10 |
| B6 Taster | J3, J4, D1–D8 |
| B7 SPK | J2, TP5 |
| B8 LED | J6, R12 |

---

## 3. Interface Control Document (ICD) — Kurz

### 3.1 Elektrisch extern

| IF | Stecker | Signale | Pegel / Hinweis |
|----|---------|---------|-----------------|
| IF-BAT | J1 MPT 0,5/2 | BAT+, GND | 12 V nom.; Verpolungsschutz intern |
| IF-SPK | J2 MPT 0,5/2 | SPK+, SPK− | BTL — **kein** GND an SPK |
| IF-BTN | J3/J4 MPT 0,5/8 | IO0…7, GND×8 | Active-low; Kabel ≤30 cm |
| IF-LED | J6 MPT 0,5/2 | 12V_LED, GND | nur bei Latch AN; R12 serie |
| IF-USB | Micro-USB an U2 | USB | nur Wartung; Latch aus / Modul ab |

### 3.2 Intern (kritisch)

| IF | Von → Nach | Bemerkung |
|----|------------|-----------|
| IOx ↔ IOx_M | J3/D1–D8 ↔ D15–D22 ↔ U2 | Domain-Trennung F-01 |
| BUSY → Q3_GATE | U2 → R13 → C4/Q3 | Blanking F-03 |
| 12V_SW → 12V_LED | Q1-Rail → R12 → J6 | F-04 |
| 5V → VOS | C3/Rail → R5=0R → U1 | F-02 |

### 3.3 Mechanisch

| IF | Beschreibung |
|----|--------------|
| IF-M3 | 4× M3 Montagelöcher PCB |
| IF-VIEW | Zähleranzeige oben (Sichtfenster Gehäuse — Annahme) |

---

## 4. Software-Schnittstellen

Keine Applikationssoftware. Audio-Dateien: Dateinamenkonvention Modul (`00001`…`00008`). API: keine.
