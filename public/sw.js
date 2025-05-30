
const CACHE_NAME = 'myhrvold-portal-v1';

// Minimal cache strategy - only cache navigation requests
const STATIC_ASSETS = [
  '/',
  '/favicon.ico'
];

// Install event - cache only essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - DO NOT INTERFERE with any module files
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) return;
  
  // CRITICAL: DO NOT cache or interfere with these files
  const skipPatterns = [
    '.css',
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    'chunk-',
    'node_modules',
    'src/',
    '@',
    'vite',
    'hot',
    'react',
    'components'
  ];
  
  const shouldSkip = skipPatterns.some(pattern => request.url.includes(pattern));
  if (shouldSkip) {
    return; // Let browser handle these directly
  }
  
  // Only handle basic navigation requests for offline fallback
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/');
      })
    );
  }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
