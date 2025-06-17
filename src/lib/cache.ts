/**
 * İnfoLine Cache System - Legacy Compatibility Layer
 * DEPRECATED: Use /src/cache/index.ts for new implementations
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { cacheManager, CACHE_TTL } from '@/cache';

// Legacy cache keys - yeni sistem istifadə edir
export const CACHE_KEYS = {
  USER_PROFILE: 'info_line_user_profile',
  USER_SESSION: 'info_line_user_session', 
  REGIONS: 'info_line_regions',
  SECTORS: 'info_line_sectors',
  SCHOOLS: 'info_line_schools',
};

// Legacy cache expiry - yeni sistem TTL istifadə edir
export const CACHE_EXPIRY = {
  SHORT: CACHE_TTL.SHORT, // 5 dəqiqə
  MEDIUM: CACHE_TTL.MEDIUM, // 10 dəqiqə  
  LONG: CACHE_TTL.LONG, // 1 saat
};

// Legacy cache storage type
export type CacheStorage = 'local' | 'session';

interface CacheItem<T> {
  data: T;
  expiry: number;
}

/**
 * @deprecated Use cacheManager.get() instead
 * Keşdən məlumat əldə etmək
 */
export function getCache<T>(key: string, storage: CacheStorage = 'local'): T | null {
  console.warn(`[DEPRECATED] getCache() is deprecated. Use cacheManager.get() instead.`);
  
  // Convert legacy storage type to new system
  const storageType = storage === 'local' ? 'localStorage' : 'sessionStorage';
  return cacheManager.get<T>(key, storageType);
}

/**
 * @deprecated Use cacheManager.set() instead
 * Məlumatı keşdə saxlamaq
 */
export function setCache<T>(
  key: string, 
  data: T | null, 
  expiryMs: number = CACHE_EXPIRY.MEDIUM,
  storage: CacheStorage = 'local'
): void {
  console.warn(`[DEPRECATED] setCache() is deprecated. Use cacheManager.set() instead.`);
  
  if (data === null) {
    cacheManager.delete(key);
    return;
  }
  
  // Convert legacy storage type to new system
  const storageType = storage === 'local' ? 'localStorage' : 'sessionStorage';
  
  cacheManager.set(key, data, {
    storage: storageType,
    ttl: expiryMs
  });
}

/**
 * @deprecated Use cacheManager.delete() or cacheManager.clear() instead
 * Keşi təmizləmək
 */
export function clearCache(key?: string, storage: CacheStorage = 'local'): void {
  console.warn(`[DEPRECATED] clearCache() is deprecated. Use cacheManager.delete() or cacheManager.clear() instead.`);
  
  if (key) {
    cacheManager.delete(key);
  } else {
    // Convert legacy storage type to new system
    const storageType = storage === 'local' ? 'localStorage' : 'sessionStorage';
    cacheManager.clearStorage(storageType);
  }
}

// Migration notice
console.warn(`
[MIGRATION NOTICE] 
/src/lib/cache.ts is deprecated and will be removed in future versions.

Please migrate to the new unified cache system:
- Import: import { cacheManager } from '@/cache'
- Get: cacheManager.get(key)
- Set: cacheManager.set(key, value, options)
- Delete: cacheManager.delete(key)

See /src/cache/index.ts for full API documentation.
`);

export default {
  getCache,
  setCache,
  clearCache,
  CACHE_KEYS,
  CACHE_EXPIRY
};
