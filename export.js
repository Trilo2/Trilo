/* =========================
   EXPORT PDF DES PERFORMANCES — TRILO (Premium)
========================= */

function expLang() { return localStorage.getItem("triloLangue") || "fr"; }
function EL(fr, en) { return expLang() === "en" ? en : fr; }

function afficherExport() {
  const zone = document.getElementById("exportZone");
  if (!zone) return;

  const connecte = window._triloUserConnected === true;
  const premium = window._triloIsPremium === true;

  if (!connecte) {
    zone.innerHTML = `<p class="export-locked">🔒 ${EL("Connecte-toi pour exporter tes performances.", "Log in to export your performances.")}</p>`;
    return;
  }

  if (!premium) {
    zone.innerHTML = `
      <div class="export-premium-lock">
        <p>🔒 <strong>${EL("Fonctionnalité Premium", "Premium feature")}</strong></p>
        <p style="font-size:13px;color:var(--text-muted);">${EL("L'export PDF est réservé aux membres Premium. Passe à Premium pour générer ton rapport !", "PDF export is reserved for Premium members. Go Premium to generate your report!")}</p>
        <a href="premium.html" class="export-premium-btn">⭐ ${EL("Découvrir Premium", "Discover Premium")}</a>
      </div>
    `;
    return;
  }

  zone.innerHTML = `
    <button class="export-btn" onclick="genererPDF()">📄 ${EL("Générer mon rapport PDF", "Generate my PDF report")}</button>
  `;
}

function genererPDF() {
  const sessions = JSON.parse(localStorage.getItem("triloSessions")) || [];
  const pseudo = window._triloPseudo || "Triathlète";

  if (sessions.length === 0) {
    alert(EL("Tu n'as pas encore de séance à exporter !", "You don't have any session to export yet!"));
    return;
  }

  // Calculs
  const nbSeances = sessions.length;
  const meilleurScore = Math.max(...sessions.map(s => s.globalScore || 0));
  const scoreMoyen = (sessions.reduce((a, s) => a + (s.globalScore || 0), 0) / nbSeances).toFixed(0);

  let distanceTotale = 0;
  sessions.forEach(s => {
    s.performances?.forEach(p => {
      if (p.sport === "natation") distanceTotale += (p.distance || 0) / 1000;
      else distanceTotale += (p.distance || 0);
    });
  });

  // Date
  const date = new Date().toLocaleDateString(expLang() === "en" ? "en-US" : "fr-FR");

  // Construire le HTML du rapport
  const titre = EL("Rapport de performances", "Performance Report");
  const sousTitre = EL("Généré le", "Generated on");

  const contenu = `
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${titre} - ${pseudo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a2e; }
        .header { text-align: center; border-bottom: 3px solid #00d4ff; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #00d4ff; font-size: 32px; margin: 0; }
        .header p { color: #666; margin: 6px 0 0; }
        .stats { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 20px; margin: 30px 0; }
        .stat { text-align: center; padding: 20px; background: #f5f9ff; border-radius: 12px; min-width: 120px; }
        .stat-num { font-size: 36px; font-weight: bold; color: #00d4ff; }
        .stat-label { font-size: 13px; color: #666; text-transform: uppercase; }
        h2 { color: #1a1a2e; border-left: 4px solid #00d4ff; padding-left: 12px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; font-size: 14px; }
        th { background: #00d4ff; color: white; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏊🚴🏃 TRILO</h1>
        <p>${titre} — ${pseudo}</p>
        <p>${sousTitre} ${date}</p>
      </div>

      <div class="stats">
        <div class="stat"><div class="stat-num">${meilleurScore}</div><div class="stat-label">${EL("Meilleur score", "Best score")}</div></div>
        <div class="stat"><div class="stat-num">${scoreMoyen}</div><div class="stat-label">${EL("Score moyen", "Avg score")}</div></div>
        <div class="stat"><div class="stat-num">${nbSeances}</div><div class="stat-label">${EL("Séances", "Sessions")}</div></div>
        <div class="stat"><div class="stat-num">${distanceTotale.toFixed(0)}</div><div class="stat-label">${EL("km parcourus", "km covered")}</div></div>
      </div>

      <h2>${EL("Historique des séances", "Session history")}</h2>
      <table>
        <tr>
          <th>${EL("Date", "Date")}</th>
          <th>${EL("Score", "Score")}</th>
          <th>${EL("Disciplines", "Disciplines")}</th>
        </tr>
        ${sessions.slice().reverse().map(s => {
          const d = s.date ? new Date(s.date).toLocaleDateString(expLang() === "en" ? "en-US" : "fr-FR") : "-";
          const disc = s.performances?.map(p => p.sport).join(", ") || "-";
          return `<tr><td>${d}</td><td>${(s.globalScore || 0).toFixed(0)}/100</td><td>${disc}</td></tr>`;
        }).join("")}
      </table>

      <div class="footer">
        ${EL("Rapport généré par Trilo", "Report generated by Trilo")} · trilo2.github.io/Trilo
      </div>
    </body>
    </html>
  `;

  // Ouvrir dans une nouvelle fenêtre et lancer l'impression (PDF)
  const fenetre = window.open("", "_blank");
  fenetre.document.write(contenu);
  fenetre.document.close();
  setTimeout(() => fenetre.print(), 500);
}

window.genererPDF = genererPDF;
window.rafraichirExport = afficherExport;

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => setTimeout(afficherExport, 800));
} else {
  setTimeout(afficherExport, 800);
}
