
const CACHE_NAME = 'myhrvold-portal-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
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
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip Chrome extension requests
  if (request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request).then(fetchResponse => {
        // Don't cache if not a valid response
        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
          return fetchResponse;
        }
        
        // Clone the response
        const responseToCache = fetchResponse.clone();
        
        // Cache dynamic content
        caches.open(DYNAMIC_CACHE).then(cache => {
          cache.put(request, responseToCache);
        });
        
        return fetchResponse;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});

// Enhanced background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered for tag:', event.tag);
  
  if (event.tag.startsWith('sync-')) {
    event.waitUntil(handleBackgroundSync(event.tag));
  } else if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Handle background sync for specific requests
async function handleBackgroundSync(tag) {
  try {
    console.log('Service Worker: Handling background sync for:', tag);
    
    // Get pending requests from IndexedDB or localStorage
    const pendingRequests = await getPendingRequests();
    const requestId = tag.replace('sync-', '');
    
    const request = pendingRequests.find(req => req.id === requestId);
    if (!request) {
      console.log('Service Worker: No pending request found for:', requestId);
      return;
    }

    // Attempt to sync the request
    const response = await fetch(request.data.url, {
      method: request.data.method,
      headers: {
        'Content-Type': 'application/json',
        ...request.data.headers
      },
      body: request.data.body ? JSON.stringify(request.data.body) : undefined
    });

    if (response.ok) {
      console.log('Service Worker: Background sync successful for:', requestId);
      
      // Remove from pending requests
      await removePendingRequest(requestId);
      
      // Notify the client
      await notifyClients('sync-success', { requestId, response: await response.json() });
      
      // Show success notification
      await self.registration.showNotification('Synkronisering vellykket', {
        body: 'Skjemadata ble sendt til serveren.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sync-success'
      });
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error);
    
    // Increment retry count or remove if max retries reached
    await handleSyncFailure(requestId, error);
    
    // Notify the client
    await notifyClients('sync-failed', { requestId, error: error.message });
  }
}

// Get pending requests (simplified - would use IndexedDB in production)
async function getPendingRequests() {
  try {
    // In a real implementation, you'd use IndexedDB
    // For now, we'll simulate this
    return [];
  } catch (error) {
    console.error('Failed to get pending requests:', error);
    return [];
  }
}

// Remove pending request after successful sync
async function removePendingRequest(requestId) {
  try {
    // In a real implementation, you'd remove from IndexedDB
    console.log('Service Worker: Removing pending request:', requestId);
  } catch (error) {
    console.error('Failed to remove pending request:', error);
  }
}

// Handle sync failure
async function handleSyncFailure(requestId, error) {
  try {
    // In a real implementation, you'd update retry count in IndexedDB
    console.log('Service Worker: Handling sync failure for:', requestId);
  } catch (error) {
    console.error('Failed to handle sync failure:', error);
  }
}

// Notify all clients
async function notifyClients(type, data) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type,
      data
    });
  });
}

// Enhanced push notifications with action buttons
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'Myhrvold Portal',
    body: 'Ny notifikasjon fra Myhrvold Portal',
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Failed to parse push data:', error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: notificationData.id || 1,
      url: notificationData.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Åpne',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Lukk',
        icon: '/favicon.ico'
      }
    ],
    requireInteraction: false,
    silent: false,
    tag: notificationData.tag || 'general'
  };
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Enhanced notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  const action = event.action;
  
  if (action === 'dismiss') {
    return; // Just close the notification
  }
  
  const urlToOpen = action === 'open' && notificationData.url 
    ? notificationData.url 
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if there's already a window/tab open with the target URL
      for (let client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is already open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed:', event.notification.tag);
});

// Original background sync function
function doBackgroundSync() {
  return new Promise((resolve) => {
    console.log('Service Worker: Performing general background sync');
    resolve();
  });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
