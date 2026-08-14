# Use Cases & Szenarien — Vogelstimmenkasten Rev 3.0

---

## 1. Use-Case-Übersicht

| UC-ID | Name | Primärakteur | Req |
|-------|------|--------------|-----|
| UC-01 | Vogelstimme starten | Besucher | F01–F05, E04 |
| UC-02 | Stimme während Play wechseln | Besucher | F07, F08 |
| UC-03 | Nutzungszähler ablesen | Betreiber | F10, H06 |
| UC-04 | Audiodateien aktualisieren | Wartung | F06, F-09 |
| UC-05 | Batterie warten | Wartung | E01, E03 |

Akteure: Besucher, Betreiber, Wartung — System = Platine + Modul + Bestand (Taster, SPK, Batterie).

---

## 2. UC-01 — Vogelstimme starten (Happy Path)

| Schritt | Akteur / System | Reaktion |
|---------|-----------------|----------|
| 1 | Besucher drückt Taster n | IO n → GND |
| 2 | System | BTN_OR low → Q6 SET → Latch AN → 12V_SW |
| 3 | System | Buck U1 → 5 V **nur für das Modul**; One-Shot an 12V_SW → Zählerimpuls (Hengstler, nicht über U1) |
| 4 | System | Fallende Flanke an IOx_M → Track startet; BUSY low |
| 5 | System | LEDs an (12V_LED) |
| 6 | System | Track Ende → BUSY high → RC → Latch AUS → Idle |

**Alternativ: Kurzdruck vor Boot-Ende** → kein Play, Latch löst wieder (Mode 0 / F-03). Mitigation: Taste halten / Blanking.

---

## 3. UC-02 — Retrigger

Während Playing Taste m drücken → neue Datei startet, alte bricht ab (Mode 0). Latch bleibt AN bis BUSY-Release nach neuem Track-Ende.

---

## 4. UC-04 — Audio per USB (Constraint)

Nur in der **Werkstatt** (E-AUDIO-04): kein USB-Loch im Waldgehäuse.

1. Gehäuse öffnen. Latch AUS (Batterie darf stecken, solange niemand einen Taster drückt) **oder** Modul vom Sockel nehmen.  
2. USB am DY-SV17F → Drag&Drop MP3/WAV (`00001`…`00008`).  
3. USB trennen, Modul in den Sockel, Gehäuse zu → UC-01 testen.

**Verboten:** USB bei Latch AN / Board-5 V (Backfeed in den Buck, F-09).

---

## 5. Activity (Wiedergabe-Session)

```
[Idle] → (Taste) → [SET/Power-Up] → [Boot] → {Flanke ok?}
    nein → [Release/Idle]
    ja   → [Playing] → (BUSY high) → [Blanking] → [Release] → [Idle]
```

---

## 6. Sequence (vereinfacht, UC-01)

```
Besucher -> Taster: press
Taster -> Latch: SET
Latch -> Buck: 12V_SW
Buck -> Modul: 5V
Modul -> Latch: BUSY low (play)
Modul -> SPK: audio
Modul -> Latch: BUSY high (end)
Latch -> *: power off
```
