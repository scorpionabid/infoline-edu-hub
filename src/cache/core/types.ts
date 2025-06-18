
export interface CacheEntry<T> {
  data: T;
  timestamp?: number;
  ttl?: number;
  accessCount?: number;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
}

export interface CacheStats {
  size: number;
  hitRate: number;
  memoryUsage?: number;
  expiredEntries?: number;
}

export interface CacheAdapter<T> {
  get(key: string): T | null;
  set(key: string, value: T, options?: CacheOptions): void;
  delete(key: string): void;
  clear(): void;
  evict(): void;
  getStats(): CacheStats;
}
