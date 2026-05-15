// DASHBOARD AVANCÉ TRILO

function mettreAJourDashboard(globalScore, performances) {

  // nombre total de séances
  const sessions = data.length;

  // meilleur score
  const bestScore = Math.max(...data);

  // moyenne générale
  const average =
    data.reduce((a, b) => a + b, 0) / data.length;

  // sport dominant
  let dominantSport = "Aucun";

  if (performances.length > 0) {

    const best =
      [...performances].sort((a, b) => b.score - a.score)[0];

    dominantSport = best.sport;
  }

  // progression totale
  let progression = "0%";

  if (data.length >= 2) {

    const first = data[0];
    const last = data[data.length - 1];

    const diff =
      ((last - first) / first) * 100;

    progression =
      diff.toFixed(1) + "%";
  }

  // régularité
  let regularite = "Faible";

  if (sessions >= 3) {
    regularite = "Bonne";
  }

  if (sessions >= 7) {
    regularite = "Excellente";
  }

  // meilleur badge
  let topBadge = "Aucun";

  if (globalScore >= 15) {
    topBadge = "🏆 Elite Trilo";
  } else if (globalScore >= 10) {
    topBadge = "💪 Score 10+";
  } else if (globalScore >= 8) {
    topBadge = "🔥 Bon départ";
  }

  // niveau IA
  let aiLevel = "Débutant";

  if (globalScore >= 6) {
    aiLevel = "Intermédiaire";
  }

  if (globalScore >= 10) {
    aiLevel = "Avancé";
  }

  if (globalScore >= 15) {
    aiLevel = "Elite";
  }

  // calories approximatives
  const calories =
    Math.round(globalScore * 55);

  // charge entraînement
  let trainingLoad = "Légère";

  if (globalScore >= 8) {
    trainingLoad = "Modérée";
  }

  if (globalScore >= 12) {
    trainingLoad = "Élevée";
  }

  // récupération
  let recovery = "24h";

  if (globalScore >= 10) {
    recovery = "36h";
  }

  if (globalScore >= 15) {
    recovery = "48h";
  }

  // mise à jour HTML

  if (el("bestScore")) {
    el("bestScore").innerText =
      bestScore.toFixed(2);
  }

  if (el("averageScore")) {
    el("averageScore").innerText =
      average.toFixed(2);
  }

  if (el("sessionCount")) {
    el("sessionCount").innerText =
      sessions;
  }

  if (el("bestSport")) {
    el("bestSport").innerText =
      dominantSport;
  }

  // dashboard avancé bonus

  if (el("progressionValue")) {
    el("progressionValue").innerText =
      progression;
  }

  if (el("regularityValue")) {
    el("regularityValue").innerText =
      regularite;
  }

  if (el("topBadgeValue")) {
    el("topBadgeValue").innerText =
      topBadge;
  }

  if (el("aiLevelValue")) {
    el("aiLevelValue").innerText =
      aiLevel;
  }

  if (el("caloriesValue")) {
    el("caloriesValue").innerText =
      calories + " kcal";
  }

  if (el("trainingLoadValue")) {
    el("trainingLoadValue").innerText =
      trainingLoad;
  }

  if (el("recoveryValue")) {
    el("recoveryValue").innerText =
      recovery;
  }
}
