
import { CacheAdapter, CacheEntry, CacheOptions, CacheStats } from './types';

export abstract class BaseCacheAdapter<T> implements CacheAdapter<T> {
  protected cache = new Map<string, CacheEntry<T>>();
  protected stats: CacheStats = {
    size: 0,
    hitRate: 0,
    memoryUsage: 0,
    expiredEntries: 0
  };
  protected hitCount = 0;
  protected missCount = 0;
  protected prefix: string;
  protected maxSize: number;
  protected version: string;

  constructor(prefix: string = 'infoline_cache', maxSize: number = 100, version: string = '1.0') {
    this.prefix = prefix;
    this.maxSize = maxSize;
    this.version = version;
  }

  abstract evict(): void;

  get(key: string): T | null {
    const cacheKey = this.getCacheKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      this.missCount++;
      this.updateStats(true);
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(cacheKey);
      this.missCount++;
      this.updateStats(true);
      return null;
    }

    this.hitCount++;
    this.updateAccess(entry);
    this.updateStats(false);
    return entry.data;
  }

  set(key: string, value: T, options: CacheOptions = {}): void {
    const cacheKey = this.getCacheKey(key);
    const entry = this.createEntry(value, options);
    this.cache.set(cacheKey, entry);
    this.updateStats(false);
  }

  delete(key: string): void {
    const cacheKey = this.getCacheKey(key);
    this.cache.delete(cacheKey);
    this.updateStats(false);
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    this.updateStats(false);
  }

  getStats(): CacheStats {
    this.updateStats(false);
    return { ...this.stats };
  }

  protected getCacheKey(key: string): string {
    return `${this.prefix}_${key}`;
  }

  protected createEntry(value: T, options: CacheOptions): CacheEntry<T> {
    return {
      data: value,
      timestamp: Date.now(),
      ttl: options.ttl,
      accessCount: 0,
      priority: options.priority || false,
      tags: options.tags || []
    };
  }

  protected isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.timestamp || !entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  protected updateAccess(entry: CacheEntry<T>): void {
    entry.accessCount = (entry.accessCount || 0) + 1;
  }

  protected updateStats(isMiss: boolean): void {
    this.stats.size = this.cache.size;
    const total = this.hitCount + this.missCount;
    this.stats.hitRate = total > 0 ? this.hitCount / total : 0;
    
    // Calculate memory usage estimate
    let memoryUsage = 0;
    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry).length * 2; // rough estimate
    }
    this.stats.memoryUsage = memoryUsage;

    // Count expired entries
    const now = Date.now();
    let expiredEntries = 0;
    for (const entry of this.cache.values()) {
      if (this.isExpired(entry)) {
        expiredEntries++;
      }
    }
    this.stats.expiredEntries = expiredEntries;
  }

  protected cleanupExpired(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }
}
