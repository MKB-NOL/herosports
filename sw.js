const CACHE_NAME = 'hero-sports-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/news.html',
  '/about.html',
  '/contact.html',
  '/admin.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
