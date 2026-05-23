/* =========================
   MODULE HISTORIQUE — TRILO
   Ajouter dans index.html :
   <script type="module" src="historique.js"></script>
========================= */

function afficherHistorique() {
  const zone = document.getElementById("historiqueList");
  if (!zone) return;

  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];

  if (sessions.length === 0) {
    zone.innerHTML = `<p class="historique-empty">Aucune séance enregistrée. Fais ta première analyse !</p>`;
    return;
  }

  // Trier du plus récent au plus ancien
  const sorted = [...sessions].reverse();

  const MAX_VISIBLE = 5;
  const visible = sorted.slice(0, MAX_VISIBLE);
  const reste   = sorted.length - MAX_VISIBLE;

  zone.innerHTML = visible.map((s, i) => {
    const date = s.date
      ? new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
      : "Date inconnue";

    const score = parseFloat(s.globalScore).toFixed(0);
    const niveau = obtenirNiveauLabel(s.globalScore);

    const sports = (s.performances || []).map(p => {
      const vitesse = p.sport === "natation"
        ? `${p.speed?.toFixed(1)} m/min`
        : `${p.speed?.toFixed(1)} km/h`;
      const emoji = p.sport === "natation" ? "🏊" : p.sport === "vélo" ? "🚴" : "🏃";
      return `<span class="historique-sport">${emoji} ${p.sport} — ${vitesse} — ${p.score?.toFixed(0)}/100</span>`;
    }).join("");

    const scoreColor = s.globalScore >= 60 ? "#00d4ff" : s.globalScore >= 35 ? "#ffd700" : "#e2e8f0";

    return `
      <div class="historique-item">
        <div class="historique-header">
          <span class="historique-date">📅 ${date}</span>
          <span class="historique-score" style="color:${scoreColor};">${score}/100</span>
        </div>
        <div class="historique-niveau">${niveau}</div>
        <div class="historique-sports">${sports || "<span style='color:#7a8faa;'>Aucun détail disponible</span>"}</div>
        <button class="historique-delete-btn" data-index="${sessions.length - 1 - i}" title="Supprimer">🗑</button>
      </div>
    `;
  }).join("");

  // Bouton "Voir plus"
  if (reste > 0) {
    zone.innerHTML += `<button id="voirPlusBtn" class="voir-plus-btn">Voir ${reste} séance${reste > 1 ? "s" : ""} de plus ▾</button>`;
  }

  // Boutons supprimer
  // Event "Voir plus"
  document.getElementById("voirPlusBtn")?.addEventListener("click", () => {
    const allItems = sorted.slice(MAX_VISIBLE).map((s, i) => {
      const idx = sessions.length - 1 - (MAX_VISIBLE + i);
      const date = s.date
        ? new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })
        : "Date inconnue";
      const score = parseFloat(s.globalScore).toFixed(0);
      const niveau = obtenirNiveauLabel(s.globalScore);
      const sports = (s.performances || []).map(p => {
        const vitesse = p.sport === "natation" ? `${p.speed?.toFixed(1)} m/min` : `${p.speed?.toFixed(1)} km/h`;
        const emoji = p.sport === "natation" ? "🏊" : p.sport === "vélo" ? "🚴" : "🏃";
        return `<span class="historique-sport">${emoji} ${p.sport} — ${vitesse} — ${p.score?.toFixed(0)}/100</span>`;
      }).join("");
      const scoreColor = s.globalScore >= 60 ? "#00d4ff" : s.globalScore >= 35 ? "#ffd700" : "#e2e8f0";
      return `<div class="historique-item">
        <div class="historique-header">
          <span class="historique-date">📅 ${date}</span>
          <span class="historique-score" style="color:${scoreColor};">${score}/100</span>
        </div>
        <div class="historique-niveau">${niveau}</div>
        <div class="historique-sports">${sports || ""}</div>
        <button class="historique-delete-btn" data-index="${idx}" title="Supprimer">🗑</button>
      </div>`;
    }).join("");

    // Remplacer le bouton par les séances restantes
    const btn = document.getElementById("voirPlusBtn");
    if (btn) {
      btn.insertAdjacentHTML("beforebegin", allItems);
      btn.remove();
      // Rebind les boutons supprimer
      zone.querySelectorAll(".historique-delete-btn").forEach(b => {
        b.addEventListener("click", () => {
          const idx2 = parseInt(b.dataset.index);
          const s2 = JSON.parse(localStorage.getItem("triloSessions")) || [];
          s2.splice(idx2, 1);
          localStorage.setItem("triloSessions", JSON.stringify(s2));
          afficherHistorique();
        });
      });
    }
  });

  zone.querySelectorAll(".historique-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
      sessions.splice(idx, 1);
      localStorage.setItem("triloSessions", JSON.stringify(sessions));
      afficherHistorique();
      // Mettre à jour le dashboard si disponible
      if (typeof mettreAJourDashboard === "function") mettreAJourDashboard();
    });
  });
}

function obtenirNiveauLabel(score) {
  if (score < 20) return "Niveau 1 😐 Débutant";
  if (score < 35) return "Niveau 2 👍 En progrès";
  if (score < 50) return "Niveau 3 🔥 Bon niveau";
  if (score < 65) return "Niveau 4 💪 Très bon";
  if (score < 80) return "Niveau 5 🚀 Expert";
  return           "Niveau 6 🏆 Élite";
}

function viderHistorique() {
  if (!confirm("Supprimer tout l'historique ? Cette action est irréversible.")) return;
  localStorage.removeItem("triloSessions");
  // Vider aussi le tableau sessions en mémoire dans script.js
  if (window.sessions && Array.isArray(window.sessions)) {
    window.sessions.length = 0;
  }
  afficherHistorique();
  if (typeof mettreAJourDashboard === "function") mettreAJourDashboard();
  if (typeof mettreAJourGraphique === "function") mettreAJourGraphique();
}

// Rafraîchir l'historique après chaque analyse
// On observe les changements du localStorage
const _origSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  _origSetItem(key, value);
  if (key === "triloSessions") afficherHistorique();
};

window.addEventListener("DOMContentLoaded", () => {
  afficherHistorique();
  document.getElementById("viderHistoriqueBtn")?.addEventListener("click", viderHistorique);
});
