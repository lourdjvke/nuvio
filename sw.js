// A unique name for your cache. Update this when you change cached files.
const CACHE_NAME = 'nuvio-cache-v1';

// List all the core files of your app that should be cached on install.
const urlsToCache = [
  '/', // The root document
  '/index.html',
  '/wrong.mp3',
  '/right.mp3',
  '/pandaleid.png'
];

// The 'install' event listener fires when the service worker is first registered.
// It's used to pre-cache the core assets of your app.
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and pre-caching files.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Forces the new service worker to activate immediately.
      .catch((error) => {
        console.error('Failed to cache files during install:', error);
      })
  );
});

// The 'activate' event listener is used for cleanup, such as deleting old caches.
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          // Delete any old caches that are not the current one.
          return cacheName !== CACHE_NAME;
        }).map((cacheName) => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Takes control of any unmanaged clients (e.g., open tabs).
  );
});

// The 'fetch' event listener intercepts network requests.
// It first tries to find a response in the cache. If not found, it fetches from the network.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the resource is found in the cache, return it.
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        // Otherwise, fetch from the network.
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        // You could return an offline page here if needed.
      })
  );
});
