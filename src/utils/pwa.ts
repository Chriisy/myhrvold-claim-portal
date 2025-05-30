
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
