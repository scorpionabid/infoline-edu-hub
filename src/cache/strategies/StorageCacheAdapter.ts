
import { BaseCacheAdapter } from '../core/BaseCacheAdapter';

export class StorageCacheAdapter<T> extends BaseCacheAdapter<T> {
  protected hitCount = 0; // Make it protected instead of private
  
  constructor(private storage: Storage, private keyPrefix: string = '') {
    super();
  }

  async get(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const item = this.storage.getItem(fullKey);
      
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      
      if (this.isExpired(parsed.expiresAt)) {
        await this.delete(key);
        return null;
      }
      
      this.hitCount++;
      return parsed.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const expiresAt = ttl ? Date.now() + ttl : undefined;
      
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

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      this.storage.removeItem(fullKey);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async clear(): Promise<void> {
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

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  getStats() {
    return {
      hitCount: this.hitCount,
      type: 'storage'
    };
  }

  private getFullKey(key: string): string {
    return this.keyPrefix ? `${this.keyPrefix}:${key}` : key;
  }

  private isExpired(expiresAt?: number): boolean {
    if (!expiresAt) return false;
    return Date.now() > expiresAt;
  }
}
