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
  storageBucket: "trilo-88a88.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
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
   HELPER
========================= */

function el(id) {
  return document.getElementById(id);
}

function convertirTempsEnMinutes(temps) {
  if (!temps || typeof temps !== "string") return 0;
  const parts = temps.trim().split(":");
  if (parts.length !== 2) return 0;
  const minutes = Number(parts[0]);
  const secondes = Number(parts[1]);
  if (isNaN(minutes) || isNaN(secondes)) return 0;
  return minutes + secondes / 60;
}

function randElement(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

/* =========================
   CONSEILS
========================= */

const conseilsNatation = [
  "🏊 Travaille ta respiration bilatérale pour équilibrer ta nage.",
  "🏊 Allonge ton coup de bras pour améliorer ta glisse.",
  "🏊 Concentre-toi sur la rotation des hanches pour plus de puissance.",
  "🏊 Pratique des séries de kick pour renforcer tes jambes.",
  "🏊 Améliore ta sortie d'eau pour gagner du temps en transition."
];

const conseilsVelo = [
  "🚴 Maintiens une cadence entre 80 et 100 rpm pour préserver tes jambes.",
  "🚴 Adopte une position aérodynamique pour réduire la résistance.",
  "🚴 Hydrate-toi toutes les 15-20 minutes sur le vélo.",
  "🚴 Travaille les relances après les virages et les montées.",
  "🚴 Mange sur le vélo pour avoir de l'énergie pour la course."
];

const conseilsCourse = [
  "🏃 Garde une foulée relâchée et économique.",
  "🏃 Vise une cadence d'environ 180 pas par minute.",
  "🏃 Contrôle ta respiration dès le départ pour ne pas partir trop vite.",
  "🏃 Ne pars pas trop vite — gère ton effort sur la durée.",
  "🏃 Maintiens une bonne posture : buste droit, bras décontractés."
];

/* =========================
   BADGES
========================= */

const BADGES = [
  {
    id: "first_session",
    label: "🎯 Première séance",
    desc: "Analyse ta première performance",
    check: (s) => s.length >= 1
  },
  {
    id: "swimmer",
    label: "🏊 Nageur",
    desc: "Nage plus de 1000m",
    check: (s) => s.some(x => x.swimDist >= 1000)
  },
  {
    id: "cyclist",
    label: "🚴 Cycliste",
    desc: "Roule plus de 20km",
    check: (s) => s.some(x => x.bikeDist >= 20)
  },
  {
    id: "runner",
    label: "🏃 Coureur",
    desc: "Cours plus de 5km",
    check: (s) => s.some(x => x.runDist >= 5)
  },
  {
    id: "triathlete",
    label: "🏅 Triathlète",
    desc: "Complète les 3 disciplines en une séance",
    check: (s) => s.some(x => x.swimDist > 0 && x.bikeDist > 0 && x.runDist > 0)
  },
  {
    id: "consistent",
    label: "🔥 Régulier",
    desc: "5 séances analysées",
    check: (s) => s.length >= 5
  },
  {
    id: "beast",
    label: "💪 Bête de course",
    desc: "Score supérieur à 12",
    check: (s) => s.some(x => x.globalScore >= 12)
  },
  {
    id: "elite",
    label: "🥇 Élite",
    desc: "Score supérieur à 15",
    check: (s) => s.some(x => x.globalScore >= 15)
  },
  {
    id: "veteran",
    label: "🎖️ Vétéran",
    desc: "10 séances analysées",
    check: (s) => s.length >= 10
  }
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

  // Références pour un niveau "correct"
  const refSwim = 45;   // m/min
  const refBike = 22;   // km/h
  const refRun  = 12;   // km/h

  let total = 0;
  let count = 0;
  const performances = [];

  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    const score = Math.min((speed / refSwim) * 10, 20);
    total += score;
    count++;
    performances.push({ sport: "natation", score, speed, dist: swimDist, time: swimTime });
  }

  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = Math.min((speed / refBike) * 10, 20);
    total += score;
    count++;
    performances.push({ sport: "vélo", score, speed, dist: bikeDist, time: bikeTime });
  }

  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = Math.min((speed / refRun) * 10, 20);
    total += score;
    count++;
    performances.push({ sport: "course", score, speed, dist: runDist, time: runTime });
  }

  if (count === 0) return null;

  return {
    globalScore: total / count,
    performances,
    swimDist, swimTime,
    bikeDist, bikeTime,
    runDist,  runTime
  };
}

/* =========================
   NIVEAU
========================= */

function obtenirNiveau(score) {
  if (score < 4)  return { level: "Niveau 1 😐 Débutant",    intro: "Tu construis ta base, continue !" };
  if (score < 7)  return { level: "Niveau 2 👍 En progrès",  intro: "Bonne progression, tu t'améliores." };
  if (score < 10) return { level: "Niveau 3 🔥 Bon niveau",  intro: "Très solide, tu es dans une bonne dynamique." };
  if (score < 13) return { level: "Niveau 4 💪 Très bon",    intro: "Excellent rythme, tu domines." };
  if (score < 16) return { level: "Niveau 5 🚀 Expert",      intro: "Performance de haut niveau !" };
  return           { level: "Niveau 6 🏆 Élite",             intro: "Tu es dans l'élite du triathlon !" };
}

/* =========================
   COACH IA
========================= */

function genererCoachIA(result) {
  const { globalScore, performances } = result;
  const { level, intro } = obtenirNiveau(globalScore);

  const conseils = performances.map(p => {
    if (p.sport === "natation") return randElement(conseilsNatation);
    if (p.sport === "vélo")    return randElement(conseilsVelo);
    if (p.sport === "course")  return randElement(conseilsCourse);
    return "";
  });

  const sorted = [...performances].sort((a, b) => b.score - a.score);
  const best  = sorted[0];
  const worst = sorted[sorted.length - 1];

  let html = `<strong>${level}</strong><br>${intro}<br><br>`;
  html += `<strong>Score global : ${globalScore.toFixed(2)} / 20</strong><br><br>`;

  performances.forEach(p => {
    const vitesse = p.sport === "natation"
      ? `${p.speed.toFixed(1)} m/min`
      : `${p.speed.toFixed(1)} km/h`;
    html += `${p.sport.charAt(0).toUpperCase() + p.sport.slice(1)} → ${vitesse} — score : ${p.score.toFixed(2)}/20<br>`;
  });

  html += `<br>`;
  if (best)  html += `💚 Point fort : <strong>${best.sport}</strong><br>`;
  if (worst && worst.sport !== best?.sport) html += `⚠️ À travailler : <strong>${worst.sport}</strong><br>`;

  html += `<br><strong>Conseils personnalisés :</strong><br>`;
  conseils.forEach(c => { html += `${c}<br>`; });

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
  const best   = Math.max(...scores).toFixed(2);
  const avg    = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);

  if (el("bestScore"))    el("bestScore").textContent    = best;
  if (el("averageScore")) el("averageScore").textContent = avg;
  if (el("sessionCount")) el("sessionCount").textContent = sessions.length;

  // Sport dominant
  const counts = { natation: 0, "vélo": 0, course: 0 };
  sessions.forEach(s => {
    s.performances?.forEach(p => {
      if (counts[p.sport] !== undefined) counts[p.sport]++;
    });
  });
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (el("bestSport")) {
    el("bestSport").textContent = (dominant && dominant[1] > 0) ? dominant[0] : "Aucun";
  }

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
  const labelsChart = slice.map((_, i) => `Séance ${sessions.length - slice.length + i + 1}`);
  const dataChart   = slice.map(s => parseFloat(s.globalScore.toFixed(2)));

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

  if (!currentUser) {
    zone.innerHTML = "🔒 Connecte-toi pour accéder au classement.";
    return;
  }

  try {
    const q    = query(collection(db, "scores"), orderBy("globalScore", "desc"), limit(10));
    const snap = await getDocs(q);

    if (snap.empty) {
      zone.innerHTML = "Aucun score enregistré pour le moment.";
      return;
    }

    let html = "<ol class='leaderboard-list'>";
    let rank = 1;
    snap.forEach(d => {
      const data = d.data();
      const isMe = data.uid === currentUser.uid;
      html += `<li class="${isMe ? "me" : ""}">
        ${rank}. <strong>${data.pseudo || data.email || "Anonyme"}</strong>
        — ${parseFloat(data.globalScore).toFixed(2)} pts
      </li>`;
      rank++;
    });
    html += "</ol>";
    zone.innerHTML = html;
  } catch (e) {
    console.error("Erreur classement :", e);
    zone.innerHTML = "Impossible de charger le classement.";
  }
}

/* =========================
   COMPARAISON
========================= */

async function chargerComparaison(monScore) {
  const zone = el("comparison");
  if (!zone) return;

  if (!currentUser) {
    zone.innerHTML = "🔒 Connecte-toi pour comparer tes performances.";
    return;
  }

  try {
    const q    = query(collection(db, "scores"), orderBy("globalScore", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      zone.innerHTML = "Pas assez de données pour comparer.";
      return;
    }

    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));

    const mieux      = scores.filter(s => s > monScore).length;
    const total      = scores.length;
    const percentile = Math.round(((total - mieux) / total) * 100);
    const moyenne    = (scores.reduce((a, b) => a + b, 0) / total).toFixed(2);

    zone.innerHTML = `
      <p>Tu es meilleur que <strong>${percentile}%</strong> des utilisateurs Trilo.</p>
      <p>Score moyen mondial : <strong>${moyenne}</strong></p>
      <p>Ton score : <strong>${monScore.toFixed(2)}</strong></p>
    `;
  } catch (e) {
    console.error("Erreur comparaison :", e);
    zone.innerHTML = "Impossible de charger la comparaison.";
  }
}

/* =========================
   COMPARAISON AVANCÉE IA
========================= */

async function chargerComparaisonAvancee(monScore) {
  const zone = el("advancedComparison");
  if (!zone) return;

  if (!currentUser) {
    zone.innerHTML = "🔒 Connecte-toi pour accéder à l'analyse avancée.";
    return;
  }

  if (!isPremium) {
    zone.innerHTML = "🔒 Premium requis pour débloquer l'analyse avancée.";
    return;
  }

  zone.innerHTML = "🧠 Analyse IA en cours...";

  try {
    const q    = query(collection(db, "scores"), orderBy("globalScore", "desc"));
    const snap = await getDocs(q);
    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));

    const avg  = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const diff = monScore - avg;

    let texte = "";
    if (diff > 3)       texte = `🚀 Tu es largement au-dessus de la moyenne (${avg.toFixed(2)}). Tu fais partie des meilleurs sur Trilo !`;
    else if (diff > 0)  texte = `👍 Tu es au-dessus de la moyenne (${avg.toFixed(2)}). Continue dans cette direction.`;
    else if (diff > -3) texte = `💪 Légèrement en dessous de la moyenne (${avg.toFixed(2)}). Un entraînement ciblé et tu passes devant.`;
    else                texte = `🔥 En dessous de la moyenne (${avg.toFixed(2)}), mais c'est le point de départ de tous les champions !`;

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
      uid:         currentUser.uid,
      email:       currentUser.email,
      globalScore: result.globalScore,
      performances: result.performances,
      timestamp:   serverTimestamp()
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
    el("message").textContent = "Remplis au moins une discipline avec distance ET temps (format MM:SS).";
    return;
  }

  const { globalScore, performances } = result;
  const { level } = obtenirNiveau(globalScore);

  // Résultat principal
  el("score").textContent = level;
  el("message").innerHTML = `Score global : <strong>${globalScore.toFixed(2)} / 20</strong>`;

  // Coach IA
  const zoneCoach = el("aiAnalysis");
  if (zoneCoach) {
    if (currentUser) {
      zoneCoach.innerHTML = genererCoachIA(result);
    } else {
      zoneCoach.innerHTML = "🔒 Connecte-toi pour accéder au Coach IA.";
    }
  }

  // Sauvegarder en local
  sessions.push({
    globalScore,
    performances,
    swimDist: result.swimDist,
    bikeDist: result.bikeDist,
    runDist:  result.runDist,
    date:     new Date().toISOString()
  });
  localStorage.setItem("triloSessions", JSON.stringify(sessions));

  // Dashboard + badges
  mettreAJourDashboard();
  afficherBadges();

  // Firebase
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
    await setDoc(ref, {
      email:     user.email,
      uid:       user.uid,
      premium:   false,
      createdAt: serverTimestamp()
    });
  }
}

async function verifierPremium(user) {
  const ref  = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(ref);
    isPremium  = snap.exists() && snap.data().premium === true;
  } catch {
    isPremium = false;
  }
}

function afficherEtatAuth() {
  const loginCard = document.querySelector(".login-card");
  if (!loginCard) return;

  if (currentUser) {
    loginCard.innerHTML = `
      <p style="color:#00d4ff;font-weight:bold;">👤 ${currentUser.email}</p>
      <button id="logoutBtn" type="button">Se déconnecter</button>
    `;
    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
      await signOut(auth);
    });
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
    document.getElementById("signupBtn")?.addEventListener("click", async () => {
      const email    = el("email")?.value?.trim();
      const password = el("password")?.value?.trim();
      if (!email || !password) return alert("Email et mot de passe requis.");
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await creerProfil(cred.user);
      } catch (e) {
        alert("Erreur inscription : " + e.message);
      }
    });

    document.getElementById("loginBtn")?.addEventListener("click", async () => {
      const email    = el("email")?.value?.trim();
      const password = el("password")?.value?.trim();
      if (!email || !password) return alert("Email et mot de passe requis.");
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (e) {
        alert("Erreur connexion : " + e.message);
      }
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
    const leaderboard = el("leaderboard");
    if (leaderboard) leaderboard.innerHTML = "🔒 Connecte-toi pour accéder au classement.";
    const comparison = el("comparison");
    if (comparison) comparison.innerHTML = "🔒 Connecte-toi pour comparer tes performances.";
    const adv = el("advancedComparison");
    if (adv) adv.innerHTML = "🔒 Premium requis pour débloquer l'analyse avancée.";
  }

  afficherEtatAuth();
  mettreAJourDashboard();
  afficherBadges();
});

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", () => {
  // Analyser
  el("analyzeBtn")?.addEventListener("click", analyser);

  // Réinitialiser
  el("resetBtn")?.addEventListener("click", reinitialiser);

  // Premium (placeholder)
  document.querySelector(".premium-btn")?.addEventListener("click", () => {
    if (!currentUser) return alert("🔒 Connecte-toi d'abord.");
    if (isPremium)    return alert("✅ Tu es déjà Premium !");
    alert("💳 Intègre Stripe ici pour activer le Premium.");
  });

  // Init
  mettreAJourDashboard();
  afficherBadges();
});
