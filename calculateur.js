/* =========================
   CALCULATEUR D'ALLURE — TRILO
   Outil public (pas besoin de compte)
========================= */

function parseTemps(str) {
  if (!str) return null;
  const parts = str.split(":").map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];        // mm:ss
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // hh:mm:ss
  return null;
}

function formaterTemps(totalSec) {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = Math.round(totalSec % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2,"0")}min ${s.toString().padStart(2,"0")}s`;
  return `${m}min ${s.toString().padStart(2,"0")}s`;
}

function formaterAllure(secParKm) {
  const m = Math.floor(secParKm / 60);
  const s = Math.round(secParKm % 60);
  return `${m}:${s.toString().padStart(2, "0")} /km`;
}

// Distances de course classiques
const DISTANCES = [
  { nom: "1 km", km: 1 },
  { nom: "5 km", km: 5 },
  { nom: "10 km", km: 10 },
  { nom: "Semi-marathon", km: 21.0975 },
  { nom: "Marathon", km: 42.195 }
];

function calculer() {
  const distance = parseFloat(document.getElementById("calcDistance").value);
  const tempsStr = document.getElementById("calcTemps").value;
  const resultZone = document.getElementById("calcResult");

  if (!distance || distance <= 0) {
    resultZone.innerHTML = `<p class="calc-error">⚠️ Entre une distance valide (en km)</p>`;
    return;
  }

  const tempsSec = parseTemps(tempsStr);
  if (!tempsSec || tempsSec <= 0) {
    resultZone.innerHTML = `<p class="calc-error">⚠️ Entre un temps valide (ex : 50:00 ou 1:30:00)</p>`;
    return;
  }

  // Calculs
  const allureSecParKm = tempsSec / distance;
  const vitesseKmh = distance / (tempsSec / 3600);

  let html = `
    <div class="calc-main-result">
      <div class="calc-big-box">
        <span class="calc-big-label">Ton allure</span>
        <span class="calc-big-value">${formaterAllure(allureSecParKm)}</span>
      </div>
      <div class="calc-big-box">
        <span class="calc-big-label">Ta vitesse</span>
        <span class="calc-big-value">${vitesseKmh.toFixed(1)} km/h</span>
      </div>
    </div>

    <h3 class="calc-table-titre">⏱️ Tes temps de passage à cette allure</h3>
    <div class="calc-table">
  `;

  DISTANCES.forEach(d => {
    const temps = allureSecParKm * d.km;
    html += `
      <div class="calc-table-row">
        <span class="calc-table-dist">${d.nom}</span>
        <span class="calc-table-temps">${formaterTemps(temps)}</span>
      </div>
    `;
  });

  html += `</div>
    <p class="calc-cta-trilo">💡 Envie d'analyser tes performances en détail ? <a href="analyser.html">Essaie Trilo gratuitement →</a></p>
  `;

  resultZone.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calcBtn")?.addEventListener("click", calculer);

  // Permettre le calcul avec Entrée
  ["calcDistance", "calcTemps"].forEach(id => {
    document.getElementById(id)?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") calculer();
    });
  });
});
