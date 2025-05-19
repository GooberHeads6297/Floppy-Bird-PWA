const CACHE_NAME = 'floppy-bird-cache-v1';
const urlsToCache = [
  './', // Alias for index.html
  './index.html',
  './floppy-bird.js',
  './manifest.json',

  // Music and Sounds
  './music/music.mp3',
  './sound/crash-sound.mp3',

  // Game Images
  './images/bird1.png',
  './images/bird2.png',
  './images/bird3.png',
  './images/pipe.png',
  './images/background.png',
  './images/ground.png',
  './images/icon1.png', // In-game icon
  './images/ButtonUnpressed.png',
  './images/ButtonPressed.png',
  './images/MenuLogo.png',
  './images/gameOverBorder.png',
  './images/restartUnpressed.png',
  './images/restartPressed.png',
  './images/feather.png',

  // Number Images
  './numbers/zero.png',
  './numbers/one.png',
  './numbers/two.png',
  './numbers/three.png',
  './numbers/four.png',
  './numbers/five.png',
  './numbers/six.png',
  './numbers/seven.png',
  './numbers/eight.png',
  './numbers/nine.png',

  // PWA Icons
  './icons/icon192.png',
  './icons/icon512.png'
];

// Install event: Cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to cache resources during install:', err);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Ensure new service worker takes control immediately
});

// Fetch event: Serve cached content when offline, or fetch from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.log('Fetch failed; returning offline page instead.', error);
          // Optionally, return a custom offline page here if specific assets fail
          // For a game, if core assets are missing, it might not be playable.
          // The initial caching should cover essential files.
        });
      })
  );
});
