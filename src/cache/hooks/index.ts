
/**
 * İnfoLine Unified Cache System - React Hooks
 * React Query və cache manager-in inteqrasiyası
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { cacheManager } from '../CacheManager';
import type { CacheOptions } from '../core/types';

/**
 * Universal cache hook for any data type
 */
export function useCache<T>(
  key: string,
  options?: {
    fallback?: T;
    enableRealTime?: boolean;
  }
) {
  const { fallback, enableRealTime = false } = options || {};

  const get = useCallback((): T | null => {
    return cacheManager.get<T>(key);
  }, [key]);

  const set = useCallback((value: T, cacheOptions?: CacheOptions) => {
    cacheManager.set(key, value, cacheOptions);
  }, [key]);

  const remove = useCallback(() => {
    cacheManager.delete(key);
  }, [key]);

  // Real-time updates (optional)
  useEffect(() => {
    if (!enableRealTime) return;

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes(key)) {
        window.dispatchEvent(new CustomEvent(`cache_update_${key}`));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, enableRealTime]);

  return {
    get,
    set,
    remove,
    value: get() || fallback
  };
}

/**
 * Cached query hook - integrates React Query with cache manager
 */
export function useCachedQuery<T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options?: {
    cacheOptions?: CacheOptions;
    queryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>;
    enableOfflineFirst?: boolean;
  }
) {
  const { cacheOptions, queryOptions, enableOfflineFirst = true } = options || {};
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('_') : queryKey;

  const cachedQueryFn = useCallback(async (): Promise<T> => {
    // Try cache first if offline-first is enabled
    if (enableOfflineFirst) {
      const cached = cacheManager.get<T>(cacheKey);
      if (cached !== null) {
        console.log(`[useCachedQuery] Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    // Fetch fresh data
    console.log(`[useCachedQuery] Fetching fresh data for ${cacheKey}`);
    const data = await queryFn();
    
    // Cache the result
    cacheManager.set(cacheKey, data, cacheOptions);
    
    return data;
  }, [cacheKey, queryFn, cacheOptions, enableOfflineFirst]);

  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: cachedQueryFn,
    staleTime: cacheOptions?.ttl || 5 * 60 * 1000, // Default 5 minutes
    ...queryOptions
  });
}

/**
 * Cache mutation hook - invalidates cache on mutations
 */
export function useCacheMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    invalidateKeys?: string[];
    updateCache?: (data: TData, variables: TVariables) => void;
    onSuccess?: (data: TData, variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();
  const { invalidateKeys = [], updateCache, onSuccess } = options || {};

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate specified cache keys
      invalidateKeys.forEach(key => {
        cacheManager.delete(key);
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      // Update cache directly if provided
      if (updateCache) {
        updateCache(data, variables);
      }

      // Call user-provided onSuccess
      if (onSuccess) {
        onSuccess(data, variables);
      }
    }
  });
}

/**
 * Preload hook - preloads data in background
 */
export function usePreload() {
  const preload = useCallback(async (
    key: string,
    fetcher: () => Promise<any>,
    options?: CacheOptions
  ) => {
    try {
      const data = await fetcher();
      cacheManager.set(key, data, { priority: 'high', ...options });
      console.log(`[usePreload] Preloaded ${key}`);
    } catch (error) {
      console.warn(`[usePreload] Failed to preload ${key}:`, error);
    }
  }, []);

  return { preload };
}

/**
 * Cache stats hook for monitoring
 */
export function useCacheStats() {
  const getStats = useCallback(() => {
    return cacheManager.getStats();
  }, []);

  const cleanup = useCallback(() => {
    cacheManager.evict();
  }, []);

  const clear = useCallback(() => {
    cacheManager.clear();
  }, []);

  return {
    getStats,
    cleanup,
    // clear
  };
}

/**
 * Translation cache hook
 */
export function useTranslationCache() {
  const setTranslations = useCallback((language: string, translations: any) => {
    const key = `translations_${language}`;
    cacheManager.set(key, translations, {
      priority: language === 'az' ? 'high' : 'normal',
      ttl: language === 'az' ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000
    });
  }, []);

  const getTranslations = useCallback((language: string) => {
    const key = `translations_${language}`;
    return cacheManager.get(key);
  }, []);

  const clearTranslations = useCallback((language?: string) => {
    if (language) {
      cacheManager.delete(`translations_${language}`);
    } else {
      ['az', 'en', 'ru', 'tr'].forEach(lang => {
        cacheManager.delete(`translations_${lang}`);
      });
    }
  }, []);

  return {
    setTranslations,
    getTranslations,
    // clearTranslations
  };
}

/**
 * User session cache hook
 */
export function useSessionCache() {
  const setUserSession = useCallback((userId: string, sessionData: any) => {
    cacheManager.set(`user_session_${userId}`, sessionData, {
      priority: 'high'
    });
  }, []);

  const getUserSession = useCallback((userId: string) => {
    return cacheManager.get(`user_session_${userId}`);
  }, []);

  const clearUserSession = useCallback((userId?: string) => {
    if (userId) {
      cacheManager.delete(`user_session_${userId}`);
    } else {
      cacheManager.clear();
    }
  }, []);

  return {
    setUserSession,
    getUserSession,
    // clearUserSession
  };
}

export default {
  useCache,
  useCachedQuery,
  useCacheMutation,
  usePreload,
  useCacheStats,
  useTranslationCache,
  // useSessionCache
};
