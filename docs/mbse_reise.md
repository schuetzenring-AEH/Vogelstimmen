# MBSE / V-Modell — Abdeckungskarte Vogelstimmen Rev 2.5

Dieses Dokument steuert den Showcase: **Was wir haben**, **was wir bewusst weglassen**, **wo Annahmen gelten**.

---

## V-Modell (Projektbezogen)

```
     Stakeholder / Lastenheft / Pflichtenheft
                    |
           Systemanforderungen (SYS-*)
                    |
         Funktionen / Use Cases / SysML-Sicht
                    |
         Systemarchitektur (B1–B8) + PBS/ICD
                    |
         ADRs / Risiko-FMEA / Detaildesign (KiCad)
                    |
              Implementierung (PCB V2.5)
                    |
                    V
         ----------------
         Unit | Integration | Twin/Review
         ----------------
                    ^
              Systemtest / Abnahme (Proto — teils offen)
```

---

## Abdeckungsmatrix

| SE/MBSE-Bereich | Status | Artefakt im Repo | Bemerkung |
|-----------------|--------|------------------|-----------|
| Business Case / Markt / ROI | **weggelassen** | — | laut Auftrag kein Business |
| Stakeholderanalyse | **vorhanden** | `stakeholder.md` | rekonstruiert |
| Lastenheft | **vorhanden** | `anforderungen.md` | |
| Pflichtenheft | **vorhanden** | `pflichtenheft.md` | abgeleitet |
| RTM / Traceability | **vorhanden** | `traceability.md` | R→F→P→V |
| Use Cases / Szenarien | **vorhanden** | `use_cases.md` | |
| Funktionsstruktur | **vorhanden** | `funktionsstruktur.md` | |
| Context / BDD / IBD | **vorhanden** | `systemarchitektur.md`, `mbse_sysml.md` | Mermaid, kein Cameo |
| State / Sequence / Activity | **vorhanden** | `use_cases.md`, Sim | |
| Parametric / Energie | **teilweise** | twin + traceability | keine Tool-Parametrics |
| PBS / ICD | **vorhanden** | `pbs_icd.md` | |
| Logical / Physical Arch | **vorhanden** | Architektur + PBS | |
| ADRs | **vorhanden** | `entscheidungen.md` | |
| Risiko / Design-FMEA | **vorhanden (leicht)** | `risiko_fmea.md` | keine HARA/FTA |
| Mechanik CAD / FEM | **nicht im Scope** | — | Gehäuse Bestand |
| E/E Schaltplan PCB | **vorhanden** | `schaltplan.md`, KiCad, V2.5-final | |
| EMV-Labor | **offen** | — | Annahme Schrank |
| Software SRS/SDS | **n/a** | — | keine App-SW |
| Digital Twin | **vorhanden** | `digitaler_zwilling.md`, `simulation/` | Verhaltens-DC |
| V&V Testplan | **vorhanden** | `vv_testplan.md` | Proto-TCs offen |
| Review / Freigabe | **vorhanden** | adversarial, M04, Fertigfreigabe | mit Auflagen |
| CM / Baseline | **vorhanden (leicht)** | `konfiguration_baseline.md` | |
| QM APQP/PPAP | **weggelassen** | — | nicht Automobil-Serie |
| Fertigung Gerber/BOM | **vorhanden** | `hardware/V2.5-final/` | |
| Montage / IBN | **vorhanden** | `montage_ibn.md` | |
| CE-Vollakte | **weggelassen** | Hinweis Service | Lehrpfad intern |
| Service / Betrieb | **vorhanden** | `service_betrieb.md` | |
| Digital Thread | **vorhanden** | `digital_thread.md` | dokumentenbasiert |

---

## Präsentationsreihenfolge (Team)

1. Kontext & Stakeholder  
2. Requirements (Lasten/Pflichten)  
3. Use Cases & Funktionen  
4. Architektur & SysML-Sicht  
5. ADRs & Risiken  
6. Detaildesign KiCad / Fertigung  
7. Digitaler Zwilling (live)  
8. Traceability & Digital Thread  
9. V&V Status (ehrlich: Proto offen)  
10. Montage/Service  

---

## Kernbotschaft

Wir zeigen **durchgängiges Systems Engineering im Kleinen**: echte Traceability, Review-Kultur und fertigungsreifes E-CAD — ohne den Ballast eines OEM-Dokumentenbergs (Business, PPAP, ISO-26262), der hier nicht passt.
