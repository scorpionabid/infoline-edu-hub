/**
 * İnfoLine Unified Cache System - Main Cache Manager
 * Bütün cache strategiyalarını idarə edən əsas sinif
 */

import { MemoryCacheAdapter } from './strategies/MemoryCacheAdapter';
import { StorageCacheAdapter } from './strategies/StorageCacheAdapter';
import { CrossTabSyncStrategy } from './strategies/CrossTabSyncStrategy';
import { 
  CACHE_TTL,
  CACHE_LIMITS
} from './core/types';
import type { 
  CacheAdapter, 
  CacheOptions, 
  CacheManagerConfig,
  CacheStorageType,
  CacheKey
} from './core/types';

export class UnifiedCacheManager {
  private memoryAdapter: MemoryCacheAdapter;
  private localStorageAdapter: StorageCacheAdapter;
  private sessionStorageAdapter: StorageCacheAdapter;
  private crossTabSync: CrossTabSyncStrategy;
  private config: CacheManagerConfig;
  private cleanupInterval?: number;

  constructor(config: Partial<CacheManagerConfig> = {}) {
    this.config = {
      defaultTTL: 10 * 60 * 1000, // 10 minutes
      defaultMaxSize: 100,
      version: '1.0',
      storagePrefix: 'infoline_unified',
      enableMonitoring: true,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      ...config
    };

    this.initializeAdapters();
    this.setupCrossTabSync();
    this.startPeriodicCleanup();
    
    console.log('[UnifiedCacheManager] Initialized with config:', this.config);
  }

  /**
   * Initialize cache adapters
   */
  private initializeAdapters(): void {
    this.memoryAdapter = new MemoryCacheAdapter(
      this.config.defaultMaxSize,
      this.config.version
    );

    this.localStorageAdapter = new StorageCacheAdapter(
      'localStorage',
      Math.floor(this.config.defaultMaxSize / 2),
      this.config.version
    );

    this.sessionStorageAdapter = new StorageCacheAdapter(
      'sessionStorage',
      Math.floor(this.config.defaultMaxSize / 4),
      this.config.version
    );
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    this.crossTabSync = new CrossTabSyncStrategy();
    this.crossTabSync.register(this.memoryAdapter);
    this.crossTabSync.register(this.localStorageAdapter);
  }

  /**
   * Start periodic cleanup
   */
  private startPeriodicCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = window.setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Get appropriate adapter based on options
   */
  private selectAdapter(options: CacheOptions = {}): CacheAdapter {
    const { storage = 'memory', priority = false } = options;

    // Priority data always goes to memory for fastest access
    if (priority) {
      return this.memoryAdapter;
    }

    switch (storage) {
      case 'localStorage':
        return this.localStorageAdapter;
      case 'sessionStorage':
        return this.sessionStorageAdapter;
      case 'memory':
      default:
        return this.memoryAdapter;
    }
  }

  /**
   * Auto-select best storage strategy based on data characteristics
   */
  private autoSelectStrategy(key: string, data: any): CacheOptions {
    const dataSize = JSON.stringify(data).length;
    
    // Large data goes to localStorage
    if (dataSize > 10000) {
      return { storage: 'localStorage', ttl: CACHE_TTL.MEDIUM };
    }
    
    // Critical user data goes to memory with priority
    if (key.includes('user_') || key.includes('session')) {
      return { storage: 'memory', priority: true, ttl: CACHE_TTL.LONG };
    }
    
    // Translation data gets special treatment
    if (key.includes('translation')) {
      return { storage: 'localStorage', priority: true, ttl: CACHE_TTL.VERY_LONG };
    }
    
    // Reports go to memory with shorter TTL
    if (key.includes('report') || key.includes('stats')) {
      return { storage: 'memory', ttl: CACHE_TTL.SHORT };
    }
    
    // Default strategy
    return { storage: 'memory', ttl: this.config.defaultTTL };
  }

  // Public API Methods

  /**
   * Get memory cache adapter
   */
  memory(): CacheAdapter {
    return this.memoryAdapter;
  }

  /**
   * Get localStorage cache adapter
   */
  localStorage(): CacheAdapter {
    // Return the adapter directly to ensure consistent key handling
    return this.localStorageAdapter;
  }

  /**
   * Get sessionStorage cache adapter
   */
  sessionStorage(): CacheAdapter {
    // Return the adapter directly to ensure consistent key handling
    return this.sessionStorageAdapter;
  }

  /**
   * Auto-select best adapter and strategy
   */
  auto(key: string, data?: any): {
    adapter: CacheAdapter;
    options: CacheOptions;
  } {
    const options = this.autoSelectStrategy(key, data);
    const adapter = this.selectAdapter(options);
    
    return { adapter, options };
  }

  /**
   * Universal get method
   */
  get<T = any>(key: string, preferredStorage?: CacheStorageType): T | null {
    // Try preferred storage first
    if (preferredStorage) {
      const adapter = this.selectAdapter({ storage: preferredStorage });
      const result = adapter.get(key);
      if (result !== null) {
        return result as T;
      }
    }

    // Try all adapters in priority order
    const adapters = [this.memoryAdapter, this.localStorageAdapter, this.sessionStorageAdapter];
    
    for (const adapter of adapters) {
      const result = adapter.get(key);
      if (result !== null) {
        // Cache hit in different storage - optionally promote to memory
        if (adapter !== this.memoryAdapter) {
          this.memoryAdapter.set(key, result);
        }
        return result as T;
      }
    }

    return null;
  }

  /**
   * Universal set method with auto-selection
   */
  set<T>(key: string, value: T, options?: CacheOptions): void {
    const { adapter, options: autoOptions } = this.auto(key, value);
    const finalOptions = { ...autoOptions, ...options };
    
    adapter.set(key, value, finalOptions);
    
    // Notify cross-tab sync if enabled
    if (finalOptions.crossTab !== false) {
      this.crossTabSync.notifyUpdate(key, value);
    }
  }

  /**
   * Universal delete method
   */
  delete(key: string): void {
    // Delete from all adapters
    this.memoryAdapter.delete(key);
    this.localStorageAdapter.delete(key);
    this.sessionStorageAdapter.delete(key);
    
    // Notify cross-tab sync
    this.crossTabSync.notifyDelete(key);
  }

  /**
   * Check if key exists in any cache
   */
  has(key: string): boolean {
    return this.memoryAdapter.has(key) || 
           this.localStorageAdapter.has(key) || 
           this.sessionStorageAdapter.has(key);
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.memoryAdapter.clear();
    this.localStorageAdapter.clear();
    this.sessionStorageAdapter.clear();
    
    // Notify cross-tab sync
    this.crossTabSync.notifyClear();
  }

  /**
   * Clear specific cache type
   */
  clearStorage(storageType: CacheStorageType): void {
    const adapter = this.selectAdapter({ storage: storageType });
    adapter.clear();
  }

  /**
   * Cleanup expired entries from all caches
   */
  cleanup(): void {
    this.memoryAdapter.cleanup();
    this.localStorageAdapter.cleanup();
    this.sessionStorageAdapter.cleanup();
    
    if (this.config.enableMonitoring) {
      console.log('[UnifiedCacheManager] Periodic cleanup completed');
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats() {
    const memoryStats = this.memoryAdapter.getMemoryStats();
    const localStorageStats = this.localStorageAdapter.getStorageStats();
    const sessionStorageStats = this.sessionStorageAdapter.getStorageStats();
    const crossTabStats = this.crossTabSync.getStatus();

    return {
      memory: memoryStats,
      localStorage: localStorageStats,
      sessionStorage: sessionStorageStats,
      crossTab: crossTabStats,
      total: {
        size: memoryStats.size + localStorageStats.size + sessionStorageStats.size,
        hits: memoryStats.hits + localStorageStats.hits + sessionStorageStats.hits,
        misses: memoryStats.misses + localStorageStats.misses + sessionStorageStats.misses,
        hitRate: ((memoryStats.hits + localStorageStats.hits + sessionStorageStats.hits) / 
                 Math.max(1, memoryStats.hits + localStorageStats.hits + sessionStorageStats.hits + 
                         memoryStats.misses + localStorageStats.misses + sessionStorageStats.misses)) * 100
      }
    };
  }

  /**
   * Preload critical data
   */
  async preload(loaders: Record<string, () => Promise<any>>): Promise<void> {
    const promises = Object.entries(loaders).map(async ([key, loader]) => {
      try {
        if (!this.has(key)) {
          const data = await loader();
          this.set(key, data, { priority: true });
          console.log(`[UnifiedCacheManager] Preloaded ${key}`);
        }
      } catch (error) {
        console.warn(`[UnifiedCacheManager] Failed to preload ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Export cache data for debugging
   */
  export() {
    return {
      memory: {
        keys: this.memoryAdapter.keys(),
        stats: this.memoryAdapter.getStats()
      },
      localStorage: {
        keys: this.localStorageAdapter.keys(),
        stats: this.localStorageAdapter.getStats()
      },
      sessionStorage: {
        keys: this.sessionStorageAdapter.keys(),
        stats: this.sessionStorageAdapter.getStats()
      }
    };
  }

  /**
   * Health check for cache system
   */
  healthCheck(): { healthy: boolean; issues: string[]; recommendations: string[] } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const stats = this.getStats();

    // Check hit rates
    if (stats.total.hitRate < 50) {
      issues.push(`Low cache hit rate: ${stats.total.hitRate.toFixed(1)}%`);
      recommendations.push('Consider increasing TTL for frequently accessed data');
    }

    // Check memory usage
    if (stats.memory.size >= stats.memory.maxSize * 0.9) {
      issues.push('Memory cache near capacity');
      recommendations.push('Consider increasing memory cache size or TTL optimization');
    }

    // Check cross-tab sync
    if (!stats.crossTab.enabled) {
      issues.push('Cross-tab sync disabled');
      recommendations.push('Enable cross-tab sync for better user experience');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Destroy cache manager
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.crossTabSync.destroy();
    this.clear();
    
    console.log('[UnifiedCacheManager] Destroyed');
  }
}

// Global cache manager instance
export const cacheManager = new UnifiedCacheManager();

export default cacheManager;
