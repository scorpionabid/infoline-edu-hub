
import { useQuery, QueryKey, UseQueryOptions } from '@tanstack/react-query';

type CacheConfig = {
  expiryInMinutes?: number;
  localOnly?: boolean;
};

/**
 * LocalStorage-də obyekt saxlamaq
 */
export const setCache = <T>(key: string, data: T, config: CacheConfig = {}) => {
  try {
    const storageItem = {
      data,
      timestamp: Date.now(),
      expiryInMinutes: config.expiryInMinutes || 5
    };
    localStorage.setItem(`infoline_cache_${key}`, JSON.stringify(storageItem));
  } catch (error) {
    console.error('Keş saxlama xətası:', error);
  }
};

/**
 * LocalStorage-dən obyekt almaq
 */
export const getCache = <T>(key: string): T | undefined => {
  try {
    const item = localStorage.getItem(`infoline_cache_${key}`);
    if (!item) return undefined;

    const storageItem = JSON.parse(item);
    const now = Date.now();
    const expiryTime = storageItem.timestamp + (storageItem.expiryInMinutes * 60 * 1000);

    if (now > expiryTime) {
      localStorage.removeItem(`infoline_cache_${key}`);
      return undefined;
    }

    return storageItem.data as T;
  } catch (error) {
    console.error('Keş oxuma xətası:', error);
    return undefined;
  }
};

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
  queryOptions?: Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>;
  cacheConfig?: CacheConfig;
}) {
  // İlk olaraq client-side keşdən məlumatları almağa çalışaq
  const cacheKey = Array.isArray(queryKey) ? queryKey.join('-') : String(queryKey);
  const cachedData = getCache<TData>(cacheKey);

  // React Query istifadə edək
  const query = useQuery<TData, TError>({
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

// Keş üçün invalidasiya utiliti
export const invalidateCache = (key: string) => {
  try {
    localStorage.removeItem(`infoline_cache_${key}`);
  } catch (error) {
    console.error('Keş silmə xətası:', error);
  }
};

// Bütün keşləri silmək üçün util funksiya
export const clearAllCaches = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('infoline_cache_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Bütün keşləri silmə xətası:', error);
  }
};
