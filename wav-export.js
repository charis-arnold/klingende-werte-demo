// wav-export.js – VORÜBERGEHEND: pro Symptom eine WAV-Spur der Beispielwoche speichern,
// zum Vergleich mit den TwoTone-Spuren aus dem Selbstexperiment. Vor den Tests entfernen
// (Knopf in index.html, diese Datei, Export-Zeile in sound.js).
//
// Rendert mit Tone.Offline genau die Töne, die auch beim Abspielen erklingen
// (gleiche Tonhöhe, Hüllkurve, Samples), aber ohne den Limiter am Ausgang.

import { noteFuer, anschlagen, bereit, SEKUNDEN_PRO_TAG } from "./sound.js";

const AUSKLINGEN = 1;   // Sekunden Stille nach dem letzten Ton, damit nichts abgeschnitten wird

async function spurRendern(symptom) {
  const dauer = beispielwoche.length * SEKUNDEN_PRO_TAG + AUSKLINGEN;
  const puffer = await Tone.Offline(() => {
    const ausgang = new Tone.Gain(1).toDestination();
    beispielwoche.forEach((tag, i) => {
      const midi = noteFuer(symptom, tag.symptome[symptom.id]);
      if (midi !== null) anschlagen(symptom, midi, i * SEKUNDEN_PRO_TAG, SEKUNDEN_PRO_TAG, ausgang);
    });
  }, dauer, 2, 44100);
  return puffer.get();
}

// AudioBuffer → WAV (16 Bit PCM)
function alsWav(buffer) {
  const kanaele = buffer.numberOfChannels;
  const laenge = buffer.length;
  const daten = new DataView(new ArrayBuffer(44 + laenge * kanaele * 2));
  const text = (pos, s) => [...s].forEach((c, i) => daten.setUint8(pos + i, c.charCodeAt(0)));
  text(0, "RIFF");
  daten.setUint32(4, 36 + laenge * kanaele * 2, true);
  text(8, "WAVE");
  text(12, "fmt ");
  daten.setUint32(16, 16, true);
  daten.setUint16(20, 1, true);
  daten.setUint16(22, kanaele, true);
  daten.setUint32(24, buffer.sampleRate, true);
  daten.setUint32(28, buffer.sampleRate * kanaele * 2, true);
  daten.setUint16(32, kanaele * 2, true);
  daten.setUint16(34, 16, true);
  text(36, "data");
  daten.setUint32(40, laenge * kanaele * 2, true);
  const kanalDaten = [...Array(kanaele)].map((_, k) => buffer.getChannelData(k));
  let pos = 44;
  for (let i = 0; i < laenge; i++) {
    for (let k = 0; k < kanaele; k++) {
      const v = Math.max(-1, Math.min(1, kanalDaten[k][i]));
      daten.setInt16(pos, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
      pos += 2;
    }
  }
  return new Blob([daten], { type: "audio/wav" });
}

function dateiname(symptom) {
  const twotone = document.getElementById("wie-twotone").checked ? " - oktaven-wie-twotone" : "";
  return `demo - ${symptom.id}${twotone}.wav`;
}

function speichern(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Für die automatische Auswertung ohne Klick (gibt Name und WAV je Symptom zurück)
export async function alleSpurenRendern() {
  await bereit;
  const ergebnis = [];
  for (const s of symptome) {
    ergebnis.push({ name: dateiname(s), wav: alsWav(await spurRendern(s)) });
  }
  return ergebnis;
}

const knopf = document.getElementById("wav-speichern");
const status = document.getElementById("klang-status");

knopf.addEventListener("click", async () => {
  knopf.disabled = true;
  status.textContent = "WAV-Spuren werden berechnet …";
  try {
    for (const { name, wav } of await alleSpurenRendern()) speichern(wav, name);
    status.textContent = `${symptome.length} WAV-Spuren gespeichert.`;
  } catch (e) {
    status.textContent = "Die WAV-Spuren konnten nicht berechnet werden.";
    console.error(e);
  } finally {
    knopf.disabled = false;
  }
});
