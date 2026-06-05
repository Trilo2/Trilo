/* =========================
   MODULE OBJECTIF + CALENDRIER COMBINÉ — TRILO
========================= */

// Programmes d'entraînement par type de course
const PROGRAMMES = {
  triathlon_xs: {
    label: "Triathlon XS (Découverte)",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "natation", libelle: "🏊 Natation 30min", premium: "8×50m crawl + 4×100m allure modérée" },
      { jour: "Mer", type: "course",   libelle: "🏃 Course 30min",   premium: "Endurance 30min à 70% FCmax" },
      { jour: "Jeu", type: "repos",    libelle: "Repos" },
      { jour: "Ven", type: "vélo",     libelle: "🚴 Vélo 45min",     premium: "75% FCmax + 5×30s sprints" },
      { jour: "Sam", type: "brique",   libelle: "💪 Brique 30min",   premium: "20min vélo + 10min course" },
      { jour: "Dim", type: "natation", libelle: "🏊 Technique 20min", premium: "Éducatifs + 200m continu" }
    ]
  },
  triathlon_s: {
    label: "Triathlon Sprint (S)",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "natation", libelle: "🏊 Natation 45min", premium: "400m échauf + 10×100m allure cible (récup 20s)" },
      { jour: "Mer", type: "course",   libelle: "🏃 Fractionné 45min", premium: "15min échauf + 6×800m allure 5km (récup 2min)" },
      { jour: "Jeu", type: "vélo",     libelle: "🚴 Vélo 1h",         premium: "1h endurance + 5×3min zone 4 (récup 3min)" },
      { jour: "Ven", type: "repos",    libelle: "Repos" },
      { jour: "Sam", type: "brique",   libelle: "💪 Brique 1h30",     premium: "1h vélo + 30min course en transition" },
      { jour: "Dim", type: "course",   libelle: "🏃 Sortie longue 1h", premium: "1h endurance 70% FCmax" }
    ]
  },
  triathlon_m: {
    label: "Triathlon Olympique (M)",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos / Étirements" },
      { jour: "Mar", type: "natation", libelle: "🏊 Natation 1h",     premium: "500m échauf + 15×100m allure tempo + 300m calme" },
      { jour: "Mer", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "20min échauf + 8×1km allure 10km (récup 2min)" },
      { jour: "Jeu", type: "vélo",     libelle: "🚴 Vélo 1h30",       premium: "Endurance + 4×8min à seuil (récup 4min)" },
      { jour: "Ven", type: "natation", libelle: "🏊 Technique 45min", premium: "Virages, départs, plongeons" },
      { jour: "Sam", type: "brique",   libelle: "💪 Brique 2h",       premium: "1h30 vélo + 30min course rapide" },
      { jour: "Dim", type: "course",   libelle: "🏃 Longue 1h30",     premium: "1h30 endurance + 3×5min allure tempo" }
    ]
  },
  triathlon_half: {
    label: "Half Ironman 70.3",
    semaine: [
      { jour: "Lun", type: "natation", libelle: "🏊 Natation 1h" },
      { jour: "Mar", type: "course",   libelle: "🏃 Tempo 1h15",      premium: "20min échauf + 40min allure semi + 15min retour" },
      { jour: "Mer", type: "vélo",     libelle: "🚴 Intervalles 2h",  premium: "1h endurance + 5×10min allure course + 30min" },
      { jour: "Jeu", type: "natation", libelle: "🏊 Endurance 1h"     },
      { jour: "Ven", type: "repos",    libelle: "Repos actif" },
      { jour: "Sam", type: "vélo",     libelle: "🚴 Sortie longue 3h", premium: "Endurance soutenue 2h en zone 2-3" },
      { jour: "Dim", type: "course",   libelle: "🏃 Longue 1h45",     premium: "1h45 allure marathon + ravitaillement" }
    ]
  },
  triathlon_ironman: {
    label: "Ironman",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "course",   libelle: "🏃 Tempo 1h30",      premium: "30min échauf + 50min seuil + 10min retour" },
      { jour: "Mer", type: "vélo",     libelle: "🚴 Intervalles 2h30", premium: "1h endurance + 4×15min allure course" },
      { jour: "Jeu", type: "natation", libelle: "🏊 Endurance 1h30" },
      { jour: "Ven", type: "repos",    libelle: "Repos actif" },
      { jour: "Sam", type: "vélo",     libelle: "🚴 Très longue 5h",  premium: "Endurance + nutrition (60-80g glucides/h)" },
      { jour: "Dim", type: "course",   libelle: "🏃 Longue 2h30",     premium: "Sortie longue + dernier tiers à allure marathon" }
    ]
  },
  marathon: {
    label: "Marathon (42km)",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "course",   libelle: "🏃 Footing 1h",      premium: "1h endurance fondamentale (70% FCmax)" },
      { jour: "Mer", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "15min échauf + 10×400m VMA (récup 1min)" },
      { jour: "Jeu", type: "course",   libelle: "🏃 Récup 45min" },
      { jour: "Ven", type: "repos",    libelle: "Repos" },
      { jour: "Sam", type: "course",   libelle: "🏃 Tempo 1h15",      premium: "20min échauf + 45min allure marathon + 10min" },
      { jour: "Dim", type: "course",   libelle: "🏃 Longue 2h",       premium: "2h endurance + dernière demi-heure à allure marathon" }
    ]
  },
  semi: {
    label: "Semi-Marathon (21km)",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "course",   libelle: "🏃 Footing 45min",   premium: "45min endurance fondamentale" },
      { jour: "Mer", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "15min échauf + 6×1km allure 10km" },
      { jour: "Jeu", type: "repos",    libelle: "Repos" },
      { jour: "Ven", type: "course",   libelle: "🏃 Tempo 45min",     premium: "10min échauf + 25min allure semi" },
      { jour: "Sam", type: "repos",    libelle: "Repos / Étirements" },
      { jour: "Dim", type: "course",   libelle: "🏃 Longue 1h30",     premium: "1h30 endurance + 20min allure semi" }
    ]
  },
  course_libre: {
    label: "Course à pied",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "course",   libelle: "🏃 Footing 45min",   premium: "45min endurance à 70% FCmax" },
      { jour: "Mer", type: "course",   libelle: "🏃 Fractionné 1h",   premium: "15min échauf + 8×400m VMA (récup 1min)" },
      { jour: "Jeu", type: "repos",    libelle: "Repos" },
      { jour: "Ven", type: "course",   libelle: "🏃 Tempo 45min",     premium: "10min échauf + 25min allure soutenue" },
      { jour: "Sam", type: "repos",    libelle: "Repos" },
      { jour: "Dim", type: "course",   libelle: "🏃 Sortie longue 1h15", premium: "1h15 endurance avec changements d'allure" }
    ]
  },
  velo_libre: {
    label: "Vélo",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "vélo",     libelle: "🚴 Endurance 1h",    premium: "1h à 70% FCmax, cadence 90rpm" },
      { jour: "Mer", type: "vélo",     libelle: "🚴 Intervalles 1h",  premium: "15min échauf + 5×4min zone 4 (récup 3min)" },
      { jour: "Jeu", type: "repos",    libelle: "Repos" },
      { jour: "Ven", type: "vélo",     libelle: "🚴 Seuil 1h",        premium: "15min échauf + 3×10min au seuil" },
      { jour: "Sam", type: "repos",    libelle: "Repos" },
      { jour: "Dim", type: "vélo",     libelle: "🚴 Sortie longue 2h30", premium: "2h30 endurance avec relances" }
    ]
  },
  natation_libre: {
    label: "Natation",
    semaine: [
      { jour: "Lun", type: "repos",    libelle: "Repos" },
      { jour: "Mar", type: "natation", libelle: "🏊 Endurance 45min", premium: "400m échauf + 8×100m allure modérée" },
      { jour: "Mer", type: "natation", libelle: "🏊 Technique 45min", premium: "Éducatifs : rattrapé, doigts traînés, battements" },
      { jour: "Jeu", type: "repos",    libelle: "Repos" },
      { jour: "Ven", type: "natation", libelle: "🏊 Fractionné 1h",   premium: "10×100m allure cible (récup 20s)" },
      { jour: "Sam", type: "repos",    libelle: "Repos" },
      { jour: "Dim", type: "natation", libelle: "🏊 Longue 1h",       premium: "1500m continu + 4×50m sprint" }
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

function obtenirObjectif() {
  return JSON.parse(localStorage.getItem("triloObjectif")) || null;
}

function sauverObjectif(obj) {
  localStorage.setItem("triloObjectif", JSON.stringify(obj));
}

function supprimerObjectif() {
  localStorage.removeItem("triloObjectif");
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

function afficherObjectif() {
  const zone = document.getElementById("objectifZone");
  if (!zone) return;

  // Vérifier connexion
  const estConnecte = window._triloUserConnected;
  if (estConnecte === undefined) {
    zone.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-muted);">⏳ Chargement...</div>`;
    setTimeout(afficherObjectif, 500);
    return;
  }

  if (estConnecte !== true) {
    zone.innerHTML = `
      <div class="objectif-locked">
        🔒 <strong>Connecte-toi pour définir ton objectif</strong>
        <p style="margin-top:8px;font-size:13px;color:var(--text-muted);">L'objectif personnalisé et le calendrier d'entraînement sont réservés aux membres Trilo.</p>
      </div>
    `;
    return;
  }

  const obj = obtenirObjectif();

  if (!obj) {
    // Formulaire complet
    zone.innerHTML = `
      <p class="objectif-intro">Définis ton objectif et Trilo te crée un plan d'entraînement personnalisé avec un calendrier semaine par semaine.</p>

      <div class="objectif-form-complet">

        <div class="cal-field">
          <label>🎯 Type de course visée (facultatif)</label>
          <select id="objProgramme">
            <option value="">— Plan adapté à mon sport —</option>
            <option value="triathlon_xs">Triathlon XS (Découverte)</option>
            <option value="triathlon_s">Triathlon Sprint (S)</option>
            <option value="triathlon_m">Triathlon Olympique (M)</option>
            <option value="triathlon_half">Half Ironman 70.3</option>
            <option value="triathlon_ironman">Ironman</option>
            <option value="marathon">Marathon (42km)</option>
            <option value="semi">Semi-Marathon (21km)</option>
          </select>
        </div>

        <div class="cal-field">
          <label>🏊🚴🏃 Sport à analyser (perf actuelle)</label>
          <select id="objSport">
            <option value="course">🏃 Course à pied</option>
            <option value="vélo">🚴 Vélo</option>
            <option value="natation">🏊 Natation</option>
          </select>
        </div>

        <div class="objectif-fields">
          <input id="objDistance" type="number" placeholder="Distance" step="0.1">
          <span id="objUnite" style="color:var(--text-muted);align-self:center;">km</span>
          <input id="objTemps" type="text" placeholder="Temps cible (facultatif, ex: 50:00)">
        </div>

        <div class="cal-field">
          <label>👥 Catégorie d'âge (facultatif)</label>
          <select id="objCategorie">
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
          <label>📅 Durée du plan d'entraînement</label>
          <select id="objSemaines">
            <option value="4">4 semaines</option>
            <option value="8" selected>8 semaines</option>
            <option value="12">12 semaines (recommandé)</option>
            <option value="16">16 semaines</option>
          </select>
        </div>

        <button id="objSaveBtn" class="objectif-save-btn">🚀 Générer mon plan</button>
      </div>
    `;

    document.getElementById("objSport")?.addEventListener("change", (e) => {
      const unite = document.getElementById("objUnite");
      if (unite) unite.textContent = e.target.value === "natation" ? "m" : "km";
    });

    document.getElementById("objSaveBtn")?.addEventListener("click", () => {
      const programme = document.getElementById("objProgramme").value;
      let programme   = document.getElementById("objProgramme").value;
      const sport     = document.getElementById("objSport").value;
      const distance  = parseFloat(document.getElementById("objDistance").value);
      const tempsStr  = document.getElementById("objTemps").value;
      const categorie = document.getElementById("objCategorie").value;
      const semaines  = parseInt(document.getElementById("objSemaines").value);

      if (!distance || distance <= 0) return alert("Entre une distance valide !");

      // Si aucun type de course choisi, adapter le plan au sport sélectionné
      if (!programme) {
        if (sport === "course")   programme = "course_libre";
        else if (sport === "vélo") programme = "velo_libre";
        else                       programme = "natation_libre";
      }

      // Temps facultatif
      let tempsMin = 0;
      if (tempsStr) {
        const parts = tempsStr.split(":");
        if (parts.length === 2) tempsMin = Number(parts[0]) + Number(parts[1])/60;
        else if (parts.length === 3) tempsMin = Number(parts[0])*60 + Number(parts[1]) + Number(parts[2])/60;
        else return alert("Format temps invalide ! Ex: 50:00 ou 1:30:00");

        if (tempsMin <= 0) return alert("Temps invalide !");
      }

      sauverObjectif({
        programme, sport, distance, tempsMin, categorie, semaines,
        dateDebut: new Date().toISOString(),
        moisAffiche: new Date().getMonth(),
        anneeAffichee: new Date().getFullYear()
      });
      afficherObjectif();
    });

    return;
  }

  // Objectif défini : afficher le récap + calendrier
  const { sport, distance, tempsMin, categorie, programme, semaines } = obj;
  const unite = sport === "natation" ? "m" : "km";
  const sportEmoji = sport === "natation" ? "🏊" : sport === "vélo" ? "🚴" : "🏃";

  const aTemps = tempsMin && tempsMin > 0;

  // Calculer vitesse cible et progression (seulement si temps défini)
  let vitesseCible = 0;
  let pctProgression = 0;
  let statut = "non-evalue";

  if (aTemps) {
    if (sport === "natation") vitesseCible = distance / tempsMin;
    else vitesseCible = distance / (tempsMin / 60);

    const meilleure = getMeilleureSession(sport);
    if (meilleure) {
      pctProgression = Math.min(100, Math.round((meilleure.speed / vitesseCible) * 100));
      if (meilleure.speed >= vitesseCible) statut = "atteint";
      else if (pctProgression >= 90) statut = "proche";
      else if (pctProgression >= 70) statut = "bon-debut";
      else statut = "loin";
    }
  } else {
    statut = "sans-temps";
  }

  const colors = {
    "atteint": "#10b981", "proche": "#00d4ff", "bon-debut": "#f59e0b",
    "loin": "#ef4444", "non-evalue": "#4a6080", "sans-temps": "#8b5cf6"
  };
  const messages = {
    "atteint": "🎉 Objectif atteint !",
    "proche": "💪 Tu y es presque !",
    "bon-debut": "👍 Bon début !",
    "loin": "🔥 Le chemin est long mais faisable",
    "non-evalue": "📊 Fais une analyse pour voir ta progression",
    "sans-temps": "🎯 Objectif sans temps cible — concentre-toi sur la distance"
  };

  // Format temps
  let tempsAffiche = "";
  if (aTemps) {
    const h = Math.floor(tempsMin / 60);
    const m = Math.floor(tempsMin % 60);
    tempsAffiche = h > 0 ? `${h}h${m.toString().padStart(2,"0")}min` : `${m}min`;
  }

  const titreObjectif = programme && PROGRAMMES[programme]
    ? PROGRAMMES[programme].label
    : `Objectif ${sport === "natation" ? "Natation" : sport === "vélo" ? "Vélo" : "Course"}`;

  let html = `
    <div class="objectif-recap">
      <div class="objectif-cible">
        <span class="objectif-sport-emoji">${sportEmoji}</span>
        <div>
          <h3>${titreObjectif}</h3>
          <p>${distance}${unite}${aTemps ? ` en ${tempsAffiche}` : ""}${categorie ? ` · ${categorie}` : ""}</p>
        </div>
      </div>

      ${aTemps ? `
      <div class="objectif-progress-zone">
        <div class="objectif-progress-bar">
          <div class="objectif-progress-fill" style="width:${pctProgression}%;background:${colors[statut]};"></div>
        </div>
        <p class="objectif-progress-text" style="color:${colors[statut]};">
          <strong>${pctProgression}%</strong> — ${messages[statut]}
        </p>
      </div>
      ` : `
      <div class="objectif-progress-zone">
        <p class="objectif-progress-text" style="color:${colors[statut]};">
          ${messages[statut]}
        </p>
      </div>
      `}
    </div>
  `;

  // Calendrier intégré SEULEMENT si un programme est choisi
  if (programme && PROGRAMMES[programme]) {
    html += genererHTMLCalendrier(obj);
  }

  html += `<button id="objDeleteBtn" class="objectif-delete-btn">🔄 Définir un nouvel objectif</button>`;

  zone.innerHTML = html;

  // Events nav calendrier
  document.getElementById("calPrevBtn")?.addEventListener("click", () => {
    const o = obtenirObjectif();
    o.moisAffiche--;
    if (o.moisAffiche < 0) { o.moisAffiche = 11; o.anneeAffichee--; }
    sauverObjectif(o);
    afficherObjectif();
  });

  document.getElementById("calNextBtn")?.addEventListener("click", () => {
    const o = obtenirObjectif();
    o.moisAffiche++;
    if (o.moisAffiche > 11) { o.moisAffiche = 0; o.anneeAffichee++; }
    sauverObjectif(o);
    afficherObjectif();
  });

  document.getElementById("objDeleteBtn")?.addEventListener("click", () => {
    if (confirm("Supprimer ton objectif et ton calendrier ?")) {
      supprimerObjectif();
      afficherObjectif();
    }
  });
}

function genererHTMLCalendrier(obj) {
  const isPremium = window._triloIsPremium === true;
  const moisNoms = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const jourNoms = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

  const mois  = obj.moisAffiche;
  const annee = obj.anneeAffichee;
  const dateDebut = new Date(obj.dateDebut);
  const jourPlan = PROGRAMMES[obj.programme]?.semaine || [];

  // Map des séances
  const seancesMap = {};
  for (let s = 0; s < obj.semaines; s++) {
    for (let j = 0; j < 7; j++) {
      const date = new Date(dateDebut);
      date.setDate(dateDebut.getDate() + s * 7 + j);
      const seance = jourPlan[j] || jourPlan[(s * 7 + j) % 7];
      seancesMap[date.toISOString().split("T")[0]] = seance;
    }
  }

  const premierJour = new Date(annee, mois, 1);
  const dernierJour = new Date(annee, mois + 1, 0);
  const decalage = (premierJour.getDay() + 6) % 7;

  let html = `
    <div style="margin-top:24px;padding-top:24px;border-top:1px solid var(--border);">
      <h4 style="font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:3px;color:var(--text-muted);margin-bottom:14px;">📅 CALENDRIER D'ENTRAÎNEMENT</h4>

      <div class="cal-header">
        <button id="calPrevBtn" class="cal-nav-btn">←</button>
        <h3>${moisNoms[mois]} ${annee}</h3>
        <button id="calNextBtn" class="cal-nav-btn">→</button>
      </div>

      <div class="cal-grid">
        ${jourNoms.map(j => `<div class="cal-day-name">${j}</div>`).join("")}
  `;

  for (let i = 0; i < decalage; i++) {
    html += `<div class="cal-cell cal-empty"></div>`;
  }

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
        🔒 <strong>Trilo Premium</strong> : débloque les détails de chaque séance (séries, allures, récupération)
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

// Lancer dès que possible (les modules se chargent après DOMContentLoaded en général)
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => afficherObjectif());
} else {
  afficherObjectif();
}

window.rafraichirObjectif = afficherObjectif;
window.rafraichirCalendrier = afficherObjectif;
