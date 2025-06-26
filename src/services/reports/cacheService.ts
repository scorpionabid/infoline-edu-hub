import { supabase } from '@/integrations/supabase/client';

// Cache interface and types
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Default: 5 minutes
  maxSize?: number; // Default: 100 entries
  enableCompression?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

/**
 * LRU Cache implementation for reports
 */
export class ReportCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private stats = { hits: 0, misses: 0 };
  private accessCounter = 0;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      enableCompression: options.enableCompression || false
    };
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);

    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Evict least recently used entries if cache is full
   */
  private evictLRU(): void {
    if (this.cache.size < this.options.maxSize) return;

    // Find least recently used key
    let lruKey = '';
    let lruAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < lruAccess) {
        lruAccess = accessTime;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.accessOrder.delete(lruKey);
    }
  }

  /**
   * Update access order for LRU
   */
  private updateAccess(key: string): void {
    this.accessOrder.set(key, ++this.accessCounter);
  }

  /**
   * Get data from cache
   */
  get<T>(prefix: string, params: Record<string, any>): T | null {
    const key = this.generateKey(prefix, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (!this.isValid(entry)) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.stats.misses++;
      return null;
    }

    this.updateAccess(key);
    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set data in cache
   */
  set<T>(prefix: string, params: Record<string, any>, data: T, customTtl?: number): void {
    const key = this.generateKey(prefix, params);

    // Evict if necessary
    this.evictLRU();

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || this.options.ttl,
      // key
    };

    this.cache.set(key, entry);
    this.updateAccess(key);
  }

  /**
   * Invalidate specific cache entries
   */
  invalidate(prefix: string, params?: Record<string, any>): void {
    if (params) {
      // Invalidate specific entry
      const key = this.generateKey(prefix, params);
      this.cache.delete(key);
      this.accessOrder.delete(key);
    } else {
      // Invalidate all entries with prefix
      const keysToDelete: string[] = [];
      for (const [key] of this.cache.entries()) {
        if (key.startsWith(prefix + ':')) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      });
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats = { hits: 0, misses: 0 };
    this.accessCounter = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0
    };
  }

  /**
   * Get all cache keys (for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
    });
  }
}

// Global cache instance
export const reportCache = new ReportCache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200, // 200 entries max
  enableCompression: false
});

/**
 * Cache decorator for async functions
 */
export function cached<T extends any[], R>(
  prefix: string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: T): Promise<R> {
      const params = args.length > 0 ? { args: args[0] } : {};

      // Try to get from cache
      const cached = reportCache.get<R>(prefix, params);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);

      // Cache the result
      reportCache.set(prefix, params, result, ttl);

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache helper functions
 */
export const CacheHelpers = {
  /**
   * Wrapper for caching async function results
   */
  async withCache<T>(
    prefix: string,
    params: Record<string, any>,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try cache first
    const cached = reportCache.get<T>(prefix, params);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const result = await fetcher();

    // Cache the result
    reportCache.set(prefix, params, result, ttl);

    return result;
  },

  /**
   * Invalidate cache when data changes
   */
  invalidateRelated(operation: 'create' | 'update' | 'delete', entity: string): void {
    switch (entity) {
      case 'data_entry': {
        reportCache.invalidate('school_performance');
        reportCache.invalidate('regional_comparison');
        reportCache.invalidate('category_completion');
        reportCache.invalidate('school_column_data');
        break; }

      case 'school': {
        reportCache.invalidate('school_performance');
        reportCache.invalidate('school_column_data');
        break; }

      case 'category': {
      case 'column': {
        reportCache.invalidate('category_completion');
        reportCache.invalidate('school_column_data');
        break; }

      default:
        // Unknown entity, clear all cache
        reportCache.clear();
    }
  },

  /**
   * Preload commonly used data
   */
  async preloadCommonData(): Promise<void> {
    try {
      // Preload regional comparison (small dataset)
      const { data: regionalData } = await supabase.rpc('get_regional_comparison_report' as any);
      if (regionalData) {
        reportCache.set('regional_comparison', {}, regionalData, 10 * 60 * 1000); // 10 minutes
      }

      // Preload basic school performance
      const { data: schoolData } = await supabase.rpc('get_school_performance_report' as any, {});
      if (schoolData) {
        reportCache.set('school_performance', {}, schoolData, 5 * 60 * 1000); // 5 minutes
      }
    } catch (error) {
      console.warn('Failed to preload cache data:', error);
    }
  },

  /**
   * Setup automatic cache cleanup
   */
  setupAutoCleanup(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      reportCache.cleanup();
    }, intervalMs);

    return () => clearInterval(interval);
  }
};

// Auto cleanup every minute
if (typeof window !== 'undefined') {
  CacheHelpers.setupAutoCleanup();
}

export default reportCache;