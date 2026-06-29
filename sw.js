// sw.js - Service Worker (Stratégie: Réseau d'abord, Cache ensuite)

const CACHE_NAME = 'magic-recipe-v2'; // On change le nom pour forcer la mise à jour
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/database.js'
];

// Installation : on met en cache les fichiers de base
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force le nouveau SW à s'activer immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activation : on nettoie les vieilles versions du cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception : Stratégie "Network First"
self.addEventListener('fetch', (event) => {
  // On ne gère que les requêtes GET (on ignore les POST vers l'IA)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si le réseau marche, on met à jour le cache silencieusement
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si le réseau échoue (mode avion), on sort le cache
        return caches.match(event.request);
      })
  );
});
