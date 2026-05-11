let labels = JSON.parse(localStorage.getItem("triloLabels")) || [];
let data = JSON.parse(localStorage.getItem("triloData")) || [];
let chart = null;

function convertirTempsEnMinutes(temps) {
  if (!temps) return 0;

  temps = temps.trim().replace("'", ":");

  if (!temps.includes(":")) {
    return Number(temps);
  }

  const parties = temps.split(":");
  const minutes = Number(parties[0]);
  const secondes = Number(parties[1]);

  if (isNaN(minutes) || isNaN(secondes)) return 0;

  return minutes + secondes / 60;
}

function analyser() {
  const swimDist = Number(document.getElementById("swimDist").value);
  const swimTime = convertirTempsEnMinutes(document.getElementById("swimTime").value);

  const bikeDist = Number(document.getElementById("bikeDist").value);
  const bikeTime = convertirTempsEnMinutes(document.getElementById("bikeTime").value);

  const runDist = Number(document.getElementById("runDist").value);
  const runTime = convertirTempsEnMinutes(document.getElementById("runTime").value);

  const refSwim = 45;
  const refBike = 22;
  const refRun = 12;

  let total = 0;
  let count = 0;
  let performances = [];

  if (swimDist > 0 && swimTime > 0) {
    const speed = swimDist / swimTime;
    const score = (speed / refSwim) * 10;
    total += score;
    count++;
    performances.push({ sport: "natation", score: score });
  }

  if (bikeDist > 0 && bikeTime > 0) {
    const speed = bikeDist / (bikeTime / 60);
    const score = (speed / refBike) * 10;
    total += score;
    count++;
    performances.push({ sport: "vélo", score: score });
  }

  if (runDist > 0 && runTime > 0) {
    const speed = runDist / (runTime / 60);
    const score = (speed / refRun) * 10;
    total += score;
    count++;
    performances.push({ sport: "course", score: score });
  }

  if (count === 0) {
    alert("Remplis au moins un sport correctement.");
    return;
  }

  const globalScore = total / count;
  const previousData = JSON.parse(localStorage.getItem("triloData")) || [];

  let evolution = "🚀 Première séance enregistrée.";
  let objectif = "🎯 Enregistre une deuxième séance pour comparer.";
  let fatigue = "";

  if (previousData.length > 0) {
    const lastScore = previousData[previousData.length - 1];

    if (globalScore > lastScore) {
      evolution = "📈 Tu progresses par rapport à ta dernière séance.";
    } else if (globalScore < lastScore) {
      evolution = "⚠️ Tu baisses un peu. Vérifie ta récupération.";
    } else {
      evolution = "😐 Tu es stable.";
    }

    let target;
    if (globalScore < 6) {
      target = globalScore * 1.10;
    } else if (globalScore < 10) {
      target = globalScore * 1.07;
    } else {
      target = globalScore * 1.03;
    }

    objectif = "🎯 Objectif prochaine séance : " + target.toFixed(2);
  }

  if (previousData.length >= 2) {
    const last = previousData[previousData.length - 1];
    const before = previousData[previousData.length - 2];

    if (globalScore < last && last < before) {
      fatigue = "⚠️ Alerte fatigue : baisse sur plusieurs séances. Repose-toi.";
    }
  }

  const today = new Date().toLocaleDateString("fr-FR");
  labels.push(today);
  data.push(globalScore);

  localStorage.setItem("triloLabels", JSON.stringify(labels));
  localStorage.setItem("triloData", JSON.stringify(data));

  let level = "";
  let intro = "";

  if (globalScore < 6) {
    level = "Niveau 1 😐 Débutant";
    intro = "Tu construis ta base.";
  } else if (globalScore < 9) {
    level = "Niveau 2 👍 En progrès";
    intro = "Bonne progression.";
  } else if (globalScore < 12) {
    level = "Niveau 3 🔥 Bon niveau";
    intro = "Très solide.";
  } else if (globalScore < 15) {
    level = "Niveau 4 💪 Très bon";
    intro = "Excellent rythme.";
  } else {
    level = "Niveau 5 🏅 Excellent";
    intro = "Niveau compétitif.";
  }

  performances.sort((a, b) => a.score - b.score);

  const sportFaible = performances[0];
  const sportFort = performances[performances.length - 1];

  let stats = "📊 Scores par sport :\n";
  performances.forEach((p) => {
    stats += "- " + p.sport + " : " + p.score.toFixed(2) + "\n";
  });

  let conseil = "";
  if (sportFaible.sport === "natation") {
    conseil = "🏊 Conseil : travaille ta technique, ta respiration et ta régularité.";
  } else if (sportFaible.sport === "vélo") {
    conseil = "🚴 Conseil : travaille ta cadence et évite les gros à-coups.";
  } else {
    conseil = "🏃 Conseil : travaille ton allure et ton endurance progressivement.";
  }

  document.getElementById("score").innerText = level;
  document.getElementById("message").innerText =
    intro +
    "\n\nScore global : " + globalScore.toFixed(2) +
    "\n\n💪 Point fort : " + sportFort.sport +
    "\n⚠️ Point faible : " + sportFaible.sport +
    "\n\n" + stats +
    "\n" + evolution +
    "\n\n" + objectif +
    "\n\n" + fatigue +
    "\n\n" + conseil;

  drawChart();
}

function drawChart() {
  const canvas = document.getElementById("chart");
  if (!canvas) return;

  if (chart) chart.destroy();

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Progression Trilo",
        data: data,
        borderWidth: 3,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function resetData() {
  const ok = confirm("Supprimer tout l'historique Trilo ?");
  if (!ok) return;

  labels = [];
  data = [];

  localStorage.removeItem("triloLabels");
  localStorage.removeItem("triloData");

  document.getElementById("score").innerText = "Aucun score";
  document.getElementById("message").innerText = "Historique supprimé.";

  drawChart();
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("analyzeBtn").addEventListener("click", analyser);
  document.getElementById("resetBtn").addEventListener("click", resetData);
  drawChart();
});
