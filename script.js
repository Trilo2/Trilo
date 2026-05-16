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

function convertirTempsEnMinutes(temps) {
  if (!temps) return 0;

  temps = temps.trim().replace("'", ":");

  if (!temps.includes(":")) {
    const simple = Number(temps);
    return isNaN(simple) ? 0 : simple;
  }

  const parts = temps.split(":");
  if (parts.length !== 2) return 0;

  const minutes = Number(parts[0]);
  const secondes = Number(parts[1]);

  if (isNaN(minutes) || isNaN(secondes)) return 0;
  if (secondes < 0 || secondes >= 60) return 0;

  return minutes + secondes / 60;
}

function conseilAleatoire(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

const conseilsNatation = [
  "🏊 Travaille ta respiration bilatérale.",
  "🏊 Améliore ta glisse.",
  "🏊 Garde une nage régulière.",
  "🏊 Fais des séries longues.",
  "🏊 Ne pars pas trop vite."
];

const conseilsVelo = [
  "🚴 Travaille ta cadence.",
  "🚴 Garde une vitesse régulière.",
  "🚴 Améliore ton endurance.",
  "🚴 Évite les gros à-coups.",
  "🚴 Travaille ta position."
];

const conseilsCourse = [
  "🏃 Travaille ton endurance fondamentale.",
  "🏃 Stabilise ton allure.",
  "🏃 Ajoute du fractionné léger.",
  "🏃 Améliore ta récupération.",
  "🏃 Garde une foulée relâchée."
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

function afficherEtatPremium() {
  if (!currentUser) {
    if (el("leaderboard")) el("leaderboard").innerText = "🔐 Connecte-toi pour accéder au classement.";
    if (el("comparison")) el("comparison").innerText = "🔐 Connecte-toi pour comparer tes performances.";
    if (el("advancedComparison")) el("advancedComparison").innerText = "🔐 Connecte-toi pour débloquer l’analyse avancée IA.";
    return;
  }

  if (!isPremium) {
    if (el("leaderboard")) el("leaderboard").innerText = "🔒 Fonction Premium : classement mondial.";
    if (el("comparison")) el("comparison").innerText = "🔒 Fonction Premium : comparaison utilisateurs.";
    if (el("advancedComparison")) el("advancedComparison").innerText = "🔒 Premium requis pour l’analyse avancée IA.";
    return;
  }

  if (el("leaderboard")) el("leaderboard").innerText = "🏆 Analyse une séance pour charger le classement.";
  if (el("comparison")) el("comparison").innerText = "⚔️ Analyse une séance pour comparer ton score.";
  if (el("advancedComparison")) el("advancedComparison").innerText = "🧠 Analyse une séance pour recevoir l’analyse avancée IA.";
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
  if (score < 6) return { level: "Niveau 1 😐 Débutant", intro: "Tu construis ta base." };
  if (score < 9) return { level: "Niveau 2 👍 En progrès", intro: "Bonne progression." };
  if (score < 12) return { level: "Niveau 3 🔥 Bon niveau", intro: "Très solide." };
  if (score < 15) return { level: "Niveau 4 💪 Très bon", intro: "Excellent rythme." };
  return { level: "Niveau 5 🏆 Elite", intro: "Niveau compétitif." };
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
    } else if (score < lastScore) {
      evolution = "⚠️ Tu baisses un peu. Vérifie ta récupération.";
      recuperation = "🛌 Récupération conseillée : 36h.";
    } else {
      evolution = "😐 Tu es stable.";
    }

    const target = score < 6 ? score * 1.1 : score < 10 ? score * 1.07 : score * 1.03;
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

  return { evolution, objectif, recuperation, fatigue };
}

function genererBadges(globalScore, performances, progression) {
  let badges = [];

  const natation = performances.find(p => p.sport === "natation");
  const velo = performances.find(p => p.sport === "vélo");
  const course = performances.find(p => p.sport === "course");

  if (natation && natation.score >= 10) badges.push("🏊 Spécialiste natation");
  if (velo && velo.score >= 10) badges.push("🚴 Puissance vélo");
  if (course && course.score >= 10) badges.push("🏃 Rapide en course");
  if (globalScore >= 8) badges.push("🔥 Bon départ");
  if (globalScore >= 10) badges.push("💪 Score 10+");
  if (globalScore >= 15) badges.push("🏆 Elite Trilo");
  if (performances.length === 3) badges.push("🔱 Triathlète complet");
  if (progression.evolution.includes("progresses")) badges.push("📈 En progression");
  if (progression.fatigue) badges.push("🧘 Récupération nécessaire");
  if (badges.length === 0) badges.push("🌱 Premier pas Trilo");

  return badges;
}

function afficherBadges(badges) {
  const box = el("badgesList");
  if (!box) return;

  box.innerHTML = "";

  badges.forEach((badge) => {
    const div = document.createElement("div");
    div.className = "badge-item";
    div.innerText = badge;
    box.appendChild(div);
  });
}

function genererAnalyseIA(globalScore, sportFaible, sportFort, progression) {
  if (!isPremium) return "🔒 Coach IA réservé aux utilisateurs Trilo Premium.";

  let texte = "🤖 Coach IA Trilo\n\n";
  texte += "Score analysé : " + globalScore.toFixed(2) + "\n";
  texte += "💪 Point fort : " + sportFort.sport + "\n";
  texte += "⚠️ Point faible : " + sportFaible.sport + "\n\n";

  if (globalScore < 6) texte += "Tu es en construction. Priorité : régularité et technique.\n\n";
  else if (globalScore < 9) texte += "Tu progresses bien. Travaille ton point faible.\n\n";
  else if (globalScore < 12) texte += "Très bon niveau. Cherche plus de constance.\n\n";
  else if (globalScore < 15) texte += "Excellent rythme. Surveille la récupération.\n\n";
  else texte += "Niveau Elite détecté. Optimise les détails.\n\n";

  if (sportFaible.sport === "natation") texte += "Plan : 2 séances natation, technique + endurance.\n";
  else if (sportFaible.sport === "vélo") texte += "Plan : 2 sorties vélo, endurance + cadence.\n";
  else texte += "Plan : 2 séances course, endurance + allure stable.\n";

  texte += "\n" + progression.recuperation;

  if (progression.fatigue) texte += "\n" + progression.fatigue;

  return texte;
}

function mettreAJourDashboard(globalScore, performances) {
  if (!el("bestScore")) return;

  const sessions = data.length;
  const bestScore = Math.max(...data);
  const average = data.reduce((a, b) => a + b, 0) / data.length;

  const bestSport = [...performances].sort((a, b) => b.score - a.score)[0];

  el("bestScore").innerText = bestScore.toFixed(2);
  el("averageScore").innerText = average.toFixed(2);
  el("sessionCount").innerText = sessions;
  el("bestSport").innerText = bestSport ? bestSport.sport : "Aucun";
}

async function sauvegarderScoreCloud(score, performances, badges) {
  if (!currentUser) return;

  await addDoc(collection(db, "scores"), {
    uid: currentUser.uid,
    email: currentUser.email,
    score: Number(score),
    performances,
    badges,
    createdAt: serverTimestamp()
  });
}

async function chargerClassement() {
  const box = el("leaderboard");
  if (!box) return;

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
    const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(10));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      box.innerText = "Aucun score enregistré.";
      return;
    }

    let texte = "🏆 TOP TRILO\n\n";
    let rang = 1;

    snapshot.forEach((docItem) => {
      const item = docItem.data();
      texte += rang + ". " + (item.email || "Utilisateur") + " — " + Number(item.score || 0).toFixed(2) + "\n";
      rang++;
    });

    box.innerText = texte;
  } catch (error) {
    console.error(error);
    box.innerText = "Erreur chargement classement.";
  }
}

async function chargerComparaison(monScore) {
  const box = el("comparison");
  if (!box) return;

  if (!currentUser) {
    box.innerText = "🔐 Connecte-toi pour comparer tes performances.";
    return;
  }

  if (!isPremium) {
    box.innerText = "🔒 Fonction Premium : débloque la comparaison utilisateurs.";
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "scores"));
    let scores = [];

    snapshot.forEach((docItem) => {
      const item = docItem.data();
      if (typeof item.score === "number") scores.push(item.score);
    });

    if (scores.length === 0) {
      box.innerText = "Pas encore assez de données.";
      return;
    }

    const best = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const rank = scores.filter(s => s > monScore).length + 1;

    box.innerText =
      "Ton score : " + monScore.toFixed(2) +
      "\nMeilleur score : " + best.toFixed(2) +
      "\nMoyenne utilisateurs : " + avg.toFixed(2) +
      "\nTon rang approximatif : #" + rank + " sur " + scores.length;
  } catch (error) {
    console.error(error);
    box.innerText = "Erreur chargement comparaison.";
  }
}

async function chargerComparaisonAvancee(monScore, sportFort, sportFaible) {
  const box = el("advancedComparison");
  if (!box) return;

  if (!currentUser) {
    box.innerText = "🔐 Connecte-toi pour débloquer l’analyse avancée IA.";
    return;
  }

  if (!isPremium) {
    box.innerText = "🔒 Premium requis pour débloquer l’analyse avancée IA.";
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "scores"));
    let scores = [];

    snapshot.forEach((docItem) => {
      const item = docItem.data();
      if (typeof item.score === "number") scores.push(item.score);
    });

    if (scores.length === 0) {
      box.innerText = "Pas encore assez de données pour l’analyse IA.";
      return;
    }

    const betterThan = scores.filter(s => s < monScore).length;
    const percent = Math.round((betterThan / scores.length) * 100);
    const best = Math.max(...scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

    let niveau = "Débutant";
    if (monScore >= avg) niveau = "Intermédiaire";
    if (monScore >= avg * 1.2) niveau = "Avancé";
    if (monScore >= best * 0.9) niveau = "Elite";

    box.innerText =
      "🧠 Analyse avancée IA\n\n" +
      "Tu dépasses environ " + percent + "% des utilisateurs Trilo.\n" +
      "Ton niveau estimé : " + niveau + ".\n" +
      "Ton point fort dominant : " + sportFort.sport + ".\n" +
      "Ton axe prioritaire : " + sportFaible.sport + ".\n\n" +
      "Conseil IA : pour progresser plus vite, améliore ton point faible avant d’augmenter l’intensité globale.";
  } catch (error) {
    console.error(error);
    box.innerText = "Erreur analyse avancée IA.";
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
  if (!confirm("Supprimer l’historique Trilo ?")) return;

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  if (el("score")) el("score").innerText = "Aucun score";
  if (el("message")) el("message").innerText = "Historique supprimé.";
  if (el("badgesList")) el("badgesList").innerText = "Fais une analyse pour débloquer tes premiers badges.";
  if (el("aiAnalysis")) el("aiAnalysis").innerText = "Fais une analyse pour recevoir ton coaching IA.";
  if (el("bestScore")) el("bestScore").innerText = "0";
  if (el("averageScore")) el("averageScore").innerText = "0";
  if (el("sessionCount")) el("sessionCount").innerText = "0";
  if (el("bestSport")) el("bestSport").innerText = "Aucun";

  afficherEtatPremium();
  drawChart();
}

async function analyser() {
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

  if (sportFaible.sport === "natation") conseil = conseilAleatoire(conseilsNatation);
  else if (sportFaible.sport === "vélo") conseil = conseilAleatoire(conseilsVelo);
  else conseil = conseilAleatoire(conseilsCourse);

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

  if (el("score")) el("score").innerText = niveau.level;

  if (el("message")) {
    el("message").innerText =
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
      (currentUser ? "\n\n☁️ Score sauvegardé." : "\n\n🔐 Connecte-toi pour sauvegarder.");
  }

  if (el("aiAnalysis")) {
    el("aiAnalysis").innerText = genererAnalyseIA(globalScore, sportFaible, sportFort, progression);
  }

  await sauvegarderScoreCloud(globalScore, performances, badges);
  await chargerClassement();
  await chargerComparaison(globalScore);
  await chargerComparaisonAvancee(globalScore, sportFort, sportFaible);

  drawChart();
}

document.addEventListener("DOMContentLoaded", () => {
  if (el("signupBtn")) el("signupBtn").addEventListener("click", signup);
  if (el("loginBtn")) el("loginBtn").addEventListener("click", login);
  if (el("analyzeBtn")) el("analyzeBtn").addEventListener("click", analyser);
  if (el("resetBtn")) el("resetBtn").addEventListener("click", resetData);

  const premiumBtn = document.querySelector(".premium-btn");

  if (premiumBtn) {
    premiumBtn.addEventListener("click", () => {
      alert("🚀 Trilo Premium arrive bientôt. Paiement bientôt disponible.");
    });
  }

  drawChart();
  afficherEtatPremium();
});
