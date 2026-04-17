// Simple offline cache for the Wagon Fitters Handbook reader.
const CACHE = 'fox-handbook-v2';
const CORE = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'sections.js',
  'manifest.webmanifest',
  'assets/handbook.pdf',
  'assets/fox-logo.svg',
  'assets/fox-logo.jpg',
  'assets/favicon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached =>
      cached || fetch(req).then(res => {
        const copy = res.clone();
        // Only cache successful, same-origin responses
        if (res.ok && new URL(req.url).origin === location.origin) {
          caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
        }
        return res;
      }).catch(() => cached)
    )
  );
});
