/* Agency OS service worker.
   1) OneSignal web push (imported first so its push/notificationclick handlers register).
   2) Splash-shell cache so the installed app opens instantly; the live OS always loads fresh. */
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

var CACHE = 'aos-shell-v3';
var ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(ASSETS); })
      .catch(function () {})
      .then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    // Only clean up our own old shells; never touch OneSignal caches.
    return Promise.all(keys.filter(function (k) {
      return k.indexOf('aos-shell-') === 0 && k !== CACHE;
    }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method === 'GET' && url.origin === location.origin && url.pathname.indexOf('/os/') === 0) {
    e.respondWith(caches.match(e.request).then(function (hit) { return hit || fetch(e.request); }));
  }
});
