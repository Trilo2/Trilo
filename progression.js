/* =========================
   CARTE DE PROGRESSION ANNUELLE — TRILO
   Grille style GitHub des jours d'entraînement
========================= */

function progLang() { return localStorage.getItem("triloLangue") || "fr"; }
function PL(fr, en) { return progLang() === "en" ? en : fr; }

function getProgSessions() {
  return JSON.parse(localStorage.getItem("triloSessions")) || [];
}

function afficherProgression() {
  const zone = document.getElementById("progressionZone");
  if (!zone) return;

  const sessions = getProgSessions();

  // Construire un set des jours d'entraînement (clé : YYYY-MM-DD)
  const joursEntraines = {};
  sessions.forEach(s => {
    if (s.date) {
      const jour = s.date.split("T")[0];
      joursEntraines[jour] = (joursEntraines[jour] || 0) + 1;
    }
  });

  // Générer les 365 derniers jours
  const aujourdhui = new Date();
  const jours = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(aujourdhui);
    d.setDate(aujourdhui.getDate() - i);
    const cle = d.toISOString().split("T")[0];
    jours.push({
      date: cle,
      count: joursEntraines[cle] || 0,
      jourSemaine: (d.getDay() + 6) % 7 // 0 = lundi
    });
  }

  // Organiser en semaines (colonnes)
  const semaines = [];
  let semaineActuelle = new Array(jours[0].jourSemaine).fill(null);
  jours.forEach(j => {
    semaineActuelle.push(j);
    if (semaineActuelle.length === 7) {
      semaines.push(semaineActuelle);
      semaineActuelle = [];
    }
  });
  if (semaineActuelle.length > 0) {
    while (semaineActuelle.length < 7) semaineActuelle.push(null);
    semaines.push(semaineActuelle);
  }

  // Statistiques
  const totalJours = Object.keys(joursEntraines).length;
  const totalSeances = sessions.length;

  // Niveau de couleur selon le nombre de séances ce jour-là
  function niveauCouleur(count) {
    if (count === 0) return "prog-niveau-0";
    if (count === 1) return "prog-niveau-1";
    if (count === 2) return "prog-niveau-2";
    return "prog-niveau-3";
  }

  // Construire la grille
  let html = `
    <div class="prog-stats">
      <div class="prog-stat">
        <span class="prog-stat-num">${totalJours}</span>
        <span class="prog-stat-label">${PL("jours actifs", "active days")}</span>
      </div>
      <div class="prog-stat">
        <span class="prog-stat-num">${totalSeances}</span>
        <span class="prog-stat-label">${PL("séances totales", "total sessions")}</span>
      </div>
    </div>
    <div class="prog-grille-wrapper">
      <div class="prog-grille">
  `;

  semaines.forEach(semaine => {
    html += `<div class="prog-colonne">`;
    semaine.forEach(jour => {
      if (jour === null) {
        html += `<div class="prog-case prog-vide"></div>`;
      } else {
        const dateAffichee = new Date(jour.date).toLocaleDateString(progLang() === "en" ? "en-US" : "fr-FR");
        const titre = jour.count === 0
          ? `${dateAffichee} — ${PL("repos", "rest")}`
          : `${dateAffichee} — ${jour.count} ${PL("séance(s)", "session(s)")}`;
        html += `<div class="prog-case ${niveauCouleur(jour.count)}" title="${titre}"></div>`;
      }
    });
    html += `</div>`;
  });

  html += `
      </div>
    </div>
    <div class="prog-legende">
      <span>${PL("Moins", "Less")}</span>
      <div class="prog-case prog-niveau-0"></div>
      <div class="prog-case prog-niveau-1"></div>
      <div class="prog-case prog-niveau-2"></div>
      <div class="prog-case prog-niveau-3"></div>
      <span>${PL("Plus", "More")}</span>
    </div>
  `;

  zone.innerHTML = html;
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => afficherProgression());
} else {
  afficherProgression();
}

window.rafraichirProgression = afficherProgression;
