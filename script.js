import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail
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

const firebaseConfig = {
  apiKey: "AIzaSyBTv3F1ukSvaoD340ABx6CLjjQ0pHBs7q8",
  authDomain: "trilo-88a88.firebaseapp.com",
  projectId: "trilo-88a88",
  storageBucket: "trilo-88a88.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let currentUser = null;
let isPremium   = false;
let chart       = null;
let sessions    = JSON.parse(localStorage.getItem("triloSessions")) || [];

function el(id) { return document.getElementById(id); }

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

const RACES = {
  sprint:    { label: "Sprint",            swim: 750,  bike: 20,  run: 5,    tempsRef: { swim: 15, bike: 40,  run: 20  } },
  olympique: { label: "Olympique",         swim: 1500, bike: 40,  run: 10,   tempsRef: { swim: 30, bike: 75,  run: 45  } },
  half:      { label: "Half Ironman 70.3", swim: 1900, bike: 90,  run: 21.1, tempsRef: { swim: 40, bike: 150, run: 105 } },
  ironman:   { label: "Ironman",           swim: 3800, bike: 180, run: 42.2, tempsRef: { swim: 75, bike: 330, run: 240 } }
};

function genererModeRace(result) {
  const swimPerf = result.performances.find(p => p.sport === "natation");
  const bikePerf = result.performances.find(p => p.sport === "vélo");
  const runPerf  = result.performances.find(p => p.sport === "course");

  // Si l'utilisateur n'a pas fait les 3 disciplines, on prévient
  const nbDisciplines = result.performances.length;
  if (nbDisciplines < 3) {
    return `<div class="race-section">
      <h3>🏁 Mode Race</h3>
      <div class="race-card">
        <p style="color:var(--text-muted);font-size:14px;">
          ⚠️ Le mode Race nécessite les <strong>3 disciplines</strong> (natation, vélo, course) pour estimer ton temps total sur une course officielle.
        </p>
        <p style="color:var(--text-muted);font-size:13px;margin-top:8px;">
          Tu as renseigné ${nbDisciplines} discipline${nbDisciplines > 1 ? "s" : ""}. Refais une analyse avec les 3 sports pour débloquer cette fonctionnalité !
        </p>
      </div>
    </div>`;
  }

  let html = `<div class="race-section"><h3>🏁 Mode Race — Comparaison officielle</h3>`;
  Object.values(RACES).forEach(race => {
    html += `<div class="race-card"><strong>${race.label}</strong><br>`;
    const tSwim = Math.round(race.swim / swimPerf.speed);
    const eSwim = (tSwim - race.tempsRef.swim) <= 0 ? "✅" : (tSwim - race.tempsRef.swim) <= 5 ? "🟡" : "🔴";
    html += `🏊 Natation (${race.swim}m) : ~${tSwim} min ${eSwim} (ref: ${race.tempsRef.swim} min)<br>`;

    const tBike = Math.round((race.bike / bikePerf.speed) * 60);
    const eBike = (tBike - race.tempsRef.bike) <= 0 ? "✅" : (tBike - race.tempsRef.bike) <= 10 ? "🟡" : "🔴";
    html += `🚴 Vélo (${race.bike}km) : ~${tBike} min ${eBike} (ref: ${race.tempsRef.bike} min)<br>`;

    const tRun = Math.round((race.run / runPerf.speed) * 60);
    const eRun = (tRun - race.tempsRef.run) <= 0 ? "✅" : (tRun - race.tempsRef.run) <= 10 ? "🟡" : "🔴";
    html += `🏃 Course (${race.run}km) : ~${tRun} min ${eRun} (ref: ${race.tempsRef.run} min)<br>`;

    const total = tSwim + tBike + tRun + 5;
    const h = Math.floor(total / 60), m = total % 60;
    html += `⏱️ Total estimé : <strong>${h > 0 ? h + "h" : ""}${m}min</strong> (avec transitions)<br></div>`;
  });
  html += `<p class="race-note">* Estimations hors fatigue cumulée.</p></div>`;
  return html;
}

function genererRecuperation(result) {
  let charge = 0;
  result.performances.forEach(p => { charge += p.dist * (20 - p.score) / 10; });
  const jours = charge < 5 ? 1 : charge < 30 ? 2 : 3;
  const texte = charge < 5  ? "Séance légère — tu peux t'entraîner demain."
    : charge < 15 ? "Séance modérée — 1 à 2 jours de récupération active."
    : charge < 30 ? "Séance intense — 2 jours de repos. Dors bien et hydrate-toi."
    :               "Séance très intense — 3 jours minimum. Favorise la natation douce.";
  return `<div class="recup-block"><strong>🛌 Récupération : ${jours} jour${jours > 1 ? "s" : ""}</strong><br><span>${texte}</span></div>`;
}

function genererProchaineSéance(result) {
  const sorted = [...result.performances].sort((a, b) => a.score - b.score);
  const pf = sorted[0];
  if (!pf) return "";
  const seances = {
    natation: ["🏊 4×200m crawl, 30s récup", "🏊 10×50m sprints technique", "🏊 800m continu allure modérée", "🏊 6×100m avec pull buoy"],
    "vélo":   ["🚴 45min endurance 70% FCmax", "🚴 5×5min résistance élevée", "🚴 1h sortie longue confortable", "🚴 10×1min intervalles"],
    course:   ["🏃 30min footing lent", "🏃 5×1km au-dessus de ta moyenne", "🏃 Fartlek 20min : 2min vite/2min lent", "🏃 45-60min allure conversationnelle"]
  };
  return `<div class="next-session-block"><strong>📅 Prochaine séance recommandée</strong><br>Focus : <strong>${pf.sport}</strong><br>${randElement(seances[pf.sport] || [])}</div>`;
}

const conseilsGeneraux = {
  natation: ["🏊 Travaille ta respiration bilatérale.", "🏊 Allonge ton coup de bras.", "🏊 Rotation des hanches pour plus de puissance."],
  "vélo":   ["🚴 Cadence régulière 80-100 rpm.", "🚴 Hydrate-toi toutes les 15-20 min.", "🚴 Adopte une position aérodynamique."],
  course:   ["🏃 Foulée économique et relâchée.", "🏃 Cadence cible : 180 pas/min.", "🏃 Gère ton effort dès le départ."]
};

const conseilsPersonnalises = {
  natation: ["🏊 Travaille la prise d'eau en début de traction.", "🏊 Nage avec palmes pour développer la propulsion.", "🏊 Analyse ta nage en vidéo.", "🏊 Pratique le SWOLF pour mesurer ton efficacité.", "🏊 Entraîne les virages culbute."],
  "vélo":   ["🚴 Pédalage mono-jambe 30s/jambe.", "🚴 2×20min à 85-90% FCmax.", "🚴 60g de glucides/heure pour efforts > 1h.", "🚴 Un fitting vélo peut t'apporter 5-10% de puissance.", "🚴 Alterne position assise et danseuse."],
  course:   ["🏃 Renforcement : gainage + fentes 2x/semaine.", "🏃 Strides : 6×80m à 90% vitesse max.", "🏃 Bains froids après séances intenses.", "🏃 Médio-pied plus économique que l'attaque talon.", "🏃 Sortie longue hebdo à 65% FCmax."]
};

const BADGES = [
  { id: "first",      label: "🎯 Première séance",  desc: "Analyse ta 1ère perf",        check: s => s.length >= 1 },
  { id: "swimmer",    label: "🏊 Nageur",            desc: "Nage plus de 1000m",          check: s => s.some(x => x.swimDist >= 1000) },
  { id: "cyclist",    label: "🚴 Cycliste",          desc: "Roule plus de 20km",          check: s => s.some(x => x.bikeDist >= 20) },
  { id: "runner",     label: "🏃 Coureur",           desc: "Cours plus de 5km",           check: s => s.some(x => x.runDist >= 5) },
  { id: "tri",        label: "🏅 Triathlète",        desc: "3 disciplines en une séance", check: s => s.some(x => x.swimDist > 0 && x.bikeDist > 0 && x.runDist > 0) },
  { id: "consistent", label: "🔥 Régulier",          desc: "5 séances analysées",         check: s => s.length >= 5 },
  { id: "beast",      label: "💪 Bête de course",    desc: "Score > 12",                  check: s => s.some(x => x.globalScore >= 12) },
  { id: "elite",      label: "🥇 Élite",             desc: "Score > 15",                  check: s => s.some(x => x.globalScore >= 15) },
  { id: "veteran",    label: "🎖️ Vétéran",          desc: "10 séances analysées",        check: s => s.length >= 10 }
];

function afficherBadges() {
  const zone = el("badgesList");
  if (!zone) return;
  const obtenus = BADGES.filter(b => b.check(sessions));
  zone.innerHTML = obtenus.length === 0
    ? "Fais une analyse pour débloquer tes premiers badges."
    : obtenus.map(b => `<div class="badge-item"><strong>${b.label}</strong><span>${b.desc}</span></div>`).join("");
}

function calculerScores() {
  let swimDist = Number(el("swimDist")?.value || 0);
  const swimTime = convertirTempsEnMinutes(el("swimTime")?.value || "");
  let bikeDist = Number(el("bikeDist")?.value || 0);
  const bikeTime = convertirTempsEnMinutes(el("bikeTime")?.value || "");
  let runDist  = Number(el("runDist")?.value  || 0);
  const runTime  = convertirTempsEnMinutes(el("runTime")?.value  || "");

  // Validation des valeurs max réalistes
  if (swimDist > 10000) { alert("⚠️ Distance natation trop élevée (max 10 000m)"); return null; }
  if (bikeDist > 300)   { alert("⚠️ Distance vélo trop élevée (max 300km)"); return null; }
  if (runDist > 100)    { alert("⚠️ Distance course trop élevée (max 100km)"); return null; }
  if (swimTime > 600)   { alert("⚠️ Temps natation trop élevé (max 10h)"); return null; }
  if (bikeTime > 600)   { alert("⚠️ Temps vélo trop élevé (max 10h)"); return null; }
  if (runTime > 600)    { alert("⚠️ Temps course trop élevé (max 10h)"); return null; }

  // Validation vitesses aberrantes
  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    if (speed > 120) { alert("⚠️ Vitesse natation irréaliste. Vérifie tes données."); return null; }
  }
  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    if (speed > 80) { alert("⚠️ Vitesse vélo irréaliste. Vérifie tes données."); return null; }
  }
  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    if (speed > 35) { alert("⚠️ Vitesse course irréaliste. Vérifie tes données."); return null; }
  }

  let total = 0, count = 0;
  const performances = [];
  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    const score = Math.min((speed / 45) * 10, 20);
    total += score; count++;
    performances.push({ sport: "natation", score, speed, dist: swimDist, time: swimTime });
  }
  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = Math.min((speed / 22) * 10, 20);
    total += score; count++;
    performances.push({ sport: "vélo", score, speed, dist: bikeDist, time: bikeTime });
  }
  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = Math.min((speed / 12) * 10, 20);
    total += score; count++;
    performances.push({ sport: "course", score, speed, dist: runDist, time: runTime });
  }
  if (count === 0) return null;
  return { globalScore: total / count, performances, swimDist, swimTime, bikeDist, bikeTime, runDist, runTime };
}

function obtenirNiveau(score) {
  if (score < 4)  return { level: "Niveau 1 😐 Débutant",   intro: "Tu construis ta base, continue !" };
  if (score < 7)  return { level: "Niveau 2 👍 En progrès", intro: "Bonne progression, tu t'améliores." };
  if (score < 10) return { level: "Niveau 3 🔥 Bon niveau", intro: "Très solide, bonne dynamique." };
  if (score < 13) return { level: "Niveau 4 💪 Très bon",   intro: "Excellent rythme, tu domines." };
  if (score < 16) return { level: "Niveau 5 🚀 Expert",     intro: "Performance de haut niveau !" };
  return           { level: "Niveau 6 🏆 Élite",            intro: "Tu es dans l'élite du triathlon !" };
}

function genererCoachGratuit(result) {
  const { globalScore, performances } = result;
  const { level, intro } = obtenirNiveau(globalScore);
  const meilleur = [...performances].sort((a, b) => b.score - a.score)[0];
  let html = `<strong>${level}</strong><br>${intro}<br><br>`;
  html += `<strong>Score global : ${globalScore.toFixed(2)} / 20</strong><br><br>`;
  if (meilleur) html += `💚 Sport dominant : <strong>${meilleur.sport}</strong><br><br>`;
  html += `<strong>Conseils généraux :</strong><br>`;
  performances.forEach(p => { html += `${randElement(conseilsGeneraux[p.sport] || [])}<br>`; });
  html += `<br>` + genererRecuperation(result);
  html += `<br><div class="premium-teaser">🔒 <strong>Premium</strong> : vitesses km/h, conseils personnalisés, prochaine séance, Mode Race</div>`;
  return html;
}

function genererCoachPremium(result) {
  const { globalScore, performances } = result;
  const { level, intro } = obtenirNiveau(globalScore);
  const sorted = [...performances].sort((a, b) => b.score - a.score);
  const meilleur = sorted[0];
  const pointFaible = sorted[sorted.length - 1];

  // Détail des performances
  let details = "";
  performances.forEach(p => {
    const v = p.sport === "natation"
      ? `${p.speed.toFixed(1)} m/min (${(p.speed * 60 / 1000).toFixed(2)} km/h)`
      : `${p.speed.toFixed(1)} km/h`;
    details += `${p.sport}: ${v}, score ${p.score.toFixed(2)}/20. `;
  });

  let html = `<strong>${level}</strong><br>${intro}<br><br>`;
  html += `<strong>Score global : ${globalScore.toFixed(2)} / 20</strong><br><br>`;
  html += `<strong>📊 Détail des performances :</strong><br>`;
  performances.forEach(p => {
    const v = p.sport === "natation"
      ? `${p.speed.toFixed(1)} m/min (${(p.speed * 60 / 1000).toFixed(2)} km/h)`
      : `${p.speed.toFixed(1)} km/h`;
    html += `${p.sport.charAt(0).toUpperCase() + p.sport.slice(1)} : ${v} — <strong>${p.score.toFixed(2)}/20</strong><br>`;
  });
  html += `<br>`;
  if (meilleur) html += `💚 Point fort : <strong>${meilleur.sport}</strong><br>`;
  if (pointFaible && pointFaible.sport !== meilleur?.sport) html += `⚠️ À travailler : <strong>${pointFaible.sport}</strong><br>`;
  html += `<br>` + genererRecuperation(result);
  html += `<br>` + genererProchaineSéance(result);
  html += `<br>` + genererModeRace(result);

  // Analyse IA locale intelligente
  html += `<br>` + genererAnalyseIA(result);

  return html;
}

function genererAnalyseIA(result) {
  const { globalScore, performances } = result;
  const sorted = [...performances].sort((a, b) => a.score - b.score);
  const faible = sorted[0];
  const fort   = sorted[sorted.length - 1];

  const nbSports = performances.length;

  // Analyse selon le score
  let intro = "";
  if (globalScore >= 16) {
    intro = `Ton score de ${globalScore.toFixed(2)}/20 te place dans l'élite mondiale du triathlon. Tu as atteint un niveau exceptionnel qui demande une planification d'entraînement très précise pour continuer à progresser.`;
  } else if (globalScore >= 13) {
    intro = `Avec ${globalScore.toFixed(2)}/20, tu es clairement au-dessus de la moyenne des triathlètes. Ton profil montre une vraie maîtrise des disciplines — il s'agit maintenant d'optimiser les détails.`;
  } else if (globalScore >= 10) {
    intro = `${globalScore.toFixed(2)}/20 est un bon score solide. Tu as les bases bien établies, et avec un travail ciblé tu peux facilement passer au niveau supérieur dans les prochains mois.`;
  } else if (globalScore >= 7) {
    intro = `Ton score de ${globalScore.toFixed(2)}/20 montre une progression encourageante. Tu construis ta base aérobie — c'est la phase la plus importante et la plus formatrice.`;
  } else {
    intro = `${globalScore.toFixed(2)}/20 : tu es au début de ton parcours triathlon. C'est le moment idéal pour construire des bases solides qui te serviront toute ta carrière sportive.`;
  }

  // Analyse du point faible
  let conseilFaible = "";
  if (faible) {
    const vitesses = {
      natation: [
        `Ta natation (${faible.speed?.toFixed(1)} m/min) est ton point à améliorer en priorité. Vise 3 séances piscine par semaine avec des séries courtes et intenses plutôt qu'une longue sortie.`,
        `Pour progresser en natation, concentre-toi sur la technique avant la vitesse : travaille le catch (prise d'eau) et la rotation des hanches avec un coach si possible.`,
        `La natation représente seulement 10-15% du temps en course mais peut te faire perdre beaucoup d'énergie. Optimise ta technique pour arriver frais sur le vélo.`
      ],
      "vélo": [
        `Le vélo (${faible.speed?.toFixed(1)} km/h) est ta discipline à cibler. Deux entraînements vélo par semaine suffisent : un en endurance longue, un en intervalles de puissance.`,
        `Pour progresser à vélo, travaille ton endurance de base : des sorties de 1h30-2h à allure modérée (70% FCmax) pour construire ton moteur aérobie.`,
        `La position sur le vélo a un impact énorme sur la performance. Vérifie ton fitting et travaille la souplesse pour une meilleure efficacité aérodynamique.`
      ],
      course: [
        `Ta course à pied (${faible.speed?.toFixed(1)} km/h) a le plus grand potentiel de progression. Augmente progressivement ton volume de 10% par semaine maximum pour éviter les blessures.`,
        `Pour améliorer ta course, intègre des sorties longues lentes (65% FCmax) et des séances de fractionné court (10x400m). Ce combo est le plus efficace pour progresser rapidement.`,
        `La course à pied après le vélo est spécifique — entraîne-toi en "brique" (vélo + course enchaînés) au moins une fois par semaine pour habituer tes jambes à la transition.`
      ]
    };
    const conseils = vitesses[faible.sport] || [];
    conseilFaible = randElement(conseils) || "";
  }

  // Conseil selon le nombre de disciplines
  let conseilGlobal = "";
  if (nbSports === 3) {
    conseilGlobal = `Tu as pratiqué les 3 disciplines — c'est parfait pour un entraînement complet. Veille à bien planifier tes récupérations entre les séances pour éviter le surmenage.`;
  } else if (nbSports === 1) {
    conseilGlobal = `Tu t'es concentré sur une seule discipline aujourd'hui. Pour progresser en triathlon, essaie d'intégrer les 3 sports dans ta semaine d'entraînement.`;
  }

  // Conseil nutrition/récupération selon l'intensité
  let conseilRecup = "";
  if (globalScore >= 13) {
    conseilRecup = `À ton niveau, la nutrition et le sommeil sont aussi importants que l'entraînement : 7-9h de sommeil, 1.6-2g de protéines/kg et une bonne hydratation sont non-négociables.`;
  } else {
    conseilRecup = `Pense à bien t'hydrater avant, pendant et après l'effort. Une bonne récupération (sommeil, alimentation) vaut autant que l'entraînement lui-même.`;
  }

  const analyse = [intro, conseilFaible, conseilGlobal, conseilRecup]
    .filter(Boolean)
    .join(" ");

  return `<div class="claude-ia-block">
    <strong>🤖 Analyse Coach IA :</strong><br>
    ${analyse}
  </div>`;
}

function mettreAJourDashboard() {
  const dashCard = document.querySelector(".dashboard-card");

  // Verrouiller si pas premium
  if (!currentUser || !isPremium) {
    if (dashCard) {
      const head = dashCard.querySelector(".dashboard-head");
      while (dashCard.children.length > 1) {
        dashCard.removeChild(dashCard.lastChild);
      }
      const lock = document.createElement("div");
      lock.className = "premium-lock-msg";
      lock.innerHTML = `🔒 <strong>Premium requis</strong><br><span style="color:var(--text-muted);font-size:13px;">Débloque le dashboard avancé avec Trilo Premium</span>`;
      dashCard.appendChild(lock);
    }
    // Mettre à jour le graphique aussi (pour afficher le message Premium)
    mettreAJourGraphique();
    return;
  }

  // Restaurer la grille si elle a été remplacée
  if (dashCard && !el("bestScore")) {
    while (dashCard.children.length > 1) {
      dashCard.removeChild(dashCard.lastChild);
    }
    const grid = document.createElement("div");
    grid.className = "dashboard-grid";
    grid.innerHTML = `
      <div class="dashboard-box"><h3>🏅 Meilleur score</h3><div id="bestScore">0</div></div>
      <div class="dashboard-box"><h3>📈 Score moyen</h3><div id="averageScore">0</div></div>
      <div class="dashboard-box"><h3>🔥 Séances</h3><div id="sessionCount">0</div></div>
      <div class="dashboard-box"><h3>💪 Sport dominant</h3><div id="bestSport">Aucun</div></div>
    `;
    dashCard.appendChild(grid);
  }

  if (sessions.length === 0) {
    ["bestScore","averageScore","sessionCount"].forEach(id => { if (el(id)) el(id).textContent = "0"; });
    if (el("bestSport")) el("bestSport").textContent = "Aucun";
    mettreAJourGraphique();
    return;
  }
  const scores = sessions.map(s => s.globalScore);
  if (el("bestScore"))    el("bestScore").textContent    = Math.max(...scores).toFixed(2);
  if (el("averageScore")) el("averageScore").textContent = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(2);
  if (el("sessionCount")) el("sessionCount").textContent = sessions.length;
  const counts = { natation: 0, "vélo": 0, course: 0 };
  sessions.forEach(s => s.performances?.forEach(p => { if (counts[p.sport] !== undefined) counts[p.sport]++; }));
  const dominant = Object.entries(counts).sort((a,b) => b[1]-a[1])[0];
  if (el("bestSport")) el("bestSport").textContent = (dominant && dominant[1] > 0) ? dominant[0] : "Aucun";
  mettreAJourGraphique();
}

function mettreAJourGraphique() {
  const canvas = el("chart");
  const chartBox = document.querySelector(".chart-box");
  if (!canvas || typeof Chart === "undefined") return;

  // Restaurer le canvas si remplacé
  if (chartBox && !document.getElementById("chart")) {
    chartBox.innerHTML = `<canvas id="chart"></canvas>`;
  }
  const canvasNew = document.getElementById("chart") || canvas;

  const slice = sessions.slice(-10);
  if (chart) chart.destroy();
  chart = new Chart(canvasNew.getContext("2d"), {
    type: "line",
    data: {
      labels: slice.map((_, i) => `S${sessions.length - slice.length + i + 1}`),
      datasets: [{ label: "Score global", data: slice.map(s => parseFloat(s.globalScore.toFixed(2))),
        borderColor: "#00d4ff", backgroundColor: "rgba(0,212,255,0.1)",
        borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: "#00d4ff", pointRadius: 5 }]
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

async function chargerClassement() {
  const zone = el("leaderboard");
  if (!zone) return;
  if (!currentUser) { zone.innerHTML = "🔒 Connecte-toi pour accéder au classement."; return; }
  if (!isPremium)   { zone.innerHTML = "🔒 Premium requis pour accéder au classement mondial."; return; }
  try {
    const snap = await getDocs(query(collection(db, "scores"), orderBy("globalScore", "desc"), limit(10)));
    if (snap.empty) { zone.innerHTML = "Aucun score enregistré."; return; }
    let html = "<ol class='leaderboard-list'>", rank = 1;
    snap.forEach(d => {
      const data = d.data();
      html += `<li class="${data.uid === currentUser.uid ? "me" : ""}">${rank++}. <strong>${data.pseudo || data.email || "Anonyme"}</strong> — ${parseFloat(data.globalScore).toFixed(2)} pts</li>`;
    });
    zone.innerHTML = html + "</ol>";
  } catch { zone.innerHTML = "Impossible de charger le classement."; }
}

async function chargerComparaison(monScore) {
  const zone = el("comparison");
  if (!zone) return;
  if (!currentUser) { zone.innerHTML = "🔒 Connecte-toi pour comparer tes performances."; return; }
  if (!isPremium)   { zone.innerHTML = "🔒 Premium requis pour comparer tes performances."; return; }
  try {
    const snap = await getDocs(query(collection(db, "scores"), orderBy("globalScore", "desc")));
    if (snap.empty) { zone.innerHTML = "Pas assez de données."; return; }
    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));
    const percentile = Math.round(((scores.length - scores.filter(s => s > monScore).length) / scores.length) * 100);
    const moyenne = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(2);
    zone.innerHTML = `<p>Tu es meilleur que <strong>${percentile}%</strong> des utilisateurs Trilo.</p><p>Moyenne mondiale : <strong>${moyenne}</strong> | Ton score : <strong>${monScore.toFixed(2)}</strong></p>`;
  } catch { zone.innerHTML = "Impossible de charger la comparaison."; }
}

async function chargerComparaisonAvancee(monScore) {
  const zone = el("advancedComparison");
  if (!zone) return;
  if (!currentUser) { zone.innerHTML = "🔒 Connecte-toi."; return; }
  if (!isPremium)   { zone.innerHTML = "🔒 Premium requis."; return; }
  zone.innerHTML = "🧠 Analyse en cours...";
  try {
    const snap = await getDocs(query(collection(db, "scores"), orderBy("globalScore", "desc")));
    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));
    const avg = scores.reduce((a,b) => a+b, 0) / scores.length;
    const diff = monScore - avg;
    const texte = diff > 3  ? `🚀 Largement au-dessus de la moyenne (${avg.toFixed(2)}). Tu fais partie des meilleurs !`
      : diff > 0  ? `👍 Au-dessus de la moyenne (${avg.toFixed(2)}). Continue !`
      : diff > -3 ? `💪 Légèrement en dessous (${avg.toFixed(2)}). Un entraînement ciblé et tu passes devant.`
      :             `🔥 En dessous de la moyenne (${avg.toFixed(2)}), mais c'est le point de départ des champions !`;
    zone.innerHTML = `<p>${texte}</p>`;
  } catch { zone.innerHTML = "Erreur analyse avancée."; }
}

async function enregistrerScore(result) {
  if (!currentUser) return;
  try {
    // Recuperer le pseudo depuis le profil
    const userSnap = await getDoc(doc(db, "users", currentUser.uid));
    const pseudo = userSnap.exists() ? (userSnap.data().pseudo || "Anonyme") : "Anonyme";

    // setDoc avec uid comme ID = un seul score par utilisateur (meilleur score)
    const refScore = doc(db, "scores", currentUser.uid);
    const existing = await getDoc(refScore);
    if (!existing.exists() || result.globalScore > existing.data().globalScore) {
      await setDoc(refScore, {
        uid:          currentUser.uid,
        pseudo:       pseudo,
        globalScore:  result.globalScore,
        performances: result.performances,
        timestamp:    serverTimestamp()
      });
    }
  } catch(e) { console.error("Erreur enregistrement :", e); }
}

async function analyser() {
  const result = calculerScores();
  if (!result) {
    el("score").textContent   = "⚠️ Erreur";
    el("message").textContent = "Remplis au moins une discipline avec distance ET temps.";
    return;
  }
  const { globalScore } = result;
  el("score").textContent = obtenirNiveau(globalScore).level;
  el("message").innerHTML = `Score global : <strong>${globalScore.toFixed(2)} / 20</strong>`;
  const zoneCoach = el("aiAnalysis");
  if (zoneCoach) {
    if (!currentUser)   zoneCoach.innerHTML = "🔒 Connecte-toi pour accéder au Coach IA.";
    else if (isPremium) zoneCoach.innerHTML = genererCoachPremium(result);
    else                zoneCoach.innerHTML = genererCoachGratuit(result);
  }
  sessions.push({
    globalScore, performances: result.performances,
    swimDist: result.swimDist, bikeDist: result.bikeDist, runDist: result.runDist,
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

function reinitialiser() {
  ["swimDist","swimTime","bikeDist","bikeTime","runDist","runTime"].forEach(id => { if (el(id)) el(id).value = ""; });
  el("score").textContent   = "Aucun score";
  el("message").textContent = "Entre tes performances puis clique sur analyser.";
  if (el("aiAnalysis")) el("aiAnalysis").innerHTML = "Fais une analyse pour recevoir ton coaching IA.";
}

async function creerProfil(user, pseudo) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      pseudo: pseudo || "Triathlète",
      premium: false,
      createdAt: serverTimestamp()
    });
  }
}

async function verifierPremium(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    isPremium = snap.exists() && snap.data().premium === true;
  } catch { isPremium = false; }
  window._triloIsPremium = isPremium;
  if (typeof window.rafraichirStats === "function") window.rafraichirStats();
}

async function afficherEtatAuth() {
  const userZone  = el("user-status");
  const authForm  = el("auth-form");
  const logoutBtn = el("logoutBtn");
  if (currentUser) {
    const badge = isPremium ? ' <span style="color:#ffd700;">⭐ PREMIUM</span>' : '';
    const userSnap2 = await getDoc(doc(db, "users", currentUser.uid));
    const pseudo = userSnap2.exists() ? (userSnap2.data().pseudo || "Triathlète") : "Triathlète";
    if (userZone)  userZone.innerHTML  = `👤 <strong>${pseudo}</strong>${badge}`;
    if (authForm)  authForm.style.display  = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
  } else {
    if (userZone)  userZone.innerHTML  = "";
    if (authForm)  authForm.style.display  = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await creerProfil(user);
    await verifierPremium(user);
    await chargerClassement();
    mettreAJourDashboard(); // Après vérification Premium
    afficherBadges();
  } else {
    isPremium = false;
    window._triloIsPremium = false;
    if (typeof window.rafraichirStats === "function") window.rafraichirStats();
    if (el("leaderboard"))        el("leaderboard").innerHTML        = "🔒 Connecte-toi pour accéder au classement.";
    if (el("comparison"))         el("comparison").innerHTML         = "🔒 Connecte-toi pour comparer tes performances.";
    if (el("advancedComparison")) el("advancedComparison").innerHTML = "🔒 Premium requis.";
  }
  afficherEtatAuth();
  mettreAJourNavbar();
  if (!user) {
    mettreAJourDashboard();
    afficherBadges();
  }
});

function mettreAJourNavbar() {
  const zone = document.getElementById("navbar-user");
  if (!zone) return;
  if (currentUser) {
    const badge = isPremium ? ' ⭐' : '';
    zone.innerHTML = `<span style="color:var(--accent);">👤 ${currentUser.email.split('@')[0]}${badge}</span>`;
  } else {
    zone.innerHTML = `<a href="#login" style="color:var(--text-muted);text-decoration:none;font-size:13px;" onclick="document.querySelector('.login-card').scrollIntoView({behavior:'smooth'});return false;">Se connecter</a>`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  el("analyzeBtn")?.addEventListener("click", analyser);
  el("resetBtn")?.addEventListener("click", reinitialiser);

  // Afficher le champ pseudo seulement quand on clique sur "Créer un compte"
  el("signupBtn")?.addEventListener("click", async () => {
    const pseudoZone = el("pseudo-zone");
    const pseudo     = el("pseudo")?.value?.trim();

    // Si le champ pseudo n est pas encore visible, l afficher
    if (pseudoZone && pseudoZone.style.display === "none") {
      pseudoZone.style.display = "block";
      el("pseudo")?.focus();
      return;
    }

    const email    = el("email")?.value?.trim();
    const password = el("password")?.value?.trim();
    if (!email || !password) return alert("Email et mot de passe requis.");
    if (!pseudo) return alert("Choisis un pseudo !");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await creerProfil(cred.user, pseudo);
    } catch(e) { alert("Erreur inscription : " + e.message); }
  });

  el("loginBtn")?.addEventListener("click", async () => {
    const email    = el("email")?.value?.trim();
    const password = el("password")?.value?.trim();
    if (!email || !password) return alert("Email et mot de passe requis.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(e) { alert("Erreur connexion : " + e.message); }
  });

  el("logoutBtn")?.addEventListener("click", async () => {
    await signOut(auth);
  });

  document.querySelector(".premium-btn")?.addEventListener("click", () => {
    if (!currentUser) return alert("🔒 Connecte-toi d'abord.");
    if (isPremium)    return alert("✅ Tu es déjà Premium !");
    alert("💳 Intègre Stripe ici pour activer le Premium.");
  });

  // Mot de passe oublié
  el("forgotBtn")?.addEventListener("click", async () => {
    const email = el("email")?.value?.trim();
    if (!email) {
      alert("Entre ton email d'abord puis clique sur Mot de passe oublié.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      alert("✅ Email de réinitialisation envoyé à " + email + " ! Vérifie ta boîte mail.");
    } catch(e) {
      alert("❌ Erreur : " + e.message);
    }
  });

  // Bouton retour en haut
  const scrollBtn = el("scrollTopBtn");
  if (scrollBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        scrollBtn.classList.add("visible");
      } else {
        scrollBtn.classList.remove("visible");
      }
    });
    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  mettreAJourDashboard();
  mettreAJourGraphique();
  afficherBadges();
});
