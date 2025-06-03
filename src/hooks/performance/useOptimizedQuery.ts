
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { memoryCache } from '@/utils/performance/caching';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  cacheTime?: number;
  useMemoryCache?: boolean;
}

/**
 * Optimized query hook with enhanced caching
 */
export const useOptimizedQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options: OptimizedQueryOptions<T> = {}
) => {
  const { useMemoryCache = true, cacheTime = 300000, ...queryOptions } = options;
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const cacheKey = queryKey.join(':');
      
      // Check memory cache first if enabled
      if (useMemoryCache) {
        const cached = memoryCache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      
      const result = await queryFn();
      
      // Store in memory cache
      if (useMemoryCache) {
        memoryCache.set(cacheKey, result, cacheTime);
      }
      
      return result;
    },
    staleTime: cacheTime / 2, // Consider data stale after half the cache time
    gcTime: cacheTime, // Keep in cache for the full cache time
    ...queryOptions,
  });
};
