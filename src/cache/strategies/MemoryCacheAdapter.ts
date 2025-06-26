
/**
 * İnfoLine Unified Cache System - Memory Cache Adapter
 * In-memory cache with LRU eviction strategy
 */

import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import type { CacheEntry, CacheOptions } from '../core/types';

export class MemoryCacheAdapter<T = any> extends BaseCacheAdapter<T> {
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;

  constructor(maxSize: number = 100, version: string = '1.0') {
    super('infoline_memory', maxSize, version);
  }

  /**
   * LRU eviction strategy
   */
  evict(): void {
    if (this.cache.size < this.maxSize) return;

    // Find least recently used entry
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
      console.log(`[MemoryCache] Evicted LRU entry: ${lruKey}`);
    }
  }

  /**
   * Update access order for LRU tracking
   */
  protected updateAccess(entry: CacheEntry<T>): void {
    super.updateAccess(entry);
    
    // Update access order for the key
    const keys = Array.from(this.cache.keys());
    const currentKey = keys.find(k => this.cache.get(k) === entry);
    
    if (currentKey) {
      this.accessOrder.set(currentKey, ++this.accessCounter);
    }
  }

  /**
   * Override set to track access order
   */
  set(key: string, value: T, options: CacheOptions = {}): void {
    const cacheKey = this.getCacheKey(key);
    
    // Check if we need to evict
    if (this.cache.size >= this.maxSize && !this.cache.has(cacheKey)) {
      this.evict();
    }
    
    const entry = this.createEntry(value, options);
    this.cache.set(cacheKey, entry);
    this.accessOrder.set(cacheKey, ++this.accessCounter);
    this.updateStats(false);
  }

  /**
   * Override delete to clean access order
   */
  delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.accessOrder.delete(cacheKey);
    this.updateStats(false);
  }

  /**
   * Override clear to clean access order
   */
  clear(): void {
    super.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
  }

  /**
   * Get access order for debugging
   */
  getAccessOrder(): Array<{ key: string; accessTime: number }> {
    return Array.from(this.accessOrder.entries())
      .map(([key, accessTime]) => ({
        key: key.replace(`${this.prefix}_`, ''),
        // accessTime
      }))
      .sort((a, b) => b.accessTime - a.accessTime);
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats() {
    const stats = this.getStats();
    const accessOrderSize = this.accessOrder.size;
    
    return {
      ...stats,
      accessOrderSize,
      averageAccessCount: this.accessCounter / Math.max(this.cache.size, 1),
      cacheEfficiency: stats.hitRate,
      memoryFragmentation: (this.maxSize - this.cache.size) / this.maxSize * 100
    };
  }
}

export default MemoryCacheAdapter;
