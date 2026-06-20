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
  "header.premium":  { fr: "Trilo Premium",   en: "Trilo Premium" }
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

// Bind le bouton de langue
document.addEventListener("DOMContentLoaded", () => {
  appliquerLangue();
  const btn = document.getElementById("langueBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      const nouvelle = getLangue() === "fr" ? "en" : "fr";
      setLangue(nouvelle);
    });
  }
});

window.appliquerLangue = appliquerLangue;
