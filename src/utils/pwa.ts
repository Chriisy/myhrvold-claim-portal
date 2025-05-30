
// PWA utilities for service worker registration and app installation
export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: any = null;
  private isInstallable = false;

  private constructor() {
    this.init();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.isInstallable = true;
      this.showInstallUI();
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App was installed');
      this.deferredPrompt = null;
      this.isInstallable = false;
      this.hideInstallUI();
    });

    // Register service worker
    this.registerServiceWorker();
  }

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully:', registration);
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker: Update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Service Worker: New version available');
                this.showUpdateAvailable();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('PWA: Message from service worker:', event.data);
          
          if (event.data.type === 'sync-success') {
            window.dispatchEvent(new CustomEvent('sync-success', {
              detail: event.data.data
            }));
          } else if (event.data.type === 'sync-failed') {
            window.dispatchEvent(new CustomEvent('sync-failed', {
              detail: event.data.data
            }));
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async installApp(): Promise<boolean> {
    if (this.deferredPrompt) {
      try {
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log('PWA: Install outcome:', outcome);
        
        if (outcome === 'accepted') {
          this.deferredPrompt = null;
          this.isInstallable = false;
          return true;
        }
      } catch (error) {
        console.error('PWA: Install error:', error);
      }
    }
    return false;
  }

  getInstallable(): boolean {
    return this.isInstallable;
  }

  private showInstallUI() {
    // Dispatch custom event to show install button
    window.dispatchEvent(new CustomEvent('pwa-installable', { 
      detail: { installable: true } 
    }));
  }

  private hideInstallUI() {
    // Dispatch custom event to hide install button
    window.dispatchEvent(new CustomEvent('pwa-installable', { 
      detail: { installable: false } 
    }));
  }

  private showUpdateAvailable() {
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BGHfACATXUHVBRUfpOTgFvotlTZV8IqgcjLQ4YmPPKNZFLhBrFNf0VnD1NKt3QLVJlFmUqW-oe37kNZsD2OKRDo'
          )
        });
        console.log('Push subscription successful:', subscription);
        return subscription;
      } catch (error) {
        console.error('Push subscription failed:', error);
      }
    }
    return null;
  }

  // Send a test push notification
  async sendTestNotification(title: string, body: string, options: NotificationOptions = {}) {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted') {
      const defaultOptions: NotificationOptions = {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        tag: 'test-notification',
        requireInteraction: false,
        silent: false,
        ...options
      };

      new Notification(title, defaultOptions);
      return true;
    }
    
    return false;
  }

  // Trigger background sync
  async triggerBackgroundSync(tag: string = 'background-sync'): Promise<boolean> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log('Background sync registered:', tag);
        return true;
      } catch (error) {
        console.error('Background sync registration failed:', error);
        return false;
      }
    }
    return false;
  }

  // Force service worker update
  async forceUpdate(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          
          // If there's a waiting worker, tell it to skip waiting
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            return true;
          }
        }
      } catch (error) {
        console.error('Force update failed:', error);
      }
    }
    return false;
  }

  // Check if app is running as PWA
  isRunningAsPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Get network status
  getNetworkStatus(): { online: boolean; type?: string; downlink?: number } {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    return {
      online: navigator.onLine,
      type: connection?.effectiveType,
      downlink: connection?.downlink
    };
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Initialize PWA manager
export const pwaManager = PWAManager.getInstance();
