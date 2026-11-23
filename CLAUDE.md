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
├── data.js          ← Vorschlagslisten, Symptom-Einstellungen, fiktive Beispielwoche
├── sound.js         ← Tone.js: Instrumente, Tonleitern, Abspielen (nur Symptome)
└── sketch.js        ← p5.js: Bild, Abspielkopf, Synchronisation mit sound.js
```

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
const symptome = [
  { id: "energie",  name: "Energie",  farbe: "#C8393B", instrument: "klavier", tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 3 },
  { id: "stimmung", name: "Stimmung", farbe: "#5AAFC0", instrument: "violine", tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 4 }
];

// Fiktive Beispielwoche
const beispielwoche = [
  {
    tag: "Mo",
    symptome:    { energie: 0.7, stimmung: 0.5 },   // 0–1, null = nicht eingetragen
    beschwerden: ["Kopfschmerzen"],                 // optional
    ereignisse:  ["Bewegung"],                      // optional
    medikamente: ["Vitamine"],                      // optional
    ruhe: { nacht: [[22, 6]], tag: [[13, 14]] }     // Stunden, optional
  },
  // … Di bis So; mindestens ein Tag mit fehlendem Wert (null)
];
```

Die Werte sind **fiktiv** und zeigen eine glaubwürdige, nicht dramatische Woche: Auf und Ab, ein ruhiger Tag, eine Lücke.

## Zuordnung Bild und Klang

Zeitachse: **1 Tag = 1 Takt** (Startwert ca. 2 Sekunden), Woche ≈ 15 Sekunden.

**Grundregel: Nur Symptome klingen. Alles andere erscheint nur im Bild.**

| Daten | Bild (p5.js) | Klang (Tone.js) |
|---|---|---|
| Symptom-Wert | Position auf der Spur; dicke, runde Linie in der gewählten Farbe, Kreis pro Tag | Tonhöhe innerhalb der gewählten Tonleiter, in 6 Stufen (wie die 6 Segmente der Figma-Säule) |
| Symptom-Einstellungen | Farbe | Instrument, Tonart, Tonleiter, Umfang, Startoktave |
| Fehlender Wert (`null`) | Lücke in der Linie | Stille für dieses Symptom |
| Beschwerden | Piktogramm-Form aus Figma (Welle, Doppellinie, Strichlinie …) am Tag | – |
| Ereignisse | Zeichen aus Figma (Kreuz, Welle, Strahlen) am Tag | – |
| Medikamente | Formen aus Figma (Pille, Tropfen, Strich, Punkte) am Tag | – |
| Ruhezeiten | Fläche bzw. Band unter dem Tag | – |

Gestaltung: Bildsprache des Figma-Prototyps und des Films aus dem Selbstexperiment (https://vimeo.com/1117098859) – dicke Linien mit runden Enden, Kreise, Überlagerungen mit `blendMode(MULTIPLY)`, viel Weissraum, Punktraster im Hintergrund. Symptome als grosse Linien in der Mitte, Beschwerden / Ereignisse / Medikamente als kleinere Zeichen in eigenen Zeilen oben und unten (wie im Film).

**Musik-Einstellungen für Testpersonen:** In Phase 1 wählt die Person pro Symptom nur **Farbe und Instrument**. Tonart, Tonleiter, Umfang und Startoktave sind sinnvoll vorgegeben und nur in einem eingeklappten Bereich «Mehr Klang-Einstellungen» erreichbar. Begriffe auf Deutsch wie im Figma: Tonleiter (Dur, Moll, Melodisch Moll, Harmonisch Moll, Dorisch, Phrygisch, Lydisch, Mixolydisch, Lokrisch), Umfang («2 Oktaven»), Startoktave.

Instrumente: Klavier, Violine, Trompete, Bass. Zuerst mit `Tone.Sampler` und frei lizenzierten Samples (z. B. das Projekt «tonejs-instruments»). Lizenz prüfen und notieren. Falls das nicht klappt, gut klingende Synth-Annäherungen.

## Bedienung

Zwei Modi, oben umschaltbar:

1. **Beispielwoche:** zeigt und spielt die fiktive Woche.
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
2. **Klang:** ein Instrument pro Symptom, Tonleiter-Quantisierung (Tonleitern selbst als Halbtonschritte hinterlegen, keine Zusatzbibliothek), eine Woche abspielen.
3. **Synchron:** `Tone.Transport` steuert, p5 zeichnet den Abspielkopf nach der Transport-Zeit. Play/Pause/Von vorne.
4. **Zeichen-Ebene (nur Bild):** Beschwerden, Ereignisse, Medikamente, Ruhezeiten.
5. **Selbst setzen:** Symptome wählen, Regler, Tages-Auswahl, Farb- und Instrumentwahl, «Mehr Klang-Einstellungen».
6. **Abschaltbar und barrierefrei:** Klang aus, Bewegung aus, Tastatur, Kontraste prüfen.
7. **Veröffentlichen:** GitHub Pages, Link in Figma (Filmbild auf dem Film-Screen) und QR-Code im Dossier (Vorarbeiten, S. 12).

Nach jedem Schritt: im Browser prüfen, kurz festhalten, was offen ist.

## Offene Entscheidungen

- Tempo: 2 Sekunden pro Tag als Startwert. Testen, ob Testpersonen langsamer wollen.
- Hochformat (Handy) oder Querformat zuerst? Vorschlag: Handy-Hochformat, weil der Figma-Prototyp darauf ausgelegt ist. Der Film aus dem Selbstexperiment ist Querformat – prüfen, was besser passt.
