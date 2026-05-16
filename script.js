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
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "AIzaSyBTv3F1ukSvaoD340ABx6CLjjQ0pHBs7q8",
  authDomain: "trilo-88a88.firebaseapp.com",
  projectId: "trilo-88a88",
  storageBucket: "trilo-88a88.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
let labels = JSON.parse(localStorage.getItem("triloLabels")) || [];
let data = JSON.parse(localStorage.getItem("triloData")) || [];
let sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];

/* =========================
   HELPERS
========================= */

function el(id) {
  return document.getElementById(id);
}

function convertirTempsEnMinutes(temps) {
  if (!temps || typeof temps !== "string") return 0;
  const parts = temps.split(":");
  if (parts.length !== 2) return 0;
  const minutes = Number(parts[0]);
  const secondes = Number(parts[1]);
  if (isNaN(minutes) || isNaN(secondes)) return 0;
  return minutes + secondes / 60;
}

function randElement(liste) {
  if (!liste || liste.length === 0) return "";
  return liste[Math.floor(Math.random() * liste.length)];
}

function afficherMessage(texte, type = "info") {
  const zone = el("message-zone");
  if (!zone) return;
  zone.textContent = texte;
  zone.className = `message-zone message-${type}`;
  zone.style.display = "block";
  setTimeout(() => {
    zone.style.display = "none";
  }, 4000);
}

/* =========================
   CONSEILS SPORT
========================= */

const conseilsNatation = [
  "🏊 Travaille ta respiration bilatérale pour équilibrer ta nage.",
  "🏊 Améliore ta glisse en allongeant ton coup de bras.",
  "🏊 Concentre-toi sur la rotation des hanches pour plus de puissance.",
  "🏊 Pratique des exercices de kick pour renforcer tes jambes.",
  "🏊 Travaille ta sortie d'eau pour gagner du temps."
];

const conseilsVelo = [
  "🚴 Maintiens une cadence entre 80 et 100 rpm pour préserver tes jambes.",
  "🚴 Adopte une position aérodynamique pour réduire la résistance au vent.",
  "🚴 Hydrate-toi régulièrement, toutes les 15-20 minutes.",
  "🚴 Travaille les relances après les virages.",
  "🚴 Pense à bien manger sur le vélo pour la course à pied."
];

const conseilsCourse = [
  "🏃 Garde une foulée relâchée et économique.",
  "🏃 Cours avec une cadence élevée, environ 180 pas/min.",
  "🏃 Contrôle ta respiration dès le départ.",
  "🏃 Ne pars pas trop vite, conserve de l'énergie pour la fin.",
  "🏃 Pense à ta posture : buste droit, bras décontractés."
];

/* =========================
   BADGES
========================= */

const BADGES = [
  { id: "first_session", label: "🎯 Première séance", description: "Analyse ta première performance", condition: (sessions) => sessions.length >= 1 },
  { id: "swimmer", label: "🏊 Nageur", description: "Nage plus de 1000m", condition: (sessions) => sessions.some(s => s.swimDist >= 1000) },
  { id: "cyclist", label: "🚴 Cycliste", description: "Fais plus de 20km à vélo", condition: (sessions) => sessions.some(s => s.bikeDist >= 20) },
  { id: "runner", label: "🏃 Coureur", description: "Cours plus de 5km", condition: (sessions) => sessions.some(s => s.runDist >= 5) },
  { id: "triathlete", label: "🏅 Triathlète", description: "Complète les 3 disciplines en une séance", condition: (sessions) => sessions.some(s => s.swimDist > 0 && s.bikeDist > 0 && s.runDist > 0) },
  { id: "consistent", label: "🔥 Régulier", description: "5 séances analysées", condition: (sessions) => sessions.length >= 5 },
  { id: "beast", label: "💪 Bête de course", description: "Score global supérieur à 12", condition: (sessions) => sessions.some(s => s.globalScore >= 12) },
  { id: "elite", label: "🥇 Élite", description: "Score global supérieur à 15", condition: (sessions) => sessions.some(s => s.globalScore >= 15) },
  { id: "veteran", label: "🎖️ Vétéran", description: "10 séances analysées", condition: (sessions) => sessions.length >= 10 }
];

function calculerBadges() {
  const obtenus = BADGES.filter(b => b.condition(sessions));
  return obtenus;
}

function afficherBadges() {
  const zone = el("badges");
  if (!zone) return;

  const obtenus = calculerBadges();

  if (obtenus.length === 0) {
    zone.innerHTML = "<p>Aucun badge débloqué. Analyse une séance pour commencer !</p>";
    return;
  }

  zone.innerHTML = obtenus.map(b => `
    <div class="badge">
      <span class="badge-label">${b.label}</span>
      <span class="badge-desc">${b.description}</span>
    </div>
  `).join("");
}

/* =========================
   CALCUL DES SCORES
========================= */

function calculerScores() {
  const swimDist = Number(el("swimDist")?.value || 0);
  const swimTime = convertirTempsEnMinutes(el("swimTime")?.value || "");
  const bikeDist = Number(el("bikeDist")?.value || 0);
  const bikeTime = convertirTempsEnMinutes(el("bikeTime")?.value || "");
  const runDist = Number(el("runDist")?.value || 0);
  const runTime = convertirTempsEnMinutes(el("runTime")?.value || "");

  // Vitesses de référence
  const refSwim = 45;  // m/min pour un niveau correct
  const refBike = 22;  // km/h
  const refRun = 12;   // km/h

  let total = 0;
  let count = 0;
  let performances = [];

  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime; // m/min
    const score = Math.min((speed / refSwim) * 10, 20);
    total += score;
    count++;
    performances.push({ sport: "natation", score, speed, dist: swimDist, time: swimTime });
  }

  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60); // km/h
    const score = Math.min((speed / refBike) * 10, 20);
    total += score;
    count++;
    performances.push({ sport: "vélo", score, speed, dist: bikeDist, time: bikeTime });
  }

  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60); // km/h
    const score = Math.min((speed / refRun) * 10, 20);
    total += score;
    count++;
    performances.push({ sport: "course", score, speed, dist: runDist, time: runTime });
  }

  if (count === 0) return null;

  return {
    globalScore: total / count,
    performances,
    swimDist, swimTime, bikeDist, bikeTime, runDist, runTime
  };
}

/* =========================
   NIVEAU
========================= */

function obtenirNiveau(score) {
  if (score < 4) return { level: "Niveau 1 😐 Débutant", intro: "Tu commences à peine, continue !" };
  if (score < 7) return { level: "Niveau 2 👍 En progrès", intro: "Bonne progression, tu t'améliores." };
  if (score < 10) return { level: "Niveau 3 🔥 Bon niveau", intro: "Très solide, tu es dans une bonne dynamique." };
  if (score < 13) return { level: "Niveau 4 💪 Très bon", intro: "Excellent rythme, tu domines." };
  if (score < 16) return { level: "Niveau 5 🚀 Expert", intro: "Performance de haut niveau !" };
  return { level: "Niveau 6 🏆 Élite", intro: "Tu es dans l'élite mondiale du triathlon !" };
}

/* =========================
   COACH IA (LOCAL)
========================= */

function genererCoachIA(result) {
  const { globalScore, performances } = result;
  const { level, intro } = obtenirNiveau(globalScore);

  let conseils = [];
  performances.forEach(p => {
    if (p.sport === "natation") conseils.push(randElement(conseilsNatation));
    if (p.sport === "vélo") conseils.push(randElement(conseilsVelo));
    if (p.sport === "course") conseils.push(randElement(conseilsCourse));
  });

  const sportsDominants = [...performances].sort((a, b) => b.score - a.score);
  const meilleurSport = sportsDominants[0]?.sport || "";
  const pointFaible = sportsDominants[sportsDominants.length - 1]?.sport || "";

  let analyse = `<strong>${level}</strong><br>${intro}<br><br>`;
  analyse += `<strong>Score global : ${globalScore.toFixed(2)} / 20</strong><br><br>`;

  if (meilleurSport) {
    analyse += `💚 Ton point fort : <strong>${meilleurSport}</strong><br>`;
  }
  if (pointFaible && pointFaible !== meilleurSport) {
    analyse += `⚠️ À travailler : <strong>${pointFaible}</strong><br><br>`;
  }

  analyse += `<br><strong>Conseils personnalisés :</strong><br>`;
  conseils.forEach(c => { analyse += `${c}<br>`; });

  return analyse;
}

/* =========================
   DASHBOARD
========================= */

function mettreAJourDashboard() {
  if (sessions.length === 0) {
    if (el("best-score")) el("best-score").textContent = "0";
    if (el("avg-score")) el("avg-score").textContent = "0";
    if (el("nb-sessions")) el("nb-sessions").textContent = "0";
    if (el("sport-dominant")) el("sport-dominant").textContent = "Aucun";
    return;
  }

  const scores = sessions.map(s => s.globalScore);
  const best = Math.max(...scores).toFixed(2);
  const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);

  if (el("best-score")) el("best-score").textContent = best;
  if (el("avg-score")) el("avg-score").textContent = avg;
  if (el("nb-sessions")) el("nb-sessions").textContent = sessions.length;

  // Sport dominant : celui avec le plus de sessions
  const counts = { natation: 0, vélo: 0, course: 0 };
  sessions.forEach(s => {
    s.performances?.forEach(p => {
      if (counts[p.sport] !== undefined) counts[p.sport]++;
    });
  });
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (el("sport-dominant")) el("sport-dominant").textContent = dominant && dominant[1] > 0 ? dominant[0] : "Aucun";

  // Graphique
  mettreAJourGraphique();
}

function mettreAJourGraphique() {
  const canvas = el("myChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const derniersSessions = sessions.slice(-10);
  const labelsChart = derniersSessions.map((_, i) => `Séance ${i + 1}`);
  const dataChart = derniersSessions.map(s => parseFloat(s.globalScore.toFixed(2)));

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labelsChart,
      datasets: [{
        label: "Score global",
        data: dataChart,
        borderColor: "#00d4ff",
        backgroundColor: "rgba(0, 212, 255, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#00d4ff",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: "#fff" } }
      },
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
    const q = query(collection(db, "scores"), orderBy("globalScore", "desc"), limit(10));
    const snap = await getDocs(q);

    if (snap.empty) {
      zone.innerHTML = "Aucun score enregistré pour le moment.";
      return;
    }

    let html = "<ol class='leaderboard-list'>";
    let rank = 1;
    snap.forEach(docSnap => {
      const d = docSnap.data();
      const isMe = d.uid === currentUser.uid;
      html += `<li class="${isMe ? 'me' : ''}">
        ${rank}. <strong>${d.pseudo || d.email || "Anonyme"}</strong> — ${parseFloat(d.globalScore).toFixed(2)} pts
      </li>`;
      rank++;
    });
    html += "</ol>";
    zone.innerHTML = html;
  } catch (e) {
    console.error("Erreur classement:", e);
    zone.innerHTML = "Impossible de charger le classement.";
  }
}

/* =========================
   COMPARAISON UTILISATEURS
========================= */

async function chargerComparaison(monScore) {
  const zone = el("comparison");
  if (!zone) return;

  if (!currentUser) {
    zone.innerHTML = "🔒 Connecte-toi pour comparer tes performances.";
    return;
  }

  try {
    const q = query(collection(db, "scores"), orderBy("globalScore", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      zone.innerHTML = "Pas assez de données pour comparer.";
      return;
    }

    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));
    const mieux = scores.filter(s => s > monScore).length;
    const total = scores.length;
    const percentile = Math.round(((total - mieux) / total) * 100);

    zone.innerHTML = `
      <p>Tu es meilleur que <strong>${percentile}%</strong> des utilisateurs Trilo.</p>
      <p>Score moyen mondial : <strong>${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)}</strong></p>
      <p>Ton score : <strong>${monScore.toFixed(2)}</strong></p>
    `;
  } catch (e) {
    console.error("Erreur comparaison:", e);
    zone.innerHTML = "Impossible de charger la comparaison.";
  }
}

/* =========================
   COMPARAISON AVANCÉE IA
========================= */

async function chargerComparaisonAvanceeIA(monScore) {
  const zone = el("advanced-comparison");
  if (!zone) return;

  if (!currentUser) {
    zone.innerHTML = "🔒 Premium requis pour débloquer l'analyse avancée.";
    return;
  }

  if (!isPremium) {
    zone.innerHTML = "🔒 Premium requis pour débloquer l'analyse avancée.";
    return;
  }

  zone.innerHTML = "🧠 Analyse IA en cours...";

  try {
    const q = query(collection(db, "scores"), orderBy("globalScore", "desc"));
    const snap = await getDocs(q);
    const scores = [];
    snap.forEach(d => scores.push(d.data().globalScore));
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const diff = monScore - avg;

    let analyse = "";
    if (diff > 3) {
      analyse = `🚀 Tu es largement au-dessus de la moyenne mondiale (${avg.toFixed(2)}). Tu fais partie des meilleurs triathlètes sur Trilo. Continue à te challenger !`;
    } else if (diff > 0) {
      analyse = `👍 Tu es au-dessus de la moyenne mondiale (${avg.toFixed(2)}). Tu progresses bien, continue dans cette direction.`;
    } else if (diff > -3) {
      analyse = `💪 Tu es légèrement en dessous de la moyenne (${avg.toFixed(2)}). Avec de l'entraînement ciblé, tu peux vite progresser.`;
    } else {
      analyse = `🔥 Tu es en dessous de la moyenne (${avg.toFixed(2)}), mais c'est le point de départ de tous les champions. Fixe-toi des objectifs précis !`;
    }

    zone.innerHTML = `<p>${analyse}</p>`;
  } catch (e) {
    zone.innerHTML = "Erreur lors de l'analyse avancée.";
  }
}

/* =========================
   ENREGISTRER EN BDD
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
    console.error("Erreur enregistrement score:", e);
  }
}

/* =========================
   ANALYSER
========================= */

async function analyser() {
  const result = calculerScores();

  if (!result) {
    afficherMessage("⚠️ Remplis au moins une discipline avec distance ET temps.", "error");
    return;
  }

  // Résultat principal
  const zoneScore = el("score-result");
  if (zoneScore) {
    zoneScore.innerHTML = `
      <h3>${obtenirNiveau(result.globalScore).level}</h3>
      <p>Score global : <strong>${result.globalScore.toFixed(2)} / 20</strong></p>
      ${result.performances.map(p => `
        <p>${p.sport.charAt(0).toUpperCase() + p.sport.slice(1)} : 
          vitesse ${p.sport === "natation" ? p.speed.toFixed(1) + " m/min" : p.speed.toFixed(1) + " km/h"}, 
          score ${p.score.toFixed(2)}/20
        </p>
      `).join("")}
    `;
  }

  // Coach IA
  const zoneCoach = el("coach-ia");
  if (zoneCoach) {
    if (currentUser) {
      zoneCoach.innerHTML = genererCoachIA(result);
    } else {
      zoneCoach.innerHTML = "🔒 Connecte-toi pour accéder au Coach IA.";
    }
  }

  // Sauvegarder en local
  const sessionData = {
    globalScore: result.globalScore,
    performances: result.performances,
    swimDist: result.swimDist,
    bikeDist: result.bikeDist,
    runDist: result.runDist,
    date: new Date().toISOString()
  };
  sessions.push(sessionData);
  localStorage.setItem("triloSessions", JSON.stringify(sessions));

  // Dashboard + badges
  mettreAJourDashboard();
  afficherBadges();

  // Firebase
  if (currentUser) {
    await enregistrerScore(result);
    await chargerClassement();
    await chargerComparaison(result.globalScore);
    await chargerComparaisonAvanceeIA(result.globalScore);
  }

  afficherMessage("✅ Analyse terminée !", "success");
}

/* =========================
   RÉINITIALISER
========================= */

function reinitialiser() {
  ["swimDist", "swimTime", "bikeDist", "bikeTime", "runDist", "runTime"].forEach(id => {
    if (el(id)) el(id).value = "";
  });

  const zoneScore = el("score-result");
  if (zoneScore) zoneScore.innerHTML = "Entre tes performances puis clique sur analyser.";

  const zoneCoach = el("coach-ia");
  if (zoneCoach) zoneCoach.innerHTML = "Fais une analyse pour recevoir ton coaching IA.";

  afficherMessage("🔄 Formulaire réinitialisé.", "info");
}

/* =========================
   AUTH
========================= */

async function creerProfilUtilisateur(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      uid: user.uid,
      premium: false,
      createdAt: serverTimestamp()
    });
  }
}

async function verifierPremium(user) {
  const userRef = doc(db, "users", user.uid);
  try {
    const snap = await getDoc(userRef);
    isPremium = snap.exists() && snap.data().premium === true;
  } catch (e) {
    isPremium = false;
  }
  afficherEtatPremium();
}

function afficherEtatPremium() {
  const btnPremium = el("btn-premium");
  if (btnPremium) {
    btnPremium.textContent = isPremium ? "✅ Premium actif" : "🚀 Passer à Premium";
    btnPremium.disabled = isPremium;
  }
}

async function inscription() {
  const email = el("auth-email")?.value?.trim();
  const password = el("auth-password")?.value?.trim();
  if (!email || !password) {
    afficherMessage("⚠️ Email et mot de passe requis.", "error");
    return;
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await creerProfilUtilisateur(cred.user);
    afficherMessage("✅ Compte créé avec succès !", "success");
  } catch (e) {
    afficherMessage("❌ Erreur inscription : " + e.message, "error");
  }
}

async function connexion() {
  const email = el("auth-email")?.value?.trim();
  const password = el("auth-password")?.value?.trim();
  if (!email || !password) {
    afficherMessage("⚠️ Email et mot de passe requis.", "error");
    return;
  }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    afficherMessage("✅ Connexion réussie !", "success");
  } catch (e) {
    afficherMessage("❌ Erreur connexion : " + e.message, "error");
  }
}

async function deconnexion() {
  try {
    await signOut(auth);
    currentUser = null;
    isPremium = false;
    afficherEtatPremium();
    afficherMessage("👋 Déconnecté.", "info");
    afficherEtatUtilisateur();
  } catch (e) {
    afficherMessage("❌ Erreur déconnexion : " + e.message, "error");
  }
}

function afficherEtatUtilisateur() {
  const zoneUser = el("user-status");
  const btnSignout = el("btn-signout");
  const authForm = el("auth-form");

  if (currentUser) {
    if (zoneUser) zoneUser.textContent = `👤 Connecté : ${currentUser.email}`;
    if (btnSignout) btnSignout.style.display = "inline-block";
    if (authForm) authForm.style.display = "none";
  } else {
    if (zoneUser) zoneUser.textContent = "";
    if (btnSignout) btnSignout.style.display = "none";
    if (authForm) authForm.style.display = "block";
  }
}

/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  if (user) {
    await creerProfilUtilisateur(user);
    await verifierPremium(user);
    await chargerClassement();
  } else {
    isPremium = false;
    afficherEtatPremium();
  }
  afficherEtatUtilisateur();
  mettreAJourDashboard();
  afficherBadges();
});

/* =========================
   INIT BOUTONS
========================= */


 document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Trilo JS chargé");

  const analyzeBtn = document.getElementById("analyzeBtn");
  const resetBtn = document.getElementById("resetBtn");
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");

  if (analyzeBtn) {
    analyzeBtn.onclick = function () {
      console.log("✅ Bouton analyser cliqué");
      analyser();
    };
  } else {
    console.error("❌ analyzeBtn introuvable");
  }

  if (resetBtn) resetBtn.onclick = resetData;
  if (signupBtn) signupBtn.onclick = signup;
  if (loginBtn) loginBtn.onclick = login;

  drawChart();
  afficherEtatPremium();
});

  // Bouton réinitialiser
  const btnReset = el("btn-reset");
  if (btnReset) btnReset.addEventListener("click", reinitialiser);

  // Bouton inscription
  const btnInscription = el("btn-inscription");
  if (btnInscription) btnInscription.addEventListener("click", inscription);

  // Bouton connexion
  const btnConnexion = el("btn-connexion");
  if (btnConnexion) btnConnexion.addEventListener("click", connexion);

  // Bouton déconnexion
  const btnSignout = el("btn-signout");
  if (btnSignout) btnSignout.addEventListener("click", deconnexion);

  // Bouton premium (placeholder)
  const btnPremium = el("btn-premium");
  if (btnPremium) {
    btnPremium.addEventListener("click", () => {
      if (!currentUser) {
        afficherMessage("🔒 Connecte-toi d'abord pour passer en Premium.", "error");
        return;
      }
      if (isPremium) {
        afficherMessage("✅ Tu es déjà Premium !", "info");
        return;
      }
      // Ici tu peux intégrer Stripe ou autre
      afficherMessage("💳 Paiement Premium à intégrer (Stripe, etc.)", "info");
    });
  }

  // Init dashboard + badges depuis localStorage
  mettreAJourDashboard();
  afficherBadges();
});
