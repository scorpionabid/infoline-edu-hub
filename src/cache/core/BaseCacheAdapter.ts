/**
 * İnfoLine Unified Cache System - Base Cache Adapter
 * Bütün cache adapter-ləri üçün base class
 */

import type { 
  CacheAdapter, 
  CacheEntry, 
  CacheOptions, 
  CacheStats,
  CacheStorageType 
} from './types';

export abstract class BaseCacheAdapter<T = any> implements CacheAdapter<T> {
  protected cache = new Map<string, CacheEntry<T>>();
  protected stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    maxSize: 100,
    hitRate: 0,
    memoryUsage: 0,
    lastCleanup: Date.now()
  };
  
  protected readonly prefix: string;
  protected readonly version: string;

  constructor(
    prefix: string = 'infoline_cache',
    maxSize: number = 100,
    version: string = '1.0'
  ) {
    this.prefix = prefix;
    this.stats.maxSize = maxSize;
    this.version = version;
  }

  /**
   * Generate cache key with prefix
   */
  protected getCacheKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  /**
   * Generate checksum for data integrity
   */
  protected generateChecksum(data: T): string {
    try {
      const str = JSON.stringify(data);
      // Simple hash function for checksum
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36);
    } catch {
      return 'invalid';
    }
  }

  /**
   * Check if cache entry is valid
   */
  protected isValid(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    
    // Check TTL
    if (entry.ttl > 0 && (now - entry.timestamp) > entry.ttl) {
      return false;
    }
    
    // Check version
    if (entry.version !== this.version) {
      return false;
    }
    
    return true;
  }

  /**
   * Update cache statistics
   */
  protected updateStats(isHit: boolean): void {
    if (isHit) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    
    this.stats.size = this.cache.size;
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    
    // Estimate memory usage (approximate)
    this.stats.memoryUsage = this.cache.size * 1024; // 1KB per entry estimate
  }

  /**
   * Create cache entry
   */
  protected createEntry(data: T, options: CacheOptions = {}): CacheEntry<T> {
    const now = Date.now();
    
    return {
      data,
      timestamp: now,
      ttl: options.ttl || 0,
      accessCount: 1,
      lastAccess: now,
      priority: options.priority || false,
      checksum: this.generateChecksum(data),
      version: this.version
    };
  }

  /**
   * Update access information for cache entry
   */
  protected updateAccess(entry: CacheEntry<T>): void {
    entry.accessCount++;
    entry.lastAccess = Date.now();
  }

  /**
   * Abstract method for eviction strategy
   */
  protected abstract evict(): void;

  // Implement CacheAdapter interface
  
  get(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      this.updateStats(false);
      return null;
    }
    
    if (!this.isValid(entry)) {
      this.cache.delete(cacheKey);
      this.updateStats(false);
      return null;
    }
    
    this.updateAccess(entry);
    this.updateStats(true);
    return entry.data;
  }

  set(key: string, value: T, options: CacheOptions = {}): void {
    const cacheKey = this.getCacheKey(key);
    
    // Check if we need to evict
    if (this.cache.size >= this.stats.maxSize && !this.cache.has(cacheKey)) {
      this.evict();
    }
    
    const entry = this.createEntry(value, options);
    this.cache.set(cacheKey, entry);
    this.updateStats(false); // Update stats after set
  }

  delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.updateStats(false); // Update size
  }

  has(key: string): boolean {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) return false;
    
    if (!this.isValid(entry)) {
      this.cache.delete(cacheKey);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.size = 0;
    this.stats.hitRate = 0;
    this.stats.memoryUsage = 0;
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValid(entry)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.stats.lastCleanup = now;
    this.updateStats(false); // Update size
    
    console.log(`[${this.prefix}] Cleaned up ${keysToDelete.length} expired entries`);
  }

  keys(): string[] {
    return Array.from(this.cache.keys()).map(key => 
      key.replace(`${this.prefix}_`, '')
    );
  }
}

export default BaseCacheAdapter;
