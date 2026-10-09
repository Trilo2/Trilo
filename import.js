/* =========================
   IMPORT GPX / TCX / FIT — TRILO
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

    const nom = file.name.toLowerCase();
    const estFit = nom.endsWith(".fit");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contenu = event.target.result;

        let donnees;
        if (nom.endsWith(".gpx")) {
          donnees = lireGPX(contenu);
        } else if (nom.endsWith(".tcx")) {
          donnees = lireTCX(contenu);
        } else if (estFit) {
          const liste = lireFIT(contenu);
          if (liste.length === 0) {
            throw new Error(IL("Impossible de lire la distance ou le temps", "Could not read distance or time"));
          }
          // Fichier multisport (triathlon) : on remplit plusieurs disciplines d'un coup
          if (liste.length > 1) {
            remplirPlusieurs(liste);
            return;
          }
          donnees = liste[0];
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
    // Le format .fit est binaire, les autres sont du texte (XML)
    if (estFit) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  });
});

// ============================================
// DÉNIVELÉ POSITIF (D+) à partir d'une liste d'altitudes
// On ignore les variations < 2 m (bruit du GPS)
// ============================================
function calculerDenivele(altitudes) {
  const valides = altitudes.filter(a => Number.isFinite(a));
  if (valides.length < 2) return 0;
  const SEUIL = 2;
  let ref = valides[0], gain = 0;
  for (let i = 1; i < valides.length; i++) {
    const diff = valides[i] - ref;
    if (diff >= SEUIL) { gain += diff; ref = valides[i]; }
    else if (diff <= -SEUIL) { ref = valides[i]; }
  }
  return Math.round(gain);
}

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
  const altitudes = [];

  for (let i = 0; i < points.length; i++) {
    const lat = parseFloat(points[i].getAttribute("lat"));
    const lon = parseFloat(points[i].getAttribute("lon"));

    // Altitude
    const eleEl = points[i].getElementsByTagName("ele")[0];
    if (eleEl) altitudes.push(parseFloat(eleEl.textContent));

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

  return { distance, duree, sport: type, denivele: calculerDenivele(altitudes) };
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

  // Altitudes (D+)
  const altEls = xml.getElementsByTagName("AltitudeMeters");
  const altitudes = [];
  for (let i = 0; i < altEls.length; i++) altitudes.push(parseFloat(altEls[i].textContent));

  // Détecter le sport
  const sport = detecterSportTCX(xml);

  return { distance, duree, sport, denivele: calculerDenivele(altitudes) };
}

// ============================================
// LIRE UN FICHIER FIT (Garmin, Wahoo, Coros, Suunto...)
// Format binaire. On lit en priorité les messages "session"
// (les totaux de l'activité), sinon les messages "record"
// (un point toutes les secondes).
// ============================================
const FIT_SPORTS = { 1: "course", 2: "velo", 5: "natation" };
const FIT_SPORT_TRANSITION = 3;

// Retourne une liste d'activités [{ sport, distance (m), duree (s), denivele (m) }]
// Un fichier de triathlon contient une activité par discipline.
function lireFIT(buffer) {
  const view = new DataView(buffer);
  const erreur = () => new Error(IL("Fichier FIT invalide", "Invalid FIT file"));
  if (view.byteLength < 14) throw erreur();

  const sessions = [];
  const records = [];
  let debut = 0;
  let nbFichiers = 0;

  // Un fichier peut en contenir plusieurs à la suite (rare)
  while (debut + 12 <= view.byteLength) {
    const tailleEntete = view.getUint8(debut);
    const signature = String.fromCharCode(
      view.getUint8(debut + 8), view.getUint8(debut + 9),
      view.getUint8(debut + 10), view.getUint8(debut + 11)
    );
    if (tailleEntete < 12 || signature !== ".FIT") break;
    const tailleDonnees = view.getUint32(debut + 4, true);
    const fin = Math.min(debut + tailleEntete + tailleDonnees, view.byteLength);
    lireMessagesFIT(view, debut + tailleEntete, fin, sessions, records);
    nbFichiers++;
    debut = fin + 2; // 2 octets de contrôle (CRC) à la fin
  }
  if (nbFichiers === 0) throw erreur();

  const altitudes = records.map(r => r.alt).filter(a => a !== null);
  let activites = [];

  if (sessions.length > 0) {
    // Regrouper les sessions par discipline (les transitions sont ignorées)
    const parSport = {};
    sessions.forEach(s => {
      if (s.sport === FIT_SPORT_TRANSITION) return;
      const sport = FIT_SPORTS[s.sport] || null;
      const cle = sport || "inconnu";
      if (!parSport[cle]) parSport[cle] = { sport, distance: 0, duree: 0, denivele: 0 };
      parSport[cle].distance += s.distance || 0;
      parSport[cle].duree += s.timer || s.elapsed || 0;
      parSport[cle].denivele += s.ascent || 0;
    });
    activites = Object.values(parSport);

    // Une seule activité sans dénivelé dans la session : on le calcule avec les altitudes
    if (activites.length === 1 && activites[0].denivele === 0 && activites[0].sport !== "natation") {
      activites[0].denivele = calculerDenivele(altitudes);
    }
  } else {
    // Pas de session : on reconstruit à partir des points
    const distances = records.map(r => r.dist).filter(d => d !== null);
    const temps = records.map(r => r.t).filter(t => t !== null && t !== undefined);
    if (distances.length > 0 && temps.length > 1) {
      activites = [{
        sport: null,
        distance: distances[distances.length - 1],
        duree: temps[temps.length - 1] - temps[0],
        denivele: calculerDenivele(altitudes)
      }];
    }
  }

  return activites
    .filter(a => a.distance > 0 && a.duree > 0)
    .map(a => ({ ...a, denivele: Math.round(a.denivele) }));
}

// Parcourt tous les messages d'un fichier FIT
function lireMessagesFIT(view, debut, fin, sessions, records) {
  const definitions = {}; // type local → description du message
  let pos = debut;
  let dernierTs = 0;

  while (pos < fin) {
    const entete = view.getUint8(pos++);
    let def, champs;

    if (entete & 0x80) {
      // Message de données avec horodatage compressé
      def = definitions[(entete >> 5) & 0x03];
      if (!def || pos + def.taille > fin) break;
      champs = lireDonneesFIT(view, pos, def);
      pos += def.taille;
      const decalage = entete & 0x1F;
      const reste = dernierTs % 32;
      let ts = dernierTs - reste + decalage;
      if (decalage < reste) ts += 32;
      champs[253] = ts;
      dernierTs = ts;

    } else if (entete & 0x40) {
      // Message de définition : explique comment lire les messages suivants
      if (pos + 5 > fin) break;
      const aDeveloppeur = (entete & 0x20) !== 0;
      pos++; // octet réservé
      const little = view.getUint8(pos++) === 0;
      const global = view.getUint16(pos, little); pos += 2;
      const nbChamps = view.getUint8(pos++);
      if (pos + nbChamps * 3 > fin) break;
      const liste = [];
      let taille = 0;
      for (let i = 0; i < nbChamps; i++) {
        liste.push({ num: view.getUint8(pos), size: view.getUint8(pos + 1), type: view.getUint8(pos + 2) });
        taille += view.getUint8(pos + 1);
        pos += 3;
      }
      if (aDeveloppeur) {
        if (pos >= fin) break;
        const nbDev = view.getUint8(pos++);
        if (pos + nbDev * 3 > fin) break;
        for (let i = 0; i < nbDev; i++) {
          taille += view.getUint8(pos + 1);
          pos += 3;
        }
      }
      definitions[entete & 0x0F] = { global, little, champs: liste, taille };
      continue;

    } else {
      // Message de données normal
      def = definitions[entete & 0x0F];
      if (!def || pos + def.taille > fin) break;
      champs = lireDonneesFIT(view, pos, def);
      pos += def.taille;
      if (champs[253] !== null && champs[253] !== undefined) dernierTs = champs[253];
    }

    traiterMessageFIT(def.global, champs, sessions, records);
  }
}

// Lit les champs d'un message de données
function lireDonneesFIT(view, pos, def) {
  const champs = {};
  let p = pos;
  def.champs.forEach(c => {
    champs[c.num] = lireValeurFIT(view, p, c.type, c.size, def.little);
    p += c.size;
  });
  return champs;
}

// Lit une valeur (null si la valeur est "invalide" selon la norme FIT)
function lireValeurFIT(view, pos, type, taille, little) {
  switch (type & 0x1F) {
    case 0: case 2: case 13: { // enum, uint8, byte
      if (taille < 1) return null;
      const v = view.getUint8(pos);
      return v === 0xFF ? null : v;
    }
    case 1: { // sint8
      if (taille < 1) return null;
      const v = view.getInt8(pos);
      return v === 0x7F ? null : v;
    }
    case 10: { // uint8z
      if (taille < 1) return null;
      const v = view.getUint8(pos);
      return v === 0 ? null : v;
    }
    case 3: { // sint16
      if (taille < 2) return null;
      const v = view.getInt16(pos, little);
      return v === 0x7FFF ? null : v;
    }
    case 4: { // uint16
      if (taille < 2) return null;
      const v = view.getUint16(pos, little);
      return v === 0xFFFF ? null : v;
    }
    case 11: { // uint16z
      if (taille < 2) return null;
      const v = view.getUint16(pos, little);
      return v === 0 ? null : v;
    }
    case 5: { // sint32
      if (taille < 4) return null;
      const v = view.getInt32(pos, little);
      return v === 0x7FFFFFFF ? null : v;
    }
    case 6: { // uint32
      if (taille < 4) return null;
      const v = view.getUint32(pos, little);
      return v === 0xFFFFFFFF ? null : v;
    }
    case 12: { // uint32z
      if (taille < 4) return null;
      const v = view.getUint32(pos, little);
      return v === 0 ? null : v;
    }
    case 8: { // float32
      if (taille < 4) return null;
      const v = view.getFloat32(pos, little);
      return Number.isFinite(v) ? v : null;
    }
    case 9: { // float64
      if (taille < 8) return null;
      const v = view.getFloat64(pos, little);
      return Number.isFinite(v) ? v : null;
    }
    default:
      return null; // texte, entiers 64 bits : inutiles pour nous
  }
}

// Garde seulement ce qui nous intéresse : "record" (20) et "session" (18)
function traiterMessageFIT(global, f, sessions, records) {
  if (global === 20) {
    const alt = f[78] != null ? f[78] / 5 - 500 : (f[2] != null ? f[2] / 5 - 500 : null);
    records.push({
      t: f[253] ?? null,
      dist: f[5] != null ? f[5] / 100 : null,
      alt
    });
  } else if (global === 18) {
    sessions.push({
      sport: f[5],
      elapsed: f[7] != null ? f[7] / 1000 : null,
      timer: f[8] != null ? f[8] / 1000 : null,
      distance: f[9] != null ? f[9] / 100 : null,
      ascent: f[22] != null ? f[22] : null
    });
  }
}

// ============================================
// REMPLIR PLUSIEURS DISCIPLINES (fichier multisport)
// ============================================
function formaterTempsImport(duree) {
  const total = Math.round(duree);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function remplirPlusieurs(liste) {
  const resultZone = document.getElementById("importResult");
  const emojis = { natation: "🏊", velo: "🚴", course: "🏃" };
  const lignes = [];
  let ignorees = 0;

  liste.forEach(d => {
    if (!d.sport) { ignorees++; return; }
    const tempsStr = formaterTempsImport(d.duree);
    if (d.sport === "natation") {
      window._triloRemplirSport("natation", d.distance, tempsStr);
      lignes.push(`${emojis.natation} ${Math.round(d.distance)} m · ${tempsStr}`);
    } else {
      const km = (d.distance / 1000).toFixed(2);
      window._triloRemplirSport(d.sport, km, tempsStr, d.denivele);
      lignes.push(`${emojis[d.sport]} ${km} km · ${tempsStr}${d.denivele > 0 ? ` · ${IL("D+", "Elev.")} ${d.denivele} m` : ""}`);
    }
  });

  resultZone.innerHTML = `
    <div class="import-success">
      ✅ ${IL("Activité multisport importée !", "Multisport activity imported!")}<br>
      <strong>${lignes.join("<br>")}</strong>
      ${ignorees > 0 ? `<p style="margin-top:8px;font-size:12px;color:var(--text-muted);">${IL(ignorees + " partie(s) sans sport reconnu ignorée(s).", ignorees + " part(s) with unrecognized sport ignored.")}</p>` : ""}
      <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">${IL("Les champs sont remplis. Clique sur Analyser !", "Fields are filled. Click Analyze!")}</p>
    </div>`;
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
  const { distance, duree, sport, denivele = 0 } = donnees;

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
    if (document.getElementById("bikeElev")) document.getElementById("bikeElev").value = denivele > 0 ? denivele : "";
    sportNom = IL("Vélo", "Cycling");
  } else if (sport === "course") {
    // Course : distance en km
    document.getElementById("runDist").value = (distance / 1000).toFixed(2);
    document.getElementById("runTime").value = tempsStr;
    if (document.getElementById("runElev")) document.getElementById("runElev").value = denivele > 0 ? denivele : "";
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
          <button onclick="window._triloRemplirSport('velo', ${distKm}, '${tempsStr}', ${denivele})">🚴 ${IL("Vélo", "Bike")}</button>
          <button onclick="window._triloRemplirSport('course', ${distKm}, '${tempsStr}', ${denivele})">🏃 ${IL("Course", "Run")}</button>
        </div>
      </div>`;
    return;
  }

  // Message de succès
  const distAffiche = sport === "natation" ? `${Math.round(distance)} m` : `${(distance/1000).toFixed(2)} km`;
  resultZone.innerHTML = `
    <div class="import-success">
      ✅ ${IL("Activité importée !", "Activity imported!")}<br>
      <strong>${sportNom}</strong> · ${distAffiche} · ${tempsStr}${denivele > 0 && sport !== "natation" ? ` · ${IL("D+", "Elev.")} ${denivele} m` : ""}
      <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">${IL("Les champs sont remplis. Clique sur Analyser !", "Fields are filled. Click Analyze!")}</p>
    </div>`;
}

// Pour le choix manuel du sport
window._triloRemplirSport = function(sport, dist, temps, denivele = 0) {
  if (sport === "natation") {
    document.getElementById("swimDist").value = Math.round(dist);
    document.getElementById("swimTime").value = temps;
  } else if (sport === "velo") {
    document.getElementById("bikeDist").value = dist;
    document.getElementById("bikeTime").value = temps;
    if (document.getElementById("bikeElev")) document.getElementById("bikeElev").value = denivele > 0 ? denivele : "";
  } else if (sport === "course") {
    document.getElementById("runDist").value = dist;
    document.getElementById("runTime").value = temps;
    if (document.getElementById("runElev")) document.getElementById("runElev").value = denivele > 0 ? denivele : "";
  }
  const resultZone = document.getElementById("importResult");
  resultZone.innerHTML = `<div class="import-success">✅ ${IL("Champs remplis ! Clique sur Analyser.", "Fields filled! Click Analyze.")}</div>`;
};
