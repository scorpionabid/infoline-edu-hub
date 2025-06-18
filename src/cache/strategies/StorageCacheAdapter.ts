import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import { CacheEntry, CacheStats } from '../core/types';

export class StorageCacheAdapter<T> extends BaseCacheAdapter<T> {
  private storage: Storage;
  private keyPrefix: string;

  constructor(storage: Storage = localStorage, keyPrefix: string = 'cache:') {
    super();
    this.storage = storage;
    this.keyPrefix = keyPrefix;
  }

  protected generateKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get(key: string): Promise<CacheEntry<T> | undefined> {
    const storedValue = this.storage.getItem(this.generateKey(key));
    if (!storedValue) {
      this.missCount++;
      return undefined;
    }

    try {
      const entry = JSON.parse(storedValue) as CacheEntry<T>;
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.delete(key);
        this.missCount++;
        return undefined;
      }

      this.hitCount++;
      return entry;
    } catch (error) {
      console.error('Error parsing cache entry:', error);
      await this.delete(key);
      this.missCount++;
      return undefined;
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl : undefined;
    const entry: CacheEntry<T> = { value, expiresAt, createdAt: Date.now() };
    try {
      this.storage.setItem(this.generateKey(key), JSON.stringify(entry));
      this.size = this.calculateTotalSize(this.getAllEntries());
    } catch (error) {
      console.error('Error setting cache entry:', error);
    }
  }

  async delete(key: string): Promise<void> {
    this.storage.removeItem(this.generateKey(key));
    this.size = this.calculateTotalSize(this.getAllEntries());
  }

  async clear(): Promise<void> {
    const keys = this.getAllKeys();
    keys.forEach(key => this.storage.removeItem(key));
    this.size = 0;
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
      return storedValue ? JSON.parse(storedValue) as CacheEntry<T> : undefined;
    }).filter(Boolean) as CacheEntry<T>[];
  }

  calculateTotalSize(entries: CacheEntry<T>[]): number {
    return entries.reduce((total, entry) => {
      const entryString = JSON.stringify(entry);
      return total + new Blob([entryString]).size;
    }, 0);
  }

  getStats(): CacheStats {
    const keys = this.getAllKeys();
    const entries = keys.map(key => this.get(key.replace(this.keyPrefix, ''))).filter(Boolean) as CacheEntry<T>[];
    
    const now = Date.now();
    const expired = entries.filter(entry => entry.expiresAt && entry.expiresAt < now);
    
    return {
      totalEntries: entries.length,
      totalSize: this.calculateTotalSize(entries),
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0,
      missRate: this.missCount / (this.hitCount + this.missCount) || 0,
      expiredEntries: expired.length
    };
  }

  getSize(): number {
    return this.size;
  }
}
