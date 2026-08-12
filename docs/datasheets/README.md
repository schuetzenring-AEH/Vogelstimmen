# Datenblätter

Lokal gespeicherte PDFs (Stand 01.08.2026) + Simulationsparameter in `simulation/js/parts.js`.

| Datei | Bauteil | Status |
|-------|---------|--------|
| [Si2301CDS.pdf](Si2301CDS.pdf) | Vishay SI2301CDS P-FET | OK |
| [TPS62163.pdf](TPS62163.pdf) | TI TPS62163 Buck 5 V | OK |
| [BZX84C6V2_Nexperia.pdf](BZX84C6V2_Nexperia.pdf) | BZX84 Serie (6,2 V) | OK |
| [SMAJ15A.pdf](SMAJ15A.pdf) | Vishay/SMAJ TVS 15 V | OK |
| [DY-SV17F.pdf](DY-SV17F.pdf) | Audio-Modul Functions (kein Iq; V33 max 80 mA) | OK |
| [Kuebler_K04-K07.pdf](Kuebler_K04-K07.pdf) | Kübler K04–K07 (historisch, E-CNT-01) | Archiv |
| [Kuebler_K04-K07_AK07.pdf](Kuebler_K04-K07_AK07.pdf) | Kübler (älterer Stand) | Archiv |

**Zähler Rev 3.0:** Hengstler **0.635.128** — PDF unter `hardware/V3.0/docs/Hengstler_634_635.pdf` (bzw. Impulse-Automation Datasheet). Kübler gestrichen (E-CNT-02).

**Nicht lokal (CDN-Block):** onsemi 2N7002L / 1N4148WS — Parameter aus Hersteller-Datenblatt übernommen (siehe `simulation/js/parts.js`).

### DY-SV17F — Strom (extern belegt)

| | Wert | Quelle |
|--|------|--------|
| Idle | **14 mA** @5 V | Messung (Amp LTK5128 + Flash) — [GitHub arduino12](https://github.com/arduino12/mp3_player_module_wire) |
| Betrieb | **≤60 mA** @5 V | Spec „Потребление тока: до 60мА“ — [compacttool.ru](https://compacttool.ru/mp3wav-pleer-dy-sv17f-s-mono-audiousilitelem-5vt) |
| V33 | max 80 mA | Modul-PDF (**Ausgang**, nicht Modul-Iq) |
| Lautsprecher | zusätzlich | Class-D; Spitzen je nach Pegel höher |

### Bestellhinweis Zähler (Rev 3.0)

**Hengstler 0.635.128** (Typ 635.1, 12 V, 6 Stellen, Spule 1860 Ω ≈80 mW, 4 PCB-Pins). Ansteuerung: One-Shot an `12V_SW` (nicht dauerhaft an 5 V). Details: `hardware/V3.0/docs/entscheidungen_v30.md`.

~~K07.90 1.130.900.008~~ — nicht mehr beschaffbar / ersetzt.
