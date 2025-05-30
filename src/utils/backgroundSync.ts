
// Background sync utilities for offline form submissions
export class BackgroundSyncManager {
  private static instance: BackgroundSyncManager;
  private pendingRequests: Map<string, any> = new Map();

  private constructor() {
    this.init();
  }

  static getInstance(): BackgroundSyncManager {
    if (!BackgroundSyncManager.instance) {
      BackgroundSyncManager.instance = new BackgroundSyncManager();
    }
    return BackgroundSyncManager.instance;
  }

  private init() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Device is back online, syncing pending requests...');
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      console.log('Device is offline, will queue requests for sync');
    });

    // Load pending requests from localStorage
    this.loadPendingRequests();
  }

  private loadPendingRequests() {
    try {
      const stored = localStorage.getItem('pendingRequests');
      if (stored) {
        const requests = JSON.parse(stored);
        Object.entries(requests).forEach(([key, value]) => {
          this.pendingRequests.set(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  }

  private savePendingRequests() {
    try {
      const requests = Object.fromEntries(this.pendingRequests);
      localStorage.setItem('pendingRequests', JSON.stringify(requests));
    } catch (error) {
      console.error('Failed to save pending requests:', error);
    }
  }

  async queueRequest(requestId: string, requestData: {
    url: string;
    method: string;
    body?: any;
    headers?: Record<string, string>;
  }) {
    console.log('Queueing request for background sync:', requestId);
    
    this.pendingRequests.set(requestId, {
      ...requestData,
      timestamp: Date.now(),
      retryCount: 0
    });
    
    this.savePendingRequests();

    // Try to register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(`sync-${requestId}`);
        console.log('Background sync registered for:', requestId);
      } catch (error) {
        console.error('Failed to register background sync:', error);
        // Fallback: try immediate sync if background sync fails
        this.syncPendingRequests();
      }
    } else {
      // Fallback for browsers without background sync
      this.syncPendingRequests();
    }
  }

  async syncPendingRequests() {
    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return;
    }

    console.log('Syncing pending requests...');
    const promises: Promise<void>[] = [];

    for (const [requestId, requestData] of this.pendingRequests) {
      promises.push(this.syncSingleRequest(requestId, requestData));
    }

    await Promise.allSettled(promises);
  }

  private async syncSingleRequest(requestId: string, requestData: any) {
    try {
      console.log('Syncing request:', requestId);

      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          'Content-Type': 'application/json',
          ...requestData.headers
        },
        body: requestData.body ? JSON.stringify(requestData.body) : undefined
      });

      if (response.ok) {
        console.log('Request synced successfully:', requestId);
        this.pendingRequests.delete(requestId);
        this.savePendingRequests();
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('sync-success', {
          detail: { requestId, response }
        }));
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to sync request:', requestId, error);
      
      // Increment retry count
      const updatedData = {
        ...requestData,
        retryCount: (requestData.retryCount || 0) + 1
      };

      // Remove if too many retries
      if (updatedData.retryCount >= 3) {
        console.log('Max retries reached, removing request:', requestId);
        this.pendingRequests.delete(requestId);
        
        // Dispatch failure event
        window.dispatchEvent(new CustomEvent('sync-failed', {
          detail: { requestId, error }
        }));
      } else {
        this.pendingRequests.set(requestId, updatedData);
      }
      
      this.savePendingRequests();
    }
  }

  // Queue form submission for background sync
  async queueFormSubmission(formType: string, formData: any) {
    const requestId = `${formType}-${Date.now()}`;
    
    await this.queueRequest(requestId, {
      url: `/api/${formType}`,
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return requestId;
  }

  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  getPendingRequests(): Array<{ id: string; data: any }> {
    return Array.from(this.pendingRequests.entries()).map(([id, data]) => ({
      id,
      data
    }));
  }
}

// Export singleton instance
export const backgroundSyncManager = BackgroundSyncManager.getInstance();
