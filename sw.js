const CACHE_NAME = 'xcorp-vt-v1';
const ASSETS = [
  '/Vehicle-Tracker/',
  '/Vehicle-Tracker/index.html',
  '/Vehicle-Tracker/manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(e) {
        console.log('Cache install error:', e);
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

  // Skip non-http requests (chrome-extension, etc)
  if (!url.startsWith('http')) return;

  // Skip API calls — always go to network
  if (
    url.indexOf('firestore.googleapis.com') > -1 ||
    url.indexOf('firebase') > -1 ||
    url.indexOf('googleapis.com') > -1 ||
    url.indexOf('docs.google.com') > -1 ||
    url.indexOf('telematics.guru') > -1 ||
    url.indexOf('script.google.com') > -1 ||
    url.indexOf('openstreetmap.org') > -1 ||
    url.indexOf('unpkg.com') > -1 ||
    url.indexOf('fonts.googleapis.com') > -1 ||
    url.indexOf('cdn-website.com') > -1
  ) {
    return;
  }

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
