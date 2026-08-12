# Konfigurationsmanagement & Baseline — Rev 2.5

**Methode:** leichtgewichtig (Git-Ordner + benannte Fertigungspakete). Kein formales CM-Tool.

---

## 1. Baselines

| Baseline | Inhalt | Datum |
|----------|--------|-------|
| BL-LH-R2 | Lastenheft Rev 2 | 2026-07 |
| BL-ARCH | Systemarchitektur B1–B8 | 2026-07 |
| BL-PCB-24 | Working PCB vor/mit Respin | 2026-08 |
| **BL-FAB-25** | **`hardware/V2.5-final/`** Gerber/BOM/CPL/KiCad/PDFs | **2026-08-03** |
| BL-SHOW | MBSE-Showcase + Docs-Satz | 2026-08-03 |

---

## 2. Identifikation

| Artefakt | Kennung |
|----------|---------|
| Schaltplan/PCB | `vogelstimmen_v2.5.*` |
| Gerber-Job | Rev-Feld in gbrjob ggf. „rev?“ (kosmetisch) |
| Simulation | Rev 2.5 Header |

---

## 3. Änderungsprozess (Vorschlag)

1. Change Request (kurz: Problem, Impact, Req betroffen)  
2. Design/Docs anpassen  
3. Review (adversarial bei Schaltung)  
4. Neue Baseline / Ordner `V2.x-final`  
5. Alte Pakete nicht überschreiben  

---

## 4. Was nicht geführt wird

- Formale ECR/ECO-Nummernkreise  
- Hardware-CM in PLM  
- Lieferanten-PPAP  

Für Lehr-/Kolping-Projekt ausreichend dokumentiert über Git + Final-Ordner.
