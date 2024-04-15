const CACHE_NAME = 'v3';
const urlsToCache = [
    './',
    './css/index.css',
    './js/index.js',
    './img/ara-babam-ara_64.png',
    './img/ara-babam-ara_192.png',
    './img/ara-babam-ara_512.png',
];
const dbName='followUpMemoryDB';
const storeName='followUpMemoryStore';
const target_url='https://www.arabam.com/ikinci-el';
const getFacetUrl = "https://www.arabam.com/listing/GetFacets?url=";
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
    const dbRequest = indexedDB.open(dbName, 1);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;

        // Start a transaction
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);

        // Get all records
        objectStore.getAll().onsuccess = async function(event) {
            const records = event.target.result;

            // Loop through all records
            for (let record of records) {
                // Loop through all URLs in the itemsUrls array
                const absoluteUrl = record.value.absoluteUrl;
                const response = await fetch(getFacetUrl + target_url + absoluteUrl);
                const data = await response.json();
                // BURADA GELEN DATA DB ILE KIYASLANACAK EGER FARK VARSA NOTIFICATION CIKARTILACAK
                // ORNEK NIFICIATION CODU BURADA
            }
        };
    };
    sendMessageToClientSide({messageType:'requestPermission'})
    await self.registration.showNotification('Website Updated', {
        body: 'The website has been updated.',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    });
}

// GOOD GENERIC MESSAGING WITH CLIENT SIDE
function sendMessageToClientSide(messageDataObject){
    self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage(JSON.stringify(messageDataObject)));
    });
}


self.addEventListener('message', function(event) {
    const dataObj = JSON.parse(event.data);
    console.log('Received message from client:', event.data);
});
