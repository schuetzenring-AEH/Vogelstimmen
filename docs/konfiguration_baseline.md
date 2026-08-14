# Konfigurationsmanagement & Baseline — Rev 3.0

**Methode:** leichtgewichtig (Git-Ordner + benannte Fertigungspakete). Kein formales CM-Tool.

---

## 1. Baselines

| Baseline | Inhalt | Datum |
|----------|--------|-------|
| BL-LH-R2 | Lastenheft Rev 2 | 2026-07 |
| BL-ARCH | Systemarchitektur B1–B8 | 2026-07 |
| BL-PCB-24 | Working PCB vor/mit Respin | 2026-08 |
| BL-FAB-25 | `hardware/V2.5-final/` Gerber/BOM/CPL (Kübler, eingefroren) | 2026-08-03 |
| **BL-FAB-30** | **`hardware/V3.0/`** Gerber/BOM/CPL/KiCad/PDFs | **2026-08-12** |
| BL-SHOW | MBSE-Showcase + Docs-Satz | 2026-08-13 |

---

## 2. Identifikation

| Artefakt | Kennung |
|----------|---------|
| Schaltplan/PCB | `vogelstimmen_v3.0.*` |
| Gerber-ZIP | `vogelstimmen_v3.0-Gerber.zip` |
| Simulation | Rev 3.0 Header |

---

## 3. Änderungsprozess (Vorschlag)

1. Change Request (kurz: Problem, Impact, Req betroffen)  
2. Design/Docs anpassen  
3. Review (adversarial bei Schaltung)  
4. Neue Baseline / Ordner `Vx.x`  
5. Alte Pakete nicht überschreiben  

---

## 4. Was nicht geführt wird

- Formale ECR/ECO-Nummernkreise  
- Hardware-CM in PLM  
- Lieferanten-PPAP  

Für Lehr-/Kolping-Projekt ausreichend dokumentiert über Git + Final-Ordner.
