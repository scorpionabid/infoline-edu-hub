
import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { getCache, setCache, CacheConfig } from '@/utils/cacheUtils';

/**
 * LocalStorage keşləmə ilə React Query hook-u
 * @description Həm React Query, həm də localStorage ilə keşləmə təmin edir
 */
export function useCachedQuery<TData = unknown, TError = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseQueryOptions<TData, TError>,
  cacheConfig?: CacheConfig
) {
  // Keş açarını yaradaq
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('_') : String(queryKey);
  
  // Custom queryFn yaradaq ki, əvvəlcə localStorage yoxlasın
  const cachedQueryFn = async () => {
    // LocalStorage-dan yoxla
    const cachedData = getCache<TData>(cacheKey);
    
    if (cachedData) {
      console.log(`Keşdən məlumat istifadə olunur: ${cacheKey}`);
      return cachedData;
    }
    
    // Keşdə tapılmadısa, sorğu göndər
    console.log(`Sorğu göndərilir: ${cacheKey}`);
    const data = await queryFn();
    
    // Nəticəni keşdə saxla
    setCache(cacheKey, data, cacheConfig);
    
    return data;
  };
  
  // React Query hook-unu istifadə edək
  return useQuery<TData, TError>({
    queryKey,
    queryFn: cachedQueryFn,
    ...options
  });
}

/**
 * Bütün keşlənmiş sorğular üçün React Query invalidasiya funksiyası hazırlayan utilit
 * @param queryClient - React Query client-i
 */
export function createCacheInvalidator(queryClient: any) {
  return {
    /**
     * Xüsusi bir sorğunu invalidasiya edir
     */
    invalidateQuery: (queryKey: QueryKey) => {
      const cacheKey = Array.isArray(queryKey) ? queryKey.join('_') : String(queryKey);
      clearCache(cacheKey);
      queryClient.invalidateQueries({ queryKey });
    },
    
    /**
     * Bütün sorğuları invalidasiya edir
     */
    invalidateAll: () => {
      clearAllCache();
      queryClient.invalidateQueries();
    }
  };
}

// LocalStorage funksiyalarını yenidən ixrac edirik
import { clearCache, clearAllCache } from '@/utils/cacheUtils';
export { clearCache, clearAllCache };
