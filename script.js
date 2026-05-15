import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");

const analyzeBtn = document.getElementById("analyzeBtn");

const scoreText = document.getElementById("score");
const messageText = document.getElementById("message");

signupBtn.addEventListener("click", async () => {

  const email = emailInput.value;
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Entre un email et un mot de passe");
    return;
  }

  try {

    await createUserWithEmailAndPassword(auth, email, password);

    alert("Compte créé avec succès 🔥");

  } catch (error) {

    alert(error.message);

  }

});

loginBtn.addEventListener("click", async () => {

  const email = emailInput.value;
  const password = passwordInput.value;

  try {

    await signInWithEmailAndPassword(auth, email, password);

    alert("Connexion réussie 🚀");

  } catch (error) {

    alert(error.message);

  }

});

onAuthStateChanged(auth, (user) => {

  if (user) {

    console.log("Utilisateur connecté :", user.email);

  }

});

function convertToSeconds(timeString) {

  const parts = timeString.split(":");

  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0]);
  const seconds = parseInt(parts[1]);

  return (minutes * 60) + seconds;

}

analyzeBtn.addEventListener("click", async () => {

  const user = auth.currentUser;

  if (!user) {

    alert("Connecte-toi d'abord");
    return;

  }

  const swimDist = parseFloat(document.getElementById("swimDist").value) || 0;
  const bikeDist = parseFloat(document.getElementById("bikeDist").value) || 0;
  const runDist = parseFloat(document.getElementById("runDist").value) || 0;

  const swimTime = convertToSeconds(document.getElementById("swimTime").value);
  const bikeTime = convertToSeconds(document.getElementById("bikeTime").value);
  const runTime = convertToSeconds(document.getElementById("runTime").value);

  let score = 0;

  if (swimTime > 0) {
    score += swimDist / swimTime * 1000;
  }

  if (bikeTime > 0) {
    score += bikeDist / bikeTime * 5000;
  }

  if (runTime > 0) {
    score += runDist / runTime * 8000;
  }

  score = Math.round(score);

  scoreText.innerText = score + " points";

  if (score < 500) {

    messageText.innerText = "Débutant 🟢";

  } else if (score < 1500) {

    messageText.innerText = "Intermédiaire 🔵";

  } else {

    messageText.innerText = "Elite 🔥";

  }

  try {

    await addDoc(collection(db, "scores"), {

      user: user.email,
      score: score,

      swimDistance: swimDist,
      bikeDistance: bikeDist,
      runDistance: runDist,

      createdAt: new Date()

    });

    console.log("Score sauvegardé");

  } catch (error) {

    console.error(error);

  }

});

async function loadLeaderboard() {

  const q = query(
    collection(db, "scores"),
    orderBy("score", "desc"),
    limit(10)
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {

    console.log(doc.data());

  });

}

loadLeaderboard();
