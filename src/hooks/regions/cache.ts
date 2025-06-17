/**
 * İnfoLine Cache System - Legacy Regions Cache
 * DEPRECATED: Use cacheManager from @/cache instead
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { cacheManager, CACHE_KEYS, CACHE_TTL } from '@/cache';
import { EnhancedRegion } from '@/types/region';

/**
 * @deprecated Use cacheManager.get(CACHE_KEYS.REGIONS) instead
 */
export const getRegionsCache = (): EnhancedRegion[] | null => {
  console.warn(`[DEPRECATED] getRegionsCache is deprecated. Use cacheManager.get(CACHE_KEYS.REGIONS) instead.`);
  
  return cacheManager.get<EnhancedRegion[]>(CACHE_KEYS.REGIONS);
};

/**
 * @deprecated Use cacheManager.set(CACHE_KEYS.REGIONS, regions) instead
 */
export const setRegionsCache = (regions: EnhancedRegion[] | null): void => {
  console.warn(`[DEPRECATED] setRegionsCache is deprecated. Use cacheManager.set(CACHE_KEYS.REGIONS, regions) instead.`);
  
  if (regions === null) {
    cacheManager.delete(CACHE_KEYS.REGIONS);
  } else {
    cacheManager.set(CACHE_KEYS.REGIONS, regions, {
      storage: 'memory',
      priority: true,
      ttl: CACHE_TTL.MEDIUM
    });
  }
};

/**
 * @deprecated This global state management approach is deprecated
 * Use React Query or other state management instead
 */
export const isFetchInProgress = (): boolean => {
  console.warn(`[DEPRECATED] isFetchInProgress is deprecated. Use React Query loading states instead.`);
  
  // Check if regions data exists in cache
  return cacheManager.has(CACHE_KEYS.REGIONS);
};

/**
 * @deprecated This global state management approach is deprecated
 * Use React Query or other state management instead
 */
export const setFetchInProgress = (isLoading: boolean): void => {
  console.warn(`[DEPRECATED] setFetchInProgress is deprecated. Use React Query loading states instead.`);
  
  // This was a global state management approach which we don't recommend anymore
  // The new cache system doesn't need this pattern
  if (isLoading) {
    // Set a temporary loading flag in session storage
    cacheManager.sessionStorage().set('regions_loading', true, { ttl: CACHE_TTL.SHORT });
  } else {
    cacheManager.sessionStorage().delete('regions_loading');
  }
};

/**
 * @deprecated Use cacheManager.delete(CACHE_KEYS.REGIONS) instead
 */
export const clearCache = (): void => {
  console.warn(`[DEPRECATED] clearCache is deprecated. Use cacheManager.delete(CACHE_KEYS.REGIONS) instead.`);
  
  cacheManager.delete(CACHE_KEYS.REGIONS);
};

// Migration notice
if (typeof window !== 'undefined') {
  console.warn(`
[MIGRATION NOTICE] 
/src/hooks/regions/cache.ts is deprecated.

Please migrate to the new cache system:
- Import: import { cacheManager, CACHE_KEYS } from '@/cache'
- Get: cacheManager.get(CACHE_KEYS.REGIONS)
- Set: cacheManager.set(CACHE_KEYS.REGIONS, regions)
- Delete: cacheManager.delete(CACHE_KEYS.REGIONS)

For loading states, use React Query's built-in loading management instead of global state.

See /src/cache/index.ts for full API documentation.
  `);
}

export default {
  getRegionsCache,
  setRegionsCache,
  isFetchInProgress,
  setFetchInProgress,
  clearCache
};
