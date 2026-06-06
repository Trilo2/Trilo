/* =========================
   MODULE PROFIL — TRILO
   Carte d'identité sportive de l'utilisateur
========================= */

const BADGES_PROFIL = [
  { id: "first",     emoji: "🎯", label: "Première séance",   desc: "Tu as fait ta première analyse",           check: s => s.length >= 1 },
  { id: "regular",   emoji: "🔥", label: "Régulier",          desc: "5 séances enregistrées",                   check: s => s.length >= 5 },
  { id: "addict",    emoji: "💎", label: "Accro",             desc: "15 séances enregistrées",                  check: s => s.length >= 15 },
  { id: "swimmer",   emoji: "🏊", label: "Nageur",            desc: "Une séance de natation",                   check: s => s.some(x => x.performances?.some(p => p.sport === "natation")) },
  { id: "cyclist",   emoji: "🚴", label: "Cycliste",          desc: "Une séance de vélo",                       check: s => s.some(x => x.performances?.some(p => p.sport === "vélo")) },
  { id: "runner",    emoji: "🏃", label: "Coureur",           desc: "Une séance de course",                     check: s => s.some(x => x.performances?.some(p => p.sport === "course")) },
  { id: "triathlete",emoji: "🏆", label: "Triathlète",        desc: "Les 3 sports dans une séance",             check: s => s.some(x => x.performances?.length >= 3) },
  { id: "beast",     emoji: "⚡", label: "Bête de course",    desc: "Un score supérieur à 60/100",              check: s => s.some(x => x.globalScore > 60) },
  { id: "elite",     emoji: "👑", label: "Élite",             desc: "Un score supérieur à 75/100",              check: s => s.some(x => x.globalScore > 75) }
];

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
    zone.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">⏳ Chargement...</div>`;
    setTimeout(afficherProfil, 400);
    return;
  }

  if (estConnecte !== true) {
    zone.innerHTML = `
      <div class="profil-locked">
        🔒 <strong>Connecte-toi pour voir ton profil</strong>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">Ton profil sportif est réservé aux membres Trilo.</p>
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
  const badgesObtenus = BADGES_PROFIL.filter(b => b.check(sessions));

  // Niveau basé sur le meilleur score
  let niveau = "Débutant", niveauEmoji = "🌱";
  if (meilleurScore >= 80)      { niveau = "Élite";     niveauEmoji = "👑"; }
  else if (meilleurScore >= 65) { niveau = "Expert";    niveauEmoji = "⚡"; }
  else if (meilleurScore >= 50) { niveau = "Très bon";  niveauEmoji = "💪"; }
  else if (meilleurScore >= 35) { niveau = "Bon";       niveauEmoji = "👍"; }
  else if (meilleurScore >= 20) { niveau = "Progrès";   niveauEmoji = "📈"; }

  zone.innerHTML = `
    <!-- Carte profil principale -->
    <div class="profil-hero">
      <div class="profil-avatar">${pseudo.charAt(0).toUpperCase()}</div>
      <div class="profil-info">
        <h2>${pseudo}</h2>
        <div class="profil-niveau">${niveauEmoji} ${niveau}</div>
      </div>
      <div class="profil-score-big">
        <span class="profil-score-num">${meilleurScore}</span>
        <span class="profil-score-label">meilleur score</span>
      </div>
    </div>

    <!-- Stats rapides -->
    <div class="profil-stats">
      <div class="profil-stat">
        <span class="profil-stat-num">${nbSeances}</span>
        <span class="profil-stat-label">Séances</span>
      </div>
      <div class="profil-stat">
        <span class="profil-stat-num">${scoreMoyen}</span>
        <span class="profil-stat-label">Score moyen</span>
      </div>
      <div class="profil-stat">
        <span class="profil-stat-num">${distanceTotale.toFixed(0)}</span>
        <span class="profil-stat-label">km parcourus</span>
      </div>
      <div class="profil-stat">
        <span class="profil-stat-num">${badgesObtenus.length}</span>
        <span class="profil-stat-label">Badges</span>
      </div>
    </div>

    <!-- Records par sport -->
    <h3 class="profil-section-titre">🏅 Mes meilleurs temps</h3>
    <div class="profil-records">
      <div class="profil-record profil-record-swim">
        <span class="profil-record-icon">🏊</span>
        <div class="profil-record-info">
          <strong>Natation</strong>
          ${bestSwim
            ? `<span>${formaterVitesse(bestSwim.speed, "natation")}</span><small>${bestSwim.distance}m</small>`
            : `<span class="profil-record-empty">Pas encore de séance</span>`}
        </div>
      </div>
      <div class="profil-record profil-record-bike">
        <span class="profil-record-icon">🚴</span>
        <div class="profil-record-info">
          <strong>Vélo</strong>
          ${bestBike
            ? `<span>${formaterVitesse(bestBike.speed, "vélo")}</span><small>${bestBike.distance}km</small>`
            : `<span class="profil-record-empty">Pas encore de séance</span>`}
        </div>
      </div>
      <div class="profil-record profil-record-run">
        <span class="profil-record-icon">🏃</span>
        <div class="profil-record-info">
          <strong>Course</strong>
          ${bestRun
            ? `<span>${formaterVitesse(bestRun.speed, "course")}</span><small>${bestRun.distance}km</small>`
            : `<span class="profil-record-empty">Pas encore de séance</span>`}
        </div>
      </div>
    </div>

    <!-- Badges -->
    <h3 class="profil-section-titre">🎖️ Mes badges (${badgesObtenus.length}/${BADGES_PROFIL.length})</h3>
    <div class="profil-badges">
      ${BADGES_PROFIL.map(b => {
        const obtenu = badgesObtenus.some(x => x.id === b.id);
        return `
          <div class="profil-badge ${obtenu ? "profil-badge-obtenu" : "profil-badge-verrouille"}" title="${b.desc}">
            <span class="profil-badge-emoji">${obtenu ? b.emoji : "🔒"}</span>
            <strong>${b.label}</strong>
            <small>${b.desc}</small>
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
