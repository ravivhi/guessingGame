const CACHE = 'guessing-v2';

self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(clients.claim()); });
self.addEventListener('fetch', e => {
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
