const VERSION = '__VERSION__';
const PREFIX = 'ts-kalkulator-app-';
const CACHE = PREFIX + VERSION;
const HOME = new URL('./', self.location.href).href;
self.addEventListener('install', event => event.waitUntil((async () => {
  const response = await fetch(new URL('./index.html', self.location.href), {cache:'reload'});
  if (!response.ok || response.redirected || !response.headers.get('content-type')?.includes('text/html')) throw Error('Ufullstendig oppdatering');
  const cache = await caches.open(CACHE);
  await cache.put(HOME, response);
})()));
self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  // Rydd bare denne appens hurtiglager. Ikke andre apper på samme domene.
  for (const key of await caches.keys()) {
    if(key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
  }
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(event.request.method !== 'GET' || event.request.mode !== 'navigate' ||
    (url.origin + url.pathname !== HOME && url.origin + url.pathname !== HOME + 'index.html')) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(HOME) || fetch(event.request);
  })());
});
