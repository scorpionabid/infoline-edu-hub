
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
  try {
    return cacheManager.get<EnhancedRegion[]>(CACHE_KEYS.REGIONS);
  } catch (error) {
    console.warn('Error getting regions cache:', error);
    return null;
  }
};

/**
 * @deprecated Use cacheManager.set(CACHE_KEYS.REGIONS, regions) instead
 */
export const setRegionsCache = (regions: EnhancedRegion[] | null): void => {
  try {
    if (regions === null) {
      cacheManager.delete(CACHE_KEYS.REGIONS);
    } else {
      cacheManager.set(CACHE_KEYS.REGIONS, regions, {
        storage: 'memory',
        priority: true,
        ttl: CACHE_TTL.MEDIUM
      });
    }
  } catch (error) {
    console.warn('Error setting regions cache:', error);
  }
};

/**
 * @deprecated This global state management approach is deprecated
 * Use React Query loading states instead
 */
export const isFetchInProgress = (): boolean => {
  try {
    // Check if regions data exists in cache
    return cacheManager.has(CACHE_KEYS.REGIONS);
  } catch (error) {
    console.warn('Error checking fetch progress:', error);
    return false;
  }
};

/**
 * @deprecated This global state management approach is deprecated
 * Use React Query loading states instead
 */
export const setFetchInProgress = (isLoading: boolean): void => {
  try {
    // This was a global state management approach which we don't recommend anymore
    // The new cache system doesn't need this pattern
    if (isLoading) {
      // Set a temporary loading flag in session storage
      cacheManager.sessionStorage().set('regions_loading', true, { ttl: CACHE_TTL.SHORT });
    } else {
      cacheManager.sessionStorage().delete('regions_loading');
    }
  } catch (error) {
    console.warn('Error setting fetch progress:', error);
  }
};

/**
 * @deprecated Use cacheManager.delete(CACHE_KEYS.REGIONS) instead
 */
export const clearCache = (): void => {
  try {
    cacheManager.delete(CACHE_KEYS.REGIONS);
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};

export default {
  getRegionsCache,
  setRegionsCache,
  isFetchInProgress,
  setFetchInProgress,
  clearCache
};
