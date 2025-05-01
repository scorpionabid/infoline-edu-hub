
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CacheConfig {
  key: string;
  ttl: number; // saniyələrlə
  dependencies?: string[];
}

export interface CachedQueryOptions<T> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<T>;
  queryOptions?: Omit<UseQueryOptions<T, unknown, T, readonly unknown[]>, 'queryFn' | 'queryKey'>;
  cacheConfig?: CacheConfig;
}

export function useCachedQuery<T>({
  queryKey,
  queryFn,
  queryOptions,
  cacheConfig
}: CachedQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        // Normal sorğu funksiyasını çağırırıq
        const result = await queryFn();
        
        // Keşləmə konfiqurasiyası varsa və serverə keşləmə sorğusu göndərə bilirik
        if (cacheConfig) {
          try {
            // Supabase funksiyasını çağıraraq nəticəni keşləyirik
            await supabase.functions.invoke('cached-query', {
              body: {
                key: cacheConfig.key,
                data: result,
                ttl: cacheConfig.ttl,
                dependencies: cacheConfig.dependencies
              }
            });
          } catch (cacheError) {
            // Keşləmə xətasını loglayırıq, amma normal nəticəni qaytarırıq
            console.error('Keşləmə xətası:', cacheError);
          }
        }
        
        return result;
      } catch (error) {
        // Əgər sorğu xəta verərsə və keşləmə konfiqurasiyası varsa
        if (cacheConfig) {
          try {
            // Keşdən məlumatı əldə etməyə çalışırıq
            const { data: cachedData, error: cacheError } = await supabase.functions.invoke('get-cached-query', {
              body: {
                key: cacheConfig.key
              }
            });
            
            if (!cacheError && cachedData) {
              console.log('Keşdən məlumatlar istifadə olundu:', cacheConfig.key);
              return cachedData as T;
            }
          } catch (cacheError) {
            console.error('Keş əldə etmə xətası:', cacheError);
          }
        }
        
        // Keşdən də əldə edilə bilmədisə, xətanı yenidən atırıq
        throw error;
      }
    },
    ...queryOptions
  });
}
