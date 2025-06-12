import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { columnService } from '@/services/columns/columnService';
import { Column } from '@/types/column';

/**
 * Query options for columns with enhanced caching and performance
 */
export interface ColumnsQueryOptions {
  categoryId?: string;
  status?: string;
  orderBy?: string;
  limit?: number;
  enabled?: boolean;
  includeDeleted?: boolean;
  includeInactive?: boolean; // NEW: Include inactive columns
  // Performance options
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Enhanced Columns Query Hook with performance optimizations
 */
export const useColumnsQuery = (options: ColumnsQueryOptions = {}) => {
  const { 
    categoryId, 
    status, 
    orderBy, 
    limit, 
    enabled = true,
    includeDeleted = false,
    includeInactive = false, // NEW: Include inactive columns
    // Performance defaults
    staleTime = 5 * 60 * 1000, // 5 minutes
    gcTime = 10 * 60 * 1000, // 10 minutes  
    refetchOnWindowFocus = false
  } = options;
  
  return useQuery({
    queryKey: ['columns', { categoryId, status, orderBy, limit, includeDeleted, includeInactive }],
    queryFn: () => columnService.fetchColumns({
      categoryId,
      status,
      orderBy,
      limit,
      includeDeleted,
      includeInactive
    }),
    enabled,
    staleTime,
    gcTime, // Updated from deprecated cacheTime
    refetchOnWindowFocus,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: any) => {
      console.error('useColumnsQuery error:', error);
    },
    // Enhanced data transformation with memoization
    select: (data: Column[]) => {
      return data.map(column => ({
        ...column,
        // Parse JSON fields only if they're strings (performance optimization)
        options: typeof column.options === 'string' 
          ? JSON.parse(column.options) 
          : column.options,
        validation: typeof column.validation === 'string' 
          ? JSON.parse(column.validation) 
          : column.validation,
      }));
    },
    // Enable background refetching for better UX
    refetchOnMount: 'always',
    // Placeholder data for instant loading
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Optimized hook for active columns with aggressive caching
 */
export const useActiveColumnsQuery = (categoryId?: string) => {
  return useColumnsQuery({
    categoryId,
    status: 'active',
    orderBy: 'order_index',
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes (more aggressive caching for active columns)
    refetchOnWindowFocus: false // Don't refetch on focus for active columns
  });
};

/**
 * Hook for archived columns with minimal caching (less frequently accessed)
 */
export const useArchivedColumnsQuery = (categoryId?: string) => {
  return useColumnsQuery({
    categoryId,
    status: 'deleted',
    orderBy: 'updated_at',
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000, // 2 minutes (less caching for archived)
    refetchOnWindowFocus: true // Refetch on focus for archived columns
  });
};

/**
 * Parallel query hook for loading both active and archived columns simultaneously
 */
export const useParallelColumnsQuery = (categoryId?: string) => {
  const queries = useQueries({
    queries: [
      {
        queryKey: ['columns', 'active', categoryId],
        queryFn: () => columnService.fetchColumns({
          categoryId,
          status: 'active',
          orderBy: 'order_index'
        }),
        enabled: !!categoryId,
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['columns', 'archived', categoryId],
        queryFn: () => columnService.fetchColumns({
          categoryId,
          status: 'deleted',
          orderBy: 'updated_at'
        }),
        enabled: !!categoryId,
        staleTime: 2 * 60 * 1000,
      }
    ]
  });

  const [activeQuery, archivedQuery] = queries;

  return {
    activeColumns: activeQuery.data || [],
    archivedColumns: archivedQuery.data || [],
    isLoadingActive: activeQuery.isPending,
    isLoadingArchived: archivedQuery.isPending,
    isLoading: activeQuery.isPending || archivedQuery.isPending,
    errorActive: activeQuery.error,
    errorArchived: archivedQuery.error,
    error: activeQuery.error || archivedQuery.error,
    refetchActive: activeQuery.refetch,
    refetchArchived: archivedQuery.refetch,
    refetchAll: () => {
      activeQuery.refetch();
      archivedQuery.refetch();
    }
  };
};

/**
 * Hook for single column by ID with derived query optimization
 */
export const useColumnQuery = (columnId: string, categoryId?: string) => {
  const { data: columns, ...rest } = useColumnsQuery({ 
    categoryId,
    // Use more aggressive caching for single column lookup
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000 // 30 minutes
  });
  
  const column = columns?.find(col => col.id === columnId);
  
  return {
    data: column,
    isFound: !!column,
    ...rest
  };
};

/**
 * Prefetch utility for warming up column cache
 */
export const usePrefetchColumns = () => {
  const queryClient = useQueryClient();
  
  const prefetchActiveColumns = useCallback((categoryId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['columns', { categoryId, status: 'active', orderBy: 'order_index' }],
      queryFn: () => columnService.fetchColumns({
        categoryId,
        status: 'active',
        orderBy: 'order_index'
      }),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchArchivedColumns = useCallback((categoryId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['columns', { categoryId, status: 'deleted', orderBy: 'updated_at' }],
      queryFn: () => columnService.fetchColumns({
        categoryId,
        status: 'deleted',
        orderBy: 'updated_at'
      }),
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient]);

  return {
    prefetchActiveColumns,
    prefetchArchivedColumns
  };
};

export default useColumnsQuery;
