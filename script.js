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
  storageBucket: "trilo-88a88.appspot.com",
  messagingSenderId: "748450983741",
  appId: "1:748450983741:web:c2f3f9f0afa042530f9f54",
  measurementId: "G-GSNS075D5R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let isPremium = false;
let chart = null;

let labels = JSON.parse(localStorage.getItem("triloLabels")) || [];
let data = JSON.parse(localStorage.getItem("triloData")) || [];

function el(id) {
  return document.getElementById(id);
}

function safeText(id, text) {
  const element = el(id);

  if (element) {
    element.innerText = text;
  }
}

function safeHTML(id, html) {
  const element = el(id);

  if (element) {
    element.innerHTML = html;
  }
}

function convertirTempsEnMinutes(temps) {
  if (!temps) return 0;

  temps = String(temps).trim();

  temps = temps.replace("'", ":");

  if (!temps.includes(":")) {
    const simple = Number(temps);

    if (isNaN(simple)) {
      return 0;
    }

    return simple;
  }

  const parts = temps.split(":");

  if (parts.length !== 2) {
    return 0;
  }

  const minutes = Number(parts[0]);
  const secondes = Number(parts[1]);

  if (isNaN(minutes)) {
    return 0;
  }

  if (isNaN(secondes)) {
    return 0;
  }

  if (secondes < 0) {
    return 0;
  }

  if (secondes >= 60) {
    return 0;
  }

  return minutes + secondes / 60;
}

function conseilAleatoire(liste) {
  const index = Math.floor(Math.random() * liste.length);

  return liste[index];
}

const conseilsNatation = [
  "🏊 Conseil : travaille ta respiration bilatérale.",
  "🏊 Conseil : améliore ta glisse dans l’eau.",
  "🏊 Conseil : garde une nage régulière.",
  "🏊 Conseil : fais des séries longues.",
  "🏊 Conseil : évite de partir trop vite.",
  "🏊 Conseil : garde ton corps bien aligné.",
  "🏊 Conseil : travaille les battements sans t’épuiser."
];

const conseilsVelo = [
  "🚴 Conseil : travaille ta cadence.",
  "🚴 Conseil : garde une vitesse régulière.",
  "🚴 Conseil : améliore ton endurance.",
  "🚴 Conseil : évite les gros à-coups.",
  "🚴 Conseil : travaille ta position.",
  "🚴 Conseil : fais une sortie facile après une grosse séance.",
  "🚴 Conseil : garde une intensité progressive."
];

const conseilsCourse = [
  "🏃 Conseil : travaille ton endurance fondamentale.",
  "🏃 Conseil : stabilise ton allure.",
  "🏃 Conseil : ajoute du fractionné léger.",
  "🏃 Conseil : améliore ta récupération.",
  "🏃 Conseil : garde une foulée relâchée.",
  "🏃 Conseil : ne pars pas trop vite.",
  "🏃 Conseil : augmente le volume progressivement."
];

async function creerProfilUtilisateur(user) {
  if (!user) {
    return;
  }

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

  if (snap.exists()) {
    const userData = snap.data();

    isPremium = userData.premium === true;
  } else {
    isPremium = false;
  }

  afficherEtatPremium();
}

async function signup() {
  const emailInput = el("email");
  const passwordInput = el("password");

  if (!emailInput || !passwordInput) {
    alert("Champs email ou mot de passe introuvables.");
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Entre un email et un mot de passe.");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await creerProfilUtilisateur(result.user);

    alert("Compte créé ✅");
  } catch (error) {
    alert("Erreur : " + error.message);
  }
}

async function login() {
  const emailInput = el("email");
  const passwordInput = el("password");

  if (!emailInput || !passwordInput) {
    alert("Champs email ou mot de passe introuvables.");
    return;
  }

  const email = emailInput.value;
  const password = passwordInput.value;

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
    alert("Erreur : " + error.message);
  }
}

function afficherEtatPremium() {
  const leaderboard = el("leaderboard");
  const comparison = el("comparison");
  const advancedComparison = el("advancedComparison");

  if (!currentUser) {
    if (leaderboard) {
      leaderboard.innerText = "🔐 Connecte-toi pour accéder au classement.";
    }

    if (comparison) {
      comparison.innerText = "🔐 Connecte-toi pour comparer tes performances.";
    }

    if (advancedComparison) {
      advancedComparison.innerText = "🔐 Connecte-toi pour débloquer l’analyse avancée IA.";
    }

    return;
  }

  if (!isPremium) {
    if (leaderboard) {
      leaderboard.innerText = "🔒 Fonction Premium : débloque le classement mondial.";
    }

    if (comparison) {
      comparison.innerText = "🔒 Fonction Premium : débloque la comparaison utilisateurs.";
    }

    if (advancedComparison) {
      advancedComparison.innerText = "🔒 Premium requis pour débloquer l’analyse avancée IA.";
    }

    return;
  }

  if (leaderboard) {
    leaderboard.innerText = "🏆 Analyse une séance pour charger le classement.";
  }

  if (comparison) {
    comparison.innerText = "⚔️ Analyse une séance pour comparer ton score.";
  }

  if (advancedComparison) {
    advancedComparison.innerText = "🧠 Analyse une séance pour recevoir l’analyse avancée IA.";
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

function calculerScores() {
  const swimDistInput = el("swimDist");
  const swimTimeInput = el("swimTime");

  const bikeDistInput = el("bikeDist");
  const bikeTimeInput = el("bikeTime");

  const runDistInput = el("runDist");
  const runTimeInput = el("runTime");

  if (!swimDistInput || !swimTimeInput || !bikeDistInput || !bikeTimeInput || !runDistInput || !runTimeInput) {
    alert("Erreur HTML : un champ sport est introuvable.");
    return null;
  }

  const swimDist = Number(swimDistInput.value);
  const swimTime = convertirTempsEnMinutes(swimTimeInput.value);

  const bikeDist = Number(bikeDistInput.value);
  const bikeTime = convertirTempsEnMinutes(bikeTimeInput.value);

  const runDist = Number(runDistInput.value);
  const runTime = convertirTempsEnMinutes(runTimeInput.value);

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

  const globalScore = total / count;

  return {
    globalScore: globalScore,
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
    level: "Niveau 5 🏆 Elite",
    intro: "Niveau compétitif."
  };
}

function obtenirEvolution(score) {
  const previousData = JSON.parse(localStorage.getItem("triloData")) || [];

  let evolution = "🚀 Première séance enregistrée.";
  let objectif = "🎯 Enregistre une deuxième séance pour comparer.";
  let recuperation = "🛌 Récupération conseillée : 24h.";
  let fatigue = "";

  if (previousData.length > 0) {
    const lastScore = previousData[previousData.length - 1];

    if (score > lastScore) {
      evolution = "📈 Tu progresses par rapport à ta dernière séance.";
    }

    if (score < lastScore) {
      evolution = "⚠️ Tu baisses un peu. Vérifie ta récupération.";
      recuperation = "🛌 Récupération conseillée : 36h.";
    }

    if (score === lastScore) {
      evolution = "😐 Tu es stable.";
    }

    let target = 0;

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
      recuperation = "🛌 Récupération conseillée : 48h.";
    }
  }

  return {
    evolution: evolution,
    objectif: objectif,
    recuperation: recuperation,
    fatigue: fatigue
  };
}

function genererBadges(globalScore, performances, progression) {
  let badges = [];

  const natation = performances.find((p) => p.sport === "natation");
  const velo = performances.find((p) => p.sport === "vélo");
  const course = performances.find((p) => p.sport === "course");

  if (natation && natation.score >= 10) {
    badges.push("🏊 Spécialiste natation");
  }

  if (velo && velo.score >= 10) {
    badges.push("🚴 Puissance vélo");
  }

  if (course && course.score >= 10) {
    badges.push("🏃 Rapide en course");
  }

  if (globalScore >= 8) {
    badges.push("🔥 Bon départ");
  }

  if (globalScore >= 10) {
    badges.push("💪 Score 10+");
  }

  if (globalScore >= 15) {
    badges.push("🏆 Elite Trilo");
  }

  if (performances.length === 3) {
    badges.push("🔱 Triathlète complet");
  }

  if (progression.evolution.includes("progresses")) {
    badges.push("📈 En progression");
  }

  if (progression.fatigue) {
    badges.push("🧘 Récupération nécessaire");
  }

  if (badges.length === 0) {
    badges.push("🌱 Premier pas Trilo");
  }

  return badges;
}

function afficherBadges(badges) {
  const box = el("badgesList");

  if (!box) {
    return;
  }

  box.innerHTML = "";

  badges.forEach((badge) => {
    const div = document.createElement("div");

    div.className = "badge-item";

    div.innerText = badge;

    box.appendChild(div);
  });
}

function genererAnalyseIA(globalScore, sportFaible, sportFort, progression) {
  if (!isPremium) {
    return "🔒 Coach IA réservé aux utilisateurs Trilo Premium.";
  }

  let texte = "";

  texte += "🤖 Coach IA Trilo\n\n";
  texte += "Score analysé : " + globalScore.toFixed(2) + "\n";
  texte += "💪 Point fort : " + sportFort.sport + "\n";
  texte += "⚠️ Point faible : " + sportFaible.sport + "\n\n";

  if (globalScore < 6) {
    texte += "Tu es en construction. Priorité : régularité, technique et endurance.\n\n";
  } else if (globalScore < 9) {
    texte += "Tu progresses bien. Travaille ton point faible pour équilibrer ton profil.\n\n";
  } else if (globalScore < 12) {
    texte += "Très bon niveau. Cherche plus de constance et de précision.\n\n";
  } else if (globalScore < 15) {
    texte += "Excellent rythme. Surveille surtout la récupération.\n\n";
  } else {
    texte += "Niveau Elite détecté. Optimise maintenant les détails.\n\n";
  }

  if (sportFaible.sport === "natation") {
    texte += "Plan IA : 2 séances natation cette semaine : technique + endurance.\n";
  } else if (sportFaible.sport === "vélo") {
    texte += "Plan IA : 2 sorties vélo cette semaine : endurance + cadence régulière.\n";
  } else {
    texte += "Plan IA : 2 séances course cette semaine : endurance + allure stable.\n";
  }

  texte += "\n" + progression.recuperation;

  if (progression.fatigue) {
    texte += "\n" + progression.fatigue;
  }

  return texte;
}

function mettreAJourDashboard(globalScore, performances) {
if (!isPremium) {
  safeText("bestScore", "🔒");
  safeText("averageScore", "🔒");
  safeText("sessionCount", "🔒");
  safeText("bestSport", "Premium");
  return;
}  if (!el("bestScore")) {
    return;
  }

  const sessions = data.length;

  const bestScore = Math.max(...data);

  const average = data.reduce((a, b) => a + b, 0) / data.length;

  let bestSport = "Aucun";

  if (performances.length > 0) {
    const sorted = [...performances].sort((a, b) => b.score - a.score);

    bestSport = sorted[0].sport;
  }

  safeText("bestScore", bestScore.toFixed(2));

  safeText("averageScore", average.toFixed(2));

  safeText("sessionCount", String(sessions));

  safeText("bestSport", bestSport);
}

async function sauvegarderScoreCloud(score, performances, badges) {
  if (!currentUser) {
    console.log("Utilisateur non connecté : score non sauvegardé dans Firestore.");
    return;
  }

  try {
    await addDoc(collection(db, "scores"), {
      uid: currentUser.uid,
      email: currentUser.email,
      score: Number(score),
      performances: performances,
      badges: badges,
      createdAt: serverTimestamp()
    });

    console.log("✅ Score sauvegardé dans Firestore.");
  } catch (error) {
    console.error("❌ Erreur sauvegarde Firestore :", error);
  }
}

async function chargerClassement() {
  const box = el("leaderboard");

  if (!box) {
    return;
  }

  if (!currentUser) {
    box.innerText = "🔐 Connecte-toi pour accéder au classement.";
    return;
  }

  if (!isPremium) {
    box.innerText = "🔒 Fonction Premium : débloque le classement mondial.";
    return;
  }

  box.innerText = "Chargement du classement...";

  try {
    const q = query(
      collection(db, "scores"),
      orderBy("score", "desc"),
      limit(10)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      box.innerText = "Aucun score enregistré.";
      return;
    }

    let texte = "🏆 TOP TRILO\n\n";
    let rang = 1;

    snapshot.forEach((docItem) => {
      const item = docItem.data();

      const email = item.email || "Utilisateur";

      const score = Number(item.score || 0).toFixed(2);

      texte += rang + ". " + email + " — " + score + "\n";

      rang++;
    });

    box.innerText = texte;
  } catch (error) {
    console.error("❌ Erreur classement :", error);

    box.innerText = "Erreur chargement classement.";
  }
}

async function chargerComparaison(monScore) {
  const box = el("comparison");

  if (!box) {
    return;
  }

  if (!currentUser) {
    box.innerText = "🔐 Connecte-toi pour comparer tes performances.";
    return;
  }

  if (!isPremium) {
    box.innerText = "🔒 Fonction Premium : débloque la comparaison utilisateurs.";
    return;
  }

  box.innerText = "Chargement de la comparaison...";

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
      box.innerText = "Pas encore assez de données.";
      return;
    }

    const best = Math.max(...scores);

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    const rank = scores.filter((s) => s > monScore).length + 1;

    box.innerText =
      "Ton score : " + monScore.toFixed(2) +
      "\nMeilleur score : " + best.toFixed(2) +
      "\nMoyenne utilisateurs : " + avg.toFixed(2) +
      "\nTon rang approximatif : #" + rank + " sur " + scores.length;
  } catch (error) {
    console.error("❌ Erreur comparaison :", error);

    box.innerText = "Erreur chargement comparaison.";
  }
}

async function chargerComparaisonAvancee(monScore, sportFort, sportFaible) {
  const box = el("advancedComparison");

  if (!box) {
    return;
  }

  if (!currentUser) {
    box.innerText = "🔐 Connecte-toi pour débloquer l’analyse avancée IA.";
    return;
  }

  if (!isPremium) {
    box.innerText = "🔒 Premium requis pour débloquer l’analyse avancée IA.";
    return;
  }

  box.innerText = "Chargement de l’analyse avancée IA...";

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
      box.innerText = "Pas encore assez de données pour l’analyse IA.";
      return;
    }

    const betterThan = scores.filter((s) => s < monScore).length;

    const percent = Math.round((betterThan / scores.length) * 100);

    const best = Math.max(...scores);

    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    let niveau = "Débutant";

    if (monScore >= avg) {
      niveau = "Intermédiaire";
    }

    if (monScore >= avg * 1.2) {
      niveau = "Avancé";
    }

    if (monScore >= best * 0.9) {
      niveau = "Elite";
    }

    box.innerText =
      "🧠 Analyse avancée IA\n\n" +
      "Tu dépasses environ " + percent + "% des utilisateurs Trilo.\n" +
      "Ton niveau estimé : " + niveau + ".\n" +
      "Ton point fort dominant : " + sportFort.sport + ".\n" +
      "Ton axe prioritaire : " + sportFaible.sport + ".\n\n" +
      "Conseil IA : améliore d’abord ton point faible avant d’augmenter l’intensité globale.";
  } catch (error) {
    console.error("❌ Erreur analyse IA avancée :", error);

    box.innerText = "Erreur analyse avancée IA.";
  }
}

function drawChart() {
  const canvas = el("chart");

  if (!canvas) {
    return;
  }

  if (typeof Chart === "undefined") {
    console.error("❌ Chart.js n’est pas chargé.");
    return;
  }

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

function resetData() {
  const ok = confirm("Supprimer l’historique Trilo ?");

  if (!ok) {
    return;
  }

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  safeText("score", "Aucun score");

  safeText("message", "Historique supprimé.");

  safeText("badgesList", "Fais une analyse pour débloquer tes premiers badges.");

  safeText("aiAnalysis", "Fais une analyse pour recevoir ton coaching IA.");

  safeText("bestScore", "0");

  safeText("averageScore", "0");

  safeText("sessionCount", "0");

  safeText("bestSport", "Aucun");

  afficherEtatPremium();

  drawChart();
}

async function analyser() {
  console.log("✅ Fonction analyser lancée");

  const resultat = calculerScores();

  if (!resultat) {
    alert("Entre au moins un sport correctement.");
    return;
  }

  const globalScore = resultat.globalScore;

  const performances = resultat.performances;

  performances.sort((a, b) => a.score - b.score);

  const sportFaible = performances[0];

  const sportFort = performances[performances.length - 1];

  const niveau = obtenirNiveau(globalScore);

  const progression = obtenirEvolution(globalScore);

  let conseil = "";

  if (sportFaible.sport === "natation") {
    conseil = conseilAleatoire(conseilsNatation);
  } else if (sportFaible.sport === "vélo") {
    conseil = conseilAleatoire(conseilsVelo);
  } else {
    conseil = conseilAleatoire(conseilsCourse);
  }

  labels.push(new Date().toLocaleDateString("fr-FR"));

  data.push(globalScore);

  localStorage.setItem("triloLabels", JSON.stringify(labels));

  localStorage.setItem("triloData", JSON.stringify(data));

  const badges = genererBadges(globalScore, performances, progression);

  afficherBadges(badges);

  mettreAJourDashboard(globalScore, performances);

  let stats = "📊 Scores par sport :\n";

  performances.forEach((p) => {
    stats += "- " + p.sport + " : " + p.score.toFixed(2) + "\n";
  });

  safeText("score", niveau.level);

  safeText(
    "message",
    niveau.intro +
      "\n\nScore global : " + globalScore.toFixed(2) +
      "\n\n💪 Point fort : " + sportFort.sport +
      "\n⚠️ Point faible : " + sportFaible.sport +
      "\n\n" + stats +
      "\n" + progression.evolution +
      "\n\n" + progression.objectif +
      "\n\n" + progression.recuperation +
      "\n\n" + progression.fatigue +
      "\n\n" + conseil +
      (currentUser ? "\n\n☁️ Score sauvegardé." : "\n\n🔐 Connecte-toi pour sauvegarder.")
  );

  safeText(
    "aiAnalysis",
    genererAnalyseIA(globalScore, sportFaible, sportFort, progression)
  );

  await sauvegarderScoreCloud(globalScore, performances, badges);

  await chargerClassement();

  await chargerComparaison(globalScore);

  await chargerComparaisonAvancee(globalScore, sportFort, sportFaible);

  drawChart();
}

function brancherBoutons() {
  console.log("✅ Branchement des boutons Trilo");

  const analyzeBtn = el("analyzeBtn");

  const resetBtn = el("resetBtn");

  const signupBtn = el("signupBtn");

  const loginBtn = el("loginBtn");

  if (analyzeBtn) {
    analyzeBtn.onclick = function () {
      console.log("✅ Bouton analyser cliqué");
      analyser();
    };

    analyzeBtn.addEventListener("click", function () {
      console.log("✅ Event listener analyser détecté");
    });
  } else {
    console.error("❌ analyzeBtn introuvable");
  }

  if (resetBtn) {
    resetBtn.onclick = resetData;
  } else {
    console.warn("⚠️ resetBtn introuvable");
  }

  if (signupBtn) {
    signupBtn.onclick = signup;
  } else {
    console.warn("⚠️ signupBtn introuvable");
  }

  if (loginBtn) {
    loginBtn.onclick = login;
  } else {
    console.warn("⚠️ loginBtn introuvable");
  }

  const premiumBtn = document.querySelector(".premium-btn");

  if (premiumBtn) {
    premiumBtn.onclick = function () {
      alert("🚀 Trilo Premium arrive bientôt. Paiement bientôt disponible.");
    };
  }
}

window.triloAnalyser = analyser;

window.triloReset = resetData;

document.addEventListener("click", function (event) {
  const target = event.target;

  if (!target) {
    return;
  }

  if (target.id === "analyzeBtn") {
    console.log("✅ Clic global détecté sur analyzeBtn");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Trilo JS chargé");

  brancherBoutons();

  drawChart();

  afficherEtatPremium();
});

if (document.readyState !== "loading") {
  console.log("✅ DOM déjà chargé, branchement direct");

  brancherBoutons();

  drawChart();

  afficherEtatPremium();
}
