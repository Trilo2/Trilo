/* =========================
   TUTORIEL D'ACCUEIL — TRILO
   Petite visite guidée à la première visite
========================= */

function tutoLang() { return localStorage.getItem("triloLangue") || "fr"; }
function TL(fr, en) { return tutoLang() === "en" ? en : fr; }

function lancerTutoriel() {
  // Ne montrer qu'une seule fois
  if (localStorage.getItem("triloTutoVu") === "true") return;

  const etapes = [
    {
      emoji: "👋",
      titre: TL("Bienvenue sur Trilo !", "Welcome to Trilo!"),
      texte: TL("Trilo analyse tes performances de triathlon et te donne un score sur 100 avec des conseils. C'est 100% gratuit !", "Trilo analyzes your triathlon performance and gives you a score out of 100 with tips. It's 100% free!")
    },
    {
      emoji: "📊",
      titre: TL("Analyse tes perfs", "Analyze your performance"),
      texte: TL("Entre tes temps et distances en natation, vélo et course. Pas besoin de compte pour essayer !", "Enter your times and distances in swimming, cycling and running. No account needed to try!")
    },
    {
      emoji: "🏅",
      titre: TL("Débloque des badges", "Unlock badges"),
      texte: TL("Crée un compte gratuit pour sauvegarder tes scores, gagner des badges et suivre ta progression.", "Create a free account to save your scores, earn badges and track your progress.")
    },
    {
      emoji: "🎁",
      titre: TL("Offre de lancement", "Launch offer"),
      texte: TL("Les 5 premières personnes à créer un compte obtiennent Premium GRATUIT À VIE ! Dépêche-toi.", "The first 5 people to create an account get Premium FREE FOR LIFE! Hurry up.")
    }
  ];

  let etapeActuelle = 0;

  const overlay = document.createElement("div");
  overlay.className = "tuto-overlay";
  overlay.innerHTML = `<div class="tuto-box" id="tutoBox"></div>`;
  document.body.appendChild(overlay);

  function afficherEtape() {
    const e = etapes[etapeActuelle];
    const estDerniere = etapeActuelle === etapes.length - 1;
    const box = document.getElementById("tutoBox");
    box.innerHTML = `
      <span class="tuto-emoji">${e.emoji}</span>
      <h2 class="tuto-titre">${e.titre}</h2>
      <p class="tuto-texte">${e.texte}</p>
      <div class="tuto-points">
        ${etapes.map((_, i) => `<span class="tuto-point ${i === etapeActuelle ? "tuto-point-actif" : ""}"></span>`).join("")}
      </div>
      <div class="tuto-boutons">
        <button class="tuto-skip" onclick="window._triloFermerTuto()">${TL("Passer", "Skip")}</button>
        <button class="tuto-next" onclick="window._triloTutoSuivant()">
          ${estDerniere ? TL("C'est parti ! 🚀", "Let's go! 🚀") : TL("Suivant →", "Next →")}
        </button>
      </div>
    `;
  }

  window._triloTutoSuivant = function() {
    if (etapeActuelle < etapes.length - 1) {
      etapeActuelle++;
      afficherEtape();
    } else {
      window._triloFermerTuto();
    }
  };

  window._triloFermerTuto = function() {
    localStorage.setItem("triloTutoVu", "true");
    overlay.classList.add("tuto-ferme");
    setTimeout(() => overlay.remove(), 300);
  };

  afficherEtape();
}

// Lancer après un court délai au chargement
if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", () => setTimeout(lancerTutoriel, 1200));
} else {
  setTimeout(lancerTutoriel, 1200);
}
