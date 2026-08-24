# Risiko & Design-FMEA (leicht) — Rev 2.5

**Scope:** Technische Risiken der Elektronik/Lehrpfad-Einsatz. Keine Automotive-HARA, keine Termin-/Business-Risiken.

**Skala:** S = Schwere 1–10, O = Auftreten 1–10, D = Entdeckung 1–10, RPN = S×O×D.

---

## 1. Risikoregister (Auszug)

| ID | Risiko | S | O | D | RPN | Maßnahme | Status |
|----|--------|---|---|---|-----|----------|--------|
| R-01 | 12 V an Modul-IO (Phantom Supply) | 9 | 8 | 3 | 216 | D15–D22 Serie (F-01) | behoben |
| R-02 | VOS mit 100k → falsche 5 V | 8 | 7 | 4 | 224 | R5=0R (F-02) | behoben |
| R-03 | Kurzdruck → kein Play / „tot“ | 7 | 8 | 3 | 168 | R13/C4 (F-03); **Proto: C4=4,7µF zu kurz → 47µF (E-IBN-03)** | **behoben** |
| R-04 | LED-Kurzschluss an J6 | 6 | 4 | 4 | 96 | R12 10Ω (F-04); messen | mitigiert |
| R-05 | SPK zu dünn → Hitze/Drop | 5 | 4 | 5 | 100 | SPK ≥0,4/0,8 (F-05) | behoben |
| R-06 | SI2301 VDS vs. TVS Clamp | 8 | 2 | 6 | 96 | akzeptiert Batterie/Schrank (F-07) | akzeptiert |
| R-07 | USB + Board-5V Backfeed | 6 | 4 | 3 | 72 | IBN-Regel Sockel (F-09) | Prozess |
| R-08 | Feuchte / Kondenswasser | 6 | 5 | 5 | 150 | Coating empfohlen (U02) | Auflage Montage |
| R-09 | Falsche Bestückung Diode | 8 | 10 | 2 | 160 | CPL + Review; **Proto: D9 bei JLCPCB 180° falsch (E-IBN-01), beide Platinen** | **behoben (Handnacharbeit)** |
| R-10 | U2 Modul falsch gesteckt (Reihen vertauscht) | 7 | 8 | 3 | 168 | **Orientierungstabelle in IBN (E-IBN-02); mech. Verpolschutz erwägen** | **mitigiert (Doku)** |

---

## 2. Design-FMEA (Kernzeilen)

| Element | Fehlerart | Folge | Ursache | Detection | Aktion |
|---------|-----------|-------|---------|-----------|--------|
| D15–D22 | verkehrt bestückt | Modul-Schaden / kein Trigger | Polarität SOD-323 | AOI/Sicht | Bestückungsnotiz Kathode=IOx |
| R5 | offen statt 0R | 5 V Drift | BOM-Verwechslung | Spannung messen | Value 0R in BOM/CPL |
| Q5 | Drain/Source vertauscht | kein Betrieb / Kurz | Footprint | Funktionsprüf | Layout-Review erledigt |
| Latch | Race BUSY | Session bricht sofort ab | Boot vs Release | Oszi Proto | F-03 RC |
| J2 | SPK− an GND | Verstärker-Stress | Verkabelung | IBN Checkliste | Doku BTL |

---

## 3. Was bewusst fehlt

- Prozess-FMEA Fertigungslinie JLCPCB (Lieferant)
- FTA/ETA formell
- Cybersecurity (kein Netz)

Annahmen und akzeptierte Restrisiken: `adversarial_review_v25.md`.
