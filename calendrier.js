/* =========================
   MODULE CALENDRIER ENTRAÎNEMENT — TRILO
========================= */

// Programmes d'entraînement par discipline/niveau
const PROGRAMMES = {
  triathlon_xs: {
    label: "Triathlon XS",
    semaine: [
      { jour: "Lundi",    type: "repos",    libelle: "Repos" },
      { jour: "Mardi",    type: "natation", libelle: "🏊 Natation 30min", premium: "8×50m crawl + 4×100m allure modérée, récup 30s" },
      { jour: "Mercredi", type: "course",   libelle: "🏃 Course 30min",   premium: "Endurance 30min à 70% FCmax (allure conversationnelle)" },
      { jour: "Jeudi",    type: "repos",    libelle: "Repos" },
      { jour: "Vendredi", type: "vélo",     libelle: "🚴 Vélo 45min",     premium: "Sortie continue à 75% FCmax + 5×30s sprints" },
      { jour: "Samedi",   type: "brique",   libelle: "💪 Brique vélo+course", premium: "20min vélo + 10min course immédiate à allure de course" },
      { jour: "Dimanche", type: "natation", libelle: "🏊 Technique 20min", premium: "Éducatifs : battements, rattrapé, doigts traînés + 200m continu" }
    ]
  },
  triathlon_s: {
    label: "Triathlon Sprint",
    semaine: [
      { jour: "Lundi",    type: "repos",    libelle: "Repos" },
      { jour: "Mardi",    type: "natation", libelle: "🏊 Natation 45min", premium: "400m échauf + 10×100m allure cible (récup 20s) + 200m retour calme" },
      { jour: "Mercredi", type: "course",   libelle: "🏃 Fractionné 45min", premium: "15min échauf + 6×800m à allure 5km (récup 2min) + 10min retour" },
      { jour: "Jeudi",    type: "vélo",     libelle: "🚴 Vélo 1h",         premium: "1h endurance avec 5×3min en zone 4 (récup 3min)" },
      { jour: "Vendredi", type: "repos",    libelle: "Repos" },
      { jour: "Samedi",   type: "brique",   libelle: "💪 Brique 1h30",     premium: "1h vélo + 30min course en transition (T2 dans tes baskets)" },
      { jour: "Dimanche", type: "course",   libelle: "🏃 Sortie longue 1h", premium: "1h endurance 70% FCmax sur terrain varié" }
    ]
  },
  triathlon_m: {
    label: "Triathlon Olympique (M)",
    semaine: [
      { jour: "Lundi",    type: "repos",    libelle: "Repos / Étirements" },
      { jour: "Mardi",    type: "natation", libelle: "🏊 Natation 1h",     premium: "500m échauf + 15×100m allure tempo + 300m calme" },
      { jour: "Mercredi", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "20min échauf + 8×1km à allure 10km (récup 2min) + 10min retour" },
      { jour: "Jeudi",    type: "vélo",     libelle: "🚴 Vélo 1h30",       premium: "Endurance + 4×8min à seuil (récup 4min)" },
      { jour: "Vendredi", type: "natation", libelle: "🏊 Technique 45min", premium: "Travail spécifique virages, départs, plongeons" },
      { jour: "Samedi",   type: "brique",   libelle: "💪 Brique 2h",       premium: "1h30 vélo + 30min course rapide en transition" },
      { jour: "Dimanche", type: "course",   libelle: "🏃 Sortie longue 1h30", premium: "1h30 endurance avec 3×5min à allure tempo" }
    ]
  },
  triathlon_half: {
    label: "Half Ironman 70.3",
    semaine: [
      { jour: "Lundi",    type: "natation", libelle: "🏊 Natation 1h" },
      { jour: "Mardi",    type: "course",   libelle: "🏃 Tempo 1h15",      premium: "20min échauf + 40min à allure semi-marathon + 15min retour" },
      { jour: "Mercredi", type: "vélo",     libelle: "🚴 Intervalles 2h",  premium: "1h endurance + 5×10min à allure course + 30min retour" },
      { jour: "Jeudi",    type: "natation", libelle: "🏊 Endurance 1h"     },
      { jour: "Vendredi", type: "repos",    libelle: "Repos actif" },
      { jour: "Samedi",   type: "vélo",     libelle: "🚴 Sortie longue 3h", premium: "Endurance soutenue avec 2h en zone 2-3" },
      { jour: "Dimanche", type: "course",   libelle: "🏃 Longue 1h45",     premium: "1h45 à allure marathon avec ravitaillement" }
    ]
  },
  triathlon_ironman: {
    label: "Ironman",
    semaine: [
      { jour: "Lundi",    type: "natation", libelle: "🏊 Natation 1h30" },
      { jour: "Mardi",    type: "course",   libelle: "🏃 Tempo 1h30",      premium: "30min échauf + 50min seuil + 10min retour" },
      { jour: "Mercredi", type: "vélo",     libelle: "🚴 Intervalles 2h30", premium: "1h endurance + 4×15min à allure course + 45min retour" },
      { jour: "Jeudi",    type: "natation", libelle: "🏊 Endurance 1h30" },
      { jour: "Vendredi", type: "course",   libelle: "🏃 Récup 45min" },
      { jour: "Samedi",   type: "vélo",     libelle: "🚴 Très longue 5h",  premium: "Endurance soutenue + nutrition course (60-80g glucides/h)" },
      { jour: "Dimanche", type: "course",   libelle: "🏃 Longue 2h30",     premium: "Sortie longue avec dernier tiers à allure marathon" }
    ]
  },
  marathon: {
    label: "Marathon (42km)",
    semaine: [
      { jour: "Lundi",    type: "repos",    libelle: "Repos" },
      { jour: "Mardi",    type: "course",   libelle: "🏃 Footing 1h",      premium: "1h endurance fondamentale (70% FCmax)" },
      { jour: "Mercredi", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "15min échauf + 10×400m VMA (récup 1min) + 15min retour" },
      { jour: "Jeudi",    type: "course",   libelle: "🏃 Récup 45min" },
      { jour: "Vendredi", type: "repos",    libelle: "Repos" },
      { jour: "Samedi",   type: "course",   libelle: "🏃 Tempo 1h15",      premium: "20min échauf + 45min à allure marathon + 10min retour" },
      { jour: "Dimanche", type: "course",   libelle: "🏃 Longue 2h",       premium: "2h endurance avec dernière demi-heure à allure marathon" }
    ]
  },
  semi: {
    label: "Semi-Marathon (21km)",
    semaine: [
      { jour: "Lundi",    type: "repos",    libelle: "Repos" },
      { jour: "Mardi",    type: "course",   libelle: "🏃 Footing 45min",   premium: "45min endurance fondamentale" },
      { jour: "Mercredi", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "15min échauf + 6×1km à allure 10km + 10min retour" },
      { jour: "Jeudi",    type: "repos",    libelle: "Repos" },
      { jour: "Vendredi", type: "course",   libelle: "🏃 Tempo 45min",     premium: "10min échauf + 25min à allure semi + 10min retour" },
      { jour: "Samedi",   type: "repos",    libelle: "Repos / Étirements" },
      { jour: "Dimanche", type: "course",   libelle: "🏃 Longue 1h30",     premium: "1h30 endurance avec 20min à allure semi" }
    ]
  }
};

const TYPES_COULEURS = {
  natation: "#3b82f6",
  vélo:     "#10b981",
  course:   "#f59e0b",
  brique:   "#8b5cf6",
  repos:    "#4a6080"
};

function obtenirPlanning() {
  return JSON.parse(localStorage.getItem("triloPlanning")) || null;
}

function sauverPlanning(planning) {
  localStorage.setItem("triloPlanning", JSON.stringify(planning));
}

function supprimerPlanning() {
  localStorage.removeItem("triloPlanning");
}

function genererCalendrier(planning) {
  if (!planning) return [];

  const dateDebut = new Date(planning.dateDebut);
  const semaines = planning.semaines;
  const jourPlan = PROGRAMMES[planning.programme]?.semaine || [];

  const dates = [];
  for (let s = 0; s < semaines; s++) {
    for (let j = 0; j < 7; j++) {
      const date = new Date(dateDebut);
      date.setDate(dateDebut.getDate() + s * 7 + j);
      const seance = jourPlan[j] || jourPlan[(s * 7 + j) % 7];
      dates.push({
        date: date.toISOString().split("T")[0],
        seance: seance
      });
    }
  }
  return dates;
}

function afficherCalendrier() {
  const zone = document.getElementById("calendrierZone");
  if (!zone) return;

  const planning = obtenirPlanning();

  if (!planning) {
    // Formulaire de création
    zone.innerHTML = `
      <p class="cal-intro">Choisis ton objectif de course et Trilo te génère un plan d'entraînement semaine par semaine.</p>

      <div class="cal-form">
        <div class="cal-field">
          <label>Course visée</label>
          <select id="calProgramme">
            <option value="triathlon_xs">Triathlon XS (Découverte / Minimes)</option>
            <option value="triathlon_s">Triathlon Sprint (S)</option>
            <option value="triathlon_m" selected>Triathlon Olympique (M)</option>
            <option value="triathlon_half">Half Ironman 70.3</option>
            <option value="triathlon_ironman">Ironman</option>
            <option value="marathon">Marathon (42km)</option>
            <option value="semi">Semi-Marathon (21km)</option>
          </select>
        </div>

        <div class="cal-field">
          <label>Catégorie (facultatif)</label>
          <select id="calCategorie">
            <option value="">— Choisis ta catégorie —</option>
            <option value="Benjamins">Benjamins (12-13 ans)</option>
            <option value="Minimes">Minimes (14-15 ans)</option>
            <option value="Cadets">Cadets (16-17 ans)</option>
            <option value="Juniors">Juniors (18-19 ans)</option>
            <option value="Seniors">Seniors (20-39 ans)</option>
            <option value="Masters">Masters (40+ ans)</option>
          </select>
        </div>

        <div class="cal-field">
          <label>Durée du programme</label>
          <select id="calSemaines">
            <option value="4">4 semaines</option>
            <option value="8" selected>8 semaines</option>
            <option value="12">12 semaines (recommandé)</option>
            <option value="16">16 semaines</option>
          </select>
        </div>

        <button id="calCreateBtn" class="cal-create-btn">📅 Créer mon calendrier</button>
      </div>
    `;

    document.getElementById("calCreateBtn")?.addEventListener("click", () => {
      const programme = document.getElementById("calProgramme").value;
      const categorie = document.getElementById("calCategorie").value;
      const semaines  = parseInt(document.getElementById("calSemaines").value);

      const planning = {
        programme,
        categorie,
        semaines,
        dateDebut: new Date().toISOString(),
        moisAffiche: new Date().getMonth(),
        anneeAffichee: new Date().getFullYear()
      };

      sauverPlanning(planning);
      afficherCalendrier();
    });

    return;
  }

  // Affichage du calendrier
  const calendrier = genererCalendrier(planning);
  const isPremium = window._triloIsPremium === true;

  const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
                    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const jourNoms = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const mois  = planning.moisAffiche;
  const annee = planning.anneeAffichee;

  // Premier jour du mois
  const premierJour = new Date(annee, mois, 1);
  const dernierJour = new Date(annee, mois + 1, 0);
  const decalage = (premierJour.getDay() + 6) % 7; // Lundi = 0

  // Map des séances par date
  const seancesMap = {};
  calendrier.forEach(c => seancesMap[c.date] = c.seance);

  let html = `
    <div class="cal-header">
      <button id="calPrevBtn" class="cal-nav-btn">←</button>
      <h3>${moisNoms[mois]} ${annee}</h3>
      <button id="calNextBtn" class="cal-nav-btn">→</button>
    </div>

    <div class="cal-info-bar">
      <span><strong>${PROGRAMMES[planning.programme]?.label}</strong></span>
      ${planning.categorie ? `<span>Catégorie : ${planning.categorie}</span>` : ""}
      <span>${planning.semaines} semaines</span>
      <button id="calResetBtn" class="cal-reset-btn">🗑</button>
    </div>

    <div class="cal-grid">
      ${jourNoms.map(j => `<div class="cal-day-name">${j}</div>`).join("")}
  `;

  // Cases vides avant le 1er
  for (let i = 0; i < decalage; i++) {
    html += `<div class="cal-cell cal-empty"></div>`;
  }

  // Jours du mois
  for (let d = 1; d <= dernierJour.getDate(); d++) {
    const date = new Date(annee, mois, d);
    const dateStr = date.toISOString().split("T")[0];
    const seance = seancesMap[dateStr];
    const today = new Date().toISOString().split("T")[0];
    const isToday = dateStr === today;

    if (seance) {
      const color = TYPES_COULEURS[seance.type];
      const detail = isPremium && seance.premium
        ? `<div class="cal-cell-detail">${seance.premium}</div>`
        : seance.premium ? `<div class="cal-cell-locked">🔒</div>` : "";
      const reposClass = seance.type === "repos" ? "cal-cell-repos" : "";
      html += `
        <div class="cal-cell ${isToday ? "cal-today" : ""} ${reposClass}" style="border-left:3px solid ${color};">
          <div class="cal-cell-day">${d}</div>
          <div class="cal-cell-label">${seance.libelle}</div>
          ${detail}
        </div>
      `;
    } else {
      html += `<div class="cal-cell ${isToday ? "cal-today" : ""}"><div class="cal-cell-day">${d}</div></div>`;
    }
  }

  html += `</div>`;

  if (!isPremium) {
    html += `
      <div class="cal-premium-teaser">
        🔒 <strong>Trilo Premium</strong> : débloque les détails précis de chaque séance (séries, allures, récupération)
      </div>
    `;
  }

  zone.innerHTML = html;

  // Navigation mois
  document.getElementById("calPrevBtn")?.addEventListener("click", () => {
    const p = obtenirPlanning();
    p.moisAffiche--;
    if (p.moisAffiche < 0) { p.moisAffiche = 11; p.anneeAffichee--; }
    sauverPlanning(p);
    afficherCalendrier();
  });

  document.getElementById("calNextBtn")?.addEventListener("click", () => {
    const p = obtenirPlanning();
    p.moisAffiche++;
    if (p.moisAffiche > 11) { p.moisAffiche = 0; p.anneeAffichee++; }
    sauverPlanning(p);
    afficherCalendrier();
  });

  document.getElementById("calResetBtn")?.addEventListener("click", () => {
    if (confirm("Supprimer ton calendrier d'entraînement ?")) {
      supprimerPlanning();
      afficherCalendrier();
    }
  });
}

// Rafraîchir si premium change
window.addEventListener("DOMContentLoaded", () => {
  afficherCalendrier();
});

window.rafraichirCalendrier = afficherCalendrier;
