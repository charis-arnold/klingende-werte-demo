// sketch.js – p5.js: ruhendes Bild der Symptome (Schritt 1)
// Abspielkopf und Synchronisation mit sound.js folgen in Schritt 3.

const BILD = {
  verhaeltnis: 0.6,        // Höhe = Breite × Verhältnis
  rand: 32,                // Weissraum links/rechts
  rasterAbstand: 16,       // Punktraster im Hintergrund
  rasterFarbe: "#D9D9D9",
  textFarbe: "#555555",
  linienDicke: 14,
  kreisDurchmesser: 30
};

let leinwand;

function setup() {
  const behaelter = document.getElementById("leinwand");
  const breite = behaelter.clientWidth;
  leinwand = createCanvas(breite, breite * BILD.verhaeltnis);
  leinwand.parent(behaelter);
  leinwand.elt.setAttribute("role", "img");
  leinwand.elt.setAttribute("aria-label", beschreibung());
  pixelDensity(Math.min(2, window.devicePixelRatio || 1));
  noLoop();   // ruhendes Bild
  legendeAufbauen();
}

function windowResized() {
  const breite = document.getElementById("leinwand").clientWidth;
  resizeCanvas(breite, breite * BILD.verhaeltnis);
  redraw();
}

function draw() {
  blendMode(BLEND);
  background(255);
  punktraster();

  const flaeche = symptomFlaeche();
  tagesBeschriftung(flaeche);

  blendMode(MULTIPLY);
  for (const s of symptome) {
    symptomZeichnen(s, flaeche);
  }
  blendMode(BLEND);
}

// Bereich in der Mitte, in dem die Symptom-Linien liegen.
// Oben und unten bleibt Platz für die Zeichen-Zeilen (Schritt 4).
function symptomFlaeche() {
  return {
    links: BILD.rand,
    rechts: width - BILD.rand,
    oben: height * 0.25,
    unten: height * 0.75
  };
}

function tagX(i, f) {
  const spalte = (f.rechts - f.links) / beispielwoche.length;
  return f.links + spalte * (i + 0.5);
}

function wertY(wert, f) {
  return lerp(f.unten, f.oben, wert);   // höher = weiter oben, ohne Wertung
}

function punktraster() {
  noStroke();
  fill(BILD.rasterFarbe);
  const a = BILD.rasterAbstand;
  for (let x = a / 2; x < width; x += a) {
    for (let y = a / 2; y < height; y += a) {
      circle(x, y, 2);
    }
  }
}

function tagesBeschriftung(f) {
  noStroke();
  fill(BILD.textFarbe);
  textAlign(CENTER, BOTTOM);
  textSize(16);
  textFont("system-ui, -apple-system, Segoe UI, Roboto, sans-serif");
  beispielwoche.forEach((t, i) => {
    text(t.tag, tagX(i, f), height - 8);
  });
}

function symptomZeichnen(s, f) {
  const c = color(s.farbe);
  const punkte = beispielwoche.map((t, i) => {
    const w = t.symptome[s.id];
    return (w === null || w === undefined) ? null : { x: tagX(i, f), y: wertY(w, f) };
  });

  // Linie: nur zwischen zwei benachbarten eingetragenen Tagen, sonst Lücke
  stroke(c);
  strokeWeight(BILD.linienDicke);
  strokeCap(ROUND);
  noFill();
  for (let i = 0; i < punkte.length - 1; i++) {
    const a = punkte[i];
    const b = punkte[i + 1];
    if (a && b) line(a.x, a.y, b.x, b.y);
  }

  // Kreis pro eingetragenem Tag
  noStroke();
  fill(c);
  for (const p of punkte) {
    if (p) circle(p.x, p.y, BILD.kreisDurchmesser);
  }
}

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
  let text = `Bild einer Woche von Montag bis Sonntag. Farbige Linien zeigen ${namen} im Verlauf der Woche.`;
  if (luecken.length) {
    text += ` Nicht eingetragen: ${luecken.join(", ")}.`;
  }
  return text;
}

function legendeAufbauen() {
  const legende = document.getElementById("legende");
  legende.innerHTML = "";
  for (const s of symptome) {
    const eintrag = document.createElement("span");
    eintrag.className = "legende-eintrag";
    const farbe = document.createElement("span");
    farbe.className = "legende-farbe";
    farbe.style.background = s.farbe;
    farbe.setAttribute("aria-hidden", "true");
    eintrag.append(farbe, document.createTextNode(s.name));
    legende.append(eintrag);
  }
}
