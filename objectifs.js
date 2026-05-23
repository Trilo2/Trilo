/* =========================
   MODULE OBJECTIFS — TRILO
   L'utilisateur définit un objectif, Trilo l'aide à l'atteindre
========================= */

function obtenirObjectif() {
  return JSON.parse(localStorage.getItem("triloObjectif")) || null;
}

function sauverObjectif(obj) {
  localStorage.setItem("triloObjectif", JSON.stringify(obj));
}

function supprimerObjectif() {
  localStorage.removeItem("triloObjectif");
}

function formaterTemps(minutes) {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  const s = Math.round((minutes - Math.floor(minutes)) * 60);
  if (h > 0) return `${h}h${m.toString().padStart(2,"0")}min`;
  if (s > 0) return `${m}min${s.toString().padStart(2,"0")}s`;
  return `${m}min`;
}

function formaterAllure(minParKm) {
  const m = Math.floor(minParKm);
  const s = Math.round((minParKm - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

function getMeilleureSession(sport) {
  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
  let meilleure = null;
  sessions.forEach(s => {
    s.performances?.forEach(p => {
      if (p.sport === sport && (!meilleure || p.speed > meilleure.speed)) {
        meilleure = p;
      }
    });
  });
  return meilleure;
}

function genererPlanEntrainement(sport, ecart) {
  // ecart = % entre allure actuelle et cible (négatif = il faut accélérer)
  const plans = {
    natation: {
      facile: [
        "🏊 2 séances/semaine de 30min en endurance",
        "🏊 Travaille la technique : 8×50m éducatifs + 4×100m allure cible"
      ],
      moyen: [
        "🏊 3 séances/semaine : 1 endurance, 1 fractionné, 1 technique",
        "🏊 Fractionné : 10×100m à ton allure cible, 30s récup",
        "🏊 Sortie longue : 1500m continu"
      ],
      difficile: [
        "🏊 4-5 séances/semaine intensives",
        "🏊 Travail spécifique : 20×100m allure cible",
        "🏊 Préparation mentale et stratégie de course indispensables",
        "🏊 Considère un coach pour optimiser ta technique"
      ]
    },
    "vélo": {
      facile: [
        "🚴 2 sorties/semaine de 1h en endurance",
        "🚴 Une sortie longue le weekend (1h30-2h)"
      ],
      moyen: [
        "🚴 3 sorties/semaine : endurance + intervalles + longue",
        "🚴 Intervalles : 5×5min à allure cible, 3min récup",
        "🚴 Sortie longue : 2h-2h30 à 70% FCmax"
      ],
      difficile: [
        "🚴 4-5 sorties/semaine avec travail spécifique",
        "🚴 PMA : 8×2min à puissance maximale",
        "🚴 Sortie longue : 3h+ avec accélérations",
        "🚴 Travail de l'aérodynamique et nutrition course"
      ]
    },
    course: {
      facile: [
        "🏃 3 sorties/semaine de 30-45min en endurance",
        "🏃 Une sortie longue de 1h le weekend"
      ],
      moyen: [
        "🏃 4 séances/semaine : 2 endurance, 1 fractionné, 1 longue",
        "🏃 Fractionné : 6×800m à ton allure cible, 2min récup",
        "🏃 Sortie longue : 1h30 à allure facile"
      ],
      difficile: [
        "🏃 5-6 séances/semaine avec gros volume",
        "🏃 VMA : 10×400m à 95% VMA",
        "🏃 Seuil : 3×10min à allure semi-marathon",
        "🏃 Sortie longue : 2h+ avec changements d'allure"
      ]
    }
  };

  let niveau;
  if (ecart >= -10) niveau = "facile";
  else if (ecart >= -25) niveau = "moyen";
  else niveau = "difficile";

  return plans[sport]?.[niveau] || [];
}

function calculerObjectif(obj) {
  const { sport, distance, tempsMin } = obj;

  // Vitesse cible
  let vitesseCible;
  if (sport === "natation") {
    vitesseCible = distance / tempsMin; // m/min
  } else {
    vitesseCible = distance / (tempsMin / 60); // km/h
  }

  // Allure cible
  const allureCible = tempsMin / distance; // min/km ou min/m

  // Meilleure session existante
  const meilleure = getMeilleureSession(sport);

  let pctProgression = 0;
  let ecart = 0;
  let statut = "non-evalue";

  if (meilleure) {
    pctProgression = Math.min(100, Math.round((meilleure.speed / vitesseCible) * 100));
    ecart = Math.round(((meilleure.speed - vitesseCible) / vitesseCible) * 100);
    if (meilleure.speed >= vitesseCible) statut = "atteint";
    else if (pctProgression >= 90) statut = "proche";
    else if (pctProgression >= 70) statut = "bon-debut";
    else statut = "loin";
  }

  return {
    vitesseCible,
    allureCible,
    meilleure,
    pctProgression,
    ecart,
    statut,
    plan: genererPlanEntrainement(sport, ecart)
  };
}

function afficherObjectif() {
  const zone = document.getElementById("objectifZone");
  if (!zone) return;

  const obj = obtenirObjectif();

  if (!obj) {
    // Pas d'objectif défini
    zone.innerHTML = `
      <div class="objectif-form">
        <p class="objectif-intro">Définis un objectif et Trilo t'aide à l'atteindre avec un plan personnalisé.</p>
        <div class="objectif-fields">
          <select id="objSport">
            <option value="course">🏃 Course à pied</option>
            <option value="vélo">🚴 Vélo</option>
            <option value="natation">🏊 Natation</option>
          </select>
          <input id="objDistance" type="number" placeholder="Distance" step="0.1">
          <span id="objUnite" style="color:var(--text-muted);align-self:center;">km</span>
          <input id="objTemps" type="text" placeholder="Temps (ex: 50:00)">
        </div>
        <button id="objSaveBtn" class="objectif-save-btn">🎯 Définir mon objectif</button>
      </div>
    `;

    document.getElementById("objSport")?.addEventListener("change", (e) => {
      const unite = document.getElementById("objUnite");
      if (unite) unite.textContent = e.target.value === "natation" ? "m" : "km";
    });

    document.getElementById("objSaveBtn")?.addEventListener("click", () => {
      const sport    = document.getElementById("objSport").value;
      const distance = parseFloat(document.getElementById("objDistance").value);
      const tempsStr = document.getElementById("objTemps").value;

      if (!distance || distance <= 0) return alert("Entre une distance valide !");
      if (!tempsStr) return alert("Entre un temps !");

      // Convertir temps en minutes
      const parts = tempsStr.split(":");
      let tempsMin = 0;
      if (parts.length === 2) tempsMin = Number(parts[0]) + Number(parts[1])/60;
      else if (parts.length === 3) tempsMin = Number(parts[0])*60 + Number(parts[1]) + Number(parts[2])/60;
      else return alert("Format temps invalide ! Ex: 50:00 ou 1:30:00");

      if (tempsMin <= 0) return alert("Temps invalide !");

      sauverObjectif({ sport, distance, tempsMin, dateDebut: new Date().toISOString() });
      afficherObjectif();
    });

    return;
  }

  // Objectif défini : afficher le suivi
  const calc = calculerObjectif(obj);
  const { sport, distance, tempsMin } = obj;
  const unite = sport === "natation" ? "m" : "km";
  const sportEmoji = sport === "natation" ? "🏊" : sport === "vélo" ? "🚴" : "🏃";
  const sportLabel = sport === "natation" ? "Natation" : sport === "vélo" ? "Vélo" : "Course à pied";

  // Couleur selon statut
  const colors = {
    "atteint":    "#10b981",
    "proche":     "#00d4ff",
    "bon-debut":  "#f59e0b",
    "loin":       "#ef4444",
    "non-evalue": "#4a6080"
  };
  const couleur = colors[calc.statut];

  // Message statut
  const messages = {
    "atteint":    "🎉 Bravo ! Tu as atteint ton objectif !",
    "proche":     "💪 Tu y es presque ! Encore un effort !",
    "bon-debut":  "👍 Bon début, continue à progresser !",
    "loin":       "🔥 Le chemin est long mais c'est faisable !",
    "non-evalue": "📊 Fais une analyse pour voir ta progression"
  };

  zone.innerHTML = `
    <div class="objectif-active">
      <div class="objectif-cible">
        <span class="objectif-sport-emoji">${sportEmoji}</span>
        <div>
          <h3>${sportLabel}</h3>
          <p>${distance} ${unite} en ${formaterTemps(tempsMin)}</p>
        </div>
        <button id="objDeleteBtn" class="objectif-delete-btn" title="Supprimer">🗑</button>
      </div>

      <div class="objectif-stats">
        <div class="objectif-stat">
          <strong>Vitesse cible</strong>
          <span>${sport === "natation" ? calc.vitesseCible.toFixed(1) + " m/min" : calc.vitesseCible.toFixed(1) + " km/h"}</span>
        </div>
        ${sport !== "natation" ? `
        <div class="objectif-stat">
          <strong>Allure cible</strong>
          <span>${formaterAllure(calc.allureCible)}</span>
        </div>
        ` : ""}
        <div class="objectif-stat">
          <strong>Ton meilleur</strong>
          <span>${calc.meilleure ? (sport === "natation" ? calc.meilleure.speed.toFixed(1) + " m/min" : calc.meilleure.speed.toFixed(1) + " km/h") : "--"}</span>
        </div>
      </div>

      <div class="objectif-progress-zone">
        <div class="objectif-progress-bar">
          <div class="objectif-progress-fill" style="width:${calc.pctProgression}%;background:${couleur};"></div>
        </div>
        <p class="objectif-progress-text" style="color:${couleur};">
          <strong>${calc.pctProgression}%</strong> de l'objectif — ${messages[calc.statut]}
        </p>
      </div>

      <div class="objectif-plan">
        <h4>📅 Plan d'entraînement recommandé</h4>
        <ul>
          ${calc.plan.map(item => `<li>${item}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;

  document.getElementById("objDeleteBtn")?.addEventListener("click", () => {
    if (confirm("Supprimer ton objectif ?")) {
      supprimerObjectif();
      afficherObjectif();
    }
  });
}

// Rafraîchir après chaque analyse
const _origSetItemObj = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  _origSetItemObj(key, value);
  if (key === "triloSessions") afficherObjectif();
};

window.addEventListener("DOMContentLoaded", () => {
  afficherObjectif();
});
