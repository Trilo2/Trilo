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
  addDoc
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

function convertirTempsEnMinutes(temps) {
  if (!temps) return 0;
  temps = temps.trim().replace("'", ":");

  if (!temps.includes(":")) return Number(temps);

  const parties = temps.split(":");
  const minutes = Number(parties[0]);
  const secondes = Number(parties[1]);

  if (isNaN(minutes) || isNaN(secondes)) return 0;

  return minutes + secondes / 60;
}

function choisirConseil(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

async function sauvegarderScoreCloud(score) {
  if (!currentUser) return;

  try {
    await addDoc(collection(db, "scores"), {
      email: currentUser.email,
      score: score,
      date: new Date()
    });
  } catch (error) {
    console.log("Erreur Firestore :", error.message);
  }
}

async function analyser() {
  const swimDist = Number(document.getElementById("swimDist").value);
  const swimTime = convertirTempsEnMinutes(document.getElementById("swimTime").value);

  const bikeDist = Number(document.getElementById("bikeDist").value);
  const bikeTime = convertirTempsEnMinutes(document.getElementById("bikeTime").value);

  const runDist = Number(document.getElementById("runDist").value);
  const runTime = convertirTempsEnMinutes(document.getElementById("runTime").value);

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

  if (count === 0) {
    alert("Remplis au moins un sport correctement.");
    return;
  }

  const globalScore = total / count;
  const previousData = JSON.parse(localStorage.getItem("triloData")) || [];

  const today = new Date().toLocaleDateString("fr-FR");
  labels.push(today);
  data.push(globalScore);

  localStorage.setItem("triloLabels", JSON.stringify(labels));
  localStorage.setItem("triloData", JSON.stringify(data));

  let level = "";
  let intro = "";

  if (globalScore < 6) {
    level = "Niveau 1 😐 Débutant";
    intro = "Tu construis ta base.";
  } else if (globalScore < 9) {
    level = "Niveau 2 👍 En progrès";
    intro = "Bonne progression.";
  } else if (globalScore < 12) {
    level = "Niveau 3 🔥 Bon niveau";
    intro = "Très solide.";
  } else if (globalScore < 15) {
    level = "Niveau 4 💪 Très bon";
    intro = "Excellent rythme.";
  } else {
    level = "Niveau 5 🏅 Excellent";
    intro = "Niveau compétitif.";
  }

  let evolution = "🚀 Première séance enregistrée.";

  if (previousData.length > 0) {
    const lastScore = previousData[previousData.length - 1];

    if (globalScore > lastScore) {
      evolution = "📈 Tu progresses par rapport à ta dernière séance.";
    } else if (globalScore < lastScore) {
      evolution = "⚠️ Tu baisses un peu. Vérifie ta récupération.";
    } else {
      evolution = "😐 Tu es stable.";
    }
  }

  performances.sort((a, b) => a.score - b.score);

  const sportFaible = performances[0];
  const sportFort = performances[performances.length - 1];

  let stats = "📊 Scores par sport :\n";
  performances.forEach((p) => {
    stats += "- " + p.sport + " : " + p.score.toFixed(2) + "\n";
  });

  const conseilsNatation = [
    "🏊 Conseil : travaille ta respiration.",
    "🏊 Conseil : améliore ta glisse.",
    "🏊 Conseil : garde une nage régulière."
  ];

  const conseilsVelo = [
    "🚴 Conseil : travaille ta cadence.",
    "🚴 Conseil : garde une vitesse régulière.",
    "🚴 Conseil : améliore ton endurance."
  ];

  const conseilsCourse = [
    "🏃 Conseil : stabilise ton allure.",
    "🏃 Conseil : travaille ton endurance.",
    "🏃 Conseil : pense à bien récupérer."
  ];

  let conseil = "";

  if (sportFaible.sport === "natation") {
    conseil = choisirConseil(conseilsNatation);
  } else if (sportFaible.sport === "vélo") {
    conseil = choisirConseil(conseilsVelo);
  } else {
    conseil = choisirConseil(conseilsCourse);
  }

  let cloudText = currentUser
    ? "\n\n☁️ Score sauvegardé dans ton compte."
    : "\n\n🔐 Connecte-toi pour sauvegarder ta progression.";

  document.getElementById("score").innerText = level;

  document.getElementById("message").innerText =
    intro +
    "\n\nScore global : " + globalScore.toFixed(2) +
    "\n\n💪 Point fort : " + sportFort.sport +
    "\n⚠️ Point faible : " + sportFaible.sport +
    "\n\n" + stats +
    "\n" + evolution +
    "\n\n" + conseil +
    cloudText;

  drawChart();
  await sauvegarderScoreCloud(globalScore);
}

function drawChart() {
  const canvas = document.getElementById("chart");
  if (!canvas) return;

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Progression Trilo",
        data: data,
        borderWidth: 3,
        tension: 0.3
      }]
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

function resetData() {
  if (!confirm("Supprimer tout l'historique Trilo ?")) return;

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  document.getElementById("score").innerText = "Aucun score";
  document.getElementById("message").innerText = "Historique supprimé.";

  drawChart();
}

function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("Compte créé ✅"))
    .catch((error) => alert("Erreur : " + error.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Connexion réussie ✅"))
    .catch((error) => alert("Erreur : " + error.message));
}

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("analyzeBtn").addEventListener("click", analyser);
  document.getElementById("resetBtn").addEventListener("click", resetData);

  document.getElementById("signupBtn").addEventListener("click", signup);
  document.getElementById("loginBtn").addEventListener("click", login);

  const premiumBtn = document.querySelector(".premium-btn");
  if (premiumBtn) {
    premiumBtn.addEventListener("click", () => {
      alert("🚀 Trilo Premium arrive bientôt !");
    });
  }

  drawChart();
});
