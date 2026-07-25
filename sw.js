// Gold Calculator — Service Worker (offline support, Android + iOS)
const CACHE_NAME = 'gold-calc-v14';

// Jo cheezein offline chahiye (app single HTML hai)
const ASSETS = [
  './',
  './index.html'
];

// Install: app ko cache karo, foran activate
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

// Activate: purani cache saaf karo
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

// Fetch: pehle network try (fresh rate), na chale to cache (offline)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // Fresh copy cache mein bhi rakho
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() =>
        // Offline: cache se do; agar exact na mile to index.html do (navigation ke liye)
        caches.match(e.request).then((hit) => hit || caches.match('./index.html'))
      )
  );
});
