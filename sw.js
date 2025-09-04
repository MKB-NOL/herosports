// ============================
// CONFIGURATION
// ============================
const CACHE_NAME = 'hero-sports-cache-v3'; // Increment when updating
const STATIC_ASSETS = [
  '/',               // Root
  '/index.html',
  '/news.html',
  '/about.html',
  '/contact.html',
  '/admin.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// ============================
// INSTALL EVENT - Cache static assets
// ============================
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
  self.skipWaiting(); // Activate immediately
});

// ============================
// ACTIVATE EVENT - Clean old caches
// ============================
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
              return caches.delete(key);
            })
      )
    )
  );
  self.clients.claim(); // Control all pages immediately
});

// ============================
// FETCH EVENT - Cache strategies
// ============================
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);

  // 1. Static assets - cache-first strategy
  if (STATIC_ASSETS.includes(requestURL.pathname) || requestURL.origin === location.origin) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => cached || fetchAndCache(event.request))
        .catch(() => requestURL.pathname.endsWith('.html') ? caches.match('/offline.html') : null)
    );
    return;
  }

  // 2. External images & dynamic content - network-first strategy
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

// ============================
// Helper: fetch and cache
// ============================
function fetchAndCache(request) {
  return fetch(request)
    .then(response => {
      if (!response || response.status !== 200) return response;
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
      return response;
    });
}

// ============================
// Listen for messages (skip waiting)
// ============================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
