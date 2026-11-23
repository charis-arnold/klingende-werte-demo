// sketch.js – p5.js: ruhendes Bild der Woche
// Raster wie im Selbstexperiment (siehe CLAUDE.md, «Raster»):
//   X-Achse: Tage
//   primäre Y-Achse: 6 Stufen der Symptome
//   sekundäre Y-Achse: Uhrzeit für die Ruhezeiten, Mitternacht in der Mitte
// Stufen- und Uhrzeit-Zahlen sind nur Konstruktionshilfe und werden nie angezeigt.
// Abspielkopf und Synchronisation mit sound.js folgen in Schritt 3.

const STUFEN = 6;

const BILD = {
  verhaeltnisQuer: 0.6,     // Höhe = Breite × Verhältnis (Querformat)
  verhaeltnisHoch: 1.25,    // Handy-Hochformat: deutlich höher
  maxHoeheAnteil: 0.72,     // höchstens dieser Anteil der Fensterhöhe
  minHoehe: 300,
  randGross: 32,            // Weissraum links/rechts
  randKlein: 16,            // auf schmalen Bildschirmen
  innenRand: 6,             // Weissraum oben/unten

  rasterGrob: "#BDBDBD",    // Stufengrenzen
  rasterFein: "#DEDEDE",    // Linien dazwischen
  punktAbstand: 8,

  bandAnteil: 0.72,         // Banddicke relativ zur Stufenhöhe
  kreisAnteil: 1.0,         // Kreis relativ zur Stufenhöhe
  kreisMaxSpalte: 0.95,     // … aber nicht breiter als die Tagesspalte
  bandMaxKreis: 0.72,       // Band nie dicker als dieser Anteil des Kreises

  ruheFarbe: "#F4C542",
  ruheBreiteAnteil: 0.34,   // Säulenbreite relativ zur Tagesspalte
  mitternachtFarbe: "#E3B21F"
};

let leinwand;
let ebenenSpeicher = null;

// ---------- Aufbau ----------

function bildMasse() {
  const breite = document.getElementById("leinwand").clientWidth;
  const hochformat = window.innerHeight > window.innerWidth;
  const verhaeltnis = hochformat ? BILD.verhaeltnisHoch : BILD.verhaeltnisQuer;
  const hoehe = Math.min(breite * verhaeltnis, window.innerHeight * BILD.maxHoeheAnteil);
  return { breite, hoehe: Math.round(Math.max(BILD.minHoehe, hoehe)) };
}

function rand() {
  return width < 600 ? BILD.randKlein : BILD.randGross;
}

function setup() {
  const behaelter = document.getElementById("leinwand");
  const m = bildMasse();
  leinwand = createCanvas(m.breite, m.hoehe);
  leinwand.parent(behaelter);
  leinwand.elt.setAttribute("role", "img");
  leinwand.elt.setAttribute("aria-label", beschreibung());
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  noLoop();   // ruhendes Bild
  tageAufbauen();
  legendeAufbauen();
}

function windowResized() {
  const m = bildMasse();
  resizeCanvas(m.breite, m.hoehe);
  tageAusrichten();
  redraw();
}

// ---------- Zeichnen ----------

function draw() {
  blendMode(BLEND);
  background(255);

  const f = flaeche();
  punktraster(f);
  ruhezeitenZeichnen(f);
  mitternachtslinie(f);

  // Jedes Symptom zuerst einzeln zeichnen (ohne Selbst-Überlagerung),
  // dann die Symptome untereinander und mit den Ruhezeiten mit MULTIPLY überlagern.
  for (const s of symptome) {
    const ebene = symptomEbene();
    ebene.clear();
    symptomZeichnen(ebene, s, f);
    blendMode(MULTIPLY);
    image(ebene, 0, 0, width, height);
    blendMode(BLEND);
  }
}

// Gemeinsame Zeichenfläche für beide Y-Achsen
function flaeche() {
  const links = rand();
  const rechts = width - rand();
  const oben = BILD.innenRand;
  const unten = height - BILD.innenRand;
  const spalte = (rechts - links) / beispielwoche.length;
  const stufe = (unten - oben) / STUFEN;
  const kreis = Math.min(stufe * BILD.kreisAnteil, spalte * BILD.kreisMaxSpalte);
  return {
    links, rechts, oben, unten,
    mitte: (oben + unten) / 2,
    spalte, stufe, kreis,
    dicke: Math.min(stufe * BILD.bandAnteil, kreis * BILD.bandMaxKreis)
  };
}

function tagX(i, f) {
  return f.links + f.spalte * (i + 0.5);
}

// Primäre Y-Achse: Wert 0–1 → eine der 6 Stufen → Mitte ihres Bandes
function stufeVonWert(wert) {
  return Math.min(STUFEN - 1, Math.floor(wert * STUFEN));   // 0 … 5
}

function yStufe(stufe, f) {
  return f.unten - (stufe + 0.5) * f.stufe;
}

// Sekundäre Y-Achse: Stunde 0–24, Mitternacht in der Mitte
//   0 → Mitte, 12 → oben  |  12 → unten, 24 → Mitte
function yUhrzeit(h, f) {
  const halb = (f.unten - f.oben) / 2;
  if (h <= 12) return f.mitte - (h / 12) * halb;
  return f.unten - ((h - 12) / 12) * halb;
}

// Punktlinien: kräftig an den Stufengrenzen, fein dazwischen
function punktraster(f) {
  noStroke();
  const a = BILD.punktAbstand;
  for (let k = 0; k <= STUFEN * 2; k++) {
    const grenze = k % 2 === 0;
    const y = f.unten - (k / 2) * f.stufe;
    fill(grenze ? BILD.rasterGrob : BILD.rasterFein);
    const d = grenze ? 2.6 : 1.8;
    const schritt = grenze ? a : a * 2;
    for (let x = f.links; x <= f.rechts + 0.5; x += schritt) {
      circle(x, y, d);
    }
  }
}

function mitternachtslinie(f) {
  stroke(BILD.mitternachtFarbe);
  strokeWeight(1);
  line(f.links, f.mitte, f.rechts, f.mitte);
}

// Ruhezeiten: senkrechte gelbe Säulen mit runden Enden
function ruhezeitenZeichnen(f) {
  stroke(BILD.ruheFarbe);
  strokeCap(ROUND);
  strokeWeight(Math.max(8, f.spalte * BILD.ruheBreiteAnteil));
  beispielwoche.forEach((t, i) => {
    if (!t.ruhe) return;
    const x = tagX(i, f);
    for (const [von, bis] of [...(t.ruhe.nacht || []), ...(t.ruhe.tag || [])]) {
      for (const [a, b] of ruheStuecke(von, bis)) {
        line(x, yUhrzeit(a, f), x, yUhrzeit(b, f));
      }
    }
  });
}

// Zerlegt eine Ruhezeit in Stücke, die sich ohne Sprung zeichnen lassen.
// Mitternacht (Mitte) ist durchgehend; nur Mittag trennt (oberer ↔ unterer Rand).
const MITTAG_UNTEN = 12 + 1e-6;   // Mittag als Anfang der unteren Hälfte

function ruheStuecke(von, bis) {
  const ueberMitternacht = von > bis;
  const ueberMittag = ueberMitternacht
    ? (von < 12 || bis > 12)        // z. B. 11 → 3 oder 22 → 13
    : (von < 12 && bis > 12);       // z. B. 11 → 14
  if (!ueberMittag) return [[von, bis]];
  return [[von, 12], [MITTAG_UNTEN, bis]];
}

function symptomEbene() {
  if (!ebenenSpeicher || ebenenSpeicher.width !== width || ebenenSpeicher.height !== height) {
    if (ebenenSpeicher) ebenenSpeicher.remove();
    ebenenSpeicher = createGraphics(width, height);
    ebenenSpeicher.pixelDensity(pixelDensity());
  }
  return ebenenSpeicher;
}

// Symptom: breites Band von Tag zu Tag, Kreis pro eingetragenem Tag
function symptomZeichnen(g, s, f) {
  const c = color(s.farbe);
  const punkte = beispielwoche.map((t, i) => {
    const w = t.symptome[s.id];
    if (w === null || w === undefined) return null;
    return { x: tagX(i, f), y: yStufe(stufeVonWert(w), f) };
  });

  // Band nur zwischen zwei benachbarten eingetragenen Tagen, sonst Lücke
  g.stroke(c);
  g.strokeWeight(f.dicke);
  g.strokeCap(ROUND);
  g.noFill();
  for (let i = 0; i < punkte.length - 1; i++) {
    const a = punkte[i];
    const b = punkte[i + 1];
    if (a && b) g.line(a.x, a.y, b.x, b.y);
  }

  g.noStroke();
  g.fill(c);
  for (const p of punkte) {
    if (p) g.circle(p.x, p.y, f.kreis);
  }
}

// ---------- Text rund ums Bild (HTML, eine Schrift) ----------

// Kurze Textbeschreibung für Screenreader – in Worten, ohne Zahlen
function beschreibung() {
  const namen = symptome.map(s => s.name).join(" und ");
  const luecken = [];
  for (const s of symptome) {
    beispielwoche.forEach(t => {
      if (t.symptome[s.id] === null || t.symptome[s.id] === undefined) {
        luecken.push(`${s.name} am ${t.tag}`);
      }
    });
  }
  let text = `Bild einer Woche von Montag bis Sonntag. Breite farbige Bänder zeigen ${namen} im Verlauf der Woche. ` +
             `Gelbe Säulen zeigen die Ruhezeiten; die Nacht liegt in der Mitte des Bildes.`;
  if (luecken.length) {
    text += ` Nicht eingetragen: ${luecken.join(", ")}.`;
  }
  return text;
}

// Wochentage als HTML unter dem Bild – dieselbe Schrift wie die Seite
function tageAufbauen() {
  const liste = document.getElementById("tage");
  liste.innerHTML = "";
  for (const t of beispielwoche) {
    const li = document.createElement("li");
    li.textContent = t.tag;
    liste.append(li);
  }
  tageAusrichten();
}

// Spalten exakt unter die Tage im Bild legen
function tageAusrichten() {
  document.getElementById("tage").style.padding = `0 ${rand()}px`;
}

function legendeAufbauen() {
  const legende = document.getElementById("legende");
  legende.innerHTML = "";
  const eintraege = [
    ...symptome.map(s => ({ name: s.name, farbe: s.farbe, art: "band" })),
    { name: "Ruhezeiten", farbe: BILD.ruheFarbe, art: "saeule" }
  ];
  for (const e of eintraege) {
    const eintrag = document.createElement("span");
    eintrag.className = "legende-eintrag";
    const farbe = document.createElement("span");
    farbe.className = `legende-farbe legende-${e.art}`;
    farbe.style.background = e.farbe;
    farbe.setAttribute("aria-hidden", "true");
    eintrag.append(farbe, document.createTextNode(e.name));
    legende.append(eintrag);
  }
}
