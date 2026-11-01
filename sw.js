/* Service worker di «Copione»: fa aprire l'editor anche senza connessione.
   Strategia: prima la rete (così trovi sempre l'ultima versione), e se la rete manca
   o è troppo lenta si usa la copia salvata nel dispositivo. */
const CACHE = 'copione-v1';
const CORE = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  const fromNetwork = fetch(req).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  });
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 4000));
  e.respondWith(
    Promise.race([fromNetwork, timeout]).catch(() =>
      caches.match(req).then((m) => m || caches.match('./index.html'))
    )
  );
});
