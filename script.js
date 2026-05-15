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

let labels = JSON.parse(localStorage.getItem("triloLabels")) || [];
let data = JSON.parse(localStorage.getItem("triloData")) || [];
let chart = null;
let currentUser = null;
let isPremium = false;

function el(id) {
  return document.getElementById(id);
}

function convertirTempsEnMinutes(temps) {
  if (!temps) return 0;

  temps = temps.trim().replace("'", ":");

  if (!temps.includes(":")) {
    const value = Number(temps);
    return isNaN(value) ? 0 : value;
  }

  const parties = temps.split(":");
  const minutes = Number(parties[0]);
  const secondes = Number(parties[1]);

  if (isNaN(minutes) || isNaN(secondes)) return 0;
  if (secondes < 0 || secondes >= 60) return 0;

  return minutes + secondes / 60;
}

function conseilAleatoire(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

const conseilsNatation = [
  "🏊 Conseil : travaille ta respiration bilatérale.",
  "🏊 Conseil : améliore ta glisse.",
  "🏊 Conseil : garde une nage régulière.",
  "🏊 Conseil : fais des séries longues."
];

const conseilsVelo = [
  "🚴 Conseil : travaille ta cadence.",
  "🚴 Conseil : garde une vitesse régulière.",
  "🚴 Conseil : améliore ton endurance.",
  "🚴 Conseil : évite les gros à-coups."
];

const conseilsCourse = [
  "🏃 Conseil : travaille ton endurance.",
  "🏃 Conseil : stabilise ton allure.",
  "🏃 Conseil : ajoute du fractionné.",
  "🏃 Conseil : pense à récupérer."
];

async function creerProfilUtilisateur(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

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
    afficherEtatPremium();
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  isPremium = snap.exists() && snap.data().premium === true;

  afficherEtatPremium();
}

function afficherEtatPremium() {
  const leaderboard = el("leaderboard");
  const comparison = el("comparison");

  if (!leaderboard || !comparison) return;

  if (!currentUser) {
    leaderboard.innerText = "🔐 Connecte-toi pour accéder aux fonctions Premium.";
    comparison.innerText = "🔐 Connecte-toi pour comparer tes performances.";
    return;
  }

  if (!isPremium) {
    leaderboard.innerText = "🔒 Fonction Premium : débloque le classement mondial.";
    comparison.innerText = "🔒 Fonction Premium : débloque la comparaison utilisateurs.";
    return;
  }

  leaderboard.innerText = "🏆 Analyse une séance pour charger le classement.";
  comparison.innerText = "⚔️ Analyse une séance pour comparer ton score.";
}

function calculerScores() {
  const swimDist = Number(el("swimDist").value);
  const swimTime = convertirTempsEnMinutes(el("swimTime").value);

  const bikeDist = Number(el("bikeDist").value);
  const bikeTime = convertirTempsEnMinutes(el("bikeTime").value);

  const runDist = Number(el("runDist").value);
  const runTime = convertirTempsEnMinutes(el("runTime").value);

  const refSwim = 45;
  const refBike = 22;
  const refRun = 12;

  let total = 0;
  let count = 0;
  let performances = [];

  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    const score = (speed / refSwim) * 10;
    total += score;
    count++;
    performances.push({ sport: "natation", score });
  }

  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = (speed / refBike) * 10;
    total += score;
    count++;
    performances.push({ sport: "vélo", score });
  }

  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = (speed / refRun) * 10;
    total += score;
    count++;
    performances.push({ sport: "course", score });
  }

  if (count === 0) return null;

  return {
    globalScore: total / count,
    performances
  };
}

function obtenirNiveau(score) {
  if (score < 6) return ["Niveau 1 😐 Débutant", "Tu construis ta base."];
  if (score < 9) return ["Niveau 2 👍 En progrès", "Bonne progression."];
  if (score < 12) return ["Niveau 3 🔥 Bon niveau", "Très solide."];
  if (score < 15) return ["Niveau 4 💪 Très bon", "Excellent rythme."];
  return ["Niveau 5 🏅 Excellent", "Niveau compétitif."];
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

    const target = score < 6 ? score * 1.10 : score < 10 ? score * 1.07 : score * 1.03;
    objectif = "🎯 Objectif prochaine séance : " + target.toFixed(2);
  }

  if (previousData.length >= 2) {
    const last = previousData[previousData.length - 1];
    const before = previousData[previousData.length - 2];

    if (score < last && last < before) {
      fatigue = "⚠️ Alerte fatigue : baisse sur plusieurs séances. Repose-toi.";
    }
  }

  return { evolution, objectif, fatigue };
}

async function sauvegarderScoreCloud(score, performances) {
  if (!currentUser) return;

  await addDoc(collection(db, "scores"), {
    uid: currentUser.uid,
    email: currentUser.email,
    score,
    performances,
    createdAt: serverTimestamp()
  });
}

async function chargerClassement() {
  const leaderboard = el("leaderboard");
  if (!leaderboard) return;

  if (!currentUser || !isPremium) {
    afficherEtatPremium();
    return;
  }

  try {
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      leaderboard.innerText = "Aucun score enregistré.";
      return;
    }

    let text = "";
    let rank = 1;

    snapshot.forEach((docItem) => {
      const item = docItem.data();
      text += rank + ". " + (item.email || "Utilisateur") + " — " + Number(item.score || 0).toFixed(2) + "\n";
      rank++;
    });

    leaderboard.innerText = text;
  } catch (error) {
    leaderboard.innerText = "Classement indisponible.";
    console.error(error);
  }
}

async function chargerComparaison(monScore) {
  const comparison = el("comparison");
  if (!comparison) return;

  if (!currentUser || !isPremium) {
    afficherEtatPremium();
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "scores"));

    let scores = [];

    snapshot.forEach((docItem) => {
      const item = docItem.data();
      if (typeof item.score === "number") {
        scores.push(item.score);
      }
    });

    if (scores.length === 0) {
      comparison.innerText = "Pas encore assez de données.";
      return;
    }

    const bestScore = Math.max(...scores);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const above = scores.filter((s) => s > monScore).length;
    const rank = above + 1;

    comparison.innerText =
      "Ton score : " + monScore.toFixed(2) +
      "\nMeilleur score : " + bestScore.toFixed(2) +
      "\nMoyenne utilisateurs : " + averageScore.toFixed(2) +
      "\nTon rang approximatif : #" + rank + " sur " + scores.length;
  } catch (error) {
    comparison.innerText = "Comparaison indisponible.";
    console.error(error);
  }
}

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

  const [level, intro] = obtenirNiveau(globalScore);
  const progression = obtenirEvolution(globalScore);

  let conseil = "";

  if (sportFaible.sport === "natation") conseil = conseilAleatoire(conseilsNatation);
  else if (sportFaible.sport === "vélo") conseil = conseilAleatoire(conseilsVelo);
  else conseil = conseilAleatoire(conseilsCourse);

  const today = new Date().toLocaleDateString("fr-FR");

  labels.push(today);
  data.push(globalScore);

  localStorage.setItem("triloLabels", JSON.stringify(labels));
  localStorage.setItem("triloData", JSON.stringify(data));

  let stats = "📊 Scores par sport :\n";

  performances.forEach((p) => {
    stats += "- " + p.sport + " : " + p.score.toFixed(2) + "\n";
  });

  let cloudText = "";

  if (currentUser) {
    try {
      await sauvegarderScoreCloud(globalScore, performances);
      cloudText = "\n\n☁️ Score sauvegardé dans ton compte Trilo.";
    } catch (error) {
      cloudText = "\n\n⚠️ Erreur de sauvegarde cloud.";
      console.error(error);
    }
  } else {
    cloudText = "\n\n🔐 Connecte-toi pour sauvegarder ta progression.";
  }

  el("score").innerText = level;

  el("message").innerText =
    intro +
    "\n\nScore global : " + globalScore.toFixed(2) +
    "\n\n💪 Point fort : " + sportFort.sport +
    "\n⚠️ Point faible : " + sportFaible.sport +
    "\n\n" + stats +
    "\n" + progression.evolution +
    "\n\n" + progression.objectif +
    "\n\n" + progression.fatigue +
    "\n\n" + conseil +
    cloudText;

  drawChart();

  if (isPremium) {
    await chargerClassement();
    await chargerComparaison(globalScore);
  } else {
    afficherEtatPremium();
  }
}

function drawChart() {
  const canvas = el("chart");
  if (!canvas) return;

  if (chart) chart.destroy();

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
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function resetData() {
  if (!confirm("Supprimer tout l'historique Trilo ?")) return;

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  el("score").innerText = "Aucun score";
  el("message").innerText = "Historique supprimé.";

  drawChart();
}

async function signup() {
  const email = el("email").value;
  const password = el("password").value;

  if (!email || !password) {
    alert("Entre un email et un mot de passe.");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await creerProfilUtilisateur(result.user);
    alert("Compte créé ✅");
  } catch (error) {
    alert("Erreur : " + error.message);
  }
}

async function login() {
  const email = el("email").value;
  const password = el("password").value;

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
});

document.addEventListener("DOMContentLoaded", () => {
  el("analyzeBtn").addEventListener("click", analyser);
  el("resetBtn").addEventListener("click", resetData);
  el("signupBtn").addEventListener("click", signup);
  el("loginBtn").addEventListener("click", login);

  const premiumBtn = document.querySelector(".premium-btn");

  if (premiumBtn) {
    premiumBtn.addEventListener("click", () => {
      alert("🚀 Trilo Premium arrive bientôt. Paiement bientôt disponible.");
    });
  }

  drawChart();
  afficherEtatPremium();
});
