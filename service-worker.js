const CACHE_NAME = 'v3';
const urlsToCache = [
    './',
    './css/index.css',
    './js/index.js',
    './img/ara-babam-ara_64.png',
    './img/ara-babam-ara_192.png',
    './img/ara-babam-ara_512.png',
];
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(urlsToCache.map(url => cache.add(url).catch(error => console.error(`Failed to cache ${url}:`, error))));
        })
    );
});


self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return fetch(event.request).then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            }).catch(() => {
                return cache.match(event.request);
            });
        })
    );
});


self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});


self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-web-page') {
        event.waitUntil(fetchAndNotify());
    }
});

async function fetchAndNotify() {
    // Fetch the website
    const response = await fetch('https://www.example.com');
    const data = await response.json();

    // Check if something changed
    if (data.hasChanged) {
        // Show a notification
        self.registration.showNotification('Website Updated', {
            body: 'The website has been updated.',
            icon: 'images/icon.png',
            badge: 'images/badge.png'
        });
    }
}
