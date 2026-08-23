# Mechanische Impulszähler — V3.0

**Primär:** **Hengstler 0.635.128** (Typ 635.1, 12 V DC, PCB-Lötpins).

| | |
|--|--|
| Körper | **25,2 × 14,6 mm** (Höhe ~31 mm), ~10 g |
| Pins | Ø 0,6 mm, Pitch **15,24 mm**, Pad1=**+**, Pad2=**−** |
| Footprint | `vogelstimmen:CNT_HENGSTLER_635` — 25,2×31 mm, **4 Pins** 15,24×25,4 mm |
| Ansteuerung | One-Shot E-CNT-03 an `12V_SW` / `CNT_LO` |
| Bezug | **RS Best.-Nr. 312-022** — [Produkt](https://de.rs-online.com/web/p/zahler-ic/0312022), [Hand-Liste](rs_bestellliste.md) |
| Datenblatt | `docs/Hengstler_634_635.pdf` |

**Nicht:** 0.635.132 (5 V) — Buck-Race beim Latch-Edge.  
**Nicht:** Panel-CSK/875 (~46 × 74 mm).

Alt. Formfaktoren: `docs/zaehler_formfaktor_recherche.md`.
