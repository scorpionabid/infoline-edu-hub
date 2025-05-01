
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';

// Keş konfiqurasiyası tipi
export interface CacheConfig {
  key: string;
  ttl: number; // saniyələrlə
  dependencies?: string[];
}

// Keşlənmiş query hook
export function useCachedQuery<T>(
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, unknown, T, QueryKey>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // Default 5 dəqiqə
    ...options,
  });
}

// Keşi təmizləmək üçün funksiya
export function invalidateCache(queryClient: any, queryKey: QueryKey) {
  return queryClient.invalidateQueries({ queryKey });
}

// Bütün keşləri təmizləmək üçün funksiya
export function clearAllCaches(queryClient: any) {
  return queryClient.clear();
}
