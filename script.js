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
  limit
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

  if (!temps.includes(":")) {
    return Number(temps);
  }

  const parties = temps.split(":");
  const minutes = Number(parties[0]);
  const secondes = Number(parties[1]);

  if (isNaN(minutes) || isNaN(secondes)) return 0;

  return minutes + secondes / 60;
}

function choisirConseilAleatoire(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

async function sauvegarderScoreCloud(score) {
  if (!currentUser) return;

  await addDoc(collection(db, "scores"), {
    email: currentUser.email,
    score: score,
    date: new Date()
  });
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
    performances.push({ sport: "natation", score: score });
  }

  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = (speed / refBike) * 10;
    total += score;
    count++;
    performances.push({ sport: "vélo", score: score });
  }

  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = (speed / refRun) * 10;
    total += score;
    count++;
    performances.push({ sport: "course", score: score });
  }

  if (count === 0) {
    alert("Remplis au moins un sport correctement.");
    return;
  }

  const globalScore = total / count;
  const previousData = JSON.parse(localStorage.getItem("triloData")) || [];

  let evolution = "🚀 Première séance enregistrée.";
  let objectif = "🎯 Enregistre une deuxième séance pour comparer.";
  let fatigue = "";

  if (previousData.length > 0) {
    const lastScore = previousData[previousData.length - 1];

    if (globalScore > lastScore) {
      evolution = "📈 Tu progresses par rapport à ta dernière séance.";
    } else if (globalScore < lastScore) {
      evolution = "⚠️ Tu baisses un peu. Vérifie ta récupération.";
    } else {
      evolution = "😐 Tu es stable.";
    }

    let target;

    if (globalScore < 6) {
      target = globalScore * 1.10;
    } else if (globalScore < 10) {
      target = globalScore * 1.07;
    } else {
      target = globalScore * 1.03;
    }

    objectif = "🎯 Objectif prochaine séance : " + target.toFixed(2);
  }

  if (previousData.length >= 2) {
    const last = previousData[previousData.length - 1];
    const before = previousData[previousData.length - 2];

    if (globalScore < last && last < before) {
      fatigue = "⚠️ Alerte fatigue : baisse sur plusieurs séances. Repose-toi.";
    }
  }

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

  performances.sort((a, b) => a.score - b.score);

  const sportFaible = performances[0];
  const sportFort = performances[performances.length - 1];

  let stats = "📊 Scores par sport :\n";

  performances.forEach((p) => {
    stats += "- " + p.sport + " : " + p.score.toFixed(2) + "\n";
  });

  const conseilsNatation = [
    "🏊 Conseil : travaille ta respiration bilatérale.",
    "🏊 Conseil : améliore ta technique de glisse.",
    "🏊 Conseil : concentre-toi sur la régularité de tes mouvements.",
    "🏊 Conseil : fais des séries longues pour développer ton endurance.",
    "🏊 Conseil : garde une nage propre même quand tu fatigues."
  ];

  const conseilsVelo = [
    "🚴 Conseil : travaille ta cadence de pédalage.",
    "🚴 Conseil : essaie de garder une vitesse plus régulière.",
    "🚴 Conseil : ajoute du travail en endurance.",
    "🚴 Conseil : améliore ton positionnement sur le vélo.",
    "🚴 Conseil : évite les gros à-coups et cherche un effort stable."
  ];

  const conseilsCourse = [
    "🏃 Conseil : travaille ton endurance fondamentale.",
    "🏃 Conseil : stabilise ton allure au lieu de partir trop vite.",
    "🏃 Conseil : ajoute quelques séances fractionnées.",
    "🏃 Conseil : améliore ta récupération entre les séances.",
    "🏃 Conseil : garde une foulée régulière et relâchée."
  ];

  let conseil = "";

  if (sportFaible.sport === "natation") {
    conseil = choisirConseilAleatoire(conseilsNatation);
  } else if (sportFaible.sport === "vélo") {
    conseil = choisirConseilAleatoire(conseilsVelo);
  } else {
    conseil = choisirConseilAleatoire(conseilsCourse);
  }

  let cloudText = "";

  if (currentUser) {
    cloudText = "\n\n☁️ Score sauvegardé dans ton compte Trilo.";
    try {
      await sauvegarderScoreCloud(globalScore);
    } catch (error) {
      cloudText = "\n\n⚠️ Erreur sauvegarde cloud : " + error.message;
    }
  } else {
    cloudText = "\n\n🔐 Connecte-toi pour sauvegarder ta progression.";
  }

  document.getElementById("score").innerText = level;

  document.getElementById("message").innerText =
    intro +
    "\n\nScore global : " + globalScore.toFixed(2) +
    "\n\n💪 Point fort : " + sportFort.sport +
    "\n⚠️ Point faible : " + sportFaible.sport +
    "\n\n" + stats +
    "\n" + evolution +
    "\n\n" + objectif +
    "\n\n" + fatigue +
    "\n\n" + conseil +
    cloudText;

  drawChart();
}

function drawChart() {
  const canvas = document.getElementById("chart");

  if (!canvas) return;

  if (chart) {
    chart.destroy();
  }

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
  const ok = confirm("Supprimer tout l'historique Trilo ?");

  if (!ok) return;

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

  if (!email || !password) {
    alert("Entre un email et un mot de passe.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Compte créé ✅");
    })
    .catch((error) => {
      alert("Erreur : " + error.message);
    });
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Entre ton email et ton mot de passe.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Connexion réussie ✅");
    })
    .catch((error) => {
      alert("Erreur : " + error.message);
    });
}

async function afficherClassement() {
  try {
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));
    const querySnapshot = await getDocs(q);

    let classement = "🏆 Top scores Trilo :\n";

    querySnapshot.forEach((doc) => {
      const s = doc.data();
      classement += "- " + s.email + " : " + Number(s.score).toFixed(2) + "\n";
    });

    console.log(classement);
  } catch (error) {
    console.log("Classement indisponible :", error.message);
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

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("analyzeBtn").addEventListener("click", analyser);
  document.getElementById("resetBtn").addEventListener("click", resetData);

  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const premiumBtn = document.querySelector(".premium-btn");

  if (signupBtn) {
    signupBtn.addEventListener("click", signup);
  }

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }

  if (premiumBtn) {
    premiumBtn.addEventListener("click", () => {
      alert("🚀 Trilo Premium arrive bientôt !");
    });
  }

  drawChart();
  afficherClassement();
});
