import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBTv3F1ukSvaoD340ABx6CLjjQ0pHBs7q8",
  authDomain: "trilo-88a88.firebaseapp.com",
  projectId: "trilo-88a88",
  storageBucket: "trilo-88a88.firebasestorage.app",
  messagingSenderId: "748450983741",
  appId: "1:748450983741:web:c2f3f9f0afa042530f9f54",
  measurementId: "G-GSNS075D5R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* =========================
   VARIABLES GLOBALES
========================= */

let currentUser = null;
let isPremium = false;
let chart = null;
let sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];

/* =========================
   HELPERS
========================= */

function el(id) {
  return document.getElementById(id);
}

function convertirTempsEnMinutes(temps) {
  if (!temps || typeof temps !== "string") return 0;
  const parts = temps.trim().split(":");
  if (parts.length === 2) {
    const m = Number(parts[0]), s = Number(parts[1]);
    if (isNaN(m) || isNaN(s)) return 0;
    return m + s / 60;
  }
  if (parts.length === 3) {
    const h = Number(parts[0]), m = Number(parts[1]), s = Number(parts[2]);
    if (isNaN(h) || isNaN(m) || isNaN(s)) return 0;
    return h * 60 + m + s / 60;
  }
  return 0;
}

function randElement(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

/* =========================
   RACES DE RÉFÉRENCE
========================= */

const RACES = {
  sprint: {
    label: "Sprint",
    swim: 750, bike: 20, run: 5,
    tempsRef: { swim: 15, bike: 40, run: 20 } // minutes
  },
  olympique: {
    label: "Olympique",
    swim: 1500, bike: 40, run: 10,
    tempsRef: { swim: 30, bike: 75, run: 45 }
  },
  half: {
    label: "Half Ironman (70.3)",
    swim: 1900, bike: 90, run: 21.1,
    tempsRef: { swim: 40, bike: 150, run: 105 }
  },
  ironman: {
    label: "Ironman",
    swim: 3800, bike: 180, run: 42.2,
    tempsRef: { swim: 75, bike: 330, run: 240 }
  }
};

function genererModeRace(result) {
  const { performances } = result;
  const swimPerf = performances.find(p => p.sport === "natation");
  const bikePerf = performances.find(p => p.sport === "vélo");
  const runPerf  = performances.find(p => p.sport === "course");

  let html = `<div class="race-section">`;
  html += `<h3>🏁 Mode Race — Comparaison avec les courses officielles</h3>`;

  Object.values(RACES).forEach(race => {
    html += `<div class="race-card">`;
    html += `<strong>${race.label}</strong><br>`;

    // Natation
    if (swimPerf && swimPerf.speed > 0) {
      const tempsEstimSwim = Math.round(race.swim / swimPerf.speed);
      const diff = tempsEstimSwim - race.tempsRef.swim;
      const emoji = diff <= 0 ? "✅" : diff <= 5 ? "🟡" : "🔴";
      html += `🏊 Natation (${race.swim}m) : ~${tempsEstimSwim} min ${emoji} (ref: ${race.tempsRef.swim} min)<br>`;
    }

    // Vélo
    if (bikePerf && bikePerf.speed > 0) {
      const tempsEstimBike = Math.round((race.bike / bikePerf.speed) * 60);
      const diff = tempsEstimBike - race.tempsRef.bike;
      const emoji = diff <= 0 ? "✅" : diff <= 10 ? "🟡" : "🔴";
      html += `🚴 Vélo (${race.bike}km) : ~${tempsEstimBike} min ${emoji} (ref: ${race.tempsRef.bike} min)<br>`;
    }

    // Course
    if (runPerf && runPerf.speed > 0) {
      const tempsEstimRun = Math.round((race.run / runPerf.speed) * 60);
      const diff = tempsEstimRun - race.tempsRef.run;
      const emoji = diff <= 0 ? "✅" : diff <= 10 ? "🟡" : "🔴";
      html += `🏃 Course (${race.run}km) : ~${tempsEstimRun} min ${emoji} (ref: ${race.tempsRef.run} min)<br>`;
    }

    // Temps total estimé
    let totalMin = 0;
    if (swimPerf) totalMin += Math.round(race.swim / swimPerf.speed);
    if (bikePerf) totalMin += Math.round((race.bike / bikePerf.speed) * 60);
    if (runPerf)  totalMin += Math.round((race.run / runPerf.speed) * 60);
    totalMin += 5; // transitions

    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    html += `⏱️ Temps total estimé : <strong>${h > 0 ? h + "h" : ""}${m}min</strong> (transitions +5min incluses)<br>`;

    html += `</div>`;
  });

  html += `<p class="race-note">* Estimations basées sur tes vitesses actuelles, hors fatigue cumulée.</p>`;
  html += `</div>`;
  return html;
}

/* =========================
   TEMPS DE RÉCUPÉRATION
========================= */

function genererRecuperation(result) {
  const { globalScore, performances } = result;

  // Calcul de la charge totale (distance × effort)
  let chargeTotal = 0;
  performances.forEach(p => {
    chargeTotal += p.dist * (20 - p.score) / 10;
  });

  let joursRecup = 1;
  let conseil = "";

  if (chargeTotal < 5) {
    joursRecup = 1;
    conseil = "Séance légère — récupération rapide, tu peux t'entraîner demain.";
  } else if (chargeTotal < 15) {
    joursRecup = 2;
    conseil = "Séance modérée — prends 1 à 2 jours de récupération active (marche, étirements).";
  } else if (chargeTotal < 30) {
    joursRecup = 2;
    conseil = "Séance intense — 2 jours de repos conseillés. Dors bien et hydrate-toi.";
  } else {
    joursRecup = 3;
    conseil = "Séance très intense — 3 jours minimum. Évite tout effort intense, favorise la natation douce.";
  }

  return `
    <div class="recup-block">
      <strong>🛌 Temps de récupération recommandé : ${joursRecup} jour${joursRecup > 1 ? "s" : ""}</strong><br>
      <span>${conseil}</span>
    </div>
  `;
}

/* =========================
   PROCHAINE SÉANCE (PREMIUM)
========================= */

function genererProchaineSéance(result) {
  const { performances } = result;
  const sorted = [...performances].sort((a, b) => a.score - b.score);
  const pointFaible = sorted[0];

  if (!pointFaible) return "";

  const seances = {
    natation: [
      "🏊 4×200m en crawl avec 30s de récup entre chaque série",
      "🏊 10×50m sprints, focus sur la technique de bras",
      "🏊 1×800m continu à allure modérée pour travailler l'endurance",
      "🏊 Séance technique : 6×100m avec pull buoy pour isoler les bras"
    ],
    "vélo": [
      "🚴 45 min en endurance à 70% de ta FCmax, cadence 90rpm",
      "🚴 5×5 min en montée ou résistance élevée avec 3 min de récup",
      "🚴 Sortie longue de 1h à allure confortable pour construire l'endurance",
      "🚴 Intervalles : 10×1 min à fond, 1 min de récup active"
    ],
    course: [
      "🏃 30 min de footing lent pour récupérer et maintenir la forme",
      "🏃 5×1km à allure légèrement au-dessus de ta vitesse moyenne actuelle",
      "🏃 Fartlek 20 min : alterne 2 min vite / 2 min lent",
      "🏃 Sortie longue 45-60 min à allure conversationnelle"
    ]
  };

  const seance = randElement(seances[pointFaible.sport] || []);
  return `
    <div class="next-session-block">
      <strong>📅 Prochaine séance recommandée</strong><br>
      <span>Focus sur ton point faible : <strong>${pointFaible.sport}</strong></span><br>
      <span>${seance}</span>
    </div>
  `;
}

/* =========================
   CONSEILS GÉNÉRAUX (GRATUIT)
========================= */

const conseilsGeneraux = {
  natation: [
    "🏊 Travaille ta respiration bilatérale.",
    "🏊 Allonge ton coup de bras pour améliorer la glisse.",
    "🏊 Concentre-toi sur la rotation des hanches."
  ],
  "vélo": [
    "🚴 Maintiens une cadence régulière entre 80-100 rpm.",
    "🚴 Hydrate-toi toutes les 15-20 minutes.",
    "🚴 Adopte une position aérodynamique."
  ],
  course: [
    "🏃 Garde une foulée économique et relâchée.",
    "🏃 Vise une cadence de 180 pas/min.",
    "🏃 Gère ton effort dès le départ."
  ]
};

/* =========================
   CONSEILS PERSONNALISÉS (PREMIUM)
========================= */

const conseilsPersonnalises = {
  natation: [
    "🏊 Ton point technique prioritaire : travaille la prise d'eau en début de traction.",
    "🏊 Intègre des séances de nage avec palmes pour développer ta propulsion.",
    "🏊 Analyse ta nage en vidéo pour détecter les déséquilibres de ta technique.",
    "🏊 Pratique le SWOLF (stroke count + temps) pour mesurer ton efficacité.",
    "🏊 Travaille les virages culbute pour gagner 3-5 secondes par longueur."
  ],
  "vélo": [
    "🚴 Travaille le pédalage en souplesse : fais des sorties mono-jambe 30s/jambe.",
    "🚴 Intègre du travail en seuil : 2×20 min à 85-90% FCmax.",
    "🚴 Soigne ta nutrition : 60g de glucides/heure pour les efforts > 1h.",
    "🚴 Améliore ta position : un fitting vélo peut te faire gagner 5-10% de puissance.",
    "🚴 Travaille la montée en danseuse pour varier les groupes musculaires."
  ],
  course: [
    "🏃 Intègre du renforcement musculaire (gainage, fentes) 2x/semaine.",
    "🏃 Travaille ta vitesse avec des séances de strides : 6×80m à 90% de ta vitesse max.",
    "🏃 Soigne ta récupération : bains froids ou cryothérapie après les séances intenses.",
    "🏃 Analyse ta foulée : attaque talon ou médio-pied ? Le médio-pied est plus économique.",
    "🏃 Programme une sortie longue hebdomadaire à 65% FCmax pour construire l'endurance."
  ]
};

/* =========================
   BADGES
========================= */

const BADGES = [
  { id: "first_session", label: "🎯 Première séance", desc: "Analyse ta première performance", check: (s) => s.length >= 1 },
  { id: "swimmer",       label: "🏊 Nageur",           desc: "Nage plus de 1000m",              check: (s) => s.some(x => x.swimDist >= 1000) },
  { id: "cyclist",       label: "🚴 Cycliste",         desc: "Roule plus de 20km",              check: (s) => s.some(x => x.bikeDist >= 20) },
  { id: "runner",        label: "🏃 Coureur",          desc: "Cours plus de 5km",               check: (s) => s.some(x => x.runDist >= 5) },
  { id: "triathlete",    label: "🏅 Triathlète",       desc: "3 disciplines en une séance",     check: (s) => s.some(x => x.swimDist > 0 && x.bikeDist > 0 && x.runDist > 0) },
  { id: "consistent",    label: "🔥 Régulier",         desc: "5 séances analysées",             check: (s) => s.length >= 5 },
  { id: "beast",         label: "💪 Bête de course",   desc: "Score supérieur à 12",            check: (s) => s.some(x => x.globalScore >= 12) },
  { id: "elite",         label: "🥇 Élite",            desc: "Score supérieur à 15",            check: (s) => s.some(x => x.globalScore >= 15) },
  { id: "veteran",       label: "🎖️ Vétéran",         desc: "10 séances analysées",            check: (s) => s.length >= 10 }
];

function afficherBadges() {
  const zone = el("badgesList");
  if (!zone) return;
  const obtenus = BADGES.filter(b => b.check(sessions));
  if (obtenus.length === 0) {
    zone.innerHTML = "Fais une analyse pour débloquer tes premiers badges.";
    return;
  }
  zone.innerHTML = obtenus.map(b => `
    <div class="badge-item">
      <strong>${b.label}</strong>
      <span>${b.desc}</span>
    </div>
  `).join("");
}

/* =========================
   CALCUL SCORES
========================= */

function calculerScores() {
  const swimDist = Number(el("swimDist")?.value || 0);
  const swimTime = convertirTempsEnMinutes(el("swimTime")?.value || "");
  const bikeDist = Number(el("bikeDist")?.value || 0);
  const bikeTime = convertirTempsEnMinutes(el("bikeTime")?.value || "");
  const runDist  = Number(el("runDist")?.value  || 0);
  const runTime  = convertirTempsEnMinutes(el("runTime")?.value  || "");

  const refSwim = 45;   // m/min
  const refBike = 22;   // km/h
  const refRun  = 12;   // km/h

  let total = 0, count = 0;
  const performances = [];

  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    const score = Math.min((speed / refSwim) * 10, 20);
    total += score; count++;
    performances.push({ sport: "natation", score, speed, dist: swimDist, time: swimTime });
  }
  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = Math.min((speed / refBike) * 10, 20);
    total += score; count++;
    performances.push({ sport: "vélo", score, speed, dist: bikeDist, time: bikeTime });
  }
  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = Math.min((speed / refRun) * 10, 20);
    total += score; count++;
    performances.push({ sport: "course", score, speed, dist: runDist, time: runTime });
  }

  if (count === 0) return null;
  return { globalScore: total / count, performances, swimDist, swimTime, bikeDist, bikeTime, runDist, runTime };
}

/* =========================
   NIVEAU
========================= */

function obtenirNiveau(score) {
  if (score < 4)  return { level: "Niveau 1 😐 Débutant",   intro: "Tu construis ta base, continue !" };
  if (score < 7)  return { level: "Niveau 2 👍 En progrès", intro: "Bonne progression, tu t'améliores." };
  if (score < 10) return { level: "Niveau 3 🔥 Bon niveau", intro: "Très solide, tu es dans une bonne dynamique." };
  if (score < 13) return { level: "Niveau 4 💪 Très bon",   intro: "Excellent rythme, tu domines." };
  if (score < 16) return { level: "Niveau 5 🚀 Expert",     intro: "Performance de haut niveau !" };
  return           { level: "Niveau 6 🏆 Élite",            intro: "Tu es dans l'élite du triathlon !" };
}

/* =========================
   COACH IA — VERSION GRATUITE
========================= */

function genererCoachGratuit(result) {
  const { globalScore, performances } = result;
  const { level, intro } = obtenirNiveau(globalScore);

  const sorted = [...performances].sort((a, b) => b.score - a.score);
  const meilleur = sorted[0];

  let html = `<strong>${level}</strong><br>${intro}<br><br>`;
  html += `<strong>Score global : ${globalScore.toFixed(2)} / 20</strong><br><br>`;

  // Sport dominant (gratuit)
  if (meilleur) {
    html += `💚 Sport dominant : <strong>${meilleur.sport}</strong><br><br>`;
  }

  // Conseils généraux simples (gratuit)
  html += `<strong>Conseils généraux :</strong><br>`;
  performances.forEach(p => {
    const conseil = randElement(conseilsGeneraux[p.sport] || []);
    if (conseil) html += `${conseil}<br>`;
  });

  // Temps de récupération (gratuit)
  html += `<br>` + genererRecuperation(result);

  html += `<br><div class="premium-teaser">🔒 <strong>Premium</strong> : vitesses détaillées, conseils personnalisés, prochaine séance et Mode Race</div>`;

  return html;
}

/* =========================
   COACH IA — VERSION PREMIUM
========================= */

function genererCoachPremium(result) {
  const { globalScore, performances } = result;
  const { level, intro } = obtenirNiveau(globalScore);

  const sorted = [...performances].sort((a, b) => b.score - a.score);
  const meilleur = sorted[0];
  const pointFaible = sorted[sorted.length - 1];

  let html = `<strong>${level}</strong><br>${intro}<br><br>`;
  html += `<strong>Score global : ${globalScore.toFixed(2)} / 20</strong><br><br>`;

  // Vitesses détaillées (premium)
  html += `<strong>📊 Détail des performances :</strong><br>`;
  performances.forEach(p => {
    const vitesse = p.sport === "natation"
      ? `${p.speed.toFixed(1)} m/min (${(p.speed * 60 / 1000).toFixed(2)} km/h)`
      : `${p.speed.toFixed(1)} km/h`;
    html += `${p.sport.charAt(0).toUpperCase() + p.sport.slice(1)} : ${vitesse} — score : <strong>${p.score.toFixed(2)}/20</strong><br>`;
  });

  // Sport dominant et point faible (premium)
  html += `<br>`;
  if (meilleur) html += `💚 Point fort : <strong>${meilleur.sport}</strong><br>`;
  if (pointFaible && pointFaible.sport !== meilleur?.sport) {
    html += `⚠️ À travailler en priorité : <strong>${pointFaible.sport}</strong><br>`;
  }

  // Temps de récupération (premium)
  html += `<br>` + genererRecuperation(result);

  // Conseils personnalisés (premium)
  html += `<br><strong>🎯 Conseils personnalisés :</strong><br>`;
  performances.forEach(p => {
    const conseil = randElement(conseilsPersonnalises[p.sport] || []);
    if (conseil) html += `${conseil}<br>`;
  });

  // Prochaine séance (premium)
  html += `<br>` + genererProchaineSéance(result);

  // Mode Race (premium)
  html += `<br>` + genererModeRace(result);

  return html;
}

/* =========================
   DASHBOARD
========================= */

function mettreAJourDashboard() {
  if (sessions.length === 0) {
    if (el("bestScore"))    el("bestScore").textContent    = "0";
    if (el("averageScore")) el("averageScore").textContent = "0";
    if (el("sessionCount")) el("sessionCount").textContent = "0";
    if (el("bestSport"))    el("bestSport").textContent    = "Aucun";
    return;
  }

  const scores = sessions.map(s => s.globalScore);
  if (el("bestScore"))    el("bestScore").textContent    = Math.max(...scores).toFixed(2);
  if (el("averageScore")) el("averageScore").textContent = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  if (el("sessionCount")) el("sessionCount").textContent = sessions.length;

  // Sport dominant
  const counts = { natation: 0, "vélo": 0, course: 0 };
  sessions.forEach(s => s.performances?.forEach(p => { if (counts[p.sport] !== undefined) counts[p.sport]++; }));
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (el("bestSport")) el("bestSport").textContent = (dominant && dominant[1] > 0) ? dominant[0] : "Aucun";

  mettreAJourGraphique();
}

/* =========================
   GRAPHIQUE
========================= */

function mettreAJourGraphique() {
  const canvas = el("chart");
  if (!canvas || typeof Chart === "undefined") return;
  const ctx = canvas.getContext("2d");
  const slice = sessions.slice(-10);
  const labelsChart = slice.map((_, i) => `S${sessions.length - slice.length + i + 1}`);
  const dataChart = slice.map(s => parseFloat(s.globalScore.toFixed(2)));

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labelsChart,
      datasets: [{
        label: "Score global",
        data: dataChart,
        borderColor: "#00d4ff",
        backgroundColor: "rgba(0,212,255,0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#00d4ff",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#fff" } } },
      scales: {
        x: { ticks: { color: "#aaa" }, grid: { color: "#333" } },
        y: { ticks: { color: "#aaa" }, grid: { color: "#333" }, min: 0, max: 20 }
      }
    }
  });
}

/* =========================
   CLASSEMENT
========================= */

async function chargerClassement() {
  const zone = el("leaderboard");
  if (!zone) return;
  if (!currentUser) { zone.innerHTML = "🔒 Connecte-toi pour accéder au classement."; return; }

  try {
    const q = query(collection(db, "scores"), orderBy("globalScore", "desc"), limit(10));
    const snap = await getDocs(q);
    if (snap.empty) { zone.innerHTML = "Aucun score enregistré pour le moment."; return; }

    let html = "<ol class='leaderboard-list'>";
    let rank = 1;
    snap.forEach(d => {
      const data = d.data();
      const isMe = data.uid === currentUser.uid;
      html += `<li class="${isMe ? "me" : ""}">${rank}. <strong>${data.pseudo || data.email || "Anonyme"}</strong> — ${parseFloat(data.globalScore).toFixed(2)} pts</li>`;
      rank++;
    });
    html += "</ol>";
    zone.innerHTML = html;
  } catch (e) {
    zone.innerHTML = "Impossible de charger le classement.";
  }
}

/* =========================
   COMPARAISON
========================= */

async function chargerComparaison(monScore) {
  const zone = el("comparison");
  if (!zone) return;
  if (!currentUser) { zone.innerHTML = "🔒 Connecte-toi pour comparer tes performances."; return; }

  try {
    const snap = await getDocs(query(collection(db, "scores"), orderBy("globalScore", "desc")));
    if (snap.empty) { zone.innerHTML = "Pas assez de données."; return; }
    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));
    const percentile = Math.round(((scores.length - scores.filter(s => s > monScore).length) / scores.length) * 100);
    const moyenne = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
    zone.innerHTML = `
      <p>Tu es meilleur que <strong>${percentile}%</strong> des utilisateurs Trilo.</p>
      <p>Score moyen mondial : <strong>${moyenne}</strong> | Ton score : <strong>${monScore.toFixed(2)}</strong></p>
    `;
  } catch (e) {
    zone.innerHTML = "Impossible de charger la comparaison.";
  }
}

/* =========================
   COMPARAISON AVANCÉE IA
========================= */

async function chargerComparaisonAvancee(monScore) {
  const zone = el("advancedComparison");
  if (!zone) return;
  if (!currentUser) { zone.innerHTML = "🔒 Connecte-toi pour accéder à l'analyse avancée."; return; }
  if (!isPremium)   { zone.innerHTML = "🔒 Premium requis pour débloquer l'analyse avancée."; return; }

  zone.innerHTML = "🧠 Analyse en cours...";
  try {
    const snap = await getDocs(query(collection(db, "scores"), orderBy("globalScore", "desc")));
    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const diff = monScore - avg;
    let texte = diff > 3
      ? `🚀 Tu es largement au-dessus de la moyenne (${avg.toFixed(2)}). Tu fais partie des meilleurs sur Trilo !`
      : diff > 0
      ? `👍 Tu es au-dessus de la moyenne (${avg.toFixed(2)}). Continue dans cette direction.`
      : diff > -3
      ? `💪 Légèrement en dessous de la moyenne (${avg.toFixed(2)}). Un entraînement ciblé et tu passes devant.`
      : `🔥 En dessous de la moyenne (${avg.toFixed(2)}), mais c'est le point de départ de tous les champions !`;
    zone.innerHTML = `<p>${texte}</p>`;
  } catch (e) {
    zone.innerHTML = "Erreur lors de l'analyse avancée.";
  }
}

/* =========================
   ENREGISTRER SCORE
========================= */

async function enregistrerScore(result) {
  if (!currentUser) return;
  try {
    await addDoc(collection(db, "scores"), {
      uid: currentUser.uid,
      email: currentUser.email,
      globalScore: result.globalScore,
      performances: result.performances,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Erreur enregistrement :", e);
  }
}

/* =========================
   ANALYSER
========================= */

async function analyser() {
  const result = calculerScores();
  if (!result) {
    el("score").textContent   = "⚠️ Erreur";
    el("message").textContent = "Remplis au moins une discipline avec distance ET temps.";
    return;
  }

  const { globalScore } = result;
  const { level } = obtenirNiveau(globalScore);

  el("score").textContent = level;
  el("message").innerHTML = `Score global : <strong>${globalScore.toFixed(2)} / 20</strong>`;

  // Coach IA : gratuit vs premium
  const zoneCoach = el("aiAnalysis");
  if (zoneCoach) {
    if (!currentUser) {
      zoneCoach.innerHTML = "🔒 Connecte-toi pour accéder au Coach IA.";
    } else if (isPremium) {
      zoneCoach.innerHTML = genererCoachPremium(result);
    } else {
      zoneCoach.innerHTML = genererCoachGratuit(result);
    }
  }

  // Sauvegarder local
  sessions.push({
    globalScore,
    performances: result.performances,
    swimDist: result.swimDist,
    bikeDist: result.bikeDist,
    runDist:  result.runDist,
    date: new Date().toISOString()
  });
  localStorage.setItem("triloSessions", JSON.stringify(sessions));

  mettreAJourDashboard();
  afficherBadges();

  if (currentUser) {
    await enregistrerScore(result);
    await chargerClassement();
    await chargerComparaison(globalScore);
    await chargerComparaisonAvancee(globalScore);
  }
}

/* =========================
   RÉINITIALISER
========================= */

function reinitialiser() {
  ["swimDist", "swimTime", "bikeDist", "bikeTime", "runDist", "runTime"].forEach(id => {
    if (el(id)) el(id).value = "";
  });
  el("score").textContent   = "Aucun score";
  el("message").textContent = "Entre tes performances puis clique sur analyser.";
  if (el("aiAnalysis")) el("aiAnalysis").innerHTML = "Fais une analyse pour recevoir ton coaching IA.";
}

/* =========================
   AUTH
========================= */

async function creerProfil(user) {
  const ref  = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { email: user.email, uid: user.uid, premium: false, createdAt: serverTimestamp() });
  }
}

async function verifierPremium(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    isPremium = snap.exists() && snap.data().premium === true;
  } catch { isPremium = false; }
}

function afficherEtatAuth() {
  const loginCard = document.querySelector(".login-card");
  if (!loginCard) return;

  if (currentUser) {
    const badge = isPremium ? ' <span style="color:#ffd700;font-size:0.8em;">⭐ PREMIUM</span>' : '';
    loginCard.innerHTML = `
      <p style="color:#00d4ff;font-weight:bold;">👤 ${currentUser.email}${badge}</p>
      <button id="logoutBtn" type="button">Se déconnecter</button>
    `;
    el("logoutBtn")?.addEventListener("click", async () => { await signOut(auth); });
  } else {
    loginCard.innerHTML = `
      <h2>Connexion Trilo</h2>
      <div class="login-grid">
        <input id="email" type="email" placeholder="Email">
        <input id="password" type="password" placeholder="Mot de passe">
      </div>
      <div class="login-actions">
        <button id="signupBtn" type="button">Créer un compte</button>
        <button id="loginBtn" type="button">Connexion</button>
      </div>
    `;
    el("signupBtn")?.addEventListener("click", async () => {
      const email = el("email")?.value?.trim(), password = el("password")?.value?.trim();
      if (!email || !password) return alert("Email et mot de passe requis.");
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await creerProfil(cred.user);
      } catch (e) { alert("Erreur inscription : " + e.message); }
    });
    el("loginBtn")?.addEventListener("click", async () => {
      const email = el("email")?.value?.trim(), password = el("password")?.value?.trim();
      if (!email || !password) return alert("Email et mot de passe requis.");
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) { alert("Erreur connexion : " + e.message); }
    });
  }
}

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await creerProfil(user);
    await verifierPremium(user);
    await chargerClassement();
  } else {
    isPremium = false;
    if (el("leaderboard"))        el("leaderboard").innerHTML        = "🔒 Connecte-toi pour accéder au classement.";
    if (el("comparison"))         el("comparison").innerHTML         = "🔒 Connecte-toi pour comparer tes performances.";
    if (el("advancedComparison")) el("advancedComparison").innerHTML = "🔒 Premium requis pour débloquer l'analyse avancée.";
  }
  afficherEtatAuth();
  mettreAJourDashboard();
  afficherBadges();
});

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", () => {
  el("analyzeBtn")?.addEventListener("click", analyser);
  el("resetBtn")?.addEventListener("click", reinitialiser);
  document.querySelector(".premium-btn")?.addEventListener("click", () => {
    if (!currentUser) return alert("🔒 Connecte-toi d'abord.");
    if (isPremium)    return alert("✅ Tu es déjà Premium !");
    alert("💳 Intègre Stripe ici pour activer le Premium.");
  });
  mettreAJourDashboard();
  afficherBadges();
});
