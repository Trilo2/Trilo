/* =========================
   MODULE PARCOURS GPS
   À ajouter dans script.js
   ou charger en <script type="module" src="parcours.js">
========================= */

/* =========================
   SECTION HTML À AJOUTER
   dans index.html avant </main>
========================= */

/*
<section class="parcours-card">
  <div class="parcours-head">
    <span>🗺️</span>
    <div>
      <h2>Parcours GPS</h2>
      <p>Trouve un parcours running ou vélo près de chez toi.</p>
    </div>
  </div>

  <div class="parcours-controls">
    <div class="parcours-row">
      <select id="parcoursType">
        <option value="running">🏃 Running</option>
        <option value="cycling-road">🚴 Vélo route</option>
        <option value="cycling-mtb">🚵 VTT</option>
        <option value="swimming">🏊 Natation (piscines)</option>
      </select>

      <select id="parcoursDist">
        <option value="5">5 km</option>
        <option value="10">10 km</option>
        <option value="20">20 km</option>
        <option value="42">42 km</option>
        <option value="50">50 km</option>
        <option value="100">100 km</option>
      </select>

      <button id="parcoursGeoBtn" type="button">📍 Ma position</button>
    </div>

    <div class="parcours-row" id="parcoursManuelZone" style="display:none;">
      <input id="parcoursVille" type="text" placeholder="Entre ta ville ou adresse...">
      <button id="parcoursManuelBtn" type="button">🔍 Rechercher</button>
    </div>
  </div>

  <div id="parcoursResult" class="parcours-result">
    Clique sur "Ma position" pour trouver des parcours près de toi.
  </div>
</section>
*/

/* =========================
   LOGIQUE JS
========================= */

function initParcours() {
  const geoBtn     = document.getElementById("parcoursGeoBtn");
  const manuelBtn  = document.getElementById("parcoursManuelBtn");
  const manuelZone = document.getElementById("parcoursManuelZone");

  if (!geoBtn) return;

  // Bouton géolocalisation
  geoBtn.addEventListener("click", () => {
    const result = document.getElementById("parcoursResult");
    result.innerHTML = "📡 Récupération de ta position...";

    if (!navigator.geolocation) {
      afficherZoneManuelle();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        ouvrirKomoot(lat, lng);
      },
      (err) => {
        console.warn("Géoloc refusée :", err.message);
        afficherZoneManuelle();
      },
      { timeout: 8000 }
    );
  });

  // Bouton saisie manuelle
  if (manuelBtn) {
    manuelBtn.addEventListener("click", async () => {
      const ville = document.getElementById("parcoursVille")?.value?.trim();
      if (!ville) return;

      const result = document.getElementById("parcoursResult");
      result.innerHTML = "🔍 Recherche de la ville...";

      try {
        const coords = await geocoderVille(ville);
        if (coords) {
          ouvrirKomoot(coords.lat, coords.lng);
        } else {
          result.innerHTML = "❌ Ville introuvable. Essaie avec un nom plus précis.";
        }
      } catch (e) {
        result.innerHTML = "❌ Erreur lors de la recherche.";
      }
    });

    // Aussi sur Entrée
    document.getElementById("parcoursVille")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") manuelBtn.click();
    });
  }
}

function afficherZoneManuelle() {
  const result     = document.getElementById("parcoursResult");
  const manuelZone = document.getElementById("parcoursManuelZone");
  result.innerHTML  = "📍 Géolocalisation refusée ou indisponible. Entre ta ville manuellement.";
  if (manuelZone) manuelZone.style.display = "flex";
}

async function geocoderVille(ville) {
  // Nominatim (OpenStreetMap) — gratuit, sans clé API
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ville)}&format=json&limit=1`;
  const res  = await fetch(url, { headers: { "Accept-Language": "fr" } });
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

function ouvrirKomoot(lat, lng) {
function ouvrirKomoot(lat, lng) {
  const type = document.getElementById("parcoursType")?.value || "running";
  const dist = document.getElementById("parcoursDist")?.value || "5";
  const result = document.getElementById("parcoursResult");

  const labels = {
    "running": "running",
    "cycling-road": "vélo route",
    "cycling-mtb": "VTT",
    "swimming": "natation"
  };

  const recherche = encodeURIComponent(
    `${labels[type] || type} ${dist} km autour de ${lat},${lng} site:komoot.com`
  );

  const komootUrl =
    `https://www.google.com/search?q=${recherche}`;

  result.innerHTML = `
    <div class="parcours-found">
      <p>🗺️ Recherche de parcours <strong>${labels[type] || type}</strong> de <strong>${dist} km</strong> près de toi.</p>

      <a href="${komootUrl}" target="_blank" rel="noopener" class="parcours-link">
        Voir les parcours sur Komoot →
      </a>

      <p class="parcours-tip">
        💡 La recherche ouvre des parcours Komoot proches de ta position sans erreur 404.
      </p>
    </div>
  `;
}

  result.innerHTML = `
    <div class="parcours-found">
      <p>🗺️ Parcours <strong>${labels[type] || type}</strong> de <strong>${dist} km</strong> trouvés près de toi !</p>
      <a href="${komootUrl}" target="_blank" rel="noopener" class="parcours-link">
        Voir les parcours sur Komoot →
      </a>
      <p class="parcours-tip">💡 Komoot va s'ouvrir avec les meilleurs parcours validés par la communauté autour de toi.</p>
    </div>
  `;
}

// Lancer au chargement
window.addEventListener("DOMContentLoaded", initParcours);
