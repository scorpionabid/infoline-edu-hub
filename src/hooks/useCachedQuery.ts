
import { useQuery, QueryKey, UseQueryOptions } from '@tanstack/react-query';
import { getCache, setCache, CacheConfig } from '@/utils/cacheUtils';

/**
 * Həm client-side, həm də server-side keşləməni birləşdirən hook
 */
export function useCachedQuery<TData = unknown, TError = unknown>({
  queryKey,
  queryFn,
  queryOptions,
  cacheConfig
}: {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  queryOptions?: UseQueryOptions<TData, TError, TData, QueryKey>;
  cacheConfig?: CacheConfig;
}) {
  // İlk olaraq client-side keşdən məlumatları almağa çalışaq
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
  const cachedData = getCache<TData>(cacheKey);

  // React Query istifadə edək
  const query = useQuery<TData, TError, TData, QueryKey>({
    queryKey,
    queryFn: async () => {
      try {
        const data = await queryFn();
        
        // LocalStorage-də saxlayaq (əgər konfiqurasiya verilibsə)
        if (cacheConfig?.expiryInMinutes) {
          setCache(cacheKey, data, cacheConfig);
        }
        
        return data;
      } catch (error) {
        console.error(`Keşlənmiş sorğu zamanı xəta (${cacheKey}):`, error);
        throw error;
      }
    },
    initialData: cachedData,
    ...queryOptions,
  });
  
  return query;
}

/**
 * Keş üçün invalidasiya utiliti yaradır
 */
export function createCacheInvalidator(queryClient: QueryClient) {
  return {
    // Xüsusi bir sorğunu yeniləmək
    invalidateQuery: (queryKey: QueryKey) => {
      const cacheKey = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
      // LocalStorage keşini silin
      try {
        localStorage.removeItem(`infoline_cache_${cacheKey}`);
      } catch (error) {
        console.error('LocalStorage keşini silmə xətası:', error);
      }
      
      // React Query keşini yeniləyin
      return queryClient.invalidateQueries({queryKey});
    },
    
    // Bütün keşləri yeniləmək
    invalidateAll: () => {
      // Bütün LocalStorage keşlərini silin
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('infoline_cache_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('Bütün lokalStorage keşlərini silmə xətası:', error);
      }
      
      // Bütün React Query keşlərini yeniləyin
      return queryClient.invalidateQueries();
    }
  };
}
