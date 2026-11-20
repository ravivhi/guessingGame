const CACHE = 'englishquiz-v73';

self.addEventListener('install', e => { self.skipWaiting(); });
// drop the caches of older versions, so an old copy of a file can never be served again
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('englishquiz-') && k !== CACHE).map(k => caches.delete(k)))).then(() => clients.claim()));
});
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
    // the word bank: always the latest from the network when online (the cache is only for offline use)
    if (new URL(e.request.url).pathname.includes('/wordbank/')) {
        e.respondWith(caches.open(CACHE).then(cache =>
            fetch(e.request, { cache: 'no-cache' }).then(res => {
                if (res.ok) cache.put(e.request, res.clone());
                return res;
            }).catch(() => cache.match(e.request))
        ));
        return;
    }
    e.respondWith(
        caches.open(CACHE).then(cache =>
            cache.match(e.request).then(cached => {
                const fresh = fetch(e.request).then(res => {
                    cache.put(e.request, res.clone());
                    return res;
                }).catch(() => cached);
                return cached || fresh;
            })
        )
    );
});
