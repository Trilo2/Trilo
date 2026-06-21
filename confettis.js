/* =========================
   CONFETTIS — TRILO
   Animation de célébration pour les records
========================= */

function lancerConfettis() {
  const couleurs = ["#00d4ff", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#ffffff"];
  const nbConfettis = 120;
  const conteneur = document.createElement("div");
  conteneur.className = "confettis-conteneur";
  document.body.appendChild(conteneur);

  for (let i = 0; i < nbConfettis; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.background = couleurs[Math.floor(Math.random() * couleurs.length)];
    conf.style.animationDelay = Math.random() * 0.5 + "s";
    conf.style.animationDuration = (2 + Math.random() * 2) + "s";
    conf.style.width = conf.style.height = (6 + Math.random() * 8) + "px";
    if (Math.random() > 0.5) conf.style.borderRadius = "50%";
    conteneur.appendChild(conf);
  }

  // Message de célébration
  const message = document.createElement("div");
  message.className = "record-message";
  message.innerHTML = `
    <div class="record-message-content">
      <span class="record-message-emoji">🎉</span>
      <strong>NOUVEAU RECORD !</strong>
      <p>Tu as battu ton meilleur score !</p>
    </div>
  `;
  document.body.appendChild(message);

  // Vibration sur mobile
  if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);

  // Nettoyer après l'animation
  setTimeout(() => {
    conteneur.remove();
    message.remove();
  }, 4000);
}

window.lancerConfettis = lancerConfettis;
