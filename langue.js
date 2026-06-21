/* =========================
   SYSTÈME DE LANGUE FR/EN — TRILO
   Traduit les textes marqués data-i18n
========================= */

const TRADUCTIONS = {
  // Navbar
  "nav.accueil":     { fr: "🏠 Accueil",     en: "🏠 Home" },
  "nav.analyser":    { fr: "📊 Analyser",    en: "📊 Analyze" },
  "nav.calculateur": { fr: "🧮 Calculateur", en: "🧮 Calculator" },
  "nav.objectifs":   { fr: "🎯 Objectifs",   en: "🎯 Goals" },
  "nav.dashboard":   { fr: "📈 Dashboard",   en: "📈 Dashboard" },
  "nav.profil":      { fr: "👤 Profil",      en: "👤 Profile" },
  "nav.premium":     { fr: "⭐ Premium",      en: "⭐ Premium" },

  // Landing
  "landing.subtitle":   { fr: "Analyse. Progresse. Domine.", en: "Analyze. Progress. Dominate." },
  "landing.desc":       { fr: "Le premier coach IA gratuit pour triathlètes. Analyse tes performances en natation, vélo et course à pied. Obtiens des conseils personnalisés, suis ta progression et compare-toi aux meilleurs.", en: "The first free AI coach for triathletes. Analyze your swim, bike and run performances. Get personalized tips, track your progress and compare yourself to the best." },
  "landing.cta.free":   { fr: "🚀 Commencer gratuitement", en: "🚀 Start for free" },
  "landing.cta.premium":{ fr: "⭐ Passer Premium",          en: "⭐ Go Premium" },
  "landing.explore":    { fr: "🧭 Explore Trilo",           en: "🧭 Explore Trilo" },

  // Cartes navigation
  "card.analyser.title":  { fr: "Analyser",  en: "Analyze" },
  "card.analyser.desc":   { fr: "Calcule ton score sur 100 et reçois des conseils IA", en: "Calculate your score out of 100 and get AI tips" },
  "card.objectifs.title": { fr: "Objectifs", en: "Goals" },
  "card.objectifs.desc":  { fr: "Fixe un objectif et obtiens ton plan d'entraînement", en: "Set a goal and get your training plan" },
  "card.dashboard.title": { fr: "Dashboard", en: "Dashboard" },
  "card.dashboard.desc":  { fr: "Suis ta progression, tes stats et tes badges", en: "Track your progress, stats and badges" },
  "card.premium.title":   { fr: "Premium",   en: "Premium" },
  "card.premium.desc":    { fr: "Débloque le classement et les fonctions avancées", en: "Unlock the leaderboard and advanced features" },

  // Comment ça marche
  "how.title":   { fr: "📖 Comment ça marche ?", en: "📖 How does it work?" },
  "how.step1":   { fr: "Crée ton compte",        en: "Create your account" },
  "how.step1d":  { fr: "Inscris-toi en 30 secondes avec un email et un pseudo", en: "Sign up in 30 seconds with an email and a username" },
  "how.step2":   { fr: "Entre tes performances", en: "Enter your performances" },
  "how.step2d":  { fr: "Renseigne distance et temps pour natation, vélo et course", en: "Enter distance and time for swim, bike and run" },
  "how.step3":   { fr: "Analyse et progresse",   en: "Analyze and progress" },
  "how.step3d":  { fr: "Reçois ton score sur 100, des conseils IA et des badges", en: "Get your score out of 100, AI tips and badges" },
  "how.step4":   { fr: "Navigue avec le menu",   en: "Navigate with the menu" },
  "how.step4d":  { fr: "Utilise les onglets en haut pour accéder à toutes les fonctionnalités", en: "Use the top tabs to access all features" },

  // Connexion
  "login.title":     { fr: "Connexion Trilo",     en: "Trilo Login" },
  "login.email":     { fr: "Email",               en: "Email" },
  "login.password":  { fr: "Mot de passe",        en: "Password" },
  "login.signup":    { fr: "Créer un compte",     en: "Sign up" },
  "login.login":     { fr: "Connexion",           en: "Log in" },
  "login.forgot":    { fr: "Mot de passe oublié ?", en: "Forgot password?" },
  "login.logout":    { fr: "Se déconnecter",      en: "Log out" },
  "login.pseudo":    { fr: "Ton pseudo",          en: "Your username" },
  "login.age":       { fr: "Ton âge",             en: "Your age" },

  // Sports
  "sport.natation":  { fr: "NATATION", en: "SWIMMING" },
  "sport.velo":      { fr: "VÉLO",     en: "CYCLING" },
  "sport.course":    { fr: "COURSE",   en: "RUNNING" },
  "sport.distM":     { fr: "Distance en mètres",     en: "Distance in meters" },
  "sport.distKm":    { fr: "Distance en kilomètres", en: "Distance in kilometers" },
  "sport.temps":     { fr: "Temps",    en: "Time" },
  "sport.analyser":  { fr: "📊 Analyser mes performances", en: "📊 Analyze my performances" },
  "sport.reset":     { fr: "🗑 Réinitialiser", en: "🗑 Reset" },

  // Calculateur
  "calc.title":      { fr: "Calculateur d'allure", en: "Pace calculator" },
  "calc.subtitle":   { fr: "Calcule ton allure, ta vitesse et tes temps de passage — gratuit, sans compte", en: "Calculate your pace, speed and split times — free, no account" },
  "calc.distance":   { fr: "Distance (km)",        en: "Distance (km)" },
  "calc.temps":      { fr: "Temps (mm:ss ou hh:mm:ss)", en: "Time (mm:ss or hh:mm:ss)" },
  "calc.btn":        { fr: "🧮 Calculer mon allure", en: "🧮 Calculate my pace" },

  // Premium
  "premium.title":   { fr: "Trilo Premium", en: "Trilo Premium" },
  "premium.desc":    { fr: "Débloque tout le potentiel de Trilo et passe au niveau supérieur.", en: "Unlock Trilo's full potential and level up." },
  "premium.btn":     { fr: "🚀 Passer à Premium", en: "🚀 Go Premium" },

  // Page headers
  "header.analyser": { fr: "Analyser mes performances", en: "Analyze my performances" },
  "header.objectifs":{ fr: "Mes objectifs",   en: "My goals" },
  "header.dashboard":{ fr: "Mon dashboard",   en: "My dashboard" },
  "header.profil":   { fr: "Mon profil",      en: "My profile" },
  "header.premium":  { fr: "Trilo Premium",   en: "Trilo Premium" },

  // Page Analyser — complet
  "an.header.sub":   { fr: "Entre tes temps et distances pour obtenir ton score Trilo", en: "Enter your times and distances to get your Trilo score" },
  "an.age.info":     { fr: "L'âge permet de te comparer à ta catégorie", en: "Age lets you compare yourself to your category" },
  "an.format":       { fr: "Format conseillé : 4:30, 20:00 ou 1:15:00", en: "Recommended format: 4:30, 20:00 or 1:15:00" },
  "an.noscore":      { fr: "Aucun score", en: "No score yet" },
  "an.message":      { fr: "Entre tes performances puis clique sur analyser.", en: "Enter your performances then click analyze." },
  "an.coach.title":  { fr: "Coach IA Trilo", en: "Trilo AI Coach" },
  "an.coach.sub":    { fr: "Analyse intelligente de tes performances.", en: "Smart analysis of your performances." },
  "an.coach.empty":  { fr: "Fais une analyse pour recevoir ton coaching IA.", en: "Run an analysis to get your AI coaching." },
  "an.v2.title":     { fr: "Analyse Trilo V2", en: "Trilo Analysis V2" },
  "an.v2.sub":       { fr: "Tableau de bord complet de ta dernière séance.", en: "Complete dashboard of your last session." },
  "an.v2.score":     { fr: "🎯 Score Trilo global", en: "🎯 Global Trilo Score" },
  "an.v2.niveau":    { fr: "Niveau : en attente d'analyse", en: "Level: waiting for analysis" },
  "an.v2.fort":      { fr: "🟢 Point fort", en: "🟢 Strength" },
  "an.v2.faible":    { fr: "🟡 À améliorer", en: "🟡 To improve" },
  "an.v2.nonlance":  { fr: "Analyse non lancée", en: "Analysis not started" },
  "an.v2.conseil":   { fr: "🧠 Conseil IA", en: "🧠 AI Tip" },
  "an.v2.conseiltxt":{ fr: "Entre tes performances pour recevoir un conseil.", en: "Enter your performances to get a tip." },
  "an.v2.records":   { fr: "🏆 Records personnels", en: "🏆 Personal records" },
  "an.v2.bestsport": { fr: "Meilleur sport :", en: "Best sport:" },
  "an.v2.disttot":   { fr: "Distance totale :", en: "Total distance:" },
  "an.v2.bestscore": { fr: "Meilleur score :", en: "Best score:" },
  "an.v2.prog":      { fr: "📈 Progression", en: "📈 Progress" },
  "an.v2.progtxt":   { fr: "Progression :", en: "Progress:" },
  "an.ph.swimdist":  { fr: "Ex : 200", en: "Ex: 200" },
  "an.ph.swimtime":  { fr: "Ex : 4:30", en: "Ex: 4:30" },
  "an.ph.bikedist":  { fr: "Ex : 10", en: "Ex: 10" },
  "an.ph.time2":     { fr: "Ex : 20:00", en: "Ex: 20:00" },
  "an.ph.rundist":   { fr: "Ex : 5", en: "Ex: 5" }
};

function getLangue() {
  return localStorage.getItem("triloLangue") || "fr";
}

function setLangue(langue) {
  localStorage.setItem("triloLangue", langue);
  appliquerLangue();
}

function appliquerLangue() {
  const langue = getLangue();

  // Traduire tous les éléments avec data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const cle = el.getAttribute("data-i18n");
    if (TRADUCTIONS[cle]) {
      el.textContent = TRADUCTIONS[cle][langue];
    }
  });

  // Traduire les placeholders avec data-i18n-ph
  document.querySelectorAll("[data-i18n-ph]").forEach(el => {
    const cle = el.getAttribute("data-i18n-ph");
    if (TRADUCTIONS[cle]) {
      el.placeholder = TRADUCTIONS[cle][langue];
    }
  });

  // Mettre à jour le bouton de langue
  const btn = document.getElementById("langueBtn");
  if (btn) btn.textContent = langue === "fr" ? "🇬🇧 EN" : "🇫🇷 FR";

  // Mettre à jour l'attribut lang du HTML
  document.documentElement.lang = langue;
}

// Appliquer la langue immédiatement et brancher le bouton
function initLangue() {
  appliquerLangue();
  const btn = document.getElementById("langueBtn");
  if (btn && !btn._triloBound) {
    btn._triloBound = true;
    btn.addEventListener("click", () => {
      const nouvelle = getLangue() === "fr" ? "en" : "fr";
      setLangue(nouvelle);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLangue);
} else {
  initLangue();
}

window.appliquerLangue = appliquerLangue;
