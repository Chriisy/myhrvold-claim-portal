
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number;
  onEvict?: (key: string, value: any) => void;
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

export class CacheService {
  private static instances = new Map<string, CacheService>();
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  private constructor(config: CacheConfig) {
    this.config = config;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  static getInstance(namespace: string, config: CacheConfig): CacheService {
    if (!this.instances.has(namespace)) {
      this.instances.set(namespace, new CacheService(config));
    }
    return this.instances.get(namespace)!;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl
    };

    // Check if we need to evict old entries
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => {
      this.config.onEvict?.(key, this.cache.get(key)?.value);
      this.cache.delete(key);
    });
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.config.onEvict?.(oldestKey, this.cache.get(oldestKey)?.value);
      this.cache.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    };
  }
}
