# Digital Thread — Vogelstimmen Rev 3.0

Zielbild: jedes Element ist rückverfolgbar. Umsetzung hier als **Dokumenten-Thread** (+ Sim + KiCad), nicht als PLM-Datenbank.

---

## 1. Kette (Soll = Ist im Repo)

```
Stakeholder (stakeholder.md)
    ↓
Lastenheft / Pflichtenheft (anforderungen.md, pflichtenheft.md)
    ↓
Use Cases / Funktionen (use_cases.md, funktionsstruktur.md)
    ↓
SysML-Sicht / Architektur (mbse_sysml.md, systemarchitektur.md)
    ↓
Entscheidungen ADR (entscheidungen.md)
    ↓
PBS / ICD (pbs_icd.md)
    ↓
Risiko/FMEA (risiko_fmea.md)
    ↓
Detaildesign E-CAD (hardware/V3.0/docs/schaltplan.md, KiCad V3.0)
    ↓
Digitaler Zwilling (digitaler_zwilling.md, simulation/)
    ↓
V&V Plan + Review (vv_testplan.md, adversarial_review_v25.md)
    ↓
Freigabe mit Auflagen → Fertigungspaket (hardware/V3.0/)
    ↓
Montage / IBN / Service (montage_ibn.md, service_betrieb.md)
```

---

## 2. Traceability-Beispiel (Ende-zu-Ende)

| Stufe | Element |
|-------|---------|
| Stakeholder | SH-01 Besucher |
| Req | F02 |
| Use Case | UC-01 |
| Funktion | SF-04 |
| Block | B4, B6 |
| Bauteil | U2, D15…D22, J3 |
| Entscheidung | E-RESPIN-01 / F-01 |
| Test | TC-I01, TC-S02 |
| Nachweis | pcbnew-Export; Proto offen |

Matrix: `traceability.md`.

---

## 3. Was der Thread bewusst nicht ist

- Kein 3DX/Teamcenter/Windchill
- Keine bidirektionale Tool-Kopplung Cameo↔KiCad
- Mechanik-CAD und Software-Repo entfallen (Bestand / Modul-Firmware)

---

## 4. Baseline

Konfigurationsstand Fertigung: **Rev 3.0 / hardware/V3.0/** — siehe `konfiguration_baseline.md`.
