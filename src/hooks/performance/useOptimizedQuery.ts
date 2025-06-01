
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

interface OptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  dependencies?: any[];
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  staleTime = 5 * 60 * 1000, // 5 minutes
  cacheTime = 10 * 60 * 1000, // 10 minutes
  enabled = true,
  refetchOnWindowFocus = false,
  dependencies = [],
}: OptimizedQueryOptions<T>) {
  const queryClient = useQueryClient();

  // Memoize query key with dependencies
  const memoizedQueryKey = useMemo(() => {
    return [...queryKey, ...dependencies];
  }, [queryKey, ...dependencies]);

  const query = useQuery({
    queryKey: memoizedQueryKey,
    queryFn,
    staleTime,
    cacheTime,
    enabled,
    refetchOnWindowFocus,
  });

  // Prefetch related data
  const prefetchRelated = (relatedQueryKey: string[], relatedQueryFn: () => Promise<any>) => {
    queryClient.prefetchQuery({
      queryKey: relatedQueryKey,
      queryFn: relatedQueryFn,
      staleTime,
    });
  };

  // Invalidate related queries
  const invalidateRelated = (patterns: string[]) => {
    patterns.forEach(pattern => {
      queryClient.invalidateQueries({ 
        queryKey: [pattern],
        exact: false 
      });
    });
  };

  return {
    ...query,
    prefetchRelated,
    invalidateRelated,
  };
}
