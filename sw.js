// v4 - Network first, no stale cache
var CACHE_NAME = 'xcorp-vt-v4';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // Delete ALL old caches immediately
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) {
        return caches.delete(key);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Skip non-HTTP
  if (url.indexOf('http') !== 0) return;

  // Skip all external APIs - never cache these
  if (
    url.indexOf('firestore.googleapis') > -1 ||
    url.indexOf('firebase') > -1 ||
    url.indexOf('googleapis') > -1 ||
    url.indexOf('docs.google') > -1 ||
    url.indexOf('telematics.guru') > -1 ||
    url.indexOf('script.google') > -1 ||
    url.indexOf('openstreetmap') > -1 ||
    url.indexOf('unpkg.com') > -1 ||
    url.indexOf('fonts.google') > -1 ||
    url.indexOf('cdn-website') > -1
  ) { return; }

  // For app files - ALWAYS go to network first, never serve stale
  event.respondWith(
    fetch(event.request, { cache: 'no-cache' }).then(function(response) {
      return response;
    }).catch(function() {
      // Only use cache if completely offline
      return caches.match(event.request);
    })
  );
});
