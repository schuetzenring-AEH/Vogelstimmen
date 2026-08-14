# Funktionsstruktur — Vogelstimmenkasten Rev 3.0

**Methode:** Funktionsanalyse → Funktionsbaum → Trace zu Blöcken (B1–B8).

---

## 1. Blackbox

```
Eingänge:  Taster(8), Batterie 12V, USB(Wartung), Lautsprecher-Last
System:    Vogelstimmenkasten (Elektronik Rev 3.0)
Ausgänge:  Audio mono, LED-Beleuchtung, Zählerstand (mechanisch)
```

---

## 2. Funktionsbaum

```
HF — Vogelstimme auf Tastendruck wiedergeben (energieeffizient)
├─ SF-01 Benutzereingabe erfassen
├─ SF-02 System einschalten (Latch SET)
├─ SF-03 Versorgung 5 V bereitstellen
├─ SF-04 Vogelstimme abspielen
├─ SF-05 Wiedergabe wechseln (Retrigger)
├─ SF-06 System automatisch abschalten
├─ SF-07 Nutzung zählen
├─ SF-08 Betriebszustand anzeigen (LEDs)
├─ SF-09 Audiodateien verwalten (USB)
├─ SF-10 Eingangsschutz gewährleisten
├─ SF-11 Ruhestrom minimieren
└─ SF-12 Schallwandlung (SPK)
```

Detail-Mapping Req→SF→Block: `traceability.md`.

---

## 3. Funktion → Logik → Physik (Auszug)

| Funktion | Logische Lösung | Physisch |
|----------|-----------------|----------|
| SF-02/11 | Hardware-Latch, kein µC-Sleep | Q1/Q2/Q3/Q6, R2–R4, R9–R11 |
| SF-03 | Buck fest 5 V | U1 TPS62163, L1, C2/C3, R5=0R |
| SF-04 | IO-Mode 0 Modul | U2 DY-SV17F, D15–D22 |
| SF-06 | BUSY → Release | R13, C4, Q3 |
| SF-07 | One-Shot ~80 ms an 12V_SW → Hengstler | J5 0.635.128, C20, R20, R21, D23, Q7, D10 |
| SF-10 | Verpolung + TVS + PTC | Q5, D11, D9, F1, C1 |

---

## 4. Annahmen

- „Wiedergabe-Session“ = ein Latch-Zyklus (Aufwachen bis Release), nicht einzelne Sekunden Audio.
- Keine Software-Funktionen außer Modul-Firmware (Blackbox).
