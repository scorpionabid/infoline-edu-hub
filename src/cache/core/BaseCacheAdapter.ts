
import { CacheAdapter, CacheEntry, CacheOptions, CacheStats } from './types';

export abstract class BaseCacheAdapter<T> implements CacheAdapter<T> {
  protected stats: CacheStats = {
    size: 0,
    hitRate: 0,
    memoryUsage: 0,
    expiredEntries: 0
  };

  abstract get(key: string): T | null;
  abstract set(key: string, value: T, options?: CacheOptions): void;
  abstract delete(key: string): void;
  abstract clear(): void;

  evict(): void {
    // Default implementation - can be overridden
    this.clear();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  protected isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.timestamp || !entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  protected updateStats(): void {
    // Base implementation - can be overridden by subclasses
  }

  protected cleanupExpired(): void {
    // Base implementation - can be overridden by subclasses
  }
}
