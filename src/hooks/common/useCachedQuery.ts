
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useCachedData } from './useCachedData';

export function useCachedQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  const { get: getCachedData, set: setCachedData } = useCachedData<T>(queryKey.join('_'));

  return useQuery({
    queryKey,
    queryFn: async () => {
      const cachedData = getCachedData();
      if (cachedData && options?.staleTime && typeof options.staleTime === 'number') {
        return cachedData;
      }
      
      const freshData = await queryFn();
      setCachedData(freshData);
      return freshData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes default
    ...options
  });
}
