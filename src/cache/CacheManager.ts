
import { MemoryCacheAdapter } from './strategies/MemoryCacheAdapter';
import { StorageCacheAdapter } from './strategies/StorageCacheAdapter';
import { CacheAdapter, CacheOptions, CacheStats, CacheStorageType } from './core/types';

export class CacheManager<T = any> {
  private adapters: Map<string, CacheAdapter<T>>;
  private primaryAdapter: CacheAdapter<T>;
  private isEnabled: boolean = true;

  constructor() {
    this.adapters = new Map();
    
    // Initialize adapters
    const memoryAdapter = new MemoryCacheAdapter<T>();
    const storageAdapter = new StorageCacheAdapter<T>();
    
    this.adapters.set('memory', memoryAdapter);
    this.adapters.set('localStorage', storageAdapter);
    this.adapters.set('storage', storageAdapter);
    
    // Set memory as primary adapter
    this.primaryAdapter = memoryAdapter;
  }

  get<U = T>(key: string, preferredStorage?: CacheStorageType): U | null {
    if (!this.isEnabled) return null;
    
    try {
      let adapter = this.primaryAdapter;
      if (preferredStorage) {
        const preferredAdapter = this.adapters.get(preferredStorage);
        if (preferredAdapter) {
          adapter = preferredAdapter;
        }
      }
      return adapter.get(key) as U | null;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  set<U = T>(key: string, value: U, options?: CacheOptions & { storage?: CacheStorageType }): void {
    if (!this.isEnabled) return;
    
    try {
      let adapter = this.primaryAdapter;
      if (options?.storage) {
        const preferredAdapter = this.adapters.get(options.storage);
        if (preferredAdapter) {
          adapter = preferredAdapter;
        }
      }
      adapter.set(key, value as T, options);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  has(key: string, preferredStorage?: CacheStorageType): boolean {
    if (!this.isEnabled) return false;
    
    try {
      let adapter = this.primaryAdapter;
      if (preferredStorage) {
        const preferredAdapter = this.adapters.get(preferredStorage);
        if (preferredAdapter) {
          adapter = preferredAdapter;
        }
      }
      return adapter.get(key) !== null;
    } catch (error) {
      console.warn('Cache has error:', error);
      return false;
    }
  }

  delete(key: string): void {
    if (!this.isEnabled) return;
    
    try {
      this.adapters.forEach(adapter => adapter.delete(key));
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  clear(): void {
    if (!this.isEnabled) return;
    
    try {
      this.adapters.forEach(adapter => adapter.clear());
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  evict(): void {
    if (!this.isEnabled) return;
    
    try {
      this.adapters.forEach(adapter => adapter.evict());
    } catch (error) {
      console.warn('Cache evict error:', error);
    }
  }

  getStats(): CacheStats {
    try {
      return this.primaryAdapter.getStats();
    } catch (error) {
      console.warn('Cache getStats error:', error);
      return {
        size: 0,
        hitRate: 0,
        memoryUsage: 0,
        expiredEntries: 0
      };
    }
  }

  switchAdapter(type: CacheStorageType): void {
    const adapter = this.adapters.get(type);
    if (adapter) {
      this.primaryAdapter = adapter;
    }
  }

  // Helper methods for compatibility
  sessionStorage() {
    return {
      set: (key: string, value: any, options?: CacheOptions) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            const entry = {
              data: value,
              timestamp: Date.now(),
              ttl: options?.ttl
            };
            window.sessionStorage.setItem(`cache:${key}`, JSON.stringify(entry));
          } catch (error) {
            console.warn('SessionStorage set error:', error);
          }
        }
      },
      get: (key: string) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            const item = window.sessionStorage.getItem(`cache:${key}`);
            if (item) {
              const entry = JSON.parse(item);
              if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
                window.sessionStorage.removeItem(`cache:${key}`);
                return null;
              }
              return entry.data;
            }
          } catch (error) {
            console.warn('SessionStorage get error:', error);
          }
        }
        return null;
      },
      delete: (key: string) => {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            window.sessionStorage.removeItem(`cache:${key}`);
          } catch (error) {
            console.warn('SessionStorage delete error:', error);
          }
        }
      }
    };
  }

  // Strategy selection helper
  auto(key: string, context?: any) {
    // Simple strategy: use memory for small, frequently accessed data
    const isFrequent = key.includes('user_') || key.includes('profile');
    const storage = isFrequent ? 'memory' : 'localStorage';
    
    return {
      adapter: this.adapters.get(storage) || this.primaryAdapter,
      options: {
        storage,
        ttl: isFrequent ? 5 * 60 * 1000 : 15 * 60 * 1000 // 5min vs 15min
      }
    };
  }

  // Export/import for debugging
  export() {
    const data: Record<string, any> = {};
    this.adapters.forEach((adapter, key) => {
      try {
        data[key] = adapter.getStats();
      } catch (error) {
        data[key] = { error: error.toString() };
      }
    });
    return data;
  }

  // Health check
  healthCheck() {
    const health = {
      enabled: this.isEnabled,
      adapters: this.adapters.size,
      primary: this.primaryAdapter.constructor.name,
      errors: [] as string[]
    };
    
    // Test basic functionality
    try {
      const testKey = 'health_check';
      this.set(testKey, 'test');
      const result = this.get(testKey);
      this.delete(testKey);
      
      if (result !== 'test') {
        health.errors.push('Basic set/get failed');
      }
    } catch (error) {
      health.errors.push(`Health check failed: ${error}`);
    }
    
    return health;
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export default cacheManager;
