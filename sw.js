// Speichert die App auf dem Handy, damit sie auch ohne Internet startet.
const CACHE = 'rezeptbuch-v32';
const FILES = ['./', 'index.html', 'styles.css', 'app.js', 'vorrat.js', 'backup.js', 'recipes.js', 'nutrition.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png',
  'tracker/', 'tracker/index.html', 'tracker/css/style.css', 'tracker/vendor/zxing.min.js', 'tracker/data/bls.json', 'tracker/data/recipes.json',
  ...['caffeine', 'alcohol', 'weightgoal', 'food', 'ocr', 'timeline', 'supp_catalog', 'supplements', 'app'].map((n) => `tracker/js/${n}.js`)];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Erst aus dem Netz holen (immer die neueste Version), sonst aus dem Speicher.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return; // z. B. Produktdaten von Open Food Facts
  e.respondWith(
    // no-cache: am Server nachfragen statt die Browser-Kopie zu nehmen (GitHub Pages erlaubt sonst bis zu 10 Minuten alte Dateien)
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});
