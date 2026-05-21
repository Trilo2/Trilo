/* =========================
   MODULE PARCOURS GPS — TRILO
========================= */

function initParcours() {
  const geoBtn     = document.getElementById("parcoursGeoBtn");
  const manuelBtn  = document.getElementById("parcoursManuelBtn");
  const manuelZone = document.getElementById("parcoursManuelZone");

  if (!geoBtn) return;

  geoBtn.addEventListener("click", () => {
    const result = document.getElementById("parcoursResult");
    result.innerHTML = "📡 Récupération de ta position...";

    if (!navigator.geolocation) {
      afficherZoneManuelle();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        ouvrirParcours(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        afficherZoneManuelle();
      },
      { timeout: 8000 }
    );
  });

  if (manuelBtn) {
    manuelBtn.addEventListener("click", async () => {
      const ville  = document.getElementById("parcoursVille")?.value?.trim();
      const result = document.getElementById("parcoursResult");
      if (!ville) return;

      result.innerHTML = "🔍 Recherche en cours...";
      try {
        const coords = await geocoderVille(ville);
        if (coords) {
          ouvrirParcours(coords.lat, coords.lng);
        } else {
          result.innerHTML = "❌ Ville introuvable. Essaie avec un nom plus précis.";
        }
      } catch (e) {
        result.innerHTML = "❌ Erreur lors de la recherche.";
      }
    });

    document.getElementById("parcoursVille")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") manuelBtn.click();
    });
  }
}

function afficherZoneManuelle() {
  const result     = document.getElementById("parcoursResult");
  const manuelZone = document.getElementById("parcoursManuelZone");
  result.innerHTML = "📍 Géolocalisation refusée. Entre ta ville manuellement.";
  if (manuelZone) manuelZone.style.display = "flex";
}

async function geocoderVille(ville) {
  const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ville)}&format=json&limit=1`;
  const res  = await fetch(url, { headers: { "Accept-Language": "fr" } });
  const data = await res.json();
  if (data && data.length > 0) {
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  }
  return null;
}

function ouvrirParcours(lat, lng) {
  const type   = document.getElementById("parcoursType")?.value || "running";
  const dist   = parseInt(document.getElementById("parcoursDist")?.value || "5");
  const result = document.getElementById("parcoursResult");

  const labels = {
    "running":      "Running",
    "cycling-road": "Vélo route",
    "cycling-mtb":  "VTT"
  };

  // ✅ Komoot Routes — URL fonctionnelle 2025
  const sportKomoot = { "running": "running", "cycling-road": "road-cycling", "cycling-mtb": "mountain-biking" };
  const komootUrl  = `https://www.komoot.com/routes?sport=${sportKomoot[type] || "running"}&map_position=${lat},${lng},12`;
  const komootPlan = `https://www.komoot.com/plan/@${lat},${lng},13z?sport=${sportKomoot[type] || "running"}`;

  // ✅ Wikiloc — lat/lng dans l'URL, très fiable
  const delta      = (dist / 111).toFixed(4);
  const wikiSport  = { "running": "10", "cycling-road": "1", "cycling-mtb": "3" };
  const wikiloc    = `https://www.wikiloc.com/wikiloc/find.do?act=findr&sw.lat=${(lat - delta)}&sw.lon=${(lng - delta)}&ne.lat=${(lat + Number(delta))}&ne.lon=${(lng + Number(delta))}&type=${wikiSport[type] || "10"}`;

  // ✅ Strava segments — fonctionne avec hash
  const stravaSport = { "running": "running", "cycling-road": "cycling", "cycling-mtb": "cycling" };
  const strava      = `https://www.strava.com/segments/explore?activity_type=${stravaSport[type] || "running"}#${lat},${lng},13z`;

  // ✅ OpenRunner — site FR très populaire pour parcours GPS
  const openrunner  = `https://www.openrunner.com/search?lat=${lat}&lng=${lng}&distance=${dist}&activity=${type === "running" ? "running" : "cycling"}`;

  result.innerHTML = `
    <div class="parcours-found">
      <p>🗺️ Parcours <strong>${labels[type] || type}</strong> — <strong>${dist} km</strong> autour de toi</p>
      <div class="parcours-links">
        <a href="${komootUrl}" target="_blank" rel="noopener" class="parcours-link p-komoot">🟢 Komoot — Parcours</a>
        <a href="${komootPlan}" target="_blank" rel="noopener" class="parcours-link p-plan">✏️ Komoot — Planifier</a>
        <a href="${wikiloc}" target="_blank" rel="noopener" class="parcours-link p-wikiloc">🔵 Wikiloc GPS</a>
        <a href="${strava}" target="_blank" rel="noopener" class="parcours-link p-strava">🟠 Strava Segments</a>
        <a href="${openrunner}" target="_blank" rel="noopener" class="parcours-link p-openrunner">🇫🇷 OpenRunner</a>
      </div>
      <p class="parcours-tip">💡 Wikiloc et Komoot proposent les meilleurs parcours communautaires. OpenRunner est très populaire en France.</p>
    </div>
  `;
}

window.addEventListener("DOMContentLoaded", initParcours);
