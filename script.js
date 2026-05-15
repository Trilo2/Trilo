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
  serverTimestamp
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

function getElement(id) {
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

function choisirConseil(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

const conseilsNatation = [
  "🏊 Conseil : travaille ta respiration bilatérale.",
  "🏊 Conseil : améliore ta technique de glisse.",
  "🏊 Conseil : garde une nage régulière même quand tu fatigues.",
  "🏊 Conseil : fais des séries longues pour développer ton endurance."
];

const conseilsVelo = [
  "🚴 Conseil : travaille ta cadence de pédalage.",
  "🚴 Conseil : garde une vitesse plus régulière.",
  "🚴 Conseil : évite les gros à-coups d’effort.",
  "🚴 Conseil : améliore ton endurance sur des sorties longues."
];

const conseilsCourse = [
  "🏃 Conseil : travaille ton endurance fondamentale.",
  "🏃 Conseil : stabilise ton allure au lieu de partir trop vite.",
  "🏃 Conseil : ajoute quelques séances fractionnées.",
  "🏃 Conseil : améliore ta récupération entre les séances."
];

function calculerScores() {
  const swimDist = Number(getElement("swimDist").value);
  const swimTime = convertirTempsEnMinutes(getElement("swimTime").value);

  const bikeDist = Number(getElement("bikeDist").value);
  const bikeTime = convertirTempsEnMinutes(getElement("bikeTime").value);

  const runDist = Number(getElement("runDist").value);
  const runTime = convertirTempsEnMinutes(getElement("runTime").value);

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

    let target = score < 6 ? score * 1.10 : score < 10 ? score * 1.07 : score * 1.03;
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
  const leaderboard = getElement("leaderboard");
  if (!leaderboard) return;

  try {
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      leaderboard.innerText = "Aucun score enregistré pour le moment.";
      return;
    }

    let text = "";

    let rank = 1;
    snapshot.forEach((doc) => {
      const item = doc.data();
      const email = item.email || "Utilisateur";
      const score = Number(item.score || 0).toFixed(2);

      text += rank + ". " + email + " — " + score + "\n";
      rank++;
    });

    leaderboard.innerText = text;
  } catch (error) {
    leaderboard.innerText = "Classement indisponible pour le moment.";
    console.error(error);
  }
}

async function chargerComparaison(monScore) {
  const comparison = getElement("comparison");
  if (!comparison) return;

  try {
    const snapshot = await getDocs(collection(db, "scores"));

    if (snapshot.empty) {
      comparison.innerText = "Pas encore assez de données pour comparer.";
      return;
    }

    let scores = [];

    snapshot.forEach((doc) => {
      const item = doc.data();
      if (typeof item.score === "number") {
        scores.push(item.score);
      }
    });

    if (scores.length === 0) {
      comparison.innerText = "Pas encore assez de scores valides.";
      return;
    }

    const bestScore = Math.max(...scores);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    let above = scores.filter((s) => s > monScore).length;
    let rank = above + 1;

    comparison.innerText =
      "Ton score : " + monScore.toFixed(2) +
      "\nMeilleur score : " + bestScore.toFixed(2) +
      "\nMoyenne utilisateurs : " + averageScore.toFixed(2) +
      "\nTon rang approximatif : #" + rank +
      " sur " + scores.length;
  } catch (error) {
    comparison.innerText = "Comparaison indisponible pour le moment.";
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
  if (sportFaible.sport === "natation") conseil = choisirConseil(conseilsNatation);
  else if (sportFaible.sport === "vélo") conseil = choisirConseil(conseilsVelo);
  else conseil = choisirConseil(conseilsCourse);

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
    cloudText = "\n\n🔐 Connecte-toi pour sauvegarder et apparaître dans le classement.";
  }

  getElement("score").innerText = level;

  getElement("message").innerText =
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
  await chargerClassement();
  await chargerComparaison(globalScore);
}

function drawChart() {
  const canvas = getElement("chart");
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
  const ok = confirm("Supprimer tout l'historique Trilo ?");
  if (!ok) return;

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  getElement("score").innerText = "Aucun score";
  getElement("message").innerText = "Historique supprimé.";

  drawChart();
}

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

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    console.log("Connecté :", user.email);
    chargerClassement();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  getElement("analyzeBtn").addEventListener("click", analyser);
  getElement("resetBtn").addEventListener("click", resetData);
  getElement("signupBtn").addEventListener("click", signup);
  getElement("loginBtn").addEventListener("click", login);

  const premiumBtn = document.querySelector(".premium-btn");
  if (premiumBtn) {
    premiumBtn.addEventListener("click", () => {
      alert("🚀 Trilo Premium arrive bientôt !");
    });
  }

  drawChart();
  chargerClassement();
});
