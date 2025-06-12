import { useQuery } from '@tanstack/react-query';
import { columnService } from '@/services/columns/columnService';
import { Column } from '@/types/column';

/**
 * Query options for columns
 */
export interface ColumnsQueryOptions {
  categoryId?: string;
  status?: string;
  orderBy?: string;
  limit?: number;
  enabled?: boolean;
  includeDeleted?: boolean; // NEW: Include deleted columns in results
}

/**
 * Unified Columns Query Hook
 * Replaces useColumnsQuery, useColumnsNew, useColumnQuery
 */
export const useColumnsQuery = (options: ColumnsQueryOptions = {}) => {
  const { 
    categoryId, 
    status, 
    orderBy, 
    limit, 
    enabled = true,
    includeDeleted = false // NEW: Default to false for backward compatibility
  } = options;
  
  return useQuery({
    queryKey: ['columns', { categoryId, status, orderBy, limit, includeDeleted }],
    queryFn: () => columnService.fetchColumns({
      categoryId,
      status,
      orderBy,
      limit,
      includeDeleted // Pass through to service
    }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: any) => {
      console.error('useColumnsQuery error:', error);
    },
    // Transform data to ensure proper typing
    select: (data: Column[]) => {
      return data.map(column => ({
        ...column,
        // Parse JSON fields if they're strings
        options: typeof column.options === 'string' 
          ? JSON.parse(column.options) 
          : column.options,
        validation: typeof column.validation === 'string' 
          ? JSON.parse(column.validation) 
          : column.validation,
      }));
    }
  });
};

/**
 * Specialized hook for active columns only
 */
export const useActiveColumnsQuery = (categoryId?: string) => {
  return useColumnsQuery({
    categoryId,
    status: 'active',
    orderBy: 'order_index',
    enabled: !!categoryId
  });
};

/**
 * Specialized hook for deleted/archived columns
 */
export const useArchivedColumnsQuery = (categoryId?: string) => {
  return useColumnsQuery({
    categoryId,
    status: 'deleted',
    orderBy: 'updated_at',
    enabled: !!categoryId
  });
};

/**
 * Hook for single column by ID (derived from columns query)
 */
export const useColumnQuery = (columnId: string, categoryId?: string) => {
  const { data: columns, ...rest } = useColumnsQuery({ categoryId });
  
  const column = columns?.find(col => col.id === columnId);
  
  return {
    data: column,
    isFound: !!column,
    ...rest
  };
};

export default useColumnsQuery;
