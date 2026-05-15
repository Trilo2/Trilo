import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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
   GLOBAL STATE
========================= */

let labels = JSON.parse(localStorage.getItem("triloLabels")) || [];
let data = JSON.parse(localStorage.getItem("triloData")) || [];

let chart = null;
let currentUser = null;

/* =========================
   HELPERS
========================= */

function getElement(id) {
  return document.getElementById(id);
}

function getNumberValue(id) {
  const value = Number(getElement(id).value);
  return isNaN(value) ? 0 : value;
}

function convertirTempsEnMinutes(temps) {
  if (!temps) return 0;

  temps = temps.trim().replace("'", ":");

  if (!temps.includes(":")) {
    const simple = Number(temps);
    return isNaN(simple) ? 0 : simple;
  }

  const parties = temps.split(":");

  if (parties.length !== 2) return 0;

  const minutes = Number(parties[0]);
  const secondes = Number(parties[1]);

  if (isNaN(minutes) || isNaN(secondes)) return 0;
  if (secondes < 0 || secondes >= 60) return 0;

  return minutes + secondes / 60;
}

function choisirConseilAleatoire(liste) {
  const index = Math.floor(Math.random() * liste.length);
  return liste[index];
}

function sauvegarderLocal() {
  localStorage.setItem("triloLabels", JSON.stringify(labels));
  localStorage.setItem("triloData", JSON.stringify(data));
}

function afficherTexte(id, texte) {
  const element = getElement(id);
  if (element) {
    element.innerText = texte;
  }
}

/* =========================
   CONSEILS
========================= */

const conseilsNatation = [
  "🏊 Conseil : travaille ta respiration bilatérale.",
  "🏊 Conseil : améliore ta technique de glisse.",
  "🏊 Conseil : garde une nage régulière même quand tu fatigues.",
  "🏊 Conseil : travaille des séries longues pour améliorer ton endurance.",
  "🏊 Conseil : concentre-toi sur la position de ton corps dans l’eau.",
  "🏊 Conseil : évite de partir trop vite sur les premières longueurs."
];

const conseilsVelo = [
  "🚴 Conseil : travaille ta cadence de pédalage.",
  "🚴 Conseil : garde une vitesse plus régulière.",
  "🚴 Conseil : évite les gros à-coups d’effort.",
  "🚴 Conseil : améliore ton endurance sur des sorties longues.",
  "🚴 Conseil : travaille ton positionnement pour être plus efficace.",
  "🚴 Conseil : essaie de maintenir un effort stable du début à la fin."
];

const conseilsCourse = [
  "🏃 Conseil : travaille ton endurance fondamentale.",
  "🏃 Conseil : stabilise ton allure au lieu de partir trop vite.",
  "🏃 Conseil : ajoute quelques séances fractionnées.",
  "🏃 Conseil : améliore ta récupération entre les séances.",
  "🏃 Conseil : garde une foulée régulière et relâchée.",
  "🏃 Conseil : augmente progressivement la distance, sans te cramer."
];

/* =========================
   SCORE LOGIC
========================= */

function calculerScores() {
  const swimDist = getNumberValue("swimDist");
  const bikeDist = getNumberValue("bikeDist");
  const runDist = getNumberValue("runDist");

  const swimTime = convertirTempsEnMinutes(getElement("swimTime").value);
  const bikeTime = convertirTempsEnMinutes(getElement("bikeTime").value);
  const runTime = convertirTempsEnMinutes(getElement("runTime").value);

  const refSwim = 45; // m/min
  const refBike = 22; // km/h
  const refRun = 12;  // km/h

  let total = 0;
  let count = 0;
  let performances = [];

  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    const score = (speed / refSwim) * 10;

    total += score;
    count++;

    performances.push({
      sport: "natation",
      score: score,
      speed: speed
    });
  }

  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = (speed / refBike) * 10;

    total += score;
    count++;

    performances.push({
      sport: "vélo",
      score: score,
      speed: speed
    });
  }

  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = (speed / refRun) * 10;

    total += score;
    count++;

    performances.push({
      sport: "course",
      score: score,
      speed: speed
    });
  }

  if (count === 0) {
    return null;
  }

  return {
    globalScore: total / count,
    performances: performances
  };
}

function obtenirNiveau(score) {
  if (score < 6) {
    return {
      level: "Niveau 1 😐 Débutant",
      intro: "Tu construis ta base."
    };
  }

  if (score < 9) {
    return {
      level: "Niveau 2 👍 En progrès",
      intro: "Bonne progression."
    };
  }

  if (score < 12) {
    return {
      level: "Niveau 3 🔥 Bon niveau",
      intro: "Très solide."
    };
  }

  if (score < 15) {
    return {
      level: "Niveau 4 💪 Très bon",
      intro: "Excellent rythme."
    };
  }

  return {
    level: "Niveau 5 🏅 Excellent",
    intro: "Niveau compétitif."
  };
}

function obtenirEvolution(score) {
  const previousData = JSON.parse(localStorage.getItem("triloData")) || [];

  let evolution = "🚀 Première séance enregistrée.";
  let objectif = "🎯 Enregistre une deuxième séance pour comparer.";
  let fatigue = "";

  if (previousData.length > 0) {
    const lastScore = previousData[previousData.length - 1];

    if (score > lastScore) {
      evolution = "📈 Tu progresses par rapport à ta dernière séance.";
    } else if (score < lastScore) {
      evolution = "⚠️ Tu baisses un peu. Vérifie ta récupération.";
    } else {
      evolution = "😐 Tu es stable.";
    }

    let target;

    if (score < 6) {
      target = score * 1.10;
    } else if (score < 10) {
      target = score * 1.07;
    } else {
      target = score * 1.03;
    }

    objectif = "🎯 Objectif prochaine séance : " + target.toFixed(2);
  }

  if (previousData.length >= 2) {
    const last = previousData[previousData.length - 1];
    const before = previousData[previousData.length - 2];

    if (score < last && last < before) {
      fatigue = "⚠️ Alerte fatigue : baisse sur plusieurs séances. Repose-toi.";
    }
  }

  return {
    evolution,
    objectif,
    fatigue
  };
}

function obtenirConseil(sportFaible) {
  if (sportFaible === "natation") {
    return choisirConseilAleatoire(conseilsNatation);
  }

  if (sportFaible === "vélo") {
    return choisirConseilAleatoire(conseilsVelo);
  }

  return choisirConseilAleatoire(conseilsCourse);
}

/* =========================
   FIRESTORE
========================= */

async function sauvegarderScoreCloud(score, performances) {
  if (!currentUser) return;

  try {
    await addDoc(collection(db, "scores"), {
      uid: currentUser.uid,
      email: currentUser.email,
      score: score,
      performances: performances,
      createdAt: serverTimestamp()
    });

    console.log("Score sauvegardé dans Firestore ✅");
  } catch (error) {
    console.error("Erreur Firestore :", error.message);
  }
}

async function chargerClassement() {
  try {
    const q = query(
      collection(db, "scores"),
      orderBy("score", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(q);

    let classement = "🏆 Top scores Trilo :\n";

    snapshot.forEach((doc) => {
      const item = doc.data();
      classement += "- " + item.email + " : " + Number(item.score).toFixed(2) + "\n";
    });

    console.log(classement);
  } catch (error) {
    console.log("Classement indisponible :", error.message);
  }
}

/* =========================
   MAIN ANALYSIS
========================= */

async function analyser() {
  const resultat = calculerScores();

  if (!resultat) {
    alert("Remplis au moins un sport correctement.");
    return;
  }

  const globalScore = resultat.globalScore;
  const performances = resultat.performances;

  performances.sort((a, b) => a.score - b.score);

  const sportFaible = performances[0];
  const sportFort = performances[performances.length - 1];

  const niveau = obtenirNiveau(globalScore);
  const progression = obtenirEvolution(globalScore);
  const conseil = obtenirConseil(sportFaible.sport);

  const today = new Date().toLocaleDateString("fr-FR");

  labels.push(today);
  data.push(globalScore);
  sauvegarderLocal();

  let stats = "📊 Scores par sport :\n";

  performances.forEach((p) => {
    stats += "- " + p.sport + " : " + p.score.toFixed(2) + "\n";
  });

  let cloudText = "";

  if (currentUser) {
    cloudText = "\n\n☁️ Score sauvegardé dans ton compte Trilo.";
    await sauvegarderScoreCloud(globalScore, performances);
  } else {
    cloudText = "\n\n🔐 Connecte-toi pour sauvegarder ta progression dans le cloud.";
  }

  afficherTexte("score", niveau.level);

  afficherTexte(
    "message",
    niveau.intro +
      "\n\nScore global : " + globalScore.toFixed(2) +
      "\n\n💪 Point fort : " + sportFort.sport +
      "\n⚠️ Point faible : " + sportFaible.sport +
      "\n\n" + stats +
      "\n" + progression.evolution +
      "\n\n" + progression.objectif +
      "\n\n" + progression.fatigue +
      "\n\n" + conseil +
      cloudText
  );

  drawChart();
  chargerClassement();
}

/* =========================
   CHART
========================= */

function drawChart() {
  const canvas = getElement("chart");

  if (!canvas) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Progression Trilo",
          data: data,
          borderWidth: 3,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/* =========================
   RESET
========================= */

function resetData() {
  const ok = confirm("Supprimer tout l'historique Trilo ?");

  if (!ok) return;

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  afficherTexte("score", "Aucun score");
  afficherTexte("message", "Historique supprimé.");

  drawChart();
}

/* =========================
   AUTH
========================= */

async function signup() {
  const email = getElement("email").value;
  const password = getElement("password").value;

  if (!email || !password) {
    alert("Entre un email et un mot de passe.");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Compte créé ✅");
  } catch (error) {
    alert("Erreur : " + error.message);
  }
}

async function login() {
  const email = getElement("email").value;
  const password = getElement("password").value;

  if (!email || !password) {
    alert("Entre ton email et ton mot de passe.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Connexion réussie ✅");
  } catch (error) {
    alert("Erreur : " + error.message);
  }
}

async function logout() {
  try {
    await signOut(auth);
    alert("Déconnexion réussie.");
  } catch (error) {
    alert("Erreur : " + error.message);
  }
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    console.log("Connecté :", user.email);
  } else {
    console.log("Non connecté");
  }
});

/* =========================
   PREMIUM
========================= */

function premiumClick() {
  alert("🚀 Trilo Premium arrive bientôt !");
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = getElement("analyzeBtn");
  const resetBtn = getElement("resetBtn");
  const signupBtn = getElement("signupBtn");
  const loginBtn = getElement("loginBtn");
  const premiumBtn = document.querySelector(".premium-btn");

  if (analyzeBtn) {
    analyzeBtn.addEventListener("click", analyser);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetData);
  }

  if (signupBtn) {
    signupBtn.addEventListener("click", signup);
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }

  if (premiumBtn) {
    premiumBtn.addEventListener("click", premiumClick);
  }

  drawChart();
  chargerClassement();
});
