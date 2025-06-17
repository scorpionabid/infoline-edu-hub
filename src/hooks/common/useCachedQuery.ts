/**
 * İnfoLine Cache System - Legacy useCachedQuery Hook
 * DEPRECATED: Use useCachedQuery from @/cache/hooks instead
 * Bu fayl backward compatibility üçün saxlanılır
 */

import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useCachedQuery as newUseCachedQuery } from '@/cache';
import { CACHE_TTL } from '@/cache';

// Legacy cache config interface
export interface CacheConfig {
  key: string;
  ttl: number; // saniyələrlə
  dependencies?: string[];
}

/**
 * @deprecated Use useCachedQuery from @/cache/hooks instead
 * Legacy keşlənmiş query hook
 */
export function useCachedQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, unknown, T, QueryKey>, 'queryKey' | 'queryFn'>
) {
  console.warn(`[DEPRECATED] useCachedQuery from hooks/common is deprecated. Use useCachedQuery from @/cache/hooks instead.`);
  
  // Convert legacy usage to new system
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('_') : String(queryKey);
  
  return newUseCachedQuery(cacheKey, queryFn, {
    cacheOptions: {
      storage: 'memory',
      ttl: options?.staleTime || CACHE_TTL.MEDIUM
    },
    queryOptions: options
  });
}

/**
 * @deprecated Use cacheManager.delete() and queryClient.invalidateQueries() instead
 * Legacy keşi təmizləmək üçün funksiya
 */
export function invalidateCache(queryClient: any, queryKey: QueryKey) {
  console.warn(`[DEPRECATED] invalidateCache is deprecated. Use cacheManager.delete() and queryClient.invalidateQueries() instead.`);
  
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * @deprecated Use cacheManager.clear() and queryClient.clear() instead
 * Legacy bütün keşləri təmizləmək üçün funksiya
 */
export function clearAllCaches(queryClient: any) {
  console.warn(`[DEPRECATED] clearAllCaches is deprecated. Use cacheManager.clear() and queryClient.clear() instead.`);
  
  return queryClient.clear();
}

// Migration notice
if (typeof window !== 'undefined') {
  console.warn(`
[MIGRATION NOTICE] 
/src/hooks/common/useCachedQuery.ts is deprecated.

Please migrate to the new cache hooks:
- Import: import { useCachedQuery } from '@/cache'
- Usage: useCachedQuery(key, fetcher, options)

New features available:
- Better TypeScript support
- Cross-tab synchronization
- Multiple storage strategies
- Improved performance monitoring

See /src/cache/hooks/index.ts for full API documentation.
  `);
}

export default useCachedQuery;
