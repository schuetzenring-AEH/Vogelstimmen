# Service & Betrieb — Vogelstimmenkasten Rev 2.5

---

## 1. Bedienung (Besucher)

1. Einen der 8 Taster **drücken und kurz halten** (ca. 0,5 s).  
2. Zugehörige Vogelstimme spielt.  
3. Anderen Taster → neue Stimme.  
4. Nach Ende schaltet die Box von selbst ab (Stromsparmodus).

---

## 2. Wartung

| Tätigkeit | Vorgehen |
|-----------|----------|
| Audio tauschen | Modul USB; **Latch aus oder Modul abgezogen**; Dateien `00001`…`00008` |
| Zähler ablesen | Anzeige oben / Sichtfenster |
| Batterie | Spannung prüfen; bei Tiefentladung laden/tauschen |
| Fehlfunktion | IBN-Checkliste `montage_ibn.md`; Idle-Strom; BUSY |

---

## 3. Ersatzteile (Annahme)

| Teil | Hinweis |
|------|---------|
| DY-SV17F | Sockel erleichtert Tausch; nicht bei RS |
| Hengstler 0.635.128 | **RS 312-022** (12 V PCB; nicht 312-016) |
| MPT 2-pol 1725656 | **RS 220-4260** |
| MPT 8-pol 1725711 | **RS 220-4327** |
| SMD-Platine | Kompletttausch bei Defekt (JLCPCB-Nachbestellung) |

---

## 4. Obsoleszenz

- TPS62163: knapper Stock → Ersatzteil/U1-Spare in BOM-Doku  
- DY-SV17F: Modulmarkt beobachten; Mode-0-Verhalten dokumentiert  

Keine Software-Update-Pipeline (Modul-Dateien = „Content-Update“).
