/* =========================
   SERVICE WORKER — TRILO PWA
========================= */

const CACHE_NAME = "trilo-v1";

const ASSETS = [
  "/Trilo/",
  "/Trilo/index.html",
  "/Trilo/style.css",
  "/Trilo/script.js",
  "/Trilo/parcours.js",
  "/Trilo/historique.js",
  "/Trilo/logo-trilo.png",
  "/Trilo/manifest.json",
  "https://cdn.jsdelivr.net/npm/chart.js",
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap"
];

// Installation : mise en cache des assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch : réseau d'abord, cache en fallback
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes Firebase
  if (event.request.url.includes("firebase") ||
      event.request.url.includes("googleapis.com/identitytoolkit") ||
      event.request.url.includes("firestore")) {
    return;
  }

  // Ne mettre en cache que les requêtes GET (POST/PUT non supportés par le cache)
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache la réponse fraîche
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Si pas de réseau, utiliser le cache
        return caches.match(event.request);
      })
  );
});
