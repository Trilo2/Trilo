/* =========================
   SERVICE WORKER — TRILO PWA
   Optimisé pour la vitesse (v2)
========================= */

const CACHE_NAME = "trilo-v2";

const ASSETS = [
  "/Trilo/",
  "/Trilo/index.html",
  "/Trilo/style.css",
  "/Trilo/script.js",
  "/Trilo/langue.js",
  "/Trilo/logo-trilo.png",
  "/Trilo/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (url.includes("firebase") ||
      url.includes("googleapis.com/identitytoolkit") ||
      url.includes("firestore") ||
      url.includes("google-analytics") ||
      url.includes("googletagmanager")) {
    return;
  }

  if (event.request.method !== "GET") {
    return;
  }

  const estFichierSite = url.includes("/Trilo/") &&
    (url.endsWith(".css") || url.endsWith(".js") || url.endsWith(".html") ||
     url.endsWith(".png") || url.endsWith(".json") || url.endsWith("/"));

  if (estFichierSite) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
