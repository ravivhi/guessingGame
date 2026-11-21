const CACHE = 'ehadi-v2';
const CORE = [
    "./",
    "index.html",
    "manifest.json",
    "css/app.css",
    "icons/icon-192.png",
    "icons/icon-512.png",
    "js/activities.js",
    "js/adaptive.js",
    "js/app.js",
    "js/avatar.js",
    "js/charts.js",
    "js/core.js",
    "js/curriculum.js",
    "js/db.js",
    "js/game.js",
    "js/gen_adv.js",
    "js/gen_core.js",
    "js/gen_data.js",
    "js/gen_frac.js",
    "js/gen_geo.js",
    "js/gen_measure.js",
    "js/gen_number.js",
    "js/gen_ops.js",
    "js/i18n_ui.js",
    "js/player.js",
    "js/report.js",
    "js/services.js",
    "js/shop_items.js",
    "js/svg.js",
    "js/ui_basic.js",
    "js/ui_visual.js",
    "js/v_student.js",
    "js/views_common.js"
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k.startsWith('ehadi-') && k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
            .catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
});
