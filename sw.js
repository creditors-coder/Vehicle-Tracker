var CACHE_NAME = 'xcorp-vt-v4';
var ASSETS = [
  '/Vehicle-Tracker/',
  '/Vehicle-Tracker/index.html',
  '/Vehicle-Tracker/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(e) {
        console.log('Cache error:', e);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  if (url.indexOf('http') !== 0) return;
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

  event.respondWith(
    fetch(event.request).then(function(response) {
      if (response && response.ok && event.request.method === 'GET') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/Vehicle-Tracker/index.html');
        }
      });
    })
  );
});
