/**
 * İnfoLine Unified Cache System - Core Types
 * Bütün cache strategiyaları üçün ümumi interface və tiplər
 */

export type CacheStorageType = 'memory' | 'localStorage' | 'sessionStorage';
export type CacheStrategy = 'LRU' | 'TTL' | 'FIFO' | 'LFU';

export interface CacheOptions {
  /** Time to live in milliseconds */
  ttl?: number;
  /** Maximum number of entries */
  maxSize?: number;
  /** Priority flag for important data */
  priority?: boolean;
  /** Storage type preference */
  storage?: CacheStorageType;
  /** Strategy for eviction */
  strategy?: CacheStrategy;
  /** Enable cross-tab synchronization */
  crossTab?: boolean;
  /** Enable compression for large data */
  compress?: boolean;
}

export interface CacheEntry<T = any> {
  /** Cached data */
  data: T;
  /** Creation timestamp */
  timestamp: number;
  /** Time to live in milliseconds */
  ttl: number;
  /** Access count for LFU strategy */
  accessCount: number;
  /** Last access time for LRU strategy */
  lastAccess: number;
  /** Priority flag */
  priority: boolean;
  /** Data checksum for integrity */
  checksum?: string;
  /** Version for cache invalidation */
  version: string;
}

export interface CacheStats {
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Current cache size */
  size: number;
  /** Maximum cache size */
  maxSize: number;
  /** Hit rate percentage */
  hitRate: number;
  /** Memory usage in bytes (approximate) */
  memoryUsage: number;
  /** Last cleanup timestamp */
  lastCleanup: number;
}

export interface CacheAdapter<T = any> {
  /** Get value from cache */
  get(key: string): T | null;
  
  /** Set value in cache */
  set(key: string, value: T, options?: CacheOptions): void;
  
  /** Delete specific key */
  delete(key: string): void;
  
  /** Check if key exists */
  has(key: string): boolean;
  
  /** Clear all cache entries */
  clear(): void;
  
  /** Get cache statistics */
  getStats(): CacheStats;
  
  /** Cleanup expired entries */
  cleanup(): void;
  
  /** Get all keys (for debugging) */
  keys(): string[];
}

export interface CrossTabMessage {
  type: 'cache_update' | 'cache_delete' | 'cache_clear' | 'cache_sync';
  key?: string;
  value?: any;
  timestamp: number;
  source: string;
}

export interface CacheManagerConfig {
  /** Default TTL in milliseconds */
  defaultTTL: number;
  /** Default max size for memory cache */
  defaultMaxSize: number;
  /** Cache version for invalidation */
  version: string;
  /** Key prefix for localStorage */
  storagePrefix: string;
  /** Enable performance monitoring */
  enableMonitoring: boolean;
  /** Cleanup interval in milliseconds */
  cleanupInterval: number;
}

// Cache key patterns for different data types
export const CACHE_KEYS = {
  // User related
  USER_PROFILE: 'user_profile',
  USER_SESSION: 'user_session',
  USER_PERMISSIONS: 'user_permissions',
  
  // Organization data
  REGIONS: 'regions',
  SECTORS: 'sectors', 
  SCHOOLS: 'schools',
  
  // Categories and forms
  CATEGORIES: 'categories',
  COLUMNS: 'columns',
  DATA_ENTRIES: 'data_entries',
  
  // Reports
  SCHOOL_PERFORMANCE: 'school_performance',
  REGIONAL_COMPARISON: 'regional_comparison',
  CATEGORY_COMPLETION: 'category_completion',
  
  // Translations
  TRANSLATIONS: 'translations',
  
  // Dashboard data
  DASHBOARD_STATS: 'dashboard_stats',
  PENDING_APPROVALS: 'pending_approvals',
  
  // Settings
  APP_SETTINGS: 'app_settings',
  NOTIFICATION_SETTINGS: 'notification_settings'
} as const;

export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];

// TTL presets for different data types
export const CACHE_TTL = {
  /** 30 seconds - real-time data */
  REAL_TIME: 30 * 1000,
  /** 2 minutes - frequently changing data */
  SHORT: 2 * 60 * 1000,
  /** 10 minutes - moderate changing data */
  MEDIUM: 10 * 60 * 1000,
  /** 1 hour - stable data */
  LONG: 60 * 60 * 1000,
  /** 24 hours - rarely changing data */
  VERY_LONG: 24 * 60 * 60 * 1000,
  /** 7 days - static data */
  PERMANENT: 7 * 24 * 60 * 60 * 1000
} as const;

// Size limits for different cache types
export const CACHE_LIMITS = {
  /** Memory cache for frequently accessed data */
  MEMORY: 100,
  /** Reports cache with LRU eviction */
  REPORTS: 50,
  /** Translation cache */
  TRANSLATIONS: 10,
  /** User session cache */
  SESSION: 20,
  /** Large data sets cache */
  BULK_DATA: 25
} as const;

// Export all types and interfaces
type CacheTypes = {
  CACHE_KEYS: typeof CACHE_KEYS;
  CACHE_TTL: typeof CACHE_TTL;
  CACHE_LIMITS: typeof CACHE_LIMITS;
  CacheOptions: CacheOptions;
  CacheEntry: CacheEntry;
  CacheStats: CacheStats;
  CacheAdapter: CacheAdapter<any>;
  CrossTabMessage: CrossTabMessage;
  CacheManagerConfig: CacheManagerConfig;
  CacheStorageType: CacheStorageType;
  CacheStrategy: CacheStrategy;
  CacheKey: CacheKey;
};

// Default export for backward compatibility
const cacheTypes: CacheTypes = {
  CACHE_KEYS,
  CACHE_TTL,
  CACHE_LIMITS,
  
  // Type placeholders for backward compatibility
  get CacheOptions(): CacheOptions { return {} as CacheOptions; },
  get CacheEntry(): CacheEntry { return {} as CacheEntry; },
  get CacheStats(): CacheStats { return {} as CacheStats; },
  get CacheAdapter(): CacheAdapter<any> { return {} as CacheAdapter<any>; },
  get CrossTabMessage(): CrossTabMessage { return {} as CrossTabMessage; },
  get CacheManagerConfig(): CacheManagerConfig { return {} as CacheManagerConfig; },
  
  // Add missing type properties
  get CacheStorageType(): CacheStorageType { return 'memory'; },
  get CacheStrategy(): CacheStrategy { return 'LRU'; },
  get CacheKey(): CacheKey { return CACHE_KEYS.USER_PROFILE; }
} as const;

export default cacheTypes;
