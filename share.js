/* =========================
   MODULE PARTAGE — TRILO
   Génère une image carrée style Instagram
========================= */

function genererImagePartage(result) {
  const { globalScore, performances } = result;

  // Canvas 1080x1080 (format Instagram)
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");

  // Fond dégradé
  const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
  grad.addColorStop(0, "#020510");
  grad.addColorStop(0.5, "#0a1628");
  grad.addColorStop(1, "#020510");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1080, 1080);

  // Halo cyan
  const radial = ctx.createRadialGradient(540, 400, 0, 540, 400, 600);
  radial.addColorStop(0, "rgba(0, 212, 255, 0.15)");
  radial.addColorStop(1, "rgba(0, 212, 255, 0)");
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, 1080, 1080);

  // Titre TRILO
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 80px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TRILO", 540, 150);

  // Sous-titre
  ctx.fillStyle = "#4a6080";
  ctx.font = "24px sans-serif";
  ctx.fillText("ANALYSE • PROGRESSE • DOMINE", 540, 200);

  // Score énorme
  ctx.fillStyle = "#fff";
  ctx.font = "bold 200px sans-serif";
  ctx.fillText(globalScore.toFixed(0), 540, 460);

  // /100
  ctx.fillStyle = "#00d4ff";
  ctx.font = "bold 70px sans-serif";
  ctx.fillText("/ 100", 540, 540);

  // Niveau
  const niveauLabels = {
    20: "DÉBUTANT",
    35: "EN PROGRÈS",
    50: "BON NIVEAU",
    65: "TRÈS BON",
    80: "EXPERT",
    100: "ÉLITE"
  };
  let niveau = "ÉLITE";
  for (const [seuil, label] of Object.entries(niveauLabels)) {
    if (globalScore < parseInt(seuil)) { niveau = label; break; }
  }
  ctx.fillStyle = "#f59e0b";
  ctx.font = "bold 40px sans-serif";
  ctx.fillText("🏆 " + niveau, 540, 620);

  // Performances
  ctx.fillStyle = "#fff";
  ctx.font = "32px sans-serif";
  let y = 730;
  performances.forEach(p => {
    const emoji = p.sport === "natation" ? "🏊" : p.sport === "vélo" ? "🚴" : "🏃";
    const vitesse = p.sport === "natation" ? `${p.speed.toFixed(1)} m/min` : `${p.speed.toFixed(1)} km/h`;
    ctx.fillText(`${emoji}  ${p.sport.toUpperCase()}  ${vitesse}  —  ${p.score.toFixed(0)}/100`, 540, y);
    y += 60;
  });

  // Pied
  ctx.fillStyle = "#4a6080";
  ctx.font = "22px sans-serif";
  ctx.fillText("trilo2.github.io/Trilo", 540, 1020);

  return canvas;
}

function partagerSeance(result) {
  // Ouvrir un menu de choix
  const score = result.globalScore.toFixed(0);
  const url = "https://trilo2.github.io/Trilo/";
  const message = `Je viens de scorer ${score}/100 sur Trilo ! 🚀\nAnalyse tes perfs de triathlon gratuitement : ${url}`;

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
      <h3>📸 Partager ma séance</h3>
      <p>Score : <strong>${score}/100</strong></p>

      <div class="share-menu-options">
        <button class="share-option share-whatsapp" onclick="window.open('https://wa.me/?text=${encodeURIComponent(message)}', '_blank')">
          <span>💬</span> WhatsApp
        </button>
        <button class="share-option share-sms" onclick="window.location.href='sms:?&body=${encodeURIComponent(message)}'">
          <span>📱</span> SMS
        </button>
        <button class="share-option share-image" onclick="window._triloDownloadImage()">
          <span>📷</span> Télécharger l'image
        </button>
        <button class="share-option share-copy" onclick="navigator.clipboard.writeText('${message.replace(/'/g, "\\'")}'); alert('✅ Message copié !');">
          <span>📋</span> Copier le message
        </button>
        <button class="share-option share-mail" onclick="window.location.href='mailto:?subject=Ma séance Trilo&body=${encodeURIComponent(message)}'">
          <span>✉️</span> Email
        </button>
      </div>

      <button class="share-menu-close" onclick="document.getElementById('shareMenu').classList.remove('share-menu-show')">
        Fermer
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
      a.download = "trilo-seance.png";
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
      alert("Fais d'abord une analyse !");
    }
  });
});
