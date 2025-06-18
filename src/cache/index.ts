/**
 * İnfoLine Unified Cache System - Public API
 * Bütün cache funksionallığı üçün vahid entry point
 */

// Core components
import { CacheManager, cacheManager } from './CacheManager';
export { CacheManager as UnifiedCacheManager, cacheManager };
export { BaseCacheAdapter } from './core/BaseCacheAdapter';

// Strategies
export { MemoryCacheAdapter } from './strategies/MemoryCacheAdapter';
export { StorageCacheAdapter } from './strategies/StorageCacheAdapter';
export { CrossTabSyncStrategy } from './strategies/CrossTabSyncStrategy';

// Hooks
import {
  useCache,
  useCachedQuery,
  useCacheMutation,
  usePreload,
  useCacheStats,
  useTranslationCache,
  useSessionCache,
} from './hooks';

export {
  useCache,
  useCachedQuery,
  useCacheMutation,
  usePreload,
  useCacheStats,
  useTranslationCache,
  useSessionCache,
};

// Types and constants
import {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_LIMITS,
  type CacheAdapter,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
  type CacheStorageType,
  type CacheStrategy,
  type CacheManagerConfig,
  type CrossTabMessage,
  type CacheKey,
} from './core/types';

// Export types and constants
export {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_LIMITS,
  type CacheAdapter,
  type CacheEntry,
  type CacheOptions,
  type CacheStats,
  type CacheStorageType,
  type CacheStrategy,
  type CacheManagerConfig,
  type CrossTabMessage,
  type CacheKey
};

// Utility functions for easy migration from old cache systems
export const CacheUtils = {
  /**
   * Migrate from old lib/cache.ts usage
   */
  migrateFromLibCache: (key: string, data: any, expiryMs?: number) => {
    cacheManager.set(key, data, { 
      storage: 'localStorage', 
      ttl: expiryMs 
    });
  },

  /**
   * Migrate from old cacheUtils.ts usage
   */
  migrateFromCacheUtils: (key: string, data: any, config?: { expiryInMinutes?: number }) => {
    const ttl = config?.expiryInMinutes ? config.expiryInMinutes * 60 * 1000 : undefined;
    cacheManager.set(key, data, { 
      storage: 'localStorage', 
      ttl 
    });
  },

  /**
   * Migrate from old regions/cache.ts usage
   */
  migrateFromRegionsCache: (regions: any[]) => {
    cacheManager.set(CACHE_KEYS.REGIONS, regions, {
      storage: 'memory',
      priority: true,
      ttl: CACHE_TTL.MEDIUM
    });
  },

  /**
   * Migrate from old EnhancedCacheService usage
   */
  migrateFromEnhancedCache: (key: string, data: any, options?: { priority?: boolean; ttl?: number }) => {
    cacheManager.set(key, data, {
      storage: 'memory',
      priority: options?.priority || false,
      ttl: options?.ttl || CACHE_TTL.MEDIUM,
      crossTab: true
    });
  },

  /**
   * Migrate from old translationCache.ts usage
   */
  migrateFromTranslationCache: (language: string, translations: any) => {
    cacheManager.set(`translations_${language}`, translations, {
      storage: 'localStorage',
      priority: language === 'az',
      ttl: language === 'az' ? CACHE_TTL.VERY_LONG : CACHE_TTL.LONG
    });
  },

  /**
   * Migrate from old reports/cacheService.ts usage
   */
  migrateFromReportsCache: (prefix: string, params: Record<string, any>, data: any, ttl?: number) => {
    const key = `${prefix}_${JSON.stringify(params)}`;
    cacheManager.set(key, data, {
      storage: 'memory',
      ttl: ttl || CACHE_TTL.SHORT
    });
  }
};

// Migration helpers for React Query integration
export const QueryCacheUtils = {
  /**
   * Convert old useCachedQuery to new implementation
   */
  convertOldUseCachedQuery: (queryKey: string[], queryFn: () => Promise<any>, options?: any) => {
    return useCachedQuery(queryKey.join('_'), queryFn, {
      cacheOptions: {
        storage: 'memory',
        ttl: options?.staleTime || CACHE_TTL.MEDIUM
      },
      queryOptions: options
    });
  }
};

// Performance monitoring utilities
export const CachePerformance = {
  /**
   * Monitor cache performance
   */
  startMonitoring: () => {
    const originalSet = cacheManager.set;
    const originalGet = cacheManager.get;
    
    let setOperations = 0;
    let getOperations = 0;
    let startTime = Date.now();

    cacheManager.set = function<T>(key: string, value: T, options?: CacheOptions) {
      setOperations++;
      return originalSet.call(this, key, value, options);
    };

    cacheManager.get = function<T>(key: string, preferredStorage?: CacheStorageType) {
      getOperations++;
      return originalGet.call(this, key, preferredStorage);
    };

    return {
      getStats: () => ({
        setOperations,
        getOperations,
        totalOperations: setOperations + getOperations,
        elapsedTime: Date.now() - startTime,
        operationsPerSecond: (setOperations + getOperations) / ((Date.now() - startTime) / 1000)
      }),
      reset: () => {
        setOperations = 0;
        getOperations = 0;
        startTime = Date.now();
      }
    };
  }
};

// Debug utilities
export const CacheDebug = {
  /**
   * Log all cache operations
   */
  enableVerboseLogging: () => {
    const originalSet = cacheManager.set;
    const originalGet = cacheManager.get;
    const originalDelete = cacheManager.delete;

    cacheManager.set = function<T>(key: string, value: T, options?: CacheOptions) {
      console.log(`[CacheDebug] SET ${key}`, { value, options });
      return originalSet.call(this, key, value, options);
    };

    cacheManager.get = function<T>(key: string, preferredStorage?: CacheStorageType) {
      const result = originalGet.call(this, key, preferredStorage);
      console.log(`[CacheDebug] GET ${key}`, { result, preferredStorage });
      return result;
    };

    cacheManager.delete = function(key: string) {
      console.log(`[CacheDebug] DELETE ${key}`);
      return originalDelete.call(this, key);
    };
  },

  /**
   * Dump all cache contents
   */
  dumpAll: () => {
    console.group('[CacheDebug] Cache Contents');
    console.log('Export:', cacheManager.export());
    console.log('Stats:', cacheManager.getStats());
    console.log('Health:', cacheManager.healthCheck());
    console.groupEnd();
  },

  /**
   * Test cache functionality
   */
  runTests: () => {
    console.group('[CacheDebug] Running Cache Tests');

    // Test basic functionality
    const testKey = 'test_key';
    const testValue = { test: 'data', timestamp: Date.now() };

    // Test set/get
    cacheManager.set(testKey, testValue);
    const retrieved = cacheManager.get(testKey);
    console.assert(JSON.stringify(retrieved) === JSON.stringify(testValue), 'Set/Get test failed');

    // Test has
    console.assert(cacheManager.has(testKey), 'Has test failed');

    // Test delete
    cacheManager.delete(testKey);
    console.assert(!cacheManager.has(testKey), 'Delete test failed');

    // Test auto strategy
    const { adapter, options } = cacheManager.auto('user_profile', { userId: 123 });
    console.log('Auto strategy test:', { adapter: adapter.constructor.name, options });

    console.log('✅ All cache tests passed');
    console.groupEnd();
  }
};

// Default export with commonly used functions
export default {
  // Main manager
  cacheManager,
  
  // Hooks
  useCache,
  useCachedQuery,
  useCacheMutation,
  usePreload,
  useCacheStats,
  useTranslationCache,
  useSessionCache,
  
  // Utils
  CacheUtils,
  QueryCacheUtils,
  CachePerformance,
  CacheDebug,
  
  // Constants
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_LIMITS
};
