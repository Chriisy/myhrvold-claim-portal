
// Simplified service worker disabler that won't interfere with app startup
export const disableServiceWorker = async () => {
  // Only run in development and if service worker is supported
  if (process.env.NODE_ENV !== 'development' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Service worker unregistered:', registration);
    }
    
    // Clear caches more safely
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name).catch(err => console.warn('Cache delete failed:', err)))
      );
      console.log('All caches cleared');
    }
  } catch (error) {
    console.warn('Service worker cleanup failed (continuing anyway):', error);
  }
};

// Call this only after the DOM is ready
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Use a timeout to ensure this doesn't block app startup
  setTimeout(() => {
    disableServiceWorker();
  }, 1000);
}
