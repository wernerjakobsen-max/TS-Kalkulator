const CACHE = 'ts-kalkulator-v3-6-4';
const ASSETS = ['./','./index.html','./manifest.webmanifest','./icon.svg','./logo-lister-blikk.svg','./qr.html'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => { e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request))); });
