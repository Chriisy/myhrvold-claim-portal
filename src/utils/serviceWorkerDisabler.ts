
// Temporary utility to disable service worker during stabilization
export const disableServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service worker unregistered:', registration);
      }
      
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        console.log('All caches cleared');
      }
    } catch (error) {
      console.error('Error disabling service worker:', error);
    }
  }
};

// Call this during development to ensure clean state
if (process.env.NODE_ENV === 'development') {
  disableServiceWorker();
}
