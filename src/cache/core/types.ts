
export interface CacheEntry<T> {
  data: T;
  timestamp?: number;
  ttl?: number;
  accessCount?: number;
  priority?: boolean | 'low' | 'normal' | 'high';
  tags?: string[];
}

export interface CacheOptions {
  ttl?: number;
  priority?: boolean | 'low' | 'normal' | 'high';
  tags?: string[];
  storage?: CacheStorageType;
  crossTab?: boolean;
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

// Storage type
export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage' | 'storage';

// Strategy type  
export type CacheStrategy = 'memory-first' | 'storage-first' | 'hybrid';

// Manager config
export interface CacheManagerConfig {
  defaultStrategy?: CacheStrategy;
  maxMemorySize?: number;
  maxStorageSize?: number;
  enableCrossTab?: boolean;
}

// Cross-tab message
export interface CrossTabMessage {
  type: 'cache_update' | 'cache_delete' | 'cache_clear' | 'cache_sync';
  key?: string;  
  value?: any;
  timestamp: number;
  source?: string;
}

// Cache key type
export type CacheKey = string;

// Cache keys constants
export const CACHE_KEYS = {
  REGIONS: 'regions',
  SECTORS: 'sectors', 
  SCHOOLS: 'schools',
  CATEGORIES: 'categories',
  COLUMNS: 'columns',
  USER_PROFILE: 'user_profile',
  TRANSLATIONS: 'translations',
  DASHBOARD_STATS: 'dashboard_stats'
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 15 * 60 * 1000,    // 15 minutes
  LONG: 60 * 60 * 1000,      // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000  // 24 hours
} as const;

// Cache size limits
export const CACHE_LIMITS = {
  MAX_MEMORY_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_STORAGE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_ENTRIES: 1000
} as const;
