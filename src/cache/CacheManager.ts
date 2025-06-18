
import { MemoryCacheAdapter } from './strategies/MemoryCacheAdapter';
import { StorageCacheAdapter } from './strategies/StorageCacheAdapter';
import { CrossTabSyncStrategy } from './strategies/CrossTabSyncStrategy';
import { CacheAdapter, CacheOptions, CacheStats } from './core/types';

export class CacheManager<T = any> {
  private adapters: Map<string, CacheAdapter<T>>;
  private primaryAdapter: CacheAdapter<T>;
  private crossTabSync: CrossTabSyncStrategy<T>;
  private isEnabled: boolean = true;

  constructor() {
    this.adapters = new Map();
    this.crossTabSync = new CrossTabSyncStrategy();
    
    // Initialize adapters
    const memoryAdapter = new MemoryCacheAdapter<T>();
    const storageAdapter = new StorageCacheAdapter<T>();
    
    this.adapters.set('memory', memoryAdapter);
    this.adapters.set('storage', storageAdapter);
    
    // Set memory as primary adapter
    this.primaryAdapter = memoryAdapter;
    
    // Setup cross-tab sync
    this.crossTabSync.initialize(this.adapters);
  }

  get(key: string): T | null {
    if (!this.isEnabled) return null;
    
    try {
      return this.primaryAdapter.get(key);
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }

  set(key: string, value: T, options?: CacheOptions): void {
    if (!this.isEnabled) return;
    
    try {
      this.primaryAdapter.set(key, value, options);
      // Sync across tabs
      this.crossTabSync.broadcast(key, value, options);
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }

  delete(key: string): void {
    if (!this.isEnabled) return;
    
    try {
      this.primaryAdapter.delete(key);
      this.crossTabSync.broadcastDelete(key);
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  clear(): void {
    if (!this.isEnabled) return;
    
    try {
      this.adapters.forEach(adapter => adapter.clear());
      this.crossTabSync.broadcastClear();
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

  switchAdapter(type: 'memory' | 'storage'): void {
    const adapter = this.adapters.get(type);
    if (adapter) {
      this.primaryAdapter = adapter;
    }
  }

  disable(): void {
    this.isEnabled = false;
  }

  enable(): void {
    this.isEnabled = true;
  }

  getHealth(): { healthy: boolean; issues: string[] } {
    const issues: string[] = [];
    
    try {
      // Test primary adapter
      this.primaryAdapter.getStats();
    } catch (error) {
      issues.push('Primary adapter error');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
export default cacheManager;
