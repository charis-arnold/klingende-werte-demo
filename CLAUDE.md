# Klingende Werte – Bild-und-Klang-Demo (Testphase 1)

Dieses Dokument ist die Arbeitsgrundlage für Claude Code. Es beschreibt, was die Demo können soll, wie sie aufgebaut ist und was sie bewusst **nicht** kann.

## Ziel

Eine kleine Webseite, auf der eine Testperson einen Wochenverlauf **sieht und hört**. Sie beantwortet eine einzige Testfrage: *Verstehen Betroffene ihren Verlauf als Bild und Klang, und hilft es ihnen?*

Die Demo wird aus dem Figma-Prototyp verlinkt (Screen `home/dein-verlauf` → Film → Filmbild).

## Begriffe (wie im Figma-Prototyp)

- **Symptome:** die Säulen mit Stärke (z. B. Energie, Stimmung). Frei wählbar, höchstens 5. **Nur Symptome klingen.**
- **Beschwerden:** was heute aufgetreten ist (z. B. Kopfschmerzen, Sehstörung).
- **Ereignisse:** was sonst passiert ist (z. B. Arzttermin, Bewegung, Flashes).
- **Medikamente:** was heute eingenommen wurde.
- **Ruhezeiten:** wann sich die Person ausgeruht hat (Nacht, Tag).

## Grenzen (nicht verhandelbar)

- **Kein halbes MVP.** Kein Login, kein Konto, kein Server, keine Datenbank, kein Export. Das MVP baut in Phase 2 ein Entwickler.
- **Daten nur im Browser**, im Arbeitsspeicher. Kein `localStorage`, keine Cookies, kein Tracking, keine externen Analytics. Nach dem Neuladen ist alles wie am Anfang.
- **Keine Notizen** in der Demo.
- **Keine Zahlen für Gefühltes.** Werte sind intern 0–1, werden aber nirgends als Zahl, Prozent oder Punktzahl angezeigt, auch nicht in Tooltips oder Screenreader-Texten.
- **Keine Bewertung:** Farben wählt die Person. Rot heisst nicht schlecht, hoch heisst nicht besser. Keine Smileys, kein Lob, kein Vergleich.
- **Keine Pflicht:** Fehlende Werte sind erlaubt und erscheinen als Lücke bzw. Stille, nicht als Fehler.

## Aufbau

Statische Seite, ohne Build-Schritt. Lokal mit der VS-Code-Erweiterung «Live Server» öffnen, später über GitHub Pages veröffentlichen (für den QR-Code im Dossier).

```
klingende-werte-demo/
├── CLAUDE.md        ← dieses Dokument
├── index.html       ← Struktur, Bedienelemente, Bibliotheken per CDN
├── style.css        ← Gestaltung, grosse Bedienelemente, Fokus-Zustände
├── data.js          ← Vorschlagslisten, Symptom-Einstellungen, fiktive Beispieldaten (4 Wochen)
├── sound.js         ← Tone.js: Instrumente, Tonleitern, Abspielen (nur Symptome); ES-Modul
├── sketch.js        ← p5.js: Bild, Abspielkopf, Synchronisation mit sound.js
├── SAMPLES.md       ← Herkunft, Lizenz und Bearbeitung jeder Sample-Quelle
├── samples/         ← nur die Töne, die gebraucht werden; Dateiname = klingende Tonhöhe
│   ├── klavier/     ← Salamander Grand Piano (CC BY 3.0)
│   ├── trompete/    ← VSCO 2 CE (CC0)
│   └── kontrabass/  ← VSCO 2 CE, pizzicato (CC0)
└── vendor/twotone/  ← scales.js, applyEnvelope.js, num.js aus TwoTone (MIT, mit LICENSE)
```

`klanglabor/` (Strudel, nur lokal) steht in `.gitignore` und gehört nicht zur Demo.
`vergleich/` enthält Charis' private TwoTone-Spuren aus dem Selbstexperiment – steht in `.gitignore`, **nie committen**.

Bibliotheken: p5.js (1.x) und Tone.js (aktuelle Version), beide per CDN. Keine weiteren Abhängigkeiten ohne Rückfrage.

## Datenstruktur

Sie spiegelt den Figma-Prototyp. Jede Kategorie ist eine **Vorlage mit Vorschlägen**: übernehmen, entfernen, Eigenes hinzufügen.

```js
// data.js

// Vorschläge aus Figma
const vorschlaege = {
  symptome:    ["Energie", "Stimmung", "Gefühlsstörung", "Gliederschmerzen", "Kopfschmerzen",
                "Lähmungserscheinung", "Muskeltonus", "Sehstörung", "Schwindel", "Steifheit"],
  beschwerden: ["Gliederschmerzen", "Kopfschmerzen", "Lähmungserscheinungen", "Sehstörung", "Verspannung"],
  ereignisse:  ["Arzttermin", "Bewegung", "Flashes"],
  medikamente: ["Basistherapie", "Kortison", "Vitamine", "Schmerzmittel"]   // allgemeine Beispiele
};

// Gewählte Symptome (max. 5) – nur diese klingen
// Vorgaben von Charis (aus dem Selbstexperiment). Farben im Original als CMYK;
// "farbe" ist der Bildschirmwert (Hex) von Charis – verbindlich.
const symptome = [
  { id: "energie",        name: "Energie",        cmyk: "7/95/85/1",    farbe: "#D8282A", instrument: "klavier",    tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 3 },
  { id: "schwindel",      name: "Schwindel",      cmyk: "71/2/26/0",    farbe: "#2CB5C2", instrument: "trompete",   tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 3 },
  { id: "muskeltonus",    name: "Muskeltonus",    cmyk: "87/38/82/35",  farbe: "#195B3B", instrument: "kontrabass", tonart: "C", tonleiter: "lydisch", umfang: 3, startoktave: 1 },
  { id: "stimmung",       name: "Stimmung",       cmyk: "98/87/20/6",   farbe: "#2B3779", instrument: "klavier",    tonart: "C", tonleiter: "lydisch", umfang: 3, startoktave: 3 },
  { id: "gefuehlsstoerung", name: "Gefühlsstörung", cmyk: "0/67/15/0", farbe: "#FF769A", instrument: "trompete",   tonart: "C", tonleiter: "lydisch", umfang: 1, startoktave: 3 }
];

// Ruhephasen
const ruheFarbe = { cmyk: "0/29/85/0", farbe: "#FFBE2E" };

// Tonhöhe: Stufe 1–6 wird gleichmässig auf den Umfang der Tonleiter verteilt
// (wie in TwoTone): Stufe 1 = Startton, Stufe 6 = höchster Ton des Umfangs.

// Fiktive Beispieldaten: 4 Wochen = 28 Tage (Name «beispielwoche» geblieben)
const beispielwoche = [
  {
    tag: "Mo",
    symptome:    { energie: 0.7, schwindel: 0.3, muskeltonus: 0.5, stimmung: 0.5, gefuehlsstoerung: null },   // 0–1, null = nicht eingetragen
    beschwerden: ["Kopfschmerzen"],                 // optional
    ereignisse:  ["Bewegung"],                      // optional
    medikamente: ["Vitamine"],                      // optional
    ruhe: { nacht: [[22, 6]], tag: [[13, 14]] }     // Stunden, optional
  },
  // … Di bis So; mindestens ein Tag mit fehlendem Wert (null)
];
```

Die Werte sind **fiktiv** und zeigen glaubwürdige, nicht dramatische **4 Wochen (28 Tage)**: Woche 1 Auf und Ab mit ruhigem Sonntag, Woche 2 ruhig, Woche 3 ein mildes Tief um die Wochenmitte, Woche 4 Erholung. Ein paar Lücken: einzelne fehlende Werte und ein ganzer Tag ohne Eintrag (Woche 2, Samstag). Unter dem Bild steht «Woche 1» … «Woche 4» statt einzelner Tageskürzel.

## Raster (aus dem Selbstexperiment)

Auf derselben Fläche liegen zwei Koordinatensysteme übereinander:

**X-Achse – Tage:** eine Spalte pro Tag, gleichmässig verteilt.

**Primäre Y-Achse – Stärke der Symptome:** 6 Stufen (wie die 6 Segmente der Figma-Säule), von unten nach oben. Jede Stufe ist ein gleich hohes Band; der Symptom-Punkt eines Tages sitzt in der Mitte seines Bandes. Stufengrenzen als kräftigere Punktlinien, dazwischen feine Punktlinien.

**Sekundäre Y-Achse – Uhrzeit, für die Ruhezeiten:** Mitternacht liegt in der **Mitte** der Fläche.
- Obere Hälfte: Vormittag. Von Mitternacht (Mitte) nach oben bis Mittag (oberer Rand).
- Untere Hälfte: Nachmittag und Abend. Von Mittag (unterer Rand) nach oben bis Mitternacht (Mitte).
- So läuft die Zeit in beiden Hälften von unten nach oben, und der Nachtschlaf ist eine zusammenhängende Säule, die die Mittellinie kreuzt. Ein Mittagsschlaf erscheint als kurze Säule nahe am unteren Rand.

```js
// h = Stunde 0–24, oben/unten/mitte = Pixel-Koordinaten der Zeichenfläche
function yUhrzeit(h) {
  const halb = (unten - oben) / 2;
  if (h <= 12) return mitte - (h / 12) * halb;        // 0 → Mitte, 12 → oben
  return unten - ((h - 12) / 12) * halb;              // 12 → unten, 24 → Mitte
}
// Ruhezeit [22, 6]: Säule von yUhrzeit(22) bis yUhrzeit(6), durchgehend über die Mitte
```

Eine feine gelbe Mittellinie markiert Mitternacht.

**Beschriftung:** Die Zahlen der Stufen (1–6) und der Uhrzeit (0–24) sind **Konstruktionshilfe und werden nicht angezeigt** – keine Zahlen für Gefühltes. Sichtbar bleiben nur das Punktraster und die Wochentage.

## Zuordnung Bild und Klang

Zeitachse: **1 Tag = 1 Sekunde, fest** (Entscheidung 23.11.2026, wie TwoTone im Selbstexperiment; kein Umschalter). 4 Wochen = 28 Sekunden.

**Grundregel: Nur Symptome klingen. Alles andere erscheint nur im Bild.**

| Daten | Bild (p5.js) | Klang (Tone.js) |
|---|---|---|
| Symptom-Wert | Position auf der Spur; dicke, runde Linie in der gewählten Farbe, Kreis pro Tag | Tonhöhe innerhalb der gewählten Tonleiter, in 6 Stufen (wie die 6 Segmente der Figma-Säule) |
| Symptom-Einstellungen | Farbe | Instrument, Tonart, Tonleiter, Umfang, Startoktave |
| Fehlender Wert (`null`) | Lücke in der Linie | Stille für dieses Symptom |
| Beschwerden | Piktogramm-Form aus Figma (Welle, Doppellinie, Strichlinie …) am Tag | – |
| Ereignisse | Zeichen aus Figma (Kreuz, Welle, Strahlen) am Tag | – |
| Medikamente | Formen aus Figma (Pille, Tropfen, Strich, Punkte) am Tag | – |
| Ruhezeiten (Erholungsphasen) | senkrechte gelbe Säulen mit runden Enden, positioniert nach Uhrzeit auf der sekundären Y-Achse (siehe «Raster») | – |

Gestaltung: Bildsprache des Figma-Prototyps und des Films aus dem Selbstexperiment (https://vimeo.com/1117098859) – dicke Linien mit runden Enden, Kreise, Überlagerungen mit `blendMode(MULTIPLY)`, viel Weissraum, Punktraster im Hintergrund. Symptome als **breite Linien (Bänder) von Tag zu Tag**, die die ganze Höhe nutzen und sich überlagern – nicht wie ein dünnes Liniendiagramm. Ruhezeiten als senkrechte gelbe Säulen dahinter. Beschwerden / Ereignisse / Medikamente als kleinere Zeichen in eigenen Zeilen oben und unten (wie im Film). Eine einzige Schrift für alle Beschriftungen.

**Musik-Einstellungen für Testpersonen:** In Phase 1 wählt die Person pro Symptom nur **Farbe und Instrument**. Tonart, Tonleiter, Umfang und Startoktave sind sinnvoll vorgegeben und nur in einem eingeklappten Bereich «Mehr Klang-Einstellungen» erreichbar. Begriffe auf Deutsch wie im Figma: Tonleiter (Dur, Moll, Melodisch Moll, Harmonisch Moll, Dorisch, Phrygisch, Lydisch, Mixolydisch, Lokrisch), Umfang («2 Oktaven»), Startoktave.

Instrumente: Klavier, Violine, Trompete, Kontrabass. Die Beispieldaten zeigen alle fünf Symptome mit den Vorgaben oben (wie im Selbstexperiment).

**Klangwelt (Entscheidung 23.11.2026, «Weg 2»):** Charis entwickelt die Klangwelt im Strudel-Editor (strudel.cc) und hält fest, was ihr gefällt (Instrumente, Hall, Filter, Ein- und Ausklingen). Umgesetzt wird sie in **Tone.js**, nicht mit Strudel – Strudel steht unter AGPL-3.0, und die Lizenz der Demo und der späteren App soll offen bleiben. Kein Strudel-Code und keine Strudel-Pakete in diesem Repository.

**Klang wie TwoTone (umgesetzt in Schritt 2, `sound.js`):** So nah wie möglich an TwoTone (https://github.com/sonifydata/twotone), mit einer bewussten Abweichung:

- **Tonhöhe:** Wert 0–1 → eine der **6 festen Stufen** (wie im Bild) → Stufe in der Tonleiter wie TwoTone: `round(stufe/5 × Oktaven × 7)`, dann `getKeyNoteFrequency` aus TwoTones `scales.js`. *Abweichung:* TwoTone normalisiert jede Datenspalte auf ihr eigenes Min–Max; wir nicht.
- **Hüllkurve:** `applyEnvelope.js` aus TwoTone. Kein Einschwingen, Ton hält den ganzen Tag, kurzes Ausklingen (Klavier/Trompete 0,1 s, Bass 0,2 s), endet 0,01 s nach dem nächsten Anschlag. Jeder Tag wird neu angeschlagen, auch bei gleicher Tonhöhe. Lautstärke pro Instrument angeglichen (`0.7 / maxAmplitude × gain`, Werte aus TwoTone).
- **Angeglichen an die TwoTone-Aufnahmen** (Vergleich 23.11.2026 mit Charis' Spuren aus dem Selbstexperiment): **Klavier mono** aus dem rechten Kanal (die Summe beider Salamander-Kanäle löscht sich teils aus, C5 −8 dB). **Kontrabass mono** (Summe), **Tiefpass 500 Hz**, zusätzliches Abklingen −11 dB über 1 s → gesamt etwa −35 dB nach 1 s, dunkler und kürzer wie der TwoTone-Bass. **Trompete unverändert** (klang bei gleicher Tonhöhe schon gleich). **Kein Hall** – auch TwoTone hat keinen.
- **Samples:** nächstgelegenes Sample, per Abspielgeschwindigkeit auf die Tonhöhe gebracht (wie TwoTone). Keine `Tone.Sampler`, sondern pro Ton ein Web-Audio-Puffer mit eigener Hüllkurve – sonst passt `applyEnvelope` nicht. Tone.js lädt, plant (Transport) und gibt aus; am Ausgang ein Limiter nur als Schutz gegen Übersteuern (TwoTone hat keinen).
- **Fehlender Wert:** Pause.
- **Instrumente:** Klavier = Salamander (CC BY 3.0, Urheber in `SAMPLES.md` und auf der Seite), Trompete und Kontrabass (gezupft) = VSCO 2 CE (CC0). Violine ist noch nicht eingebunden. Herkunft und Bearbeitung in `SAMPLES.md`.
- **Achtung Benennung:** VSCO zählt Oktaven eine tiefer als üblich (VSCO «C3» klingt C4). Unsere Dateinamen sind die klingende Tonhöhe (C4 = mittleres C). TwoTone liest die VSCO-Namen wörtlich – dort klingt die Trompete eine Oktave höher als berechnet.
- **Vergleichsschalter «Oktaven wie TwoTone»** (nur für die Entwicklung, vor den Tests entfernen): aus = wie in den Einstellungen; an = so, wie TwoTone tatsächlich klingt. TwoTone schiebt die Startoktave nach unten, wenn Startoktave + Umfang über das Instrument hinausreicht, und bei der Trompete kommt der Benennungsversatz dazu. Ergebnis für die Beispieldaten: Schwindel unverändert, Muskeltonus eine Oktave tiefer, Gefühlsstörung eine Oktave höher, Klavier unverändert. Den TwoTone-Bass (patcharena, uneinheitlich benannt) bildet der Schalter nicht nach.
- **Code aus TwoTone:** nur `scales.js`, `applyEnvelope.js` und `num.js` aus `src/soundq` (MIT, © 2019 Datavized) – in `vendor/twotone/` mit Hinweis und LICENSE. Der übrige TwoTone-Code steht unter MPL 2.0 und wird nicht kopiert; Rechenwege sind in eigenen Worten nachgebaut.

## Bedienung

Zwei Modi, oben umschaltbar:

1. **Beispielwoche:** zeigt und spielt die fiktiven Beispieldaten (4 Wochen).
2. **Selbst setzen:**
   - Symptome aus den Vorschlägen wählen oder eigenes hinzufügen (max. 5), wieder entfernen.
   - Für jeden der 7 Tage pro Symptom ein vertikaler Regler ohne Zahlen (wie die Figma-Säule). Ein Tag kann leer bleiben.
   - Pro Tag Beschwerden, Ereignisse und Medikamente antippen (an/aus).
   - Bild und Klang aktualisieren sich sofort.

Bedienelemente (immer sichtbar, gross):

- **Abspielen / Pause** (auch Leertaste)
- **Klang an / aus** – Bild läuft weiter ohne Ton
- **Bewegung an / aus** – ohne Bewegung zeigt die Demo das ruhende Gesamtbild, der Abspielkopf springt nur tageweise. Startwert folgt `prefers-reduced-motion`.
- **Von vorne**

## Barrierefreiheit (WCAG 2.2 AA)

- Bedienelemente mind. 44 × 44 px, gut sichtbarer Fokus, alles per Tastatur bedienbar.
- Text mind. 16 px, Kontrast mind. 4.5 : 1 (Text) bzw. 3 : 1 (Linien, Regler-Grenzen).
- Regler mit `aria-valuetext` in Worten («wenig», «mittel», «viel», «nicht eingetragen»), nie Zahlen.
- Ton startet **nur nach Klick** (Browser-Regel und Respekt). Kein Autoplay.
- Das Canvas hat eine kurze Textbeschreibung (`aria-label`) dessen, was zu sehen ist.

## Schritte

1. **Gerüst:** Ordner, `index.html`, Bibliotheken laden, Beispielwoche, ruhendes Bild der Symptome zeichnen.
2. **Klang:** ein Instrument pro Symptom, Tonleiter-Quantisierung (Tonleitern als Halbtonschritte aus TwoTones `scales.js`, keine Zusatzbibliothek), eine Woche abspielen. *Umgesetzt:* `sound.js`, Abspielen/Pause (auch Leertaste), 1 Tag = 1 s, nach dem letzten Tag zurück an den Anfang. Klang an TwoTone angeglichen (siehe «Klang wie TwoTone»). Vorübergehend: Knopf «Als WAV speichern» (`wav-export.js`) zum Vergleich – vor den Tests entfernen. Offen: Violine, «Klang an/aus», «Von vorne», Abspielkopf (Schritt 3).
3. **Synchron:** `Tone.Transport` steuert, p5 zeichnet den Abspielkopf nach der Transport-Zeit. Play/Pause/Von vorne.
4. **Zeichen-Ebene (nur Bild):** Beschwerden, Ereignisse, Medikamente, Ruhezeiten.
5. **Selbst setzen:** Symptome wählen, Regler, Tages-Auswahl, Farb- und Instrumentwahl, «Mehr Klang-Einstellungen».
6. **Abschaltbar und barrierefrei:** Klang aus, Bewegung aus, Tastatur, Kontraste prüfen.
7. **Veröffentlichen:** GitHub Pages, Link in Figma (Filmbild auf dem Film-Screen) und QR-Code im Dossier (Vorarbeiten, S. 12).

Nach jedem Schritt: im Browser prüfen, kurz festhalten, was offen ist.

## Offene Entscheidungen

- Hochformat (Handy) oder Querformat zuerst? Vorschlag: Handy-Hochformat, weil der Figma-Prototyp darauf ausgelegt ist. Der Film aus dem Selbstexperiment ist Querformat – prüfen, was besser passt.
