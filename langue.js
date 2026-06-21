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
  "an.ph.rundist":   { fr: "Ex : 5", en: "Ex: 5" },

  // Landing — Features
  "feat.free":         { fr: "GRATUIT", en: "FREE" },
  "feat.premium":      { fr: "PREMIUM", en: "PREMIUM" },
  "feat.analyse":      { fr: "Analyse des perfs", en: "Performance analysis" },
  "feat.analyse.d":    { fr: "Score détaillé sur 100 pour chaque discipline", en: "Detailed score out of 100 for each discipline" },
  "feat.streaks":      { fr: "Streaks", en: "Streaks" },
  "feat.streaks.d":    { fr: "Garde ta motivation chaque jour", en: "Keep your motivation every day" },
  "feat.gps":          { fr: "Parcours GPS", en: "GPS routes" },
  "feat.gps.d":        { fr: "Trouve des itinéraires près de chez toi", en: "Find routes near you" },
  "feat.coach":        { fr: "Coach IA", en: "AI Coach" },
  "feat.coach.d":      { fr: "Analyse intelligente et conseils personnalisés", en: "Smart analysis and personalized tips" },
  "feat.race":         { fr: "Mode Race", en: "Race Mode" },
  "feat.race.d":       { fr: "Compare-toi aux courses officielles", en: "Compare yourself to official races" },
  "feat.dash":         { fr: "Dashboard avancé", en: "Advanced dashboard" },
  "feat.dash.d":       { fr: "Stats complètes et graphique d'évolution", en: "Full stats and progress chart" },
  "feat.rank":         { fr: "Classement mondial", en: "World leaderboard" },
  "feat.rank.d":       { fr: "Compare-toi aux meilleurs triathlètes Trilo", en: "Compare yourself to the best Trilo triathletes" },

  // FAQ
  "faq.q1":   { fr: "Trilo est-il vraiment gratuit ?", en: "Is Trilo really free?" },
  "faq.a1":   { fr: "Oui ! Toutes les fonctionnalités principales sont gratuites : analyse des perfs, score sur 100, Coach IA basique, badges, streak, parcours GPS, calendrier d'entraînement, historique. Seules quelques fonctionnalités avancées nécessitent l'abonnement Premium.", en: "Yes! All main features are free: performance analysis, score out of 100, basic AI Coach, badges, streak, GPS routes, training calendar, history. Only a few advanced features require the Premium subscription." },
  "faq.q2":   { fr: "Comment fonctionne le score sur 100 ?", en: "How does the score out of 100 work?" },
  "faq.a2":   { fr: "Le score Trilo est calculé en comparant ta vitesse à des références : 45 m/min pour la natation, 22 km/h pour le vélo, 12 km/h pour la course. Plus tu es proche ou au-dessus, plus ton score est élevé. Au-dessus de 80, tu es Élite !", en: "The Trilo score compares your speed to references: 45 m/min for swimming, 22 km/h for cycling, 12 km/h for running. The closer or higher you are, the higher your score. Above 80, you're Elite!" },
  "faq.q3":   { fr: "Mes données sont-elles en sécurité ?", en: "Is my data safe?" },
  "faq.a3":   { fr: "Oui. Tes données sont stockées chez Google Firebase (serveurs sécurisés conformes RGPD). Trilo ne vend jamais tes données. Tu peux demander leur suppression à tout moment.", en: "Yes. Your data is stored on Google Firebase (secure GDPR-compliant servers). Trilo never sells your data. You can request deletion at any time." },
  "faq.q4":   { fr: "Le coach IA est-il vraiment intelligent ?", en: "Is the AI coach really smart?" },
  "faq.a4":   { fr: "Le Coach IA analyse tes performances et te donne des conseils adaptés à ton niveau et à tes points forts/faibles. Le mode Premium offre une analyse encore plus détaillée.", en: "The AI Coach analyzes your performances and gives tips suited to your level and strengths/weaknesses. Premium offers even more detailed analysis." },
  "faq.q5":   { fr: "Puis-je utiliser Trilo sur mon téléphone ?", en: "Can I use Trilo on my phone?" },
  "faq.a5":   { fr: "Oui ! Trilo est une PWA, tu peux l'installer sur ton téléphone comme une vraie app. Va sur le site depuis ton mobile et clique sur 'Ajouter à l'écran d'accueil'.", en: "Yes! Trilo is a PWA, you can install it on your phone like a real app. Go to the site from your mobile and click 'Add to home screen'." },
  "faq.q6":   { fr: "Comment fonctionne le classement mondial ?", en: "How does the world leaderboard work?" },
  "faq.a6":   { fr: "Le classement mondial compare ton meilleur score à celui de tous les autres utilisateurs. Avec Premium, tu peux te comparer à ta catégorie d'âge.", en: "The world leaderboard compares your best score to all other users. With Premium, you can compare yourself to your age category." },
  "faq.q7":   { fr: "Quelle est la différence entre les programmes d'entraînement ?", en: "What's the difference between training programs?" },
  "faq.a7":   { fr: "Trilo propose 7 programmes : Triathlon XS/S/M, Half Ironman, Ironman, Marathon et Semi. Chacun a son planning hebdomadaire avec natation, vélo, course et repos adaptés.", en: "Trilo offers 7 programs: Triathlon XS/S/M, Half Ironman, Ironman, Marathon and Half-Marathon. Each has its weekly schedule with adapted swim, bike, run and rest days." },
  "faq.q8":   { fr: "Qui a créé Trilo ?", en: "Who created Trilo?" },
  "faq.a8":   { fr: "Trilo a été créé par Eliott, 13 ans, passionné de triathlon, pour aider les triathlètes de tous niveaux à progresser.", en: "Trilo was created by Eliott, 13 years old, a triathlon enthusiast, to help triathletes of all levels progress." },
  "faq.title":{ fr: "❓ Questions fréquentes", en: "❓ Frequently asked questions" }
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
