/* =========================
   MODULE PARTAGE — TRILO
   Génère une image carrée style Instagram
========================= */

function genererImagePartage(result) {
  const { globalScore, performances } = result;
  const EN = (localStorage.getItem("triloLangue") || "fr") === "en";

  // Canvas 1080x1080 (format Instagram)
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  // Fond dégradé profond
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, "#020510");
  grad.addColorStop(0.5, "#0a1628");
  grad.addColorStop(1, "#020510");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Cercles décoratifs en arrière-plan
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(540, 480, 150 + i * 90, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Halo cyan central
  const radial = ctx.createRadialGradient(540, 440, 0, 540, 440, 550);
  radial.addColorStop(0, "rgba(0, 212, 255, 0.18)");
  radial.addColorStop(1, "rgba(0, 212, 255, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 1080, 1080);

  // Bordure néon
  ctx.strokeStyle = "rgba(0, 212, 255, 0.4)";
  ctx.lineWidth = 6;
  ctx.strokeRect(30, 30, 1020, 1020);

  // Titre TRILO
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 90px sans-serif";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0, 212, 255, 0.6)";
  ctx.shadowBlur = 30;
  ctx.fillText("TRILO", 540, 160);
  ctx.shadowBlur = 0;

  // Sous-titre
  ctx.fillStyle = "#4a6080";
  ctx.font = "26px sans-serif";
  ctx.fillText(EN ? "ANALYZE · PROGRESS · DOMINATE" : "ANALYSE · PROGRESSE · DOMINE", 540, 205);

  // Label "MON SCORE"
  ctx.fillStyle = "#6b7d99";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText(EN ? "MY TRILO SCORE" : "MON SCORE TRILO", 540, 290);

  // Cercle de score
  ctx.beginPath();
  ctx.arc(540, 470, 160, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 212, 255, 0.25)";
  ctx.lineWidth = 12;
  ctx.stroke();

  // Arc de score (proportionnel)
  ctx.beginPath();
  ctx.arc(540, 470, 160, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * globalScore / 100));
  ctx.strokeStyle = "#00d4ff";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.shadowColor = "rgba(0, 212, 255, 0.8)";
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Score énorme dans le cercle
  ctx.fillStyle = "#fff";
  ctx.font = "bold 170px sans-serif";
  ctx.fillText(globalScore.toFixed(0), 540, 530);

  // /100
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 50px sans-serif";
  ctx.fillText("/ 100", 540, 590);

  // Niveau (badge doré)
  const niveauLabels = EN ? {
    20: "BEGINNER", 35: "IMPROVING", 50: "GOOD LEVEL", 65: "VERY GOOD", 80: "EXPERT", 100: "ELITE"
  } : {
    20: "DÉBUTANT", 35: "EN PROGRÈS", 50: "BON NIVEAU", 65: "TRÈS BON", 80: "EXPERT", 100: "ÉLITE"
  };
  let niveau = "ELITE";
  for (const [seuil, label] of Object.entries(niveauLabels)) {
    if (globalScore < parseInt(seuil)) { niveau = label; break; }
  }

  // Pastille niveau
  ctx.fillStyle = "rgba(245, 158, 11, 0.15)";
  const badgeW = 360, badgeH = 70;
  roundRect(ctx, 540 - badgeW/2, 690, badgeW, badgeH, 35);
  ctx.fill();
  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 42px sans-serif";
  ctx.fillText("🏆 " + niveau, 540, 738);

  // Performances
  ctx.font = "34px sans-serif";
  let y = 830;
  performances.forEach(p => {
    const emoji = p.sport === "natation" ? "🏊" : p.sport === "vélo" ? "🚴" : "🏃";
    const nom = EN
      ? (p.sport === "natation" ? "SWIM" : p.sport === "vélo" ? "BIKE" : "RUN")
      : p.sport.toUpperCase();
    const vitesse = p.sport === "natation" ? `${p.speed.toFixed(1)} m/min` : `${p.speed.toFixed(1)} km/h`;
    ctx.fillStyle = "#fff";
    ctx.fillText(`${emoji}  ${nom}  ·  ${vitesse}  ·  ${p.score.toFixed(0)}/100`, 540, y);
    y += 58;
  });

  // Pied avec URL
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("trilo2.github.io/Trilo", 540, 1020);

  return canvas;
}

// Helper pour dessiner un rectangle arrondi
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function partagerSeance(result) {
  const EN = (localStorage.getItem("triloLangue") || "fr") === "en";
  const score = result.globalScore.toFixed(0);
  const url = "https://trilo2.github.io/Trilo/";
  const message = EN
    ? `I just scored ${score}/100 on Trilo! 🚀\nAnalyze your triathlon performance for free: ${url}`
    : `Je viens de scorer ${score}/100 sur Trilo ! 🚀\nAnalyse tes perfs de triathlon gratuitement : ${url}`;

  // Créer le menu
  let menu = document.getElementById("shareMenu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "shareMenu";
    menu.className = "share-menu";
    document.body.appendChild(menu);
  }

  menu.innerHTML = `
    <div class="share-menu-overlay" onclick="document.getElementById('shareMenu').classList.remove('share-menu-show')"></div>
    <div class="share-menu-content">
      <h3>📸 ${EN ? "Share my session" : "Partager ma séance"}</h3>
      <p>${EN ? "Score" : "Score"} : <strong>${score}/100</strong></p>

      <div class="share-menu-options">
        <button class="share-option share-whatsapp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(message)}', '_blank')">
          <span>💬</span> WhatsApp
        </button>
        <button class="share-option share-sms" onclick="window.location.href='sms:?&body=${encodeURIComponent(message)}'">
          <span>📱</span> SMS
        </button>
        <button class="share-option share-image" onclick="window._triloDownloadImage()">
          <span>📷</span> ${EN ? "Download image" : "Télécharger l'image"}
        </button>
        <button class="share-option share-copy" onclick="navigator.clipboard.writeText('${message.replace(/'/g, "\\'")}'); alert('${EN ? "✅ Message copied!" : "✅ Message copié !"}');">
          <span>📋</span> ${EN ? "Copy message" : "Copier le message"}
        </button>
        <button class="share-option share-mail" onclick="window.location.href='mailto:?subject=${EN ? "My Trilo session" : "Ma séance Trilo"}&body=${encodeURIComponent(message)}'">
          <span>✉️</span> Email
        </button>
      </div>

      <button class="share-menu-close" onclick="document.getElementById('shareMenu').classList.remove('share-menu-show')">
        ${EN ? "Close" : "Fermer"}
      </button>
    </div>
  `;

  menu.classList.add("share-menu-show");

  // Préparer le téléchargement d'image
  window._triloDownloadImage = function() {
    const canvas = genererImagePartage(result);
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "trilo-score.png";
      a.click();
      URL.revokeObjectURL(url);
      document.getElementById("shareMenu").classList.remove("share-menu-show");
    }, "image/png");
  };
}

// Exposer globalement pour script.js
window.partagerSeance = partagerSeance;

// Bind le bouton au chargement
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("shareBtn")?.addEventListener("click", () => {
    if (window._triloLastResult) {
      partagerSeance(window._triloLastResult);
    } else {
      const EN = (localStorage.getItem("triloLangue") || "fr") === "en";
      alert(EN ? "Do an analysis first!" : "Fais d'abord une analyse !");
    }
  });
});
