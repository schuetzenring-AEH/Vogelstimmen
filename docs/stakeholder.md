# Stakeholderanalyse — Vogelstimmenkasten Rev 3.0

**Status:** angenommen / rekonstruiert für MBSE-Showcase  
**Hinweis:** Kein Business-Case — Fokus Betrieb, Nutzung, Technik.

---

## 1. Stakeholder

| ID | Rolle | Interesse | Einfluss | Anforderungen (Beispiele) |
|----|-------|-----------|----------|---------------------------|
| SH-01 | **Besucher** (Waldlehrpfad) | Vogelstimmen hören, einfache Bedienung | mittel | F01–F09, F03, F05 |
| SH-02 | **Betreiber** (Kolping / Lehrpfad) | Zuverlässig, wartungsarm, Batterie hält | hoch | E02, E03, U03, F10 |
| SH-03 | **Wartung / Service** | Einfacher Tausch, Audio per USB, Zähler ablesen | mittel | F06, H01, H06, Service |
| SH-04 | **Entwicklung** (dieses Projekt) | Nachvollziehbare Spec, Review, Fertigung | hoch | M01–M04, Traceability |
| SH-05 | **Fertigung** (JLCPCB + Handbestückung) | Klare BOM/CPL/Gerber, manuelle Teile markiert | mittel | H02, H03, BOM |
| SH-06 | **Reviewer** (adversarial) | Blocker finden vor Serie | hoch | M04, adversarial review |

**Nicht im Scope:** Marketing, Vertrieb, Investoren, Zulassungsbehörde als eigener Stakeholder (Hobby-/Lehrpfad-Gerät, keine ISO-26262-Zulassung).

---

## 2. Needs → Requirements (Auszug)

| Need (Stakeholder) | Abgeleitete Req-ID |
|--------------------|---------------------|
| „Taste drücken → Stimme“ | F01, F02, F03 |
| „Ein ganzes Jahr ohne Batteriewechsel“ | E02, E03, E-LATCH |
| „Stimmen selbst wechseln können“ | F06 |
| „Sehen, wie oft benutzt“ | F10, H01 |
| „Keine teure Spezialfertigung“ | H02, M01, JLCPCB |
| „Nicht nochmal Rev‑1-Fehler“ | M01, M02, M04, Review |

---

## 3. Annahmen

- Einbauraum und Taster bleiben wie Bestand (O2/O6 im Lastenheft noch messen).
- Betrieb im Schrank, Tasterkabel ≤ 30 cm (Disposition F-06).
- Kein kommerzieller Vertrieb — interne/kolping-interne Nutzung.
