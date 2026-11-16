const VERSION = '5.0.0-rc.4';
const PREFIX = 'ts-kalkulator-app-';
const CACHE = PREFIX + VERSION;
const HOME = new URL('./', self.location.href).href;
const LEGACY_CACHE = 'ts-kalkulator-v3-9-7d';
self.addEventListener('install', event => event.waitUntil((async () => {
  const response = await fetch(new URL('./index.html', self.location.href), {cache:'reload'});
  if (!response.ok || response.redirected || !response.headers.get('content-type')?.includes('text/html')) throw Error('Ufullstendig oppdatering');
  const cache = await caches.open(CACHE);
  await cache.put(HOME, response);
  await cache.addAll(['./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./guide-photo.jpg']);
})()));
self.addEventListener('message', event => {
  if(event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  // Rydd bare denne appens hurtiglager. Ikke andre apper på samme domene.
  for (const key of await caches.keys()) {
    if((key.startsWith(PREFIX) && key !== CACHE) || key === LEGACY_CACHE) await caches.delete(key);
  }
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const resource = url.origin + url.pathname;
  const navigation = event.request.mode === 'navigate' && (resource === HOME || resource === HOME + 'index.html');
  const asset = [HOME + 'manifest.webmanifest',HOME + 'icon.svg',HOME + 'icon-192.png',HOME + 'icon-512.png',HOME + 'guide-photo.jpg'].includes(resource);
  if(event.request.method !== 'GET' || (!navigation && !asset)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    return await cache.match(navigation ? HOME : resource) || fetch(event.request);
  })());
});
