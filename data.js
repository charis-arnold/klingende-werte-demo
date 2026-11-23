// data.js – Vorschlagslisten, Symptom-Einstellungen, fiktive Beispielwoche
// Alle Werte sind fiktiv. Werte 0–1 sind nur intern und werden nie als Zahl angezeigt.

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
  { id: "energie",          name: "Energie",        cmyk: "7/95/85/1",   farbe: "#D8282A", instrument: "klavier",    tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 3 },
  { id: "schwindel",        name: "Schwindel",      cmyk: "71/2/26/0",   farbe: "#2CB5C2", instrument: "trompete",   tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 3 },
  { id: "muskeltonus",      name: "Muskeltonus",    cmyk: "87/38/82/35", farbe: "#195B3B", instrument: "kontrabass", tonart: "C", tonleiter: "lydisch", umfang: 3, startoktave: 1 },
  { id: "stimmung",         name: "Stimmung",       cmyk: "98/87/20/6",  farbe: "#2B3779", instrument: "klavier",    tonart: "C", tonleiter: "lydisch", umfang: 3, startoktave: 3 },
  { id: "gefuehlsstoerung", name: "Gefühlsstörung", cmyk: "0/67/15/0",   farbe: "#FF769A", instrument: "trompete",   tonart: "C", tonleiter: "lydisch", umfang: 1, startoktave: 3 }
];

// Ruhephasen
const ruheFarbe = { cmyk: "0/29/85/0", farbe: "#FFBE2E" };

// Tonhöhe: Stufe 1–6 wird gleichmässig auf den Umfang der Tonleiter verteilt
// (wie in TwoTone): Stufe 1 = Startton, Stufe 6 = höchster Ton des Umfangs.

// Fiktive Beispielwoche: Auf und Ab, ein ruhiger Tag (So),
// zwei Lücken (Mo Gefühlsstörung, Do Stimmung). null = nicht eingetragen.
const beispielwoche = [
  {
    tag: "Mo",
    symptome:    { energie: 0.7,  schwindel: 0.3,  muskeltonus: 0.5,  stimmung: 0.5,  gefuehlsstoerung: null },
    beschwerden: [],
    ereignisse:  ["Bewegung"],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[23, 7]], tag: [] }
  },
  {
    tag: "Di",
    symptome:    { energie: 0.55, schwindel: 0.25, muskeltonus: 0.5,  stimmung: 0.6,  gefuehlsstoerung: 0.35 },
    beschwerden: [],
    ereignisse:  [],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[22, 6]], tag: [] }
  },
  {
    tag: "Mi",
    symptome:    { energie: 0.3,  schwindel: 0.55, muskeltonus: 0.65, stimmung: 0.4,  gefuehlsstoerung: 0.5 },
    beschwerden: ["Kopfschmerzen", "Verspannung"],
    ereignisse:  ["Arzttermin"],
    medikamente: ["Basistherapie", "Schmerzmittel"],
    ruhe: { nacht: [[22, 6]], tag: [[14, 15]] }
  },
  {
    tag: "Do",
    symptome:    { energie: 0.35, schwindel: 0.6,  muskeltonus: 0.7,  stimmung: null, gefuehlsstoerung: 0.55 },
    beschwerden: ["Sehstörung"],
    ereignisse:  ["Flashes"],
    medikamente: ["Basistherapie"],
    ruhe: { nacht: [[21, 7]], tag: [[13, 15]] }
  },
  {
    tag: "Fr",
    symptome:    { energie: 0.5,  schwindel: 0.4,  muskeltonus: 0.55, stimmung: 0.55, gefuehlsstoerung: 0.4 },
    beschwerden: [],
    ereignisse:  [],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[22, 6]], tag: [] }
  },
  {
    tag: "Sa",
    symptome:    { energie: 0.75, schwindel: 0.2,  muskeltonus: 0.45, stimmung: 0.7,  gefuehlsstoerung: 0.3 },
    beschwerden: [],
    ereignisse:  ["Bewegung"],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[0, 8]], tag: [] }
  },
  {
    tag: "So",
    symptome:    { energie: 0.6,  schwindel: 0.2,  muskeltonus: 0.45, stimmung: 0.65, gefuehlsstoerung: 0.3 },
    beschwerden: [],
    ereignisse:  [],
    medikamente: ["Basistherapie"],
    ruhe: { nacht: [[23, 8]], tag: [[15, 16]] }
  }
];
