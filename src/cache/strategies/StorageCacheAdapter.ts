
import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import { CacheEntry, CacheStats, CacheOptions } from '../core/types';

export class StorageCacheAdapter<T> extends BaseCacheAdapter<T> {
  private storage: Storage;
  private keyPrefix: string;
  private hitCount = 0;
  private missCount = 0;
  private size = 0;

  constructor(storage: Storage = localStorage, keyPrefix: string = 'cache:') {
    super();
    this.storage = storage;
    this.keyPrefix = keyPrefix;
  }

  protected generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  get(key: string): T | null {
    const storedValue = this.storage.getItem(this.generateKey(key));
    if (!storedValue) {
      this.missCount++;
      return null;
    }

    try {
      const entry = JSON.parse(storedValue) as CacheEntry<T>;
      if (entry.timestamp && entry.ttl && (Date.now() - entry.timestamp > entry.ttl)) {
        this.delete(key);
        this.missCount++;
        return null;
      }

      this.hitCount++;
      return entry.data;
    } catch (error) {
      console.error('Error parsing cache entry:', error);
      this.delete(key);
      this.missCount++;
      return null;
    }
  }

  set(key: string, value: T, options?: CacheOptions): void {
    const ttl = options?.ttl || 300000; // 5 minutes default
    const entry: CacheEntry<T> = { 
      data: value, 
      timestamp: Date.now(), 
      ttl,
      accessCount: 0,
      priority: options?.priority || 'normal',
      tags: options?.tags || []
    };
    
    try {
      this.storage.setItem(this.generateKey(key), JSON.stringify(entry));
      this.size = this.calculateTotalSize();
    } catch (error) {
      console.error('Error setting cache entry:', error);
    }
  }

  delete(key: string): void {
    this.storage.removeItem(this.generateKey(key));
    this.size = this.calculateTotalSize();
  }

  clear(): void {
    const keys = this.getAllKeys();
    keys.forEach(key => this.storage.removeItem(key));
    this.size = 0;
  }

  evict(): void {
    // Simple LRU eviction - remove expired entries
    const keys = this.getAllKeys();
    const now = Date.now();
    
    keys.forEach(key => {
      const storedValue = this.storage.getItem(key);
      if (storedValue) {
        try {
          const entry = JSON.parse(storedValue) as CacheEntry<T>;
          if (entry.timestamp && entry.ttl && (now - entry.timestamp > entry.ttl)) {
            this.storage.removeItem(key);
          }
        } catch {
          this.storage.removeItem(key);
        }
      }
    });
    
    this.size = this.calculateTotalSize();
  }

  getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keys.push(key);
      }
    }
    return keys;
  }

  getAllEntries(): CacheEntry<T>[] {
    const keys = this.getAllKeys();
    return keys.map(key => {
      const storedValue = this.storage.getItem(key);
      return storedValue ? JSON.parse(storedValue) as CacheEntry<T> : null;
    }).filter(Boolean) as CacheEntry<T>[];
  }

  calculateTotalSize(): number {
    const entries = this.getAllEntries();
    return entries.reduce((total, entry) => {
      const entryString = JSON.stringify(entry);
      return total + new Blob([entryString]).size;
    }, 0);
  }

  getStats(): CacheStats {
    const entries = this.getAllEntries();
    const now = Date.now();
    const expired = entries.filter(entry => 
      entry.timestamp && entry.ttl && (now - entry.timestamp > entry.ttl)
    );
    
    return {
      size: entries.length,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      missRate: this.missCount / (this.hitCount + this.missCount) || 0,
      memoryUsage: this.calculateTotalSize(),
      expiredEntries: expired.length
    };
  }

  getSize(): number {
    return this.size;
  }
}
