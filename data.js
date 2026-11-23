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
const symptome = [
  { id: "energie",  name: "Energie",  farbe: "#C8393B", instrument: "klavier", tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 3 },
  { id: "stimmung", name: "Stimmung", farbe: "#5AAFC0", instrument: "violine", tonart: "C", tonleiter: "lydisch", umfang: 2, startoktave: 4 }
];

// Fiktive Beispielwoche: Auf und Ab, ein ruhiger Tag (So), eine Lücke (Do, Stimmung)
const beispielwoche = [
  {
    tag: "Mo",
    symptome:    { energie: 0.7, stimmung: 0.5 },
    beschwerden: [],
    ereignisse:  ["Bewegung"],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[23, 7]], tag: [] }
  },
  {
    tag: "Di",
    symptome:    { energie: 0.55, stimmung: 0.6 },
    beschwerden: [],
    ereignisse:  [],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[22, 6]], tag: [] }
  },
  {
    tag: "Mi",
    symptome:    { energie: 0.3, stimmung: 0.4 },
    beschwerden: ["Kopfschmerzen", "Verspannung"],
    ereignisse:  ["Arzttermin"],
    medikamente: ["Basistherapie", "Schmerzmittel"],
    ruhe: { nacht: [[22, 6]], tag: [[14, 15]] }
  },
  {
    tag: "Do",
    symptome:    { energie: 0.35, stimmung: null },   // nicht eingetragen
    beschwerden: ["Sehstörung"],
    ereignisse:  ["Flashes"],
    medikamente: ["Basistherapie"],
    ruhe: { nacht: [[21, 7]], tag: [[13, 15]] }
  },
  {
    tag: "Fr",
    symptome:    { energie: 0.5, stimmung: 0.55 },
    beschwerden: [],
    ereignisse:  [],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[22, 6]], tag: [] }
  },
  {
    tag: "Sa",
    symptome:    { energie: 0.75, stimmung: 0.7 },
    beschwerden: [],
    ereignisse:  ["Bewegung"],
    medikamente: ["Basistherapie", "Vitamine"],
    ruhe: { nacht: [[0, 8]], tag: [] }
  },
  {
    tag: "So",
    symptome:    { energie: 0.6, stimmung: 0.65 },
    beschwerden: [],
    ereignisse:  [],
    medikamente: ["Basistherapie"],
    ruhe: { nacht: [[23, 8]], tag: [[15, 16]] }
  }
];
