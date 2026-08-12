# Inbetriebnahme-Checkliste

Checkliste für den ersten Test des Vogelstimmenkastens nach Lieferung der Platine.

## Vor dem Einschalten

- [ ] Visuelle Prüfung: keine Lötbrücken, ICs richtig orientiert
- [ ] U1 (WT588D) im Sockel, Pin 1 markiert
- [ ] J1–J5 eingelötet
- [ ] Kein Kurzschluss zwischen Batterie + und − (Multimeter)

## Erste Spannungsprüfung

- [ ] 12 V an J1 → keine Überhitzung
- [ ] 3,3 V an J3 Pin 10 (oder WT588D VCC) messen
- [ ] GND-Verbindung J3 Pin 9 ↔ Batterie −

## Audio-Test

- [ ] WT588D mit 8 Sounds programmiert (siehe [wt588d-konfiguration.md](wt588d-konfiguration.md))
- [ ] Lautsprecher an J2 (Mono, ein Kanal des Verstärkers reicht)
- [ ] Taste 1 → Sound startet innerhalb **0,5 s**
- [ ] Alle 8 Taster nacheinander testen
- [ ] Lautstärke aus **2–3 m** Entfernung OK
- [ ] Während Wiedergabe andere Taste → neuer Sound startet

## Zähler-Test

- [ ] Impulszähler 12 V an J5 (Polarität laut Datenblatt)
- [ ] Jeder Tastendruck → Zähler +1
- [ ] Zähler zählt nur während BUSY (Wiedergabe), nicht im Leerlauf

## Dauerbetrieb

- [ ] 1 h Dauerbetrieb ohne Abstürze
- [ ] Platine bleibt handwarm (nicht heiß)
- [ ] Ruhestrom: nach 24 h keine auffällige Batterie-Entladung

## Einbau Gehäuse

- [ ] Platine mechanisch fixiert
- [ ] Kabel zu Tastern/Lautsprecher/Batterie strain relief
- [ ] Feuchtigkeitsschutz bewertet (Lastenheft O5)

## Dokumentation

- [ ] Welche Vogelstimme auf welcher Taste (Liste für Betreuer)
- [ ] Batterie-Ladeintervall notieren (Ziel: ~1× pro Jahr)
