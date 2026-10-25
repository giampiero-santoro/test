/* Il Mio Ricettario - service worker (uso offline). Cambia VERSION ad ogni release. */
const VERSION = 'ricettario-5.47.0';
const PRECACHE = ['./', 'index.html', 'style.css', 'css/bulma.css', 'js/app.js', 'js/off-integration.js', 'js/nutrition-import.js', 'js/vendor/html5-qrcode.min.js', 'fonts/fonts.css',
  'manifest.json', 'guida.html', 'img/icon-192.png', 'img/icon-512.png', 'img/apple-touch-icon.png', 'img/favicon-32.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isData = /\/(data|img|fonts|vendor\/ocr)\//.test(url.pathname);
  if (isData) { // cache-first
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
      return res;
    })));
    return;
  }
  // network-first con ripiego sulla cache
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
