/* =========================
   IMPORT GPX / TCX — TRILO
   Lit un fichier d'activité et remplit les champs
========================= */

function impLang() { return localStorage.getItem("triloLangue") || "fr"; }
function IL(fr, en) { return impLang() === "en" ? en : fr; }

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("importFile");
  if (!input) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const resultZone = document.getElementById("importResult");
    resultZone.innerHTML = `<div class="import-loading">⏳ ${IL("Lecture du fichier...", "Reading file...")}</div>`;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contenu = event.target.result;
        const nom = file.name.toLowerCase();

        let donnees;
        if (nom.endsWith(".gpx")) {
          donnees = lireGPX(contenu);
        } else if (nom.endsWith(".tcx")) {
          donnees = lireTCX(contenu);
        } else {
          throw new Error(IL("Format non reconnu", "Unrecognized format"));
        }

        if (!donnees || !donnees.distance || !donnees.duree) {
          throw new Error(IL("Impossible de lire la distance ou le temps", "Could not read distance or time"));
        }

        remplirChamps(donnees);

      } catch (err) {
        resultZone.innerHTML = `<div class="import-error">⚠️ ${IL("Erreur : ", "Error: ")}${err.message}. ${IL("Essaie un autre fichier ou saisis manuellement.", "Try another file or enter manually.")}</div>`;
      }
    };
    reader.onerror = () => {
      resultZone.innerHTML = `<div class="import-error">⚠️ ${IL("Impossible de lire le fichier.", "Could not read the file.")}</div>`;
    };
    reader.readAsText(file);
  });
});

// ============================================
// LIRE UN FICHIER GPX
// ============================================
function lireGPX(contenu) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(contenu, "text/xml");

  // Récupérer tous les points de tracé
  const trkpts = xml.getElementsByTagName("trkpt");
  if (trkpts.length < 2) {
    // Essayer les waypoints ou routepoints
    const rtepts = xml.getElementsByTagName("rtept");
    if (rtepts.length < 2) return null;
  }

  const points = trkpts.length >= 2 ? trkpts : xml.getElementsByTagName("rtept");

  // Calculer la distance totale (formule de Haversine entre chaque point)
  let distance = 0;
  let premierTemps = null;
  let dernierTemps = null;

  for (let i = 0; i < points.length; i++) {
    const lat = parseFloat(points[i].getAttribute("lat"));
    const lon = parseFloat(points[i].getAttribute("lon"));

    // Temps
    const timeEl = points[i].getElementsByTagName("time")[0];
    if (timeEl) {
      const t = new Date(timeEl.textContent);
      if (!premierTemps) premierTemps = t;
      dernierTemps = t;
    }

    // Distance avec le point précédent
    if (i > 0) {
      const latPrev = parseFloat(points[i-1].getAttribute("lat"));
      const lonPrev = parseFloat(points[i-1].getAttribute("lon"));
      distance += haversine(latPrev, lonPrev, lat, lon);
    }
  }

  // Durée en secondes
  let duree = null;
  if (premierTemps && dernierTemps) {
    duree = (dernierTemps - premierTemps) / 1000;
  }

  // Détecter le sport depuis le type de trace
  const type = detecterSportGPX(xml);

  return { distance, duree, sport: type };
}

// ============================================
// LIRE UN FICHIER TCX (Garmin)
// ============================================
function lireTCX(contenu) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(contenu, "text/xml");

  // TCX a souvent les totaux directement !
  let distance = 0;
  let duree = 0;

  // Distance totale (somme des laps ou DistanceMeters)
  const distanceEls = xml.getElementsByTagName("DistanceMeters");
  const laps = xml.getElementsByTagName("Lap");

  if (laps.length > 0) {
    // Additionner les laps (plus fiable)
    for (let i = 0; i < laps.length; i++) {
      const d = laps[i].getElementsByTagName("DistanceMeters")[0];
      const t = laps[i].getElementsByTagName("TotalTimeSeconds")[0];
      if (d) distance += parseFloat(d.textContent);
      if (t) duree += parseFloat(t.textContent);
    }
  } else if (distanceEls.length > 0) {
    // Prendre la dernière distance cumulée
    distance = parseFloat(distanceEls[distanceEls.length - 1].textContent);
  }

  // Détecter le sport
  const sport = detecterSportTCX(xml);

  return { distance, duree, sport };
}

// ============================================
// DÉTECTER LE SPORT
// ============================================
function detecterSportGPX(xml) {
  // Chercher dans les balises type
  const types = xml.getElementsByTagName("type");
  for (let i = 0; i < types.length; i++) {
    const t = types[i].textContent.toLowerCase();
    if (t.includes("swim") || t.includes("natation")) return "natation";
    if (t.includes("bike") || t.includes("cycl") || t.includes("velo") || t.includes("ride")) return "velo";
    if (t.includes("run") || t.includes("course") || t.includes("jog")) return "course";
  }
  return null; // sport inconnu
}

function detecterSportTCX(xml) {
  const activities = xml.getElementsByTagName("Activity");
  if (activities.length > 0) {
    const sport = activities[0].getAttribute("Sport");
    if (sport) {
      const s = sport.toLowerCase();
      if (s.includes("swim") || s.includes("natation")) return "natation";
      if (s.includes("bik") || s.includes("cycl") || s.includes("ride")) return "velo";
      if (s.includes("run") || s.includes("course")) return "course";
    }
  }
  return null;
}

// ============================================
// FORMULE DE HAVERSINE (distance entre 2 coordonnées GPS)
// ============================================
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000; // rayon de la Terre en mètres
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // distance en mètres
}

// ============================================
// REMPLIR LES CHAMPS
// ============================================
function remplirChamps(donnees) {
  const resultZone = document.getElementById("importResult");
  const { distance, duree, sport } = donnees;

  // Convertir la durée en format mm:ss ou h:mm:ss
  const h = Math.floor(duree / 3600);
  const m = Math.floor((duree % 3600) / 60);
  const s = Math.round(duree % 60);
  let tempsStr;
  if (h > 0) {
    tempsStr = `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  } else {
    tempsStr = `${m}:${s.toString().padStart(2,"0")}`;
  }

  // Déterminer quel sport remplir
  let sportDetecte = sport;
  let sportNom = "";

  if (sport === "natation") {
    // Natation : distance en mètres
    document.getElementById("swimDist").value = Math.round(distance);
    document.getElementById("swimTime").value = tempsStr;
    sportNom = IL("Natation", "Swimming");
  } else if (sport === "velo") {
    // Vélo : distance en km
    document.getElementById("bikeDist").value = (distance / 1000).toFixed(2);
    document.getElementById("bikeTime").value = tempsStr;
    sportNom = IL("Vélo", "Cycling");
  } else if (sport === "course") {
    // Course : distance en km
    document.getElementById("runDist").value = (distance / 1000).toFixed(2);
    document.getElementById("runTime").value = tempsStr;
    sportNom = IL("Course", "Running");
  } else {
    // Sport inconnu : on demande à l'utilisateur de choisir
    const distKm = (distance / 1000).toFixed(2);
    resultZone.innerHTML = `
      <div class="import-success">
        ✅ ${IL("Fichier lu !", "File read!")} ${IL("Distance", "Distance")} : <strong>${distKm} km</strong>, ${IL("Temps", "Time")} : <strong>${tempsStr}</strong>
        <p style="margin-top:10px;font-size:13px;">${IL("Quel sport est-ce ?", "Which sport is it?")}</p>
        <div class="import-sport-choix">
          <button onclick="window._triloRemplirSport('natation', ${Math.round(distance)}, '${tempsStr}')">🏊 ${IL("Natation", "Swim")}</button>
          <button onclick="window._triloRemplirSport('velo', ${distKm}, '${tempsStr}')">🚴 ${IL("Vélo", "Bike")}</button>
          <button onclick="window._triloRemplirSport('course', ${distKm}, '${tempsStr}')">🏃 ${IL("Course", "Run")}</button>
        </div>
      </div>`;
    return;
  }

  // Message de succès
  const distAffiche = sport === "natation" ? `${Math.round(distance)} m` : `${(distance/1000).toFixed(2)} km`;
  resultZone.innerHTML = `
    <div class="import-success">
      ✅ ${IL("Activité importée !", "Activity imported!")}<br>
      <strong>${sportNom}</strong> · ${distAffiche} · ${tempsStr}
      <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">${IL("Les champs sont remplis. Clique sur Analyser !", "Fields are filled. Click Analyze!")}</p>
    </div>`;
}

// Pour le choix manuel du sport
window._triloRemplirSport = function(sport, dist, temps) {
  if (sport === "natation") {
    document.getElementById("swimDist").value = Math.round(dist);
    document.getElementById("swimTime").value = temps;
  } else if (sport === "velo") {
    document.getElementById("bikeDist").value = dist;
    document.getElementById("bikeTime").value = temps;
  } else if (sport === "course") {
    document.getElementById("runDist").value = dist;
    document.getElementById("runTime").value = temps;
  }
  const resultZone = document.getElementById("importResult");
  resultZone.innerHTML = `<div class="import-success">✅ ${IL("Champs remplis ! Clique sur Analyser.", "Fields filled! Click Analyze.")}</div>`;
};
