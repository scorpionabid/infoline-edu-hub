
import { BaseCacheAdapter } from '../core/BaseCacheAdapter';
import { CacheOptions } from '../core/types';

export class StorageCacheAdapter<T> extends BaseCacheAdapter<T> {
  protected hitCount = 0;
  
  constructor(private storage: Storage = localStorage, private keyPrefix: string = '') {
    super(keyPrefix, 100, '1.0');
  }

  get(key: string): T | null {
    try {
      const fullKey = this.getFullKey(key);
      const item = this.storage.getItem(fullKey);
      
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      if (this.isExpired(parsed)) {
        this.delete(key);
        return null;
      }
      
      this.hitCount++;
      return parsed.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  set(key: string, value: T, options: CacheOptions = {}): void {
    try {
      const fullKey = this.getFullKey(key);
      const expiresAt = options.ttl ? Date.now() + options.ttl : undefined;
      
      const item = {
        data: value,
        expiresAt,
        createdAt: Date.now()
      };
      
      this.storage.setItem(fullKey, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  delete(key: string): void {
    try {
      const fullKey = this.getFullKey(key);
      this.storage.removeItem(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      const prefixedKeys = keys.filter(key => key.startsWith(this.keyPrefix));
      
      prefixedKeys.forEach(key => {
        this.storage.removeItem(key);
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  evict(): void {
    this.cleanupExpired();
  }

  getStats() {
    return {
      hitCount: this.hitCount,
      type: 'storage',
      size: this.cache.size,
      hitRate: this.hitCount / (this.hitCount + this.missCount || 1)
    };
  }

  private getFullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private isExpired(entry: any): boolean {
    if (!entry.expiresAt) return false;
    return Date.now() > entry.expiresAt;
  }
}
