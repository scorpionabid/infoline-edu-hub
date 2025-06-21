
import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import { CacheEntry, CacheOptions, CacheStats } from '../core/types';

export class StorageCacheAdapter<T> extends BaseCacheAdapter<T> {
  protected hitCount = 0;
  protected missCount = 0;
  protected storage: Storage;
  private keyPrefix: string;

  constructor(storage: Storage = localStorage, keyPrefix: string = 'cache_') {
    super();
    this.storage = storage;
    this.keyPrefix = keyPrefix;
  }

  get(key: string): T | null {
    try {
      const fullKey = this.keyPrefix + key;
      const item = this.storage.getItem(fullKey);
      
      if (!item) {
        this.missCount++;
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check TTL
      if (entry.ttl && entry.timestamp) {
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
          this.storage.removeItem(fullKey);
          this.missCount++;
          return null;
        }
      }

      this.hitCount++;
      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      this.missCount++;
      return null;
    }
  }

  set(key: string, value: T, options?: CacheOptions): void {
    try {
      const fullKey = this.keyPrefix + key;
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: options?.ttl,
        priority: options?.priority,
        tags: options?.tags
      };

      this.storage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  delete(key: string): void {
    const fullKey = this.keyPrefix + key;
    this.storage.removeItem(fullKey);
  }

  clear(): void {
    // Clear only items with our prefix
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keys.push(key);
      }
    }
    keys.forEach(key => this.storage.removeItem(key));
  }

  evict(): void {
    // Simple LRU eviction - remove oldest items
    const items = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        try {
          const item = this.storage.getItem(key);
          if (item) {
            const entry = JSON.parse(item);
            items.push({ key, timestamp: entry.timestamp || 0 });
          }
        } catch (e) {
          // Remove invalid entries
          this.storage.removeItem(key);
        }
      }
    }

    // Sort by timestamp and remove oldest 25%
    items.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.floor(items.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.storage.removeItem(items[i].key);
    }
  }

  getStats(): CacheStats {
    let size = 0;
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        size++;
      }
    }

    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? this.hitCount / total : 0;

    return {
      size,
      hitRate,
      expiredEntries: 0
    };
  }
}
