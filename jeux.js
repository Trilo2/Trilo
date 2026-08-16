<<<<<<< HEAD
/* =========================
   JEUX TRILO — Quiz + Vrai/Faux
   Thème : triathlon et endurance
========================= */

function jeuLang() { return localStorage.getItem("triloLangue") || "fr"; }
function JL(fr, en) { return jeuLang() === "en" ? en : fr; }

// ============================================
// BANQUE DE QUESTIONS — QUIZ (triathlon + endurance)
// ============================================
const QUIZ_BANQUE = [
  // ===== TRIATHLON — FACILE =====
  { q: JL("Dans quel ordre se déroule un triathlon ?", "In which order does a triathlon take place?"), options: [JL("Vélo, nage, course", "Bike, swim, run"), JL("Nage, vélo, course", "Swim, bike, run"), JL("Course, vélo, nage", "Run, bike, swim"), JL("Nage, course, vélo", "Swim, run, bike")], correct: 1, diff: "facile", exp: JL("Toujours natation, puis vélo, puis course à pied.", "Always swim, then bike, then run.") },
  { q: JL("Comment s'appelle le passage d'une discipline à l'autre ?", "What is the switch between disciplines called?"), options: [JL("Transition", "Transition"), JL("Relais", "Relay"), JL("Changement", "Switch"), JL("Pause", "Break")], correct: 0, diff: "facile", exp: JL("La transition (T1 nage-vélo, T2 vélo-course).", "The transition (T1 swim-bike, T2 bike-run).") },
  { q: JL("Quelle distance de natation dans un triathlon olympique ?", "Swim distance in an Olympic triathlon?"), options: ["750m", "1500m", "3800m", "500m"], correct: 1, diff: "facile", exp: JL("1500m de nage pour le format olympique.", "1500m swim for the Olympic format.") },
  { q: JL("Combien de disciplines dans un triathlon ?", "How many disciplines in a triathlon?"), options: ["2", "3", "4", "5"], correct: 1, diff: "facile", exp: JL("Trois : natation, vélo, course à pied.", "Three: swimming, cycling, running.") },

  // ===== TRIATHLON — MOYEN =====
  { q: JL("Quelle est la distance d'un Ironman (course à pied) ?", "Running distance of an Ironman?"), options: [JL("21 km", "21 km"), JL("42 km (marathon)", "42 km (marathon)"), JL("10 km", "10 km"), JL("50 km", "50 km")], correct: 1, diff: "moyen", exp: JL("Un marathon complet : 42,195 km après 3,8km de nage et 180km de vélo !", "A full marathon: 42.195 km after a 3.8km swim and 180km bike!") },
  { q: JL("Que signifie 'drafting' à vélo en triathlon ?", "What does 'drafting' mean in triathlon cycling?"), options: [JL("Rouler dans l'aspiration d'un autre", "Riding in someone's slipstream"), JL("Changer de vitesse", "Changing gears"), JL("Boire en roulant", "Drinking while riding"), JL("Accélérer", "Accelerating")], correct: 0, diff: "moyen", exp: JL("Rouler dans l'aspiration. Interdit sur la plupart des triathlons amateurs !", "Riding in the slipstream. Banned in most amateur triathlons!") },
  { q: JL("Quel format de triathlon est le plus court ?", "Which triathlon format is the shortest?"), options: [JL("Sprint", "Sprint"), JL("Olympique", "Olympic"), JL("Half Ironman", "Half Ironman"), JL("Ironman", "Ironman")], correct: 0, diff: "moyen", exp: JL("Le format Sprint : environ 750m/20km/5km.", "The Sprint format: about 750m/20km/5km.") },
  { q: JL("Comment appelle-t-on une combinaison de nage en triathlon ?", "What is a triathlon swimming suit called?"), options: [JL("Wetsuit / néoprène", "Wetsuit / neoprene"), JL("Trifonction", "Trisuit"), JL("Skinsuit", "Skinsuit"), JL("Drysuit", "Drysuit")], correct: 0, diff: "moyen", exp: JL("La combinaison néoprène (wetsuit) aide à flotter et garde au chaud.", "The neoprene wetsuit helps you float and keeps you warm.") },

  // ===== TRIATHLON — DIFFICILE =====
  { q: JL("Où a lieu le championnat du monde Ironman chaque année ?", "Where is the Ironman World Championship held each year?"), options: [JL("Nice", "Nice"), JL("Kona (Hawaï)", "Kona (Hawaii)"), JL("Roth", "Roth"), JL("Melbourne", "Melbourne")], correct: 1, diff: "difficile", exp: JL("Kona, à Hawaï, le triathlon le plus mythique du monde.", "Kona, Hawaii, the most legendary triathlon in the world.") },
  { q: JL("Quelle distance de vélo pour un Half Ironman (70.3) ?", "Bike distance for a Half Ironman (70.3)?"), options: ["45 km", "90 km", "120 km", "180 km"], correct: 1, diff: "difficile", exp: JL("90 km de vélo. Le '70.3' = 70,3 miles au total.", "90 km bike. '70.3' = 70.3 total miles.") },
  { q: JL("Qui détient le record du monde sur Ironman (moins de 7h) ?", "Who holds the Ironman world record (sub-7h)?"), options: [JL("Kristian Blummenfelt", "Kristian Blummenfelt"), JL("Jan Frodeno", "Jan Frodeno"), JL("Gustav Iden", "Gustav Iden"), JL("Alistair Brownlee", "Alistair Brownlee")], correct: 1, diff: "difficile", exp: JL("Jan Frodeno, légende allemande du triathlon longue distance.", "Jan Frodeno, German legend of long-distance triathlon.") },

  // ===== COURSE / MARATHON =====
  { q: JL("Quelle est la distance officielle d'un marathon ?", "Official marathon distance?"), options: ["40 km", "42,195 km", "45 km", "50 km"], correct: 1, diff: "facile", exp: JL("42,195 km exactement, depuis les JO de 1908.", "Exactly 42.195 km, since the 1908 Olympics.") },
  { q: JL("Qui a couru un marathon en moins de 2h (non officiel) ?", "Who ran a sub-2h marathon (unofficial)?"), options: [JL("Mo Farah", "Mo Farah"), JL("Eliud Kipchoge", "Eliud Kipchoge"), JL("Kenenisa Bekele", "Kenenisa Bekele"), JL("Haile Gebrselassie", "Haile Gebrselassie")], correct: 1, diff: "moyen", exp: JL("Eliud Kipchoge, 1h59'40 en 2019 à Vienne (conditions spéciales).", "Eliud Kipchoge, 1:59:40 in 2019 in Vienna (special conditions).") },
  { q: JL("Que veut dire 'négative split' en course ?", "What does 'negative split' mean in running?"), options: [JL("Ralentir à la fin", "Slowing down at the end"), JL("Courir la 2e moitié plus vite", "Running the 2nd half faster"), JL("S'arrêter à mi-course", "Stopping halfway"), JL("Partir très vite", "Starting very fast")], correct: 1, diff: "difficile", exp: JL("Courir la seconde moitié plus vite que la première : la stratégie idéale !", "Running the second half faster than the first: the ideal strategy!") },
  { q: JL("Qu'est-ce que le 'mur' du marathon ?", "What is the marathon 'wall'?"), options: [JL("Une côte difficile", "A hard hill"), JL("L'épuisement soudain vers 30km", "Sudden exhaustion around 30km"), JL("La ligne d'arrivée", "The finish line"), JL("Un ravitaillement", "An aid station")], correct: 1, diff: "moyen", exp: JL("L'épuisement des réserves de glycogène, souvent vers le 30e km.", "The depletion of glycogen stores, often around km 30.") },

  // ===== VÉLO =====
  { q: JL("Qu'est-ce que la 'cadence' à vélo ?", "What is cycling 'cadence'?"), options: [JL("La vitesse", "The speed"), JL("Le nombre de tours de pédale par minute", "Pedal revolutions per minute"), JL("La distance", "The distance"), JL("La puissance", "The power")], correct: 1, diff: "moyen", exp: JL("Le nombre de coups de pédale par minute (rpm). ~90 est idéal.", "The number of pedal strokes per minute (rpm). ~90 is ideal.") },
  { q: JL("Comment mesure-t-on la puissance à vélo ?", "How is cycling power measured?"), options: [JL("En km/h", "In km/h"), JL("En watts", "In watts"), JL("En calories", "In calories"), JL("En battements", "In beats")], correct: 1, diff: "moyen", exp: JL("En watts, grâce à un capteur de puissance.", "In watts, thanks to a power meter.") },

  // ===== NATATION =====
  { q: JL("Quelle nage est la plus rapide et utilisée en triathlon ?", "Which stroke is fastest and used in triathlon?"), options: [JL("Brasse", "Breaststroke"), JL("Crawl", "Freestyle"), JL("Dos", "Backstroke"), JL("Papillon", "Butterfly")], correct: 1, diff: "facile", exp: JL("Le crawl (nage libre), la plus rapide et efficace.", "Freestyle, the fastest and most efficient.") },
  { q: JL("Que travaille l'exercice de 'catch' en natation ?", "What does the 'catch' drill improve in swimming?"), options: [JL("La respiration", "Breathing"), JL("La prise d'appui dans l'eau", "The grip on the water"), JL("Les jambes", "The legs"), JL("Le virage", "The turn")], correct: 1, diff: "difficile", exp: JL("La prise d'eau avec l'avant-bras, clé de la propulsion.", "The water grip with the forearm, key to propulsion.") },

  // ===== ENDURANCE / PHYSIO =====
  { q: JL("Que signifie 'VMA' en course à pied ?", "What does 'VO2max pace' relate to in running?"), options: [JL("Vitesse Maximale Aérobie", "Maximal Aerobic Speed"), JL("Vitesse Moyenne Annuelle", "Mean Annual Speed"), JL("Volume Musculaire Actif", "Active Muscle Volume"), JL("Vitesse Minimale d'Allure", "Minimal Pace Speed")], correct: 0, diff: "moyen", exp: JL("Vitesse Maximale Aérobie : ta vitesse au max de ta consommation d'oxygène.", "Maximal Aerobic Speed: your speed at maximum oxygen consumption.") },
  { q: JL("Qu'est-ce que le seuil 'anaérobie' ?", "What is the 'anaerobic' threshold?"), options: [JL("Le repos total", "Complete rest"), JL("L'intensité où le lactate s'accumule", "The intensity where lactate accumulates"), JL("La marche", "Walking"), JL("Le sommeil", "Sleep")], correct: 1, diff: "difficile", exp: JL("L'intensité où l'acide lactique s'accumule plus vite qu'il n'est éliminé.", "The intensity where lactic acid builds up faster than it's cleared.") },
  { q: JL("Combien de temps avant l'effort faut-il bien s'hydrater ?", "How long before exercise should you hydrate well?"), options: [JL("Juste avant", "Just before"), JL("Plusieurs heures avant", "Several hours before"), JL("Pas besoin", "No need"), JL("Après seulement", "After only")], correct: 1, diff: "moyen", exp: JL("L'hydratation se prépare plusieurs heures avant l'effort.", "Hydration is prepared several hours before exercise.") },
  { q: JL("Quel muscle est le plus sollicité en course à pied ?", "Which muscle is most used in running?"), options: [JL("Les biceps", "The biceps"), JL("Les quadriceps et mollets", "Quadriceps and calves"), JL("Les abdos", "The abs"), JL("Les pectoraux", "The pecs")], correct: 1, diff: "facile", exp: JL("Les jambes : quadriceps, ischios, mollets surtout.", "The legs: quads, hamstrings, and especially calves.") },
];

// ============================================
// BANQUE VRAI/FAUX (triathlon + endurance)
// ============================================
const VF_BANQUE = [
  { q: JL("En triathlon, on peut nager n'importe quelle nage.", "In triathlon, you can swim any stroke."), reponse: true, exp: JL("Vrai ! Le crawl est le plus utilisé, mais aucune nage n'est imposée.", "True! Freestyle is most used, but no stroke is required.") },
  { q: JL("Le drafting à vélo est autorisé dans tous les triathlons.", "Drafting is allowed in all triathlons."), reponse: false, exp: JL("Faux ! Il est interdit dans la plupart des triathlons amateurs.", "False! It's banned in most amateur triathlons.") },
  { q: JL("Un Ironman se termine par un marathon complet.", "An Ironman ends with a full marathon."), reponse: true, exp: JL("Vrai ! 42,195 km de course après la nage et le vélo.", "True! A 42.195 km run after the swim and bike.") },
  { q: JL("Il faut toujours partir le plus vite possible à la natation.", "You should always start the swim as fast as possible."), reponse: false, exp: JL("Faux ! Partir trop vite épuise pour le vélo et la course.", "False! Starting too fast exhausts you for the bike and run.") },
  { q: JL("La transition fait partie du temps de course.", "The transition counts in your race time."), reponse: true, exp: JL("Vrai ! Le chrono tourne pendant les transitions T1 et T2.", "True! The clock runs during T1 and T2 transitions.") },
  { q: JL("Le repos ne sert à rien pour progresser.", "Rest is useless for improving."), reponse: false, exp: JL("Faux ! C'est pendant le repos que le corps progresse.", "False! The body improves during rest.") },
  { q: JL("Une cadence de vélo idéale tourne autour de 90 rpm.", "An ideal bike cadence is around 90 rpm."), reponse: true, exp: JL("Vrai ! Environ 90 tours de pédale par minute est recommandé.", "True! About 90 pedal revolutions per minute is recommended.") },
  { q: JL("Le 'mur' du marathon arrive généralement vers 30 km.", "The marathon 'wall' usually hits around 30 km."), reponse: true, exp: JL("Vrai ! L'épuisement du glycogène frappe souvent vers le 30e km.", "True! Glycogen depletion often hits around km 30.") },
  { q: JL("On peut faire un triathlon avec un VTT.", "You can do a triathlon with a mountain bike."), reponse: true, exp: JL("Vrai ! Pour débuter, n'importe quel vélo en bon état convient.", "True! To start, any bike in good condition works.") },
  { q: JL("Il faut s'hydrater seulement après l'effort.", "You should only hydrate after exercise."), reponse: false, exp: JL("Faux ! Il faut boire avant, pendant ET après.", "False! You should drink before, during AND after.") },
  { q: JL("Le crawl est la nage la plus rapide.", "Freestyle is the fastest stroke."), reponse: true, exp: JL("Vrai ! C'est pourquoi il est privilégié en triathlon.", "True! That's why it's preferred in triathlon.") },
  { q: JL("Un marathon fait exactement 40 km.", "A marathon is exactly 40 km."), reponse: false, exp: JL("Faux ! Un marathon fait 42,195 km précisément.", "False! A marathon is exactly 42.195 km.") },
  { q: JL("La séance 'brique' enchaîne vélo puis course.", "A 'brick' session chains bike then run."), reponse: true, exp: JL("Vrai ! Elle habitue les jambes à la transition vélo-course.", "True! It gets your legs used to the bike-run transition.") },
  { q: JL("Plus on s'entraîne dur chaque jour, mieux c'est.", "The harder you train every day, the better."), reponse: false, exp: JL("Faux ! Sans récupération, on se blesse et on stagne.", "False! Without recovery, you get injured and plateau.") },
];

// ============================================
// SÉLECTION DU JOUR
// ============================================
function getJourNumero() {
  const ref = new Date(2026, 0, 1);
  const now = new Date();
  return Math.floor((now - ref) / (1000 * 60 * 60 * 24));
}

function tirerElements(banque, nombre, graine) {
  const indices = [];
  let seed = graine;
  while (indices.length < nombre && indices.length < banque.length) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const idx = seed % banque.length;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices.map(i => banque[i]);
}

// ============================================
// ÉTAT
// ============================================
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizPoints = 0;
let quizReponses = [];

const TEMPS_MAX = 15;
let tempsRestant = TEMPS_MAX;
let chronoInterval = null;
let questionRepondue = false;

let vfQuestions = [];
let vfIndex = 0;
let vfScore = 0;
let vfReponses = [];

// Clés stockage
const K = {
  jour: "trilojeux_jour",
  quizScore: "trilojeux_quizscore",
  quizPoints: "trilojeux_quizpoints",
  quizStreak: "trilojeux_quizstreak",
  quizBest: "trilojeux_quizbest",
  quizRep: "trilojeux_quizrep",
  vfJour: "trilojeux_vfjour",
  vfScore: "trilojeux_vfscore",
  vfRep: "trilojeux_vfrep"
};

// ============================================
// INIT
// ============================================
function initJeux() {
  const jour = getJourNumero();
  quizQuestions = tirerElements(QUIZ_BANQUE, 5, jour * 7919);
  vfQuestions = tirerElements(VF_BANQUE, 5, jour * 5443);

  construireProgressQuiz();

  // Quiz : déjà joué ?
  if (parseInt(localStorage.getItem(K.jour)) === jour) {
    quizScore = parseInt(localStorage.getItem(K.quizScore)) || 0;
    quizPoints = parseInt(localStorage.getItem(K.quizPoints)) || 0;
    quizReponses = JSON.parse(localStorage.getItem(K.quizRep)) || [];
    afficherQuizResults(true);
  } else {
    afficherQuizQuestion();
  }

  demarrerCountdown();
}

// ============================================
// CHANGER DE JEU (onglets)
// ============================================
function changerJeu(jeu) {
  document.getElementById('tabQuiz').classList.toggle('active', jeu === 'quiz');
  document.getElementById('tabVF').classList.toggle('active', jeu === 'vf');
  document.getElementById('jeuQuiz').style.display = jeu === 'quiz' ? 'block' : 'none';
  document.getElementById('jeuVF').style.display = jeu === 'vf' ? 'block' : 'none';

  // Lancer le VF si première ouverture
  if (jeu === 'vf' && vfIndex === 0 && vfReponses.length === 0) {
    const jour = getJourNumero();
    if (parseInt(localStorage.getItem(K.vfJour)) === jour) {
      vfScore = parseInt(localStorage.getItem(K.vfScore)) || 0;
      vfReponses = JSON.parse(localStorage.getItem(K.vfRep)) || [];
      afficherVFResults(true);
    } else {
      afficherVFQuestion();
    }
  }
}

// ============================================
// QUIZ — AFFICHAGE
// ============================================
function construireProgressQuiz() {
  const bar = document.getElementById('quizProgress');
  bar.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    const dot = document.createElement('div');
    dot.className = 'jeu-progress-dot';
    dot.id = 'qdot-' + i;
    bar.appendChild(dot);
  }
}

function majProgressQuiz() {
  for (let i = 0; i < 5; i++) {
    const dot = document.getElementById('qdot-' + i);
    if (!dot) continue;
    dot.className = 'jeu-progress-dot';
    if (i < quizIndex) dot.classList.add('done');
    else if (i === quizIndex) dot.classList.add('current');
  }
}

function afficherQuizQuestion() {
  majProgressQuiz();
  const q = quizQuestions[quizIndex];
  const lettres = ['A', 'B', 'C', 'D'];
  const diffLabel = { facile: JL('Facile','Easy'), moyen: JL('Moyen','Medium'), difficile: JL('Difficile','Hard') };

  let html = `
    <div class="jeu-chrono-wrap">
      <div class="jeu-chrono-track"><div class="jeu-chrono-fill" id="chronoFill"></div></div>
      <div class="jeu-chrono-label">
        <span id="chronoText">⏱️ ${TEMPS_MAX}s</span>
        <span class="jeu-chrono-points" id="chronoPoints">${JL('Rapidité','Speed')} : x2</span>
      </div>
    </div>
    <div class="jeu-card">
      <div class="jeu-q-number">${JL('Question','Question')} ${quizIndex + 1} / 5
        <span class="jeu-q-diff diff-${q.diff}">${diffLabel[q.diff]}</span>
      </div>
      <div class="jeu-q-text">${q.q}</div>
      <div class="jeu-options" id="quizOptions">
  `;
  q.options.forEach((opt, i) => {
    html += `<button class="jeu-option" onclick="repondreQuiz(${i})"><span class="jeu-option-letter">${lettres[i]}</span>${opt}</button>`;
  });
  html += `
      </div>
      <div class="jeu-explanation" id="quizExp"><strong>💡 ${JL('Le savais-tu ?','Did you know?')}</strong><br>${q.exp}</div>
      <button class="jeu-next-btn" id="quizNext" onclick="quizSuivant()">
        ${quizIndex < 4 ? JL('Question suivante →','Next question →') : JL('Voir mon score 🏆','See my score 🏆')}
      </button>
    </div>
  `;
  document.getElementById('quizZone').innerHTML = html;
  demarrerChrono();
}

// ============================================
// CHRONO
// ============================================
function demarrerChrono() {
  tempsRestant = TEMPS_MAX;
  questionRepondue = false;
  if (chronoInterval) clearInterval(chronoInterval);
  chronoInterval = setInterval(() => {
    tempsRestant -= 0.1;
    if (tempsRestant <= 0) { tempsRestant = 0; majChrono(); tempsEcoule(); }
    else majChrono();
  }, 100);
}

function majChrono() {
  const fill = document.getElementById('chronoFill');
  const text = document.getElementById('chronoText');
  const pts = document.getElementById('chronoPoints');
  if (!fill) return;
  fill.style.width = (tempsRestant / TEMPS_MAX * 100) + '%';
  fill.className = 'jeu-chrono-fill';
  if (tempsRestant < 5) fill.classList.add('danger');
  else if (tempsRestant < 8) fill.classList.add('warning');
  if (text) text.textContent = '⏱️ ' + Math.ceil(tempsRestant) + 's';
  if (pts) pts.textContent = JL('Rapidité','Speed') + ' : x' + calcMult().toFixed(1);
}

function calcMult() { return 1 + (tempsRestant / TEMPS_MAX); }

function tempsEcoule() {
  if (questionRepondue) return;
  clearInterval(chronoInterval);
  questionRepondue = true;
  const q = quizQuestions[quizIndex];
  document.querySelectorAll('#quizOptions .jeu-option').forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('correct');
  });
  quizReponses.push(false);
  document.getElementById('quizExp').classList.add('show');
  document.getElementById('quizNext').classList.add('show');
}

function repondreQuiz(choix) {
  if (questionRepondue) return;
  questionRepondue = true;
  clearInterval(chronoInterval);
  const q = quizQuestions[quizIndex];
  document.querySelectorAll('#quizOptions .jeu-option').forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('correct');
    if (i === choix && choix !== q.correct) b.classList.add('wrong');
  });
  if (choix === q.correct) {
    quizScore++;
    const gagnes = Math.round(100 * calcMult());
    quizPoints += gagnes;
    popupPoints(gagnes);
  }
  quizReponses.push(choix === q.correct);
  document.getElementById('quizExp').classList.add('show');
  document.getElementById('quizNext').classList.add('show');
}

function popupPoints(pts) {
  const p = document.createElement('div');
  p.className = 'jeu-points-popup';
  p.textContent = '+' + pts;
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1000);
}

function quizSuivant() {
  quizIndex++;
  if (quizIndex < 5) afficherQuizQuestion();
  else terminerQuiz();
}

function terminerQuiz() {
  const jour = getJourNumero();
  const dernier = parseInt(localStorage.getItem(K.jour));
  let streak = parseInt(localStorage.getItem(K.quizStreak)) || 0;
  streak = (dernier === jour - 1) ? streak + 1 : 1;
  let best = parseInt(localStorage.getItem(K.quizBest)) || 0;
  if (quizPoints > best) best = quizPoints;

  localStorage.setItem(K.jour, jour);
  localStorage.setItem(K.quizScore, quizScore);
  localStorage.setItem(K.quizPoints, quizPoints);
  localStorage.setItem(K.quizStreak, streak);
  localStorage.setItem(K.quizBest, best);
  localStorage.setItem(K.quizRep, JSON.stringify(quizReponses));

  afficherQuizResults(false);
}

function afficherQuizResults(deja) {
  document.getElementById('quizZone').innerHTML = '';
  document.getElementById('quizProgress').style.display = 'none';
  document.getElementById('quizResults').classList.add('show');

  const emojis = ['😅','🙂','😊','😎','🤩','🏆'];
  const msgs = [
    JL("Pas facile ! Reviens demain te rattraper.","Tough one! Come back tomorrow."),
    JL("Un bon début ! Continue.","Good start! Keep going."),
    JL("Pas mal du tout !","Not bad at all!"),
    JL("Bien joué, vrai amateur !","Well played, true fan!"),
    JL("Excellent ! Presque parfait !","Excellent! Almost perfect!"),
    JL("PARFAIT ! Champion du triathlon ! 🎉","PERFECT! Triathlon champion! 🎉")
  ];
  document.getElementById('quizEmoji').textContent = emojis[quizScore];
  document.getElementById('quizScore').textContent = quizPoints;
  document.getElementById('quizSub').textContent = '✅ ' + quizScore + '/5 ' + JL('bonnes réponses','correct');
  document.getElementById('quizMsg').textContent = msgs[quizScore];
  document.getElementById('quizStreak').textContent = parseInt(localStorage.getItem(K.quizStreak)) || 0;
  document.getElementById('quizBest').textContent = parseInt(localStorage.getItem(K.quizBest)) || 0;

  if (deja) {
    document.getElementById('quizMsg').innerHTML = msgs[quizScore] +
      "<br><br><span style='color:var(--accent);font-size:14px;'>✅ " +
      JL("Tu as déjà joué aujourd'hui ! Reviens demain.","You already played today! Come back tomorrow.") + "</span>";
  }
}

// ============================================
// VRAI / FAUX
// ============================================
function afficherVFQuestion() {
  const q = vfQuestions[vfIndex];
  let html = `
    <div class="jeu-vf-progress">${JL('Affirmation','Statement')} ${vfIndex + 1} / 5</div>
    <div class="jeu-card jeu-vf-card">
      <div class="jeu-vf-text">${q.q}</div>
      <div class="jeu-vf-buttons" id="vfButtons">
        <button class="jeu-vf-btn jeu-vf-true" onclick="repondreVF(true)">✅ ${JL('VRAI','TRUE')}</button>
        <button class="jeu-vf-btn jeu-vf-false" onclick="repondreVF(false)">❌ ${JL('FAUX','FALSE')}</button>
      </div>
      <div class="jeu-explanation" id="vfExp">${q.exp}</div>
      <button class="jeu-next-btn" id="vfNext" onclick="vfSuivant()">
        ${vfIndex < 4 ? JL('Suivant →','Next →') : JL('Voir mon score 🏆','See my score 🏆')}
      </button>
    </div>
  `;
  document.getElementById('vfZone').innerHTML = html;
}

function repondreVF(choix) {
  const q = vfQuestions[vfIndex];
  const btns = document.querySelectorAll('#vfButtons .jeu-vf-btn');
  btns.forEach(b => b.disabled = true);

  const correct = choix === q.reponse;
  if (correct) vfScore++;
  vfReponses.push(correct);

  // Colorer
  btns.forEach(b => {
    const estVrai = b.classList.contains('jeu-vf-true');
    if (estVrai === q.reponse) b.classList.add('correct');
    else if (estVrai === choix) b.classList.add('wrong');
  });

  document.getElementById('vfExp').classList.add('show');
  document.getElementById('vfNext').classList.add('show');
}

function vfSuivant() {
  vfIndex++;
  if (vfIndex < 5) afficherVFQuestion();
  else terminerVF();
}

function terminerVF() {
  const jour = getJourNumero();
  localStorage.setItem(K.vfJour, jour);
  localStorage.setItem(K.vfScore, vfScore);
  localStorage.setItem(K.vfRep, JSON.stringify(vfReponses));
  afficherVFResults(false);
}

function afficherVFResults(deja) {
  document.getElementById('vfZone').innerHTML = '';
  document.getElementById('vfResults').classList.add('show');

  const emojis = ['😅','🙂','😊','😎','🤩','🏆'];
  document.getElementById('vfEmoji').textContent = emojis[vfScore];
  document.getElementById('vfScore').textContent = vfScore + '/5';
  const msg = vfScore >= 4 ? JL("Excellent ! Tu maîtrises le triathlon !","Excellent! You know your triathlon!")
    : vfScore >= 2 ? JL("Pas mal ! Continue d'apprendre.","Not bad! Keep learning.")
    : JL("Reviens demain pour progresser !","Come back tomorrow to improve!");
  document.getElementById('vfMsg').textContent = msg;

  if (deja) {
    document.getElementById('vfMsg').innerHTML = msg +
      "<br><br><span style='color:var(--accent);font-size:14px;'>✅ " +
      JL("Déjà joué aujourd'hui ! Reviens demain.","Already played today! Come back tomorrow.") + "</span>";
  }
}

// ============================================
// PARTAGE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const qs = document.getElementById('quizShareBtn');
  if (qs) qs.addEventListener('click', function() {
    const jour = getJourNumero();
    let grille = '';
    quizReponses.forEach(r => grille += r ? '🟩' : '🟥');
    const texte = JL(`Quiz Triathlon Trilo #${jour} : ${quizPoints} pts (${quizScore}/5)\n${grille}\n\nJoue au quiz du jour ! `,
      `Trilo Triathlon Quiz #${jour}: ${quizPoints} pts (${quizScore}/5)\n${grille}\n\nPlay the daily quiz! `) + "https://trilo2.github.io/Trilo/jeux.html";
    partagerTexte(texte, this);
  });

  const vs = document.getElementById('vfShareBtn');
  if (vs) vs.addEventListener('click', function() {
    let grille = '';
    vfReponses.forEach(r => grille += r ? '🟩' : '🟥');
    const texte = JL(`Vrai/Faux Triathlon Trilo : ${vfScore}/5\n${grille}\n\n`,
      `Trilo Triathlon True/False: ${vfScore}/5\n${grille}\n\n`) + "https://trilo2.github.io/Trilo/jeux.html";
    partagerTexte(texte, this);
  });
});

function partagerTexte(texte, bouton) {
  if (navigator.share) {
    navigator.share({ text: texte });
  } else {
    navigator.clipboard.writeText(texte).then(() => {
      const original = bouton.textContent;
      bouton.textContent = '✅ ' + JL('Copié !','Copied!');
      setTimeout(() => { bouton.textContent = original; }, 2000);
    });
  }
}

// ============================================
// COUNTDOWN
// ============================================
function demarrerCountdown() {
  function update() {
    const now = new Date();
    const minuit = new Date();
    minuit.setHours(24, 0, 0, 0);
    const diff = minuit - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const txt = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
    const el1 = document.getElementById('quizCountdown');
    const el2 = document.getElementById('vfCountdown');
    if (el1) el1.textContent = txt;
    if (el2) el2.textContent = txt;
  }
  update();
  setInterval(update, 1000);
}

// Regénère les textes au changement de langue
window.rafraichirJeux = function() {
  location.reload(); // simple : recharge pour tout retraduire
};

// GO
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initJeux);
} else {
  initJeux();
}
=======

>>>>>>> 6c80b822183f16d4558ca2114880acf7e523d792
