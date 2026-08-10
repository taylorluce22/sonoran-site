/* Agency OS shell service worker — caches the splash shell so the
   installed app opens instantly; the live app itself always loads fresh. */
var CACHE = 'aos-shell-v2';
var ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (url.origin === location.origin && url.pathname.indexOf('/os/') === 0) {
    e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
  }
});
