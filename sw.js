// Camp Hearne Trails - offline support.
// Docs/data are network-first so updates always land; media/tiles are cache-first.
const SHELL = 'ch-shell-v3';
const TILES = 'ch-tiles-v1';
const TILE_CAP = 600;
const TILE_HOSTS = ['server.arcgisonline.com', 'tile.openstreetmap.org'];

const PRECACHE = [
  './', './index.html', './manifest.json', './stops-data.js', './safety-data.js',
  './assets/vendor/leaflet/leaflet.css', './assets/vendor/leaflet/leaflet.js',
  './assets/vendor/leaflet/images/layers.png', './assets/vendor/leaflet/images/layers-2x.png',
  './assets/icons/icon-192.png', './assets/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(SHELL);
    await Promise.allSettled(PRECACHE.map(u => c.add(new Request(u, { cache: 'reload' }))));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUV'.split('');
    await Promise.allSettled(letters.map(L =>
      c.add(new Request('./assets/stops/' + L + '.jpg', { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== SHELL && k !== TILES).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function netFirst(req) {
  const c = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res && res.ok) c.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await c.match(req, { ignoreSearch: true });
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req, cacheName) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
  return res;
}

async function tileFirst(req) {
  const c = await caches.open(TILES);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) {
    c.put(req, res.clone());
    const keys = await c.keys();
    if (keys.length > TILE_CAP) {
      for (let i = 0; i < keys.length - TILE_CAP; i++) c.delete(keys[i]);
    }
  }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let u;
  try { u = new URL(req.url); } catch (err) { return; }

  if (TILE_HOSTS.some(h => u.hostname.endsWith(h))) {
    e.respondWith(tileFirst(req).catch(() => new Response('', { status: 504 })));
    return;
  }
  if (u.origin !== self.location.origin) return;

  const isDoc = req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html');
  const isData = u.pathname.endsWith('.js') || u.pathname.endsWith('.json');
  if (isDoc || isData) { e.respondWith(netFirst(req)); return; }
  e.respondWith(cacheFirst(req, SHELL).catch(() => new Response('', { status: 504 })));
});
