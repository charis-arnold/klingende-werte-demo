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
  bandMaxSpalte: 0.68,      // … aber nie dicker als dieser Anteil der Tagesspalte
  plateauAnteil: 0.45,      // waagrechtes Stück pro Tag, relativ zur Tagesspalte
  kopfKreisAnteil: 1.0,     // Kreis am Abspielkopf (Schritt 3), relativ zur Stufenhöhe

  ruheFarbe: ruheFarbe.farbe,   // aus data.js
  ruheBreiteAnteil: 0.17,   // Säulenbreite relativ zur Tagesspalte
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
  return {
    links, rechts, oben, unten,
    mitte: (oben + unten) / 2,
    spalte, stufe,
    dicke: Math.min(stufe * BILD.bandAnteil, spalte * BILD.bandMaxSpalte),
    kopfKreis: stufe * BILD.kopfKreisAnteil   // erst ab Schritt 3 gezeichnet
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
  strokeWeight(Math.max(5, f.spalte * BILD.ruheBreiteAnteil));
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

// Symptom: glattes, breites Band. Pro Tag ein waagrechtes Stück auf der Stufe,
// dazwischen ein schräger Wechsel zum nächsten Tag. Kein Kreis pro Tag –
// ein Kreis erscheint später nur am Abspielkopf.
function symptomZeichnen(g, s, f) {
  const halb = (f.spalte * BILD.plateauAnteil) / 2;

  // Zusammenhängende Abschnitte eingetragener Tage; fehlender Wert = Lücke
  const abschnitte = [];
  let aktuell = [];
  beispielwoche.forEach((t, i) => {
    const w = t.symptome[s.id];
    if (w === null || w === undefined) {
      if (aktuell.length) abschnitte.push(aktuell);
      aktuell = [];
      return;
    }
    const x = tagX(i, f);
    const y = yStufe(stufeVonWert(w), f);
    aktuell.push([x - halb, y], [x + halb, y]);
  });
  if (aktuell.length) abschnitte.push(aktuell);

  // Einzelne Stücke mit runden Enden statt eines Pfads: Bei steilen Wechseln
  // erzeugt der Canvas-Pfad sonst innen eine weisse Kerbe. Da jedes Symptom
  // auf eigener Ebene in einer Deckfarbe liegt, bleiben die Überlappungen unsichtbar.
  for (const punkte of abschnitte) {
    g.push();
    g.stroke(s.farbe);
    g.strokeWeight(f.dicke);
    g.strokeCap(ROUND);
    g.noFill();
    for (let i = 0; i < punkte.length - 1; i++) {
      const [x1, y1] = punkte[i];
      const [x2, y2] = punkte[i + 1];
      g.line(x1, y1, x2, y2);
    }
    g.pop();
    g.push();
    innenwinkelSchliessen(g, punkte, f.dicke, s.farbe);
    g.pop();
  }
}

// Bei Tal oder Gipfel (beide Nachbartage auf derselben Seite) ist das waagrechte
// Stück kürzer als das Band breit – die Innenkanten der beiden Schrägen treffen sich
// erst oberhalb davon, dazwischen bliebe eine weisse Kerbe. Diese Fläche füllen:
// zwischen den Mittellinien bis zum Treffpunkt M der Innenkanten.
function innenwinkelSchliessen(g, punkte, dicke, farbe) {
  const r = dicke / 2;
  g.fill(farbe);
  g.stroke(farbe);          // dünne Kontur gleicher Farbe gegen Kantenglättungs-Haarlinien
  g.strokeWeight(1.5);
  g.strokeJoin(ROUND);
  // punkte = [L0, R0, L1, R1, …] – je Tag Anfang und Ende des waagrechten Stücks
  for (let i = 2; i + 2 < punkte.length; i += 2) {
    const P = punkte[i - 1], A = punkte[i], B = punkte[i + 1], N = punkte[i + 2];
    const seiteP = Math.sign(P[1] - A[1]);
    const seiteN = Math.sign(N[1] - B[1]);
    if (seiteP === 0 || seiteP !== seiteN) continue;

    const u1 = einheit(P[0] - A[0], P[1] - A[1]);
    const u2 = einheit(N[0] - B[0], N[1] - B[1]);
    const n1 = nachInnen([-u1[1], u1[0]], B[0] - A[0], B[1] - A[1]);
    const n2 = nachInnen([-u2[1], u2[0]], A[0] - B[0], A[1] - B[1]);

    // Innenkanten: A + r·n1 + t·u1  und  B + r·n2 + s·u2
    const a = [A[0] + r * n1[0], A[1] + r * n1[1]];
    const b = [B[0] + r * n2[0], B[1] + r * n2[1]];
    const nenner = u1[0] * u2[1] - u1[1] * u2[0];
    if (Math.abs(nenner) < 1e-9) continue;
    const t = ((b[0] - a[0]) * u2[1] - (b[1] - a[1]) * u2[0]) / nenner;
    const sP = ((b[0] - a[0]) * u1[1] - (b[1] - a[1]) * u1[0]) / nenner;
    const laenge1 = Math.hypot(P[0] - A[0], P[1] - A[1]);
    const laenge2 = Math.hypot(N[0] - B[0], N[1] - B[1]);

    if (t <= 0 || sP <= 0) {
      // Die Innenkanten treffen sich erst unterhalb der Kante des waagrechten
      // Stücks: Die Öffnung hätte dort einen flachen Boden (Schlitz).
      // Stattdessen läuft sie spitz auf die Mitte dieser Kante zu.
      spitzerBoden(g, a, u1, b, u2, A[1] + seiteP * r, seiteP * r, laenge1, laenge2);
      continue;
    }
    if (t > laenge1 || sP > laenge2) continue;

    const M = [a[0] + t * u1[0], a[1] + t * u1[1]];
    g.beginShape();
    g.vertex(A[0], A[1]);
    g.vertex(B[0], B[1]);
    g.vertex(B[0] + sP * u2[0], B[1] + sP * u2[1]);
    g.vertex(M[0], M[1]);
    g.vertex(A[0] + t * u1[0], A[1] + t * u1[1]);
    g.endShape(CLOSE);
  }
}

// a/u1, b/u2: Innenkanten der beiden Schrägen; yKante: Innenkante des waagrechten
// Stücks; schritt: Höhe (mit Richtung), über die die Öffnung spitz zuläuft
function spitzerBoden(g, a, u1, b, u2, yKante, schritt, laenge1, laenge2) {
  const aufKante1 = y => (y - a[1]) / u1[1];
  const aufKante2 = y => (y - b[1]) / u2[1];
  const t0 = aufKante1(yKante), t1 = aufKante1(yKante + schritt);
  const s0 = aufKante2(yKante), s1 = aufKante2(yKante + schritt);
  if (t1 > laenge1 || s1 > laenge2) return;
  const X1 = [a[0] + t0 * u1[0], yKante];
  const L  = [a[0] + t1 * u1[0], yKante + schritt];
  const X2 = [b[0] + s0 * u2[0], yKante];
  const R  = [b[0] + s1 * u2[0], yKante + schritt];
  const Q  = [(X1[0] + X2[0]) / 2, yKante];
  g.triangle(X1[0], X1[1], L[0], L[1], Q[0], Q[1]);
  g.triangle(X2[0], X2[1], R[0], R[1], Q[0], Q[1]);
}

function einheit(x, y) {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
}

function nachInnen(n, zuX, zuY) {
  return (n[0] * zuX + n[1] * zuY) >= 0 ? n : [-n[0], -n[1]];
}

// ---------- Text rund ums Bild (HTML, eine Schrift) ----------

// Kurze Textbeschreibung für Screenreader – in Worten, ohne Zahlen
function beschreibung() {
  const liste = symptome.map(s => s.name);
  const namen = liste.length > 1
    ? `${liste.slice(0, -1).join(", ")} und ${liste[liste.length - 1]}`
    : liste.join("");
  const tagName = { Mo: "Montag", Di: "Dienstag", Mi: "Mittwoch", Do: "Donnerstag", Fr: "Freitag", Sa: "Samstag", So: "Sonntag" };
  const luecken = [];
  for (const s of symptome) {
    beispielwoche.forEach(t => {
      if (t.symptome[s.id] === null || t.symptome[s.id] === undefined) {
        luecken.push(`${s.name} am ${tagName[t.tag] || t.tag}`);
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
