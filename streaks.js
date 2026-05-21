/* =========================
   MODULE STREAKS — TRILO
   Ajouter dans index.html :
   <script type="module" src="streaks.js"></script>
========================= */

function calculerStreak() {
  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
  if (sessions.length === 0) return { current: 0, best: 0, lastDate: null };

  // Extraire les dates uniques (1 par jour)
  const jours = [...new Set(
    sessions.map(s => s.date ? new Date(s.date).toDateString() : null).filter(Boolean)
  )].map(d => new Date(d)).sort((a, b) => b - a); // du plus récent au plus ancien

  if (jours.length === 0) return { current: 0, best: 0, lastDate: null };

  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastDay = new Date(jours[0]);
  lastDay.setHours(0, 0, 0, 0);

  // Le streak est actif seulement si la dernière séance est aujourd'hui ou hier
  const streakActif = lastDay >= yesterday;

  // Calculer le streak actuel
  let current = 0;
  if (streakActif) {
    current = 1;
    for (let i = 1; i < jours.length; i++) {
      const diff = Math.round((jours[i-1] - jours[i]) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // Calculer le meilleur streak
  let best = 1, tempStreak = 1;
  for (let i = 1; i < jours.length; i++) {
    const diff = Math.round((jours[i-1] - jours[i]) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      tempStreak++;
      if (tempStreak > best) best = tempStreak;
    } else {
      tempStreak = 1;
    }
  }
  if (current > best) best = current;

  return { current, best, lastDate: jours[0] };
}

function getStreakEmoji(streak) {
  if (streak === 0) return "😴";
  if (streak < 3)  return "🔥";
  if (streak < 7)  return "🔥🔥";
  if (streak < 14) return "🔥🔥🔥";
  if (streak < 30) return "⚡";
  return "🏆";
}

function getStreakMessage(streak, actif) {
  if (streak === 0) return "Commence ton streak aujourd'hui !";
  if (!actif)       return "Ton streak est cassé. Recommence !";
  if (streak === 1) return "C'est parti ! Reviens demain pour continuer.";
  if (streak < 3)   return "Bonne lancée ! Continue comme ça.";
  if (streak < 7)   return "Tu es en feu ! 🔥 Ne lâche pas.";
  if (streak < 14)  return "Une semaine de streak ! Impressionnant !";
  if (streak < 30)  return "2 semaines ! Tu es une machine ! 💪";
  return "Un mois de streak ! Tu es une légende Trilo ! 🏆";
}

function afficherStreak() {
  const zone = document.getElementById("streakZone");
  if (!zone) return;

  const { current, best, lastDate } = calculerStreak();

  const today     = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastDay = lastDate ? new Date(lastDate) : null;
  if (lastDay) lastDay.setHours(0, 0, 0, 0);
  const actif = lastDay && lastDay >= yesterday;

  const emoji   = getStreakEmoji(current);
  const message = getStreakMessage(current, actif);

  // Jours de la semaine
  const semaineHTML = genererSemaine();

  zone.innerHTML = `
    <div class="streak-main">
      <div class="streak-fire">${emoji}</div>
      <div class="streak-count">${current}</div>
      <div class="streak-label">jour${current > 1 ? "s" : ""} de streak</div>
    </div>
    <div class="streak-message">${message}</div>
    <div class="streak-semaine">${semaineHTML}</div>
    <div class="streak-best">🏅 Meilleur streak : <strong>${best} jour${best > 1 ? "s" : ""}</strong></div>
  `;
}

function genererSemaine() {
  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
  const joursAvecSeance = new Set(
    sessions.map(s => s.date ? new Date(s.date).toDateString() : null).filter(Boolean)
  );

  const jours = ["L", "M", "M", "J", "V", "S", "D"];
  const today  = new Date();
  today.setHours(0, 0, 0, 0);

  // Lundi de la semaine courante
  const lundi = new Date(today);
  const jourSemaine = today.getDay() === 0 ? 6 : today.getDay() - 1;
  lundi.setDate(today.getDate() - jourSemaine);

  let html = '<div class="streak-days">';
  for (let i = 0; i < 7; i++) {
    const jour = new Date(lundi);
    jour.setDate(lundi.getDate() + i);
    jour.setHours(0, 0, 0, 0);

    const estAujourdHui = jour.getTime() === today.getTime();
    const aSeance      = joursAvecSeance.has(jour.toDateString());
    const estFutur     = jour > today;

    let cls = "streak-day";
    if (aSeance)       cls += " streak-day-done";
    else if (estFutur) cls += " streak-day-future";
    else if (estAujourdHui && !aSeance) cls += " streak-day-today";
    else               cls += " streak-day-missed";

    html += `<div class="${cls}" title="${jour.toLocaleDateString("fr-FR")}">
      <span class="streak-day-label">${jours[i]}</span>
      <span class="streak-day-icon">${aSeance ? "✅" : estFutur ? "·" : estAujourdHui ? "⭕" : "✗"}</span>
    </div>`;
  }
  html += '</div>';
  return html;
}

// Rafraîchir après chaque séance
const _origSetItem2 = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  _origSetItem2(key, value);
  if (key === "triloSessions") afficherStreak();
};

window.addEventListener("DOMContentLoaded", () => {
  afficherStreak();
});
