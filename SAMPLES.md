# Samples – Herkunft und Lizenz

Alle Klänge der Demo liegen in `samples/`. Es sind nur die Töne dabei, die die Demo braucht. Jede Datei heisst nach ihrer **klingenden Tonhöhe** (wissenschaftliche Zählung, C4 = mittleres C, A4 = 440 Hz; «s» steht für ♯, also `Ds4` = D♯4). Die Tonhöhen wurden nachgemessen.

## Klavier – `samples/klavier/`

- **Quelle:** Salamander Grand Piano V3, Yamaha C5, aufgenommen von **Alexander Holm**  
  https://archive.org/details/SalamanderGrandPianoV3
- **Lizenz:** Creative Commons Attribution 3.0 (CC BY 3.0), https://creativecommons.org/licenses/by/3.0/  
  Der Urheber muss genannt werden. Das geschieht hier und in der Fusszeile der Demo.
- **Bezogen über:** TwoTone (https://github.com/sonifydata/twotone, `src/audio/samplers/piano/`, Commit 697cb4f). Dort liegen MP3-Fassungen der Salamander-Samples.
- **Dateien:** C3, D♯3, F♯3, A3, C4, D♯4, F♯4, A4, C5, D♯5, F♯5, A5, C6 (13 Dateien)
- **Bearbeitung:** keine, unverändert kopiert.

## Trompete – `samples/trompete/`

- **Quelle:** VS Chamber Orchestra: Community Edition (VSCO 2 CE), Versilian Studios  
  https://github.com/sgossner/VSCO-2-CE, Ordner `Brass/Trumpet/sus/`, Dynamik `v1`, `rr1`
- **Lizenz:** Creative Commons Zero (CC0 1.0), gemeinfrei. Eine Nennung ist nicht nötig, wir nennen die Quelle trotzdem.
- **Dateien:** F3, A3, C4, D♯4, G4, A♯4, D5 (7 Dateien)
- **Bearbeitung:**
  - Umbenannt: VSCO zählt Oktaven eine tiefer als üblich. Die Datei `Sum_SHTrumpet_sus_C3_v1_rr1.wav` klingt auf C4 und heisst hier `C4.mp3`. Das gilt für alle Töne.
  - Auf 6 Sekunden gekürzt, mit 0,5 s Ausblenden am Ende. Ein Ton dauert in der Demo höchstens etwa 2,1 s.
  - Von WAV in MP3 umgewandelt (LAME, VBR-Qualität 2).

## Kontrabass, gezupft – `samples/kontrabass/`

- **Quelle:** VS Chamber Orchestra: Community Edition (VSCO 2 CE), Versilian Studios  
  https://github.com/sgossner/VSCO-2-CE, Ordner `Strings/Solo Contrabass/Pizz/`, Dynamik `v1`, `rr1`
- **Lizenz:** Creative Commons Zero (CC0 1.0), gemeinfrei.
- **Dateien:** E1, F♯1, G1, A♯1, C2, D2, E2, F♯2, G♯2, A2, C♯3, E3, G♯3, B3 (14 Dateien, alle in VSCO vorhandenen gezupften Töne)
- **Bearbeitung:**
  - Umbenannt wie die Trompete: VSCO `E0` klingt auf E1 und heisst hier `E1.mp3`.
  - Pegel angeglichen: Die Originale sind sehr leise und schwanken etwa um den Faktor 10. Jede Datei ist auf denselben Spitzenpegel (0,7) gebracht.
  - Von WAV in MP3 umgewandelt (LAME, VBR-Qualität 2).
- **Nicht verwendet:** der Kontrabass aus TwoTone («Double Bass Samples Free Pizzicato» von patcharena.com). Für ihn ist keine Lizenz angegeben, und seine Dateinamen passen nicht einheitlich zur klingenden Tonhöhe.

## Code aus TwoTone

Kein Sample, aber verwandt: `vendor/twotone/` enthält `scales.js`, `applyEnvelope.js` und `num.js` aus TwoTone (`src/soundq/src/util/`). Sie stehen unter der MIT-Lizenz, © 2019 Datavized; die Lizenz liegt in `vendor/twotone/LICENSE`.
