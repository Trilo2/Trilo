/* =========================
   MODULE STATS — TRILO
   Distance totale (gratuit) + graphiques par sport (Premium)
========================= */

let chartSwim = null, chartBike = null, chartRun = null;

function calculerDistanceTotale() {
  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
  const totaux = { natation: 0, "vélo": 0, course: 0 };
  sessions.forEach(s => {
    if (s.swimDist) totaux.natation += s.swimDist;
    if (s.bikeDist) totaux["vélo"]   += s.bikeDist;
    if (s.runDist)  totaux.course    += s.runDist;
  });
  return totaux;
}

function afficherDistanceTotale() {
  const zone = document.getElementById("distanceTotaleZone");
  if (!zone) return;

  const t = calculerDistanceTotale();
  const totalKm = (t.natation / 1000) + t["vélo"] + t.course;

  zone.innerHTML = `
    <div class="dist-grid">
      <div class="dist-box dist-swim">
        <span>🏊</span>
        <strong>${(t.natation / 1000).toFixed(2)}</strong>
        <small>km nagés</small>
      </div>
      <div class="dist-box dist-bike">
        <span>🚴</span>
        <strong>${t["vélo"].toFixed(1)}</strong>
        <small>km à vélo</small>
      </div>
      <div class="dist-box dist-run">
        <span>🏃</span>
        <strong>${t.course.toFixed(2)}</strong>
        <small>km courus</small>
      </div>
      <div class="dist-box dist-total">
        <span>🏆</span>
        <strong>${totalKm.toFixed(1)}</strong>
        <small>km au total</small>
      </div>
    </div>
  `;
}

function afficherGraphiquesParSport() {
  const zone = document.getElementById("graphiquesParSportZone");
  if (!zone) return;

  // Vérifier si Premium
  const isPremium = window._triloIsPremium === true;
  if (!isPremium) {
    zone.innerHTML = `<div class="premium-lock-msg" style="padding:50px 30px;text-align:center;">
      <div style="font-size:32px;margin-bottom:10px;">📊</div>
      🔒 <strong>Graphiques par sport Premium</strong><br>
      <span style="color:var(--text-muted);font-size:13px;">Débloque l'évolution détaillée par discipline avec Trilo Premium</span>
    </div>`;
    return;
  }

  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
  if (sessions.length === 0) {
    zone.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:20px;">Fais une analyse pour voir tes graphiques par sport.</p>`;
    return;
  }

  zone.innerHTML = `
    <div class="sport-charts-grid">
      <div class="sport-chart-card">
        <h4>🏊 Natation</h4>
        <canvas id="chartSwim"></canvas>
      </div>
      <div class="sport-chart-card">
        <h4>🚴 Vélo</h4>
        <canvas id="chartBike"></canvas>
      </div>
      <div class="sport-chart-card">
        <h4>🏃 Course</h4>
        <canvas id="chartRun"></canvas>
      </div>
    </div>
  `;

  // Extraire les scores par sport
  const dataParSport = { natation: [], "vélo": [], course: [] };
  sessions.forEach((s, i) => {
    s.performances?.forEach(p => {
      if (dataParSport[p.sport]) {
        dataParSport[p.sport].push({ x: i + 1, y: parseFloat(p.score.toFixed(2)) });
      }
    });
  });

  const colors = {
    natation: "#3b82f6",
    "vélo":   "#10b981",
    course:   "#f59e0b"
  };

  ["natation", "vélo", "course"].forEach(sport => {
    const id = sport === "natation" ? "chartSwim" : sport === "vélo" ? "chartBike" : "chartRun";
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === "undefined") return;

    const data = dataParSport[sport];
    if (data.length === 0) {
      canvas.parentElement.innerHTML += `<p style="color:var(--text-muted);font-size:12px;text-align:center;">Aucune séance enregistrée.</p>`;
      return;
    }

    new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: data.map(d => `S${d.x}`),
        datasets: [{
          label: `Score ${sport}`,
          data: data.map(d => d.y),
          borderColor: colors[sport],
          backgroundColor: colors[sport] + "20",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: "#aaa", font: { size: 10 } }, grid: { color: "#222" } },
          y: { ticks: { color: "#aaa", font: { size: 10 } }, grid: { color: "#222" }, min: 0, max: 20 }
        }
      }
    });
  });
}

// Rafraîchir tout
function rafraichirStats() {
  afficherDistanceTotale();
  afficherGraphiquesParSport();
}

// Observer le statut Premium
window.addEventListener("DOMContentLoaded", () => {
  rafraichirStats();
});

// Rafraîchir après chaque analyse
const _origSetItem3 = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(key, value) {
  _origSetItem3(key, value);
  if (key === "triloSessions") rafraichirStats();
};

// Exposer pour rafraîchir depuis script.js après vérification Premium
window.rafraichirStats = rafraichirStats;
