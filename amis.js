/* =========================
   MODULE AMIS — TRILO
   Ajouter des amis + classement privé
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, setDoc, query, where, updateDoc, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBTv3F1ukSvaoD340ABx6CLjjQ0pHBs7q8",
  authDomain: "trilo-88a88.firebaseapp.com",
  projectId: "trilo-88a88",
  storageBucket: "trilo-88a88.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  afficherAmis();
});

// Trouver un utilisateur par pseudo
async function trouverParPseudo(pseudo) {
  const q = query(collection(db, "users"), where("pseudo", "==", pseudo));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const docu = snap.docs[0];
  return { uid: docu.id, ...docu.data() };
}

// Ajouter un ami
async function ajouterAmi(pseudo) {
  if (!currentUser) return alert("Connecte-toi d'abord !");
  if (!pseudo) return alert("Entre un pseudo !");

  // Trouver l'ami
  const ami = await trouverParPseudo(pseudo);
  if (!ami) return alert("Aucun utilisateur avec ce pseudo.");
  if (ami.uid === currentUser.uid) return alert("Tu ne peux pas t'ajouter toi-même !");

  // Ajouter dans ma liste d'amis
  const refMoi = doc(db, "users", currentUser.uid);
  await updateDoc(refMoi, {
    amis: arrayUnion(ami.uid)
  });

  alert(`✅ ${pseudo} ajouté à tes amis !`);
  afficherAmis();
}

// Retirer un ami
async function retirerAmi(uid) {
  if (!currentUser) return;
  if (!confirm("Retirer cet ami ?")) return;
  const refMoi = doc(db, "users", currentUser.uid);
  await updateDoc(refMoi, {
    amis: arrayRemove(uid)
  });
  afficherAmis();
}
window._triloRetirerAmi = retirerAmi;

// Afficher la section amis
async function afficherAmis() {
  const zone = document.getElementById("amisZone");
  if (!zone) return;

  if (!currentUser) {
    zone.innerHTML = `
      <div class="amis-locked">
        🔒 <strong>Connecte-toi pour ajouter des amis</strong>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">Compare-toi à tes amis dans un classement privé !</p>
      </div>
    `;
    return;
  }

  // Charger mon profil pour avoir ma liste d'amis
  let mesAmis = [];
  try {
    const moi = await getDoc(doc(db, "users", currentUser.uid));
    mesAmis = moi.exists() ? (moi.data().amis || []) : [];
  } catch(e) {}

  // Formulaire d'ajout
  let html = `
    <div class="amis-ajout">
      <input id="amiPseudo" type="text" placeholder="Pseudo de ton ami..." maxlength="20">
      <button id="amiAjoutBtn" type="button">➕ Ajouter</button>
    </div>
  `;

  if (mesAmis.length === 0) {
    html += `<p class="amis-vide">Tu n'as pas encore d'amis sur Trilo. Ajoute-les par leur pseudo ! 👆</p>`;
    zone.innerHTML = html;
    document.getElementById("amiAjoutBtn")?.addEventListener("click", () => {
      ajouterAmi(document.getElementById("amiPseudo").value.trim());
    });
    return;
  }

  // Charger les scores de mes amis + moi pour le classement privé
  const participants = [];

  // Moi
  try {
    const monScore = await getDoc(doc(db, "scores", currentUser.uid));
    const monProfil = await getDoc(doc(db, "users", currentUser.uid));
    participants.push({
      uid: currentUser.uid,
      pseudo: monProfil.exists() ? (monProfil.data().pseudo || "Moi") : "Moi",
      score: monScore.exists() ? (monScore.data().globalScore || 0) : 0,
      estLegende: monScore.exists() ? monScore.data().estLegende : false,
      moi: true
    });
  } catch(e) {}

  // Mes amis
  for (const amiUid of mesAmis) {
    try {
      const amiScore = await getDoc(doc(db, "scores", amiUid));
      const amiProfil = await getDoc(doc(db, "users", amiUid));
      participants.push({
        uid: amiUid,
        pseudo: amiProfil.exists() ? (amiProfil.data().pseudo || "Ami") : "Ami",
        score: amiScore.exists() ? (amiScore.data().globalScore || 0) : 0,
        estLegende: amiScore.exists() ? amiScore.data().estLegende : false,
        moi: false
      });
    } catch(e) {}
  }

  // Trier par score décroissant
  participants.sort((a, b) => b.score - a.score);

  // Classement privé
  html += `<h3 class="amis-section-titre">🏆 Classement entre amis</h3>`;
  html += `<ol class="amis-classement">`;
  participants.forEach((p, i) => {
    const medaille = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
    const legende = p.estLegende ? " 🏆" : "";
    html += `
      <li class="amis-rang ${p.moi ? "amis-moi" : ""}">
        <span class="amis-medaille">${medaille}</span>
        <span class="amis-nom">${p.pseudo}${legende}${p.moi ? " (toi)" : ""}</span>
        <span class="amis-score">${p.score.toFixed(0)}/100</span>
        ${!p.moi ? `<button class="amis-retirer" onclick="window._triloRetirerAmi('${p.uid}')" title="Retirer">✕</button>` : ""}
      </li>
    `;
  });
  html += `</ol>`;

  zone.innerHTML = html;

  document.getElementById("amiAjoutBtn")?.addEventListener("click", () => {
    ajouterAmi(document.getElementById("amiPseudo").value.trim());
  });
}

window.rafraichirAmis = afficherAmis;
