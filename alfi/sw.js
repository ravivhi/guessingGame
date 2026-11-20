const CACHE = 'alfi-v3';
const CORE = [
    './',
    'index.html',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'fonts/rubik-hebrew.woff2',
    'fonts/rubik-latin.woff2'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k.startsWith('alfi-') && k !== CACHE).map(k => caches.delete(k))))
            .then(() => clients.claim())
    );
});
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
    e.respondWith(
        caches.open(CACHE).then(cache =>
            cache.match(e.request, { ignoreSearch: true }).then(cached => {
                const fresh = fetch(e.request).then(res => {
                    if (res.ok) cache.put(e.request, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || fresh;
            })
        )
    );
});
