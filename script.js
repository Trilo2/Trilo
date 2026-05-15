import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

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
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

/* =========================
   FIREBASE
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
   VARIABLES
========================= */

let currentUser = null;

let isPremium = false;

let chart = null;

let labels =
  JSON.parse(localStorage.getItem("triloLabels")) || [];

let data =
  JSON.parse(localStorage.getItem("triloData")) || [];

/* =========================
   HELPERS
========================= */

function el(id) {
  return document.getElementById(id);
}

function convertirTempsEnMinutes(temps) {

  if (!temps) return 0;

  temps = temps.trim().replace("'", ":");

  if (!temps.includes(":")) {
    return Number(temps);
  }

  const parts = temps.split(":");

  const minutes = Number(parts[0]);

  const secondes = Number(parts[1]);

  return minutes + secondes / 60;
}

/* =========================
   AUTH
========================= */

async function creerProfilUtilisateur(user) {

  const userRef =
    doc(db, "users", user.uid);

  const snap =
    await getDoc(userRef);

  if (!snap.exists()) {

    await setDoc(userRef, {
      email: user.email,
      premium: false,
      createdAt: serverTimestamp()
    });
  }
}

async function verifierPremium(user) {

  if (!user) {
    isPremium = false;
    return;
  }

  const userRef =
    doc(db, "users", user.uid);

  const snap =
    await getDoc(userRef);

  isPremium =
    snap.exists() &&
    snap.data().premium === true;
}

async function signup() {

  const email =
    el("email").value;

  const password =
    el("password").value;

  if (!email || !password) {
    alert("Entre un email et un mot de passe.");
    return;
  }

  try {

    const result =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    await creerProfilUtilisateur(result.user);

    alert("Compte créé ✅");

  } catch (error) {

    alert(error.message);
  }
}

async function login() {

  const email =
    el("email").value;

  const password =
    el("password").value;

  if (!email || !password) {
    alert("Entre ton email et ton mot de passe.");
    return;
  }

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Connexion réussie ✅");

  } catch (error) {

    alert(error.message);
  }
}

onAuthStateChanged(auth, async (user) => {

  currentUser = user;

  if (user) {

    await verifierPremium(user);

    chargerClassement();

  } else {

    isPremium = false;
  }
});

/* =========================
   SCORE
========================= */

function calculerScores() {

  const swimDist =
    Number(el("swimDist").value);

  const swimTime =
    convertirTempsEnMinutes(
      el("swimTime").value
    );

  const bikeDist =
    Number(el("bikeDist").value);

  const bikeTime =
    convertirTempsEnMinutes(
      el("bikeTime").value
    );

  const runDist =
    Number(el("runDist").value);

  const runTime =
    convertirTempsEnMinutes(
      el("runTime").value
    );

  const refSwim = 45;
  const refBike = 22;
  const refRun = 12;

  let total = 0;

  let count = 0;

  let performances = [];

  if (swimDist > 0 && swimTime > 0) {

    const speed =
      swimDist / swimTime;

    const score =
      (speed / refSwim) * 10;

    total += score;

    count++;

    performances.push({
      sport: "natation",
      score
    });
  }

  if (bikeDist > 0 && bikeTime > 0) {

    const speed =
      bikeDist / (bikeTime / 60);

    const score =
      (speed / refBike) * 10;

    total += score;

    count++;

    performances.push({
      sport: "vélo",
      score
    });
  }

  if (runDist > 0 && runTime > 0) {

    const speed =
      runDist / (runTime / 60);

    const score =
      (speed / refRun) * 10;

    total += score;

    count++;

    performances.push({
      sport: "course",
      score
    });
  }

  if (count === 0) {
    return null;
  }

  return {
    globalScore: total / count,
    performances
  };
}

/* =========================
   BADGES
========================= */

function genererBadges(globalScore) {

  let badges = [];

  if (globalScore >= 8) {
    badges.push("🔥 Bon départ");
  }

  if (globalScore >= 10) {
    badges.push("💪 Score 10+");
  }

  if (globalScore >= 15) {
    badges.push("🏆 Elite Trilo");
  }

  if (badges.length === 0) {
    badges.push("🌱 Premier pas");
  }

  return badges;
}

function afficherBadges(badges) {

  const badgesList =
    el("badgesList");

  if (!badgesList) return;

  badgesList.innerHTML = "";

  badges.forEach((badge) => {

    const div =
      document.createElement("div");

    div.className =
      "badge-item";

    div.innerText =
      badge;

    badgesList.appendChild(div);
  });
}

/* =========================
   IA
========================= */

function genererAnalyseIA(score) {

  if (!isPremium) {
    return "🔒 Coach IA réservé au Premium.";
  }

  if (score < 6) {
    return "🤖 Tu construis encore ta base.";
  }

  if (score < 10) {
    return "🤖 Tu progresses bien.";
  }

  return "🤖 Excellent niveau détecté.";
}

/* =========================
   DASHBOARD
========================= */

function mettreAJourDashboard(
  globalScore,
  performances
) {

  const sessions =
    data.length;

  const bestScore =
    Math.max(...data);

  const average =
    data.reduce((a, b) => a + b, 0)
    / data.length;

  let dominantSport =
    "Aucun";

  if (performances.length > 0) {

    const best =
      [...performances]
      .sort((a, b) => b.score - a.score)[0];

    dominantSport =
      best.sport;
  }

  if (el("bestScore")) {
    el("bestScore").innerText =
      bestScore.toFixed(2);
  }

  if (el("averageScore")) {
    el("averageScore").innerText =
      average.toFixed(2);
  }

  if (el("sessionCount")) {
    el("sessionCount").innerText =
      sessions;
  }

  if (el("bestSport")) {
    el("bestSport").innerText =
      dominantSport;
  }
}

/* =========================
   FIRESTORE
========================= */

async function sauvegarderScoreCloud(
  score,
  performances
) {

  if (!currentUser) return;

  await addDoc(
    collection(db, "scores"),
    {
      uid: currentUser.uid,
      email: currentUser.email,
      score,
      performances,
      createdAt: serverTimestamp()
    }
  );
}

/* =========================
   CLASSEMENT
========================= */

async function chargerClassement() {

  const leaderboard =
    el("leaderboard");

  if (!leaderboard) return;

  if (!currentUser || !isPremium) {

    leaderboard.innerText =
      "🔒 Premium requis.";

    return;
  }

  try {

    const q =
      query(
        collection(db, "scores"),
        orderBy("score", "desc"),
        limit(10)
      );

    const snapshot =
      await getDocs(q);

    let text = "";

    let rank = 1;

    snapshot.forEach((docItem) => {

      const item =
        docItem.data();

      text +=
        rank +
        ". " +
        item.email +
        " — " +
        Number(item.score).toFixed(2) +
        "\n";

      rank++;
    });

    leaderboard.innerText =
      text;

  } catch (error) {

    leaderboard.innerText =
      "Erreur classement.";
  }
}

/* =========================
   COMPARAISON
========================= */

async function chargerComparaison(
  monScore
) {

  const comparison =
    el("comparison");

  if (!comparison) return;

  if (!currentUser || !isPremium) {

    comparison.innerText =
      "🔒 Premium requis.";

    return;
  }

  try {

    const snapshot =
      await getDocs(
        collection(db, "scores")
      );

    let scores = [];

    snapshot.forEach((docItem) => {

      const item =
        docItem.data();

      if (
        typeof item.score === "number"
      ) {
        scores.push(item.score);
      }
    });

    const bestScore =
      Math.max(...scores);

    const average =
      scores.reduce((a, b) => a + b, 0)
      / scores.length;

    const above =
      scores.filter(
        s => s > monScore
      ).length;

    const rank =
      above + 1;

    comparison.innerText =
      "Ton score : " +
      monScore.toFixed(2) +

      "\nMeilleur score : " +
      bestScore.toFixed(2) +

      "\nMoyenne : " +
      average.toFixed(2) +

      "\nRang : #" +
      rank;

  } catch (error) {

    comparison.innerText =
      "Erreur comparaison.";
  }
}

/* =========================
   GRAPH
========================= */

function drawChart() {

  const canvas =
    el("chart");

  if (!canvas) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(canvas, {

    type: "line",

    data: {

      labels,

      datasets: [{
        label: "Progression Trilo",
        data,
        borderWidth: 3,
        tension: 0.3
      }]
    },

    options: {
      responsive: true
    }
  });
}

/* =========================
   RESET
========================= */

function resetData() {

  const ok =
    confirm(
      "Supprimer l’historique ?"
    );

  if (!ok) return;

  labels = [];

  data = [];

  localStorage.removeItem(
    "triloLabels"
  );

  localStorage.removeItem(
    "triloData"
  );

  el("score").innerText =
    "Aucun score";

  el("message").innerText =
    "Historique supprimé.";

  drawChart();
}

/* =========================
   ANALYSE
========================= */

async function analyser() {

  const resultat =
    calculerScores();

  if (!resultat) {

    alert(
      "Entre au moins un sport."
    );

    return;
  }

  const globalScore =
    resultat.globalScore;

  const performances =
    resultat.performances;

  const today =
    new Date()
    .toLocaleDateString("fr-FR");

  labels.push(today);

  data.push(globalScore);

  localStorage.setItem(
    "triloLabels",
    JSON.stringify(labels)
  );

  localStorage.setItem(
    "triloData",
    JSON.stringify(data)
  );

  const badges =
    genererBadges(globalScore);

  afficherBadges(badges);

  mettreAJourDashboard(
    globalScore,
    performances
  );

  el("score").innerText =
    "Score : " +
    globalScore.toFixed(2);

  el("message").innerText =
    "Analyse terminée.";

  const aiBox =
    el("aiAnalysis");

  if (aiBox) {

    aiBox.innerText =
      genererAnalyseIA(globalScore);
  }

  await sauvegarderScoreCloud(
    globalScore,
    performances
  );

  if (isPremium) {

    await chargerClassement();

    await chargerComparaison(
      globalScore
    );
  }

  drawChart();
}

/* =========================
   EVENTS
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    el("signupBtn")
      .addEventListener(
        "click",
        signup
      );

    el("loginBtn")
      .addEventListener(
        "click",
        login
      );

    el("analyzeBtn")
      .addEventListener(
        "click",
        analyser
      );

    el("resetBtn")
      .addEventListener(
        "click",
        resetData
      );

    drawChart();
  }
);
