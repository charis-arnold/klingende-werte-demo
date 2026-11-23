// sound.js – Tone.js: Instrumente, Tonleitern, Abspielen (nur Symptome klingen)
//
// So nah wie möglich an TwoTone (https://github.com/sonifydata/twotone):
//   - Tonhöhe: Stufe in der Tonleiter, gerechnet mit scales.js aus TwoTone
//   - Hüllkurve: applyEnvelope.js aus TwoTone – kein Einschwingen, Ton hält den ganzen Tag,
//     kurzes Ausklingen (Klavier/Trompete 0,1 s, Bass 0,2 s), endet 0,01 s nach dem nächsten Anschlag
//   - jeder Tag wird neu angeschlagen, auch bei gleicher Tonhöhe
//   - Sample: das nächstgelegene, per Abspielgeschwindigkeit auf die Tonhöhe gebracht
//   - fehlender Wert = Pause
// Anders als TwoTone: feste 6 Stufen statt Min–Max pro Spalte (wie die 6 Segmente der Figma-Säule).
// Angeglichen an die TwoTone-Aufnahmen aus dem Selbstexperiment (Vergleich 23.11.2026):
//   1 Tag = 1 Sekunde wie dort; Klavier mono (rechter Kanal, ohne Auslöschungen);
//   Bass mono, Tiefpass um 500 Hz, schnelleres Abklingen (dunkler und kürzer wie der TwoTone-Bass).
//
// Tone.js übernimmt Laden, Zeitplan (Transport) und Ausgang. Die einzelnen Töne sind – wie in
// TwoTone – einfache Web-Audio-Knoten (Puffer → Hüllkurve), damit applyEnvelope unverändert passt.

import { getKeyNoteFrequency, getNoteMidi } from "./vendor/twotone/scales.js";
import applyEnvelope from "./vendor/twotone/applyEnvelope.js";

const SEKUNDEN_PRO_TAG = 1;   // fest, wie in TwoTone (siehe CLAUDE.md)
const STUFEN = 6;

// Tonleiter-Namen aus data.js → Namen in scales.js
const TONLEITERN = {
  "dur": "major",
  "moll": "minor",
  "melodisch moll": "melodic",
  "harmonisch moll": "harmonic",
  "dorisch": "dorian",
  "phrygisch": "phrygian",
  "lydisch": "lydian",
  "mixolydisch": "mixolydian",
  "lokrisch": "locrian"
};

// Instrumente. Dateinamen = klingende Tonhöhe (C4 = mittleres C), siehe SAMPLES.md.
// release / maxAmplitude / gain wie in TwoTone (samplerInstruments.js), ausser wo vermerkt.
// "twotone" beschreibt nur den Vergleichsschalter (siehe oktavenWieTwoTone).
const INSTRUMENTE = {
  klavier: {
    ordner: "samples/klavier",
    toene: ["C3", "Ds3", "Fs3", "A3", "C4", "Ds4", "Fs4", "A4", "C5", "Ds5", "Fs5", "A5", "C6"],
    release: 0.1,
    maxAmplitude: 0.4453566074371338,
    gain: 0.5,
    // Mono aus dem rechten Kanal: Die Salamander-Samples sind mit zwei Mikrofonen im Abstand
    // aufgenommen; die Summe beider Kanäle löscht sich teils aus (C5 −8 dB).
    mono: "rechts",
    twotone: { minOktave: 0, maxOktave: 7, namensVersatz: 0 }
  },
  trompete: {
    ordner: "samples/trompete",
    toene: ["F3", "A3", "C4", "Ds4", "G4", "As4", "D5"],
    release: 0.1,
    maxAmplitude: 0.3986937999725342,
    gain: 1,
    // TwoTone liest die VSCO-Dateinamen wörtlich; VSCO zählt aber eine Oktave tiefer.
    // Darum klingt die Trompete in TwoTone eine Oktave höher als berechnet.
    twotone: { minOktave: 2, maxOktave: 4, namensVersatz: 12 }
  },
  kontrabass: {
    ordner: "samples/kontrabass",
    toene: ["E1", "Fs1", "G1", "As1", "C2", "D2", "E2", "Fs2", "Gs2", "A2", "Cs3", "E3", "Gs3", "B3"],
    release: 0.2,
    maxAmplitude: 0.7,   // eigene Samples, auf Spitze 0,7 angeglichen (TwoTone: 0,715)
    gain: 1,
    // Näher am dunklen, kurzen TwoTone-Bass: Summe beider Kanäle, Tiefpass, zusätzliches Abklingen
    mono: "summe",
    tiefpass: 500,                       // Hz
    abklingen: { db: -11, nach: 1 },     // zusätzlich zum natürlichen Abklingen → gesamt etwa −35 dB nach 1 s
    // TwoTone-Bass (patcharena) ist uneinheitlich benannt – nicht nachbildbar, darum kein Versatz.
    twotone: { minOktave: 0, maxOktave: 3, namensVersatz: 0 }
  }
};
INSTRUMENTE.bass = INSTRUMENTE.kontrabass;   // alter Name

// ---------- Tonhöhe ----------

function stufeVonWert(wert) {
  return Math.min(STUFEN - 1, Math.floor(wert * STUFEN));   // 0 … 5, wie im Bild
}

// Vergleichsschalter: so, wie TwoTone tatsächlich klingt.
// 1. TwoTone schiebt beim Abspielen die Startoktave nach unten, wenn Startoktave + Umfang
//    über die oberste Oktave des Instruments reicht (scale/index.js, update()).
// 2. Danach der Versatz durch die Sample-Benennung (nur Trompete).
function oktavenWieTwoTone(symptom, instrument) {
  const { minOktave, maxOktave, namensVersatz } = instrument.twotone;
  let start = symptom.startoktave;
  if (start + symptom.umfang > maxOktave) {
    start = Math.max(minOktave, maxOktave - symptom.umfang);
  }
  start = Math.max(minOktave, Math.min(maxOktave, start));
  const umfang = Math.min(symptom.umfang, 1 + maxOktave - start);
  return { start, umfang, versatz: namensVersatz };
}

// Wert 0–1 → MIDI-Note der klingenden Tonhöhe. null = Pause.
function noteFuer(symptom, wert) {
  if (wert === null || wert === undefined) return null;
  const instrument = INSTRUMENTE[symptom.instrument];
  let { startoktave: start, umfang } = symptom;
  let versatz = 0;
  if (zustand.wieTwoTone && instrument) {
    ({ start, umfang, versatz } = oktavenWieTwoTone(symptom, instrument));
  }
  // Wie TwoTone: note = round(wert × (scaleRange − 1)), scaleRange = Oktaven × 7 + 1.
  // Nur ist "wert" hier die feste Stufe (0, 1/5 … 1) statt Min–Max der Spalte.
  const scaleRange = umfang * 7 + 1;
  const stufenwert = stufeVonWert(wert) / (STUFEN - 1);
  const tonstufe = Math.round(stufenwert * (scaleRange - 1));
  const modus = TONLEITERN[symptom.tonleiter.toLowerCase()] || symptom.tonleiter;
  const frequenz = getKeyNoteFrequency(tonstufe, symptom.tonart, modus, start);
  return Math.round(69 + 12 * Math.log2(frequenz / 440)) + versatz;
}

// ---------- Laden ----------

// Sample-Name ("Ds3") → MIDI, wie loadSamples in TwoTone ("s" = Kreuz)
function midiVonName(name) {
  const [, ton, oktave] = /^([a-z]+)([0-9]+)$/i.exec(name);
  return getNoteMidi(ton.replace("s", "#"), parseInt(oktave, 10));
}

const tabellen = {};   // Instrument-Name → Map(MIDI → AudioBuffer), sobald geladen

async function instrumentLaden(name) {
  const inst = INSTRUMENTE[name];
  if (!inst || tabellen[name]) return;
  const eintraege = await Promise.all(inst.toene.map(async ton => {
    const buffer = await Tone.ToneAudioBuffer.load(`${inst.ordner}/${ton}.mp3`);
    return [midiVonName(ton), buffer];
  }));
  tabellen[name] = new Map(eintraege);
}

function alleLaden() {
  return Promise.all([...new Set(symptome.map(s => s.instrument))].map(instrumentLaden));
}

// Nächstgelegenes Sample; bei gleichem Abstand das höhere (wie sampler.js in TwoTone)
function naechstesSample(tabelle, midi) {
  for (let abstand = 0; abstand < 96; abstand++) {
    if (tabelle.has(midi + abstand)) return { midi: midi + abstand, buffer: tabelle.get(midi + abstand) };
    if (tabelle.has(midi - abstand)) return { midi: midi - abstand, buffer: tabelle.get(midi - abstand) };
  }
  return null;
}

// ---------- Ausgang ----------

// Pro Symptom ein Kanal (Lautstärke 1 wie in TwoTone). Am Ende ein Limiter nur als Schutz
// gegen Übersteuern, wenn alle fünf Stimmen gleichzeitig laut sind – TwoTone hat keinen.
const limiter = new Tone.Limiter(-1).toDestination();
const kanaele = new Map();

function kanalFuer(symptom) {
  if (!kanaele.has(symptom.id)) kanaele.set(symptom.id, new Tone.Gain(1).connect(limiter));
  return kanaele.get(symptom.id);
}

// ---------- Ein Ton ----------

const aktiveToene = new Set();

// ausgang: wohin der Ton geht (Standard: Kanal des Symptoms; für den WAV-Export ein eigener)
function anschlagen(symptom, midi, zeit, haltedauer, ausgang = kanalFuer(symptom)) {
  const inst = INSTRUMENTE[symptom.instrument];
  const tabelle = tabellen[symptom.instrument];
  if (!tabelle) return;
  const sample = naechstesSample(tabelle, midi);
  if (!sample) return;

  const ctx = Tone.getContext().rawContext;
  const quelle = ctx.createBufferSource();
  quelle.buffer = sample.buffer;
  const rate = Math.pow(2, (midi - sample.midi) / 12);
  quelle.playbackRate.value = rate;

  // Kette: Quelle → (Mono) → (Tiefpass) → (Abklingen) → Hüllkurve → Ausgang
  let kette = quelle;
  const anhaengen = knoten => { kette.connect(knoten); kette = knoten; };
  if (inst.mono === "rechts") {
    const teiler = ctx.createChannelSplitter(2);
    const mono = ctx.createGain();
    kette.connect(teiler);
    teiler.connect(mono, 1);   // nur der rechte Kanal
    kette = mono;
  } else if (inst.mono === "summe") {
    const mono = ctx.createGain();   // auf einen Kanal heruntergemischt: (L + R) / 2
    mono.channelCount = 1;
    mono.channelCountMode = "explicit";
    mono.channelInterpretation = "speakers";
    anhaengen(mono);
  }
  if (inst.tiefpass) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = inst.tiefpass;
    filter.Q.value = Math.SQRT1_2;
    anhaengen(filter);
  }
  if (inst.abklingen) {
    const abklingen = ctx.createGain();
    abklingen.gain.setValueAtTime(1, zeit);
    abklingen.gain.exponentialRampToValueAtTime(Math.pow(10, inst.abklingen.db / 20), zeit + inst.abklingen.nach);
    anhaengen(abklingen);
  }
  const huelle = ctx.createGain();
  anhaengen(huelle);
  Tone.connect(huelle, ausgang);

  // Wie TwoTone: duration = interval + release + 0.01; Ausklingen beginnt release vor dem Ende.
  const ende = zeit + haltedauer + inst.release + 0.01;
  applyEnvelope(huelle.gain, zeit, ende, ende, {
    attack: 0,
    decay: 0,
    sustain: 0.7 / inst.maxAmplitude,
    release: inst.release,
    gain: inst.gain
  });
  quelle.start(zeit);
  quelle.stop(Math.min(ende, zeit + quelle.buffer.duration / rate));

  const ton = { quelle, huelle, release: inst.release };
  aktiveToene.add(ton);
  quelle.onended = () => {
    huelle.disconnect();
    aktiveToene.delete(ton);
  };
}

// Klingende Töne sofort kurz ausklingen lassen (bei Pause)
function verstummen() {
  const jetzt = Tone.getContext().rawContext.currentTime;
  for (const { quelle, huelle, release } of aktiveToene) {
    huelle.gain.cancelScheduledValues(jetzt);
    huelle.gain.setValueAtTime(huelle.gain.value, jetzt);
    huelle.gain.linearRampToValueAtTime(0, jetzt + release);
    try { quelle.stop(jetzt + release + 0.01); } catch (e) { /* schon gestoppt */ }
  }
}

function tagSpielen(index, zeit, haltedauer = SEKUNDEN_PRO_TAG) {
  const tag = beispielwoche[index];
  if (!tag) return;
  for (const s of symptome) {
    const midi = noteFuer(s, tag.symptome[s.id]);
    if (midi !== null) anschlagen(s, midi, zeit, haltedauer);
  }
}

// ---------- Zeitplan ----------

const transport = Tone.getTransport();
const WOCHE = beispielwoche.length * SEKUNDEN_PRO_TAG;

beispielwoche.forEach((_, i) => {
  transport.schedule(zeit => tagSpielen(i, zeit), i * SEKUNDEN_PRO_TAG);
});
// Nach dem letzten Tag: zurück an den Anfang, bereit für das nächste Abspielen
transport.schedule(zeit => {
  Tone.getDraw().schedule(() => {
    transport.stop();
    zustandSetzen({ laeuft: false });
  }, zeit);
}, WOCHE + 0.3);

const zustand = { laeuft: false, geladen: false, wieTwoTone: false };
const beobachter = new Set();

function zustandSetzen(neu) {
  Object.assign(zustand, neu);
  beobachter.forEach(f => f({ ...zustand }));
}

async function abspielen() {
  if (zustand.laeuft) return;
  await Tone.start();   // Ton erst nach Klick (Browser-Regel)
  if (!zustand.geladen) {
    zustandSetzen({ laedt: true });
    await bereit;
  }
  // Nach einer Pause mitten im Tag: den laufenden Tag für den Rest neu anschlagen
  const position = transport.seconds;
  const tag = Math.floor(position / SEKUNDEN_PRO_TAG + 1e-6);
  const rest = (tag + 1) * SEKUNDEN_PRO_TAG - position;
  const mitten = position > 0 && rest > 0.05 && rest < SEKUNDEN_PRO_TAG - 1e-6;
  const jetzt = Tone.now() + 0.05;
  transport.start(jetzt);
  if (mitten) tagSpielen(tag, jetzt, rest);
  zustandSetzen({ laeuft: true, laedt: false });
}

function pause() {
  if (!zustand.laeuft) return;
  transport.pause();
  verstummen();
  zustandSetzen({ laeuft: false });
}

function umschalten() {
  return zustand.laeuft ? pause() : abspielen();
}

const bereit = alleLaden().then(() => zustandSetzen({ geladen: true }));

// ---------- Bedienung ----------

const knopf = document.getElementById("abspielen");
const knopfText = document.getElementById("abspielen-text");
const schalterTwoTone = document.getElementById("wie-twotone");
const status = document.getElementById("klang-status");

beobachter.add(z => {
  knopfText.textContent = z.laeuft ? "Pause" : "Abspielen";
  knopf.setAttribute("aria-pressed", z.laeuft ? "true" : "false");
  knopf.classList.toggle("laeuft", z.laeuft);
  status.textContent = z.laedt && !z.geladen ? "Klänge werden geladen …" : "";
});

knopf.addEventListener("click", umschalten);

schalterTwoTone.checked = false;
schalterTwoTone.addEventListener("change", () => {
  zustandSetzen({ wieTwoTone: schalterTwoTone.checked });   // gilt ab dem nächsten Tag
});

// Leertaste = Abspielen/Pause, ausser auf Bedienelementen, die die Leertaste selbst nutzen
document.addEventListener("keydown", e => {
  if (e.code !== "Space" || e.repeat) return;
  const ziel = e.target;
  if (ziel.closest && ziel.closest("button, input, select, textarea, a, [contenteditable]")) return;
  e.preventDefault();
  umschalten();
});

bereit.catch(e => {
  status.textContent = "Die Klänge konnten nicht geladen werden.";
  console.error(e);
});

// Für den vorübergehenden WAV-Export (wav-export.js)
export { noteFuer, anschlagen, bereit, SEKUNDEN_PRO_TAG };

// Für Schritt 3 (Abspielkopf im Bild)
window.klang = {
  abspielen, pause, umschalten, transport,
  sekundenProTag: SEKUNDEN_PRO_TAG,
  zustand: () => ({ ...zustand }),
  beobachten: f => beobachter.add(f)
};
