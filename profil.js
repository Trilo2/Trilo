/* =========================
   MODULE PROFIL — TRILO
   Carte d'identité sportive de l'utilisateur
========================= */

// Helper langue
function prLang() { return localStorage.getItem("triloLangue") || "fr"; }
function L(fr, en) { return prLang() === "en" ? en : fr; }

const BADGES_PROFIL = [
  // — Assiduité —
  { id: "first",     emoji: "🎯", label: "Première séance", labelEn: "First session", desc: "Ta première analyse", descEn: "Your first analysis", check: s => s.length >= 1 },
  { id: "regular",   emoji: "🔥", label: "Régulier", labelEn: "Regular", desc: "5 séances enregistrées", descEn: "5 sessions recorded", check: s => s.length >= 5 },
  { id: "addict",    emoji: "💎", label: "Accro", labelEn: "Addict", desc: "15 séances enregistrées", descEn: "15 sessions recorded", check: s => s.length >= 15 },
  { id: "machine",   emoji: "🤖", label: "Machine", labelEn: "Machine", desc: "30 séances enregistrées", descEn: "30 sessions recorded", check: s => s.length >= 30 },
  { id: "legend",    emoji: "🌟", label: "Légende", labelEn: "Legend", desc: "50 séances enregistrées", descEn: "50 sessions recorded", check: s => s.length >= 50 },

  // — Disciplines —
  { id: "swimmer",   emoji: "🏊", label: "Nageur", labelEn: "Swimmer", desc: "Une séance de natation", descEn: "One swimming session", check: s => s.some(x => x.performances?.some(p => p.sport === "natation")) },
  { id: "cyclist",   emoji: "🚴", label: "Cycliste", labelEn: "Cyclist", desc: "Une séance de vélo", descEn: "One cycling session", check: s => s.some(x => x.performances?.some(p => p.sport === "vélo")) },
  { id: "runner",    emoji: "🏃", label: "Coureur", labelEn: "Runner", desc: "Une séance de course", descEn: "One running session", check: s => s.some(x => x.performances?.some(p => p.sport === "course")) },
  { id: "triathlete",emoji: "🏆", label: "Triathlète", labelEn: "Triathlete", desc: "Les 3 sports dans une séance", descEn: "All 3 sports in one session", check: s => s.some(x => x.performances?.length >= 3) },

  // — Scores —
  { id: "score30",   emoji: "📈", label: "En progrès", labelEn: "Improving", desc: "Score supérieur à 30/100", descEn: "Score above 30/100", check: s => s.some(x => x.globalScore > 30) },
  { id: "score50",   emoji: "💪", label: "Confirmé", labelEn: "Confirmed", desc: "Score supérieur à 50/100", descEn: "Score above 50/100", check: s => s.some(x => x.globalScore > 50) },
  { id: "beast",     emoji: "⚡", label: "Bête de course", labelEn: "Beast", desc: "Score supérieur à 60/100", descEn: "Score above 60/100", check: s => s.some(x => x.globalScore > 60) },
  { id: "elite",     emoji: "👑", label: "Élite", labelEn: "Elite", desc: "Score supérieur à 75/100", descEn: "Score above 75/100", check: s => s.some(x => x.globalScore > 75) },
  { id: "perfect",   emoji: "🏅", label: "Quasi-parfait", labelEn: "Near perfect", desc: "Score supérieur à 90/100", descEn: "Score above 90/100", check: s => s.some(x => x.globalScore > 90) },

  // — Distances natation —
  { id: "swim1k",    emoji: "🌊", label: "1 km à la nage", labelEn: "1 km swim", desc: "1000m de natation en une fois", descEn: "1000m swim in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "natation" && p.distance >= 1000)) },
  { id: "swim2k",    emoji: "🐬", label: "Dauphin", labelEn: "Dolphin", desc: "2000m de natation en une fois", descEn: "2000m swim in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "natation" && p.distance >= 2000)) },

  // — Distances vélo —
  { id: "bike20",    emoji: "🚲", label: "20 km à vélo", labelEn: "20 km bike", desc: "20km de vélo en une fois", descEn: "20km bike in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "vélo" && p.distance >= 20)) },
  { id: "bike50",    emoji: "🚵", label: "Grimpeur", labelEn: "Climber", desc: "50km de vélo en une fois", descEn: "50km bike in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "vélo" && p.distance >= 50)) },
  { id: "bike100",   emoji: "🏔️", label: "Centurion", labelEn: "Centurion", desc: "100km de vélo en une fois", descEn: "100km bike in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "vélo" && p.distance >= 100)) },

  // — Distances course —
  { id: "run5",      emoji: "👟", label: "5 km", labelEn: "5 km", desc: "5km de course en une fois", descEn: "5km run in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "course" && p.distance >= 5)) },
  { id: "run10",     emoji: "🏃‍♂️", label: "10 km", labelEn: "10 km", desc: "10km de course en une fois", descEn: "10km run in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "course" && p.distance >= 10)) },
  { id: "runsemi",   emoji: "🥈", label: "Semi-marathon", labelEn: "Half-marathon", desc: "21km de course en une fois", descEn: "21km run in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "course" && p.distance >= 21)) },
  { id: "runmara",   emoji: "🥇", label: "Marathon", labelEn: "Marathon", desc: "42km de course en une fois", descEn: "42km run in one go", check: s => s.some(x => x.performances?.some(p => p.sport === "course" && p.distance >= 42)) },

  // — Spécial —
  { id: "complete",  emoji: "🎖️", label: "Collectionneur", labelEn: "Collector", desc: "Débloque 15 autres badges", descEn: "Unlock 15 other badges", check: s => false } // calculé à part
];

// Helpers pour afficher le bon label/desc selon la langue
function badgeLabel(b) { return prLang() === "en" ? b.labelEn : b.label; }
function badgeDesc(b)  { return prLang() === "en" ? b.descEn : b.desc; }

// Badge spécial : débloqué si 15 autres badges obtenus
function calculerBadges(sessions) {
  const obtenus = BADGES_PROFIL.filter(b => b.id !== "complete" && b.check(sessions));
  if (obtenus.length >= 15) {
    obtenus.push(BADGES_PROFIL.find(b => b.id === "complete"));
  }
  return obtenus;
}

function getSessions() {
  return JSON.parse(localStorage.getItem("triloSessions")) || [];
}

function formaterVitesse(speed, sport) {
  if (sport === "natation") return speed.toFixed(1) + " m/min";
  return speed.toFixed(1) + " km/h";
}

function getMeilleurePerf(sessions, sport) {
  let best = null;
  sessions.forEach(s => {
    s.performances?.forEach(p => {
      if (p.sport === sport && (!best || p.speed > best.speed)) {
        best = p;
      }
    });
  });
  return best;
}

function afficherProfil() {
  const zone = document.getElementById("profilZone");
  if (!zone) return;

  const estConnecte = window._triloUserConnected;
  if (estConnecte === undefined) {
    zone.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">⏳ ${L("Chargement...", "Loading...")}</div>`;
    setTimeout(afficherProfil, 400);
    return;
  }

  if (estConnecte !== true) {
    zone.innerHTML = `
      <div class="profil-locked">
        🔒 <strong>${L("Connecte-toi pour voir ton profil", "Log in to see your profile")}</strong>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">${L("Ton profil sportif est réservé aux membres Trilo.", "Your sports profile is reserved for Trilo members.")}</p>
      </div>
    `;
    return;
  }

  const sessions = getSessions();
  const pseudo = window._triloPseudo || "Triathlète";

  // Meilleures perfs par sport
  const bestSwim = getMeilleurePerf(sessions, "natation");
  const bestBike = getMeilleurePerf(sessions, "vélo");
  const bestRun  = getMeilleurePerf(sessions, "course");

  // Stats globales
  const nbSeances = sessions.length;
  const meilleurScore = sessions.length ? Math.max(...sessions.map(s => s.globalScore || 0)) : 0;
  const scoreMoyen = sessions.length
    ? (sessions.reduce((a, s) => a + (s.globalScore || 0), 0) / sessions.length).toFixed(0)
    : 0;

  // Distance totale
  let distanceTotale = 0;
  sessions.forEach(s => {
    s.performances?.forEach(p => {
      if (p.sport === "natation") distanceTotale += (p.distance || 0) / 1000;
      else distanceTotale += (p.distance || 0);
    });
  });

  // Badges
  const badgesObtenus = calculerBadges(sessions);

  // Niveau basé sur le meilleur score
  let niveau = L("Débutant", "Beginner"), niveauEmoji = "🌱";
  if (meilleurScore >= 80)      { niveau = L("Élite", "Elite");     niveauEmoji = "👑"; }
  else if (meilleurScore >= 65) { niveau = L("Expert", "Expert");    niveauEmoji = "⚡"; }
  else if (meilleurScore >= 50) { niveau = L("Très bon", "Very good");  niveauEmoji = "💪"; }
  else if (meilleurScore >= 35) { niveau = L("Bon", "Good");       niveauEmoji = "👍"; }
  else if (meilleurScore >= 20) { niveau = L("Progrès", "Progress");   niveauEmoji = "📈"; }

  // Tous les badges débloqués = statut LÉGENDE TRILO
  const tousLesBadges = badgesObtenus.length >= BADGES_PROFIL.length;

  // Sauvegarder le statut dans Firebase pour que les autres le voient
  if (window._triloSauverBadges && typeof window._triloSauverBadges === "function") {
    window._triloSauverBadges(badgesObtenus.length, tousLesBadges);
  }

  const banniereComplete = tousLesBadges ? `
    <div class="profil-complete-banner">
      <span class="profil-complete-icon">🏆</span>
      <div>
        <strong>${L("LÉGENDE TRILO", "TRILO LEGEND")}</strong>
        <p>${L("Tu as débloqué TOUS les badges ! Tu fais partie de l'élite Trilo. 🎉", "You've unlocked ALL badges! You're part of the Trilo elite. 🎉")}</p>
      </div>
    </div>
  ` : "";

  zone.innerHTML = `
    ${banniereComplete}
    <!-- Carte profil principale -->
    <div class="profil-hero">
      <div class="profil-avatar">${pseudo.charAt(0).toUpperCase()}</div>
      <div class="profil-info">
        <h2>${pseudo} ${tousLesBadges ? "🏆" : ""}</h2>
        <div class="profil-niveau">${niveauEmoji} ${niveau}</div>
      </div>
      <div class="profil-score-big">
        <span class="profil-score-num">${meilleurScore}</span>
        <span class="profil-score-label">${L("meilleur score", "best score")}</span>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="profil-stats">
      <div class="profil-stat">
        <span class="profil-stat-num">${nbSeances}</span>
        <span class="profil-stat-label">${L("Séances", "Sessions")}</span>
      </div>
      <div class="profil-stat">
        <span class="profil-stat-num">${scoreMoyen}</span>
        <span class="profil-stat-label">${L("Score moyen", "Avg score")}</span>
      </div>
      <div class="profil-stat">
        <span class="profil-stat-num">${distanceTotale.toFixed(0)}</span>
        <span class="profil-stat-label">${L("km parcourus", "km covered")}</span>
      </div>
      <div class="profil-stat">
        <span class="profil-stat-num">${badgesObtenus.length}</span>
        <span class="profil-stat-label">${L("Badges", "Badges")}</span>
      </div>
    </div>

    <!-- Records par sport -->
    <h3 class="profil-section-titre">🏅 ${L("Mes meilleurs temps", "My best times")}</h3>
    <div class="profil-records">
      <div class="profil-record profil-record-swim">
        <span class="profil-record-icon">🏊</span>
        <div class="profil-record-info">
          <strong>${L("Natation", "Swimming")}</strong>
          ${bestSwim
            ? `<span>${formaterVitesse(bestSwim.speed, "natation")}</span><small>${bestSwim.distance}m</small>`
            : `<span class="profil-record-empty">${L("Pas encore de séance", "No session yet")}</span>`}
        </div>
      </div>
      <div class="profil-record profil-record-bike">
        <span class="profil-record-icon">🚴</span>
        <div class="profil-record-info">
          <strong>${L("Vélo", "Cycling")}</strong>
          ${bestBike
            ? `<span>${formaterVitesse(bestBike.speed, "vélo")}</span><small>${bestBike.distance}km</small>`
            : `<span class="profil-record-empty">${L("Pas encore de séance", "No session yet")}</span>`}
        </div>
      </div>
      <div class="profil-record profil-record-run">
        <span class="profil-record-icon">🏃</span>
        <div class="profil-record-info">
          <strong>${L("Course", "Running")}</strong>
          ${bestRun
            ? `<span>${formaterVitesse(bestRun.speed, "course")}</span><small>${bestRun.distance}km</small>`
            : `<span class="profil-record-empty">${L("Pas encore de séance", "No session yet")}</span>`}
        </div>
      </div>
    </div>

    <!-- Badges -->
    <h3 class="profil-section-titre">🎖️ ${L("Mes badges", "My badges")} (${badgesObtenus.length}/${BADGES_PROFIL.length})</h3>
    <div class="profil-badges">
      ${BADGES_PROFIL.map(b => {
        const obtenu = badgesObtenus.some(x => x.id === b.id);
        return `
          <div class="profil-badge ${obtenu ? "profil-badge-obtenu" : "profil-badge-verrouille"}" title="${badgeDesc(b)}">
            <span class="profil-badge-emoji">${obtenu ? b.emoji : "🔒"}</span>
            <strong>${badgeLabel(b)}</strong>
            <small>${badgeDesc(b)}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => afficherProfil());
} else {
  afficherProfil();
}

window.rafraichirProfil = function() {
  afficherProfil();
};
