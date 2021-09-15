const cacheName = 'v1.0.0::static';

self.addEventListener('install', e => {
    // once the SW is installed, go ahead and fetch the resources
    // to make this work offline
    e.waitUntil(
        caches.open(cacheName).then(cache => {
            return cache.addAll([
                './index.html',
                './css/bootstrap.min.css',
                './css/fontawesome.css',
                "./js/vue-select.js",
                "./js/vue.min.js",
            ]).then(() => self.skipWaiting().catch(e => {console.error(e);}));
        }).catch(e => {
            console.error(e);
        })
    );
});

// when the browser fetches a url, either response with
// the cached object or go ahead and fetch the actual url
self.addEventListener('fetch', event => {
    event.respondWith(
        // ensure we check the *right* cache to match against
        caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(res => {
                return res || fetch(event.request)
            });
        })
    );
});