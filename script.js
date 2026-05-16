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
    const value = Number(temps);
    return isNaN(value) ? 0 : value;
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
  "🏊 Conseil : travaille ta respiration bilatérale.",
  "🏊 Conseil : améliore ta glisse.",
  "🏊 Conseil : garde une nage régulière.",
  "🏊 Conseil : fais des séries longues.",
  "🏊 Conseil : évite de partir trop vite."
];

const conseilsVelo = [
  "🚴 Conseil : travaille ta cadence.",
  "🚴 Conseil : garde une vitesse régulière.",
  "🚴 Conseil : améliore ton endurance.",
  "🚴 Conseil : évite les gros à-coups.",
  "🚴 Conseil : travaille ta position."
];

const conseilsCourse = [
  "🏃 Conseil : travaille ton endurance fondamentale.",
  "🏃 Conseil : stabilise ton allure.",
  "🏃 Conseil : ajoute du fractionné léger.",
  "🏃 Conseil : améliore ta récupération.",
  "🏃 Conseil : garde une foulée relâchée."
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
  const leaderboard = el("leaderboard");
  const comparison = el("comparison");
  const advancedComparison = el("advancedComparison");

  if (!currentUser) {
    if (leaderboard) leaderboard.innerText = "🔐 Connecte-toi pour accéder au classement.";
    if (comparison) comparison.innerText = "🔐 Connecte-toi pour comparer tes performances.";
    if (advancedComparison) advancedComparison.innerText = "🔐 Connecte-toi pour débloquer l’analyse avancée IA.";
    return;
  }

  if (!isPremium) {
    if (leaderboard) leaderboard.innerText = "🔒 Fonction Premium : débloque le classement mondial.";
    if (comparison) comparison.innerText = "🔒 Fonction Premium : débloque la comparaison utilisateurs.";
    if (advancedComparison) advancedComparison.innerText = "🔒 Premium requis pour débloquer l’analyse avancée IA.";
    return;
  }

  if (leaderboard) leaderboard.innerText = "🏆 Analyse une séance pour charger le classement.";
  if (comparison) comparison.innerText = "⚔️ Analyse une séance pour comparer ton score.";
  if (advancedComparison) advancedComparison.innerText = "🧠 Analyse une séance pour recevoir la comparaison avancée IA.";
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

  if (count === 0) return null;

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
   
