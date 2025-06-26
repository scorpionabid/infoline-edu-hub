import { useState, useEffect, useCallback, useMemo } from 'react';
import { reportCache, CacheHelpers } from '@/services/reports/cacheService';
import { supabase } from '@/integrations/supabase/client';
import { handleError } from '@/utils/errorHandler';

export interface PaginationConfig {
  pageSize: number;
  initialPage: number;
  enableInfiniteScroll: boolean;
  prefetchNextPage: boolean;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  loadMore: () => void;
  refresh: () => void;
  setPageSize: (size: number) => void;
}

export interface UsePaginatedReportsProps {
  reportType: string;
  filters?: Record<string, any>;
  config?: Partial<PaginationConfig>;
  enabled?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationState;
  actions: PaginationActions;
}

const DEFAULT_CONFIG: PaginationConfig = {
  pageSize: 50,
  initialPage: 1,
  enableInfiniteScroll: false,
  prefetchNextPage: true
};

/**
 * Optimized pagination hook for reports with caching
 */
export function usePaginatedReports<T = any>({
  reportType,
  filters = {},
  config = {},
  enabled = true
}: UsePaginatedReportsProps): PaginatedResult<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [currentPage, setCurrentPage] = useState(finalConfig.initialPage);
  const [pageSize, setPageSize] = useState(finalConfig.pageSize);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allData, setAllData] = useState<T[]>([]);
  const [pageData, setPageData] = useState<Map<number, T[]>>(new Map());

  // Memoized cache key generator
  const getCacheKey = useCallback((page: number, size: number) => {
    return {
      reportType,
      filters,
      page,
      pageSize: size
    };
  }, [reportType, filters]);

  // Fetch function with caching
  const fetchPage = useCallback(async (
    page: number, 
    size: number, 
    useCache = true
  ): Promise<{ data: T[], total: number }> => {
    const cacheKey = getCacheKey(page, size);
    
    if (useCache) {
      const cached = reportCache.get<{ data: T[], total: number }>('paginated_reports', cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Calculate offset
    const offset = (page - 1) * size;
    
    let query: any;
    let countQuery: any;
    
    // Build query based on report type
    switch (reportType) {
      case 'school_performance': {
        const { data: performanceData, error: perfError } = await supabase.rpc('get_school_performance_report' as any, {
          p_region_id: filters.region_id || null,
          p_sector_id: filters.sector_id || null,
          p_date_from: filters.date_from || null,
          p_date_to: filters.date_to || null
        });
        
        if (perfError) throw perfError;
        
        const allPerformanceData = performanceData || [];
        const paginatedPerformanceData = allPerformanceData.slice(offset, offset + size);
        
        const result = {
          data: paginatedPerformanceData,
          total: allPerformanceData.length
        };
        
        // Cache the result
        reportCache.set('paginated_reports', cacheKey, result, 5 * 60 * 1000);
        return result;
        
      case 'school_column_data': {
        const { data: columnData, error: colError } = await supabase.rpc('get_school_column_export_data' as any, {
          p_category_id: filters.category_id || null,
          p_region_id: filters.region_id || null,
          p_sector_id: filters.sector_id || null
        });
        
        if (colError) throw colError;
        
        const allColumnData = columnData || [];
        const paginatedColumnData = allColumnData.slice(offset, offset + size);
        
        const columnResult = {
          data: paginatedColumnData,
          total: allColumnData.length
        };
        
        reportCache.set('paginated_reports', cacheKey, columnResult, 5 * 60 * 1000);
        return columnResult;
        
      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }
  }, [reportType, filters, getCacheKey]);

  // Load data for specific page
  const loadPage = useCallback(async (page: number, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await fetchPage(page, pageSize);
      
      setTotalItems(result.total);
      
      if (append) {
        // Infinite scroll: append to existing data
        setAllData(prev => [...prev, ...result.data]);
        setPageData(prev => new Map(prev).set(page, result.data));
      } else {
        // Regular pagination: replace data
        setAllData(result.data);
        setPageData(new Map().set(page, result.data));
      }

      // Prefetch next page if enabled
      if (finalConfig.prefetchNextPage && result.total > page * pageSize) {
        setTimeout(() => {
          fetchPage(page + 1, pageSize).catch(() => {
            // Ignore prefetch errors
          });
        }, 100);
      }
      
    } catch (err) {
      setError(handleError(err));
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [fetchPage, pageSize, finalConfig.prefetchNextPage]);

  // Load initial data
  useEffect(() => {
    if (!enabled) return;
    
    loadPage(currentPage);
  }, [enabled, currentPage, pageSize, reportType, JSON.stringify(filters)]);

  // Pagination calculations
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  // Actions
  const actions: PaginationActions = {
    goToPage: useCallback((page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    }, [totalPages]),

    nextPage: useCallback(() => {
      if (hasNextPage) {
        setCurrentPage(prev => prev + 1);
      }
    }, [hasNextPage]),

    previousPage: useCallback(() => {
      if (hasPreviousPage) {
        setCurrentPage(prev => prev - 1);
      }
    }, [hasPreviousPage]),

    loadMore: useCallback(() => {
      if (finalConfig.enableInfiniteScroll && hasNextPage && !isLoadingMore) {
        loadPage(currentPage + 1, true);
        setCurrentPage(prev => prev + 1);
      }
    }, [finalConfig.enableInfiniteScroll, hasNextPage, isLoadingMore, loadPage, currentPage]),

    refresh: useCallback(() => {
      // Clear cache for this report type
      reportCache.invalidate('paginated_reports');
      loadPage(currentPage);
    }, [loadPage, currentPage]),

    setPageSize: useCallback((size: number) => {
      setPageSize(size);
      setCurrentPage(1); // Reset to first page
      setAllData([]);
      setPageData(new Map());
    }, [])
  };

  // Return current data based on pagination mode
  const data = useMemo(() => {
    if (finalConfig.enableInfiniteScroll) {
      return allData; // All loaded data for infinite scroll
    } else {
      return pageData.get(currentPage) || []; // Current page data for regular pagination
    }
  }, [finalConfig.enableInfiniteScroll, allData, pageData, currentPage]);

  const pagination: PaginationState = {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    isLoadingMore,
    // error
  };

  return {
    data,
    pagination,
    // actions
  };
}

/**
 * Simplified hook for infinite scroll reports
 */
export function useInfiniteReports<T = any>({
  reportType,
  filters = {},
  pageSize = 50
}: {
  reportType: string;
  filters?: Record<string, any>;
  pageSize?: number;
}) {
  return usePaginatedReports<T>({
    reportType,
    filters,
    config: {
      pageSize,
      enableInfiniteScroll: true,
      prefetchNextPage: true
    }
  });
}

/**
 * Hook for traditional pagination
 */
export function usePagedReports<T = any>({
  reportType,
  filters = {},
  pageSize = 50,
  initialPage = 1
}: {
  reportType: string;
  filters?: Record<string, any>;
  pageSize?: number;
  initialPage?: number;
}) {
  return usePaginatedReports<T>({
    reportType,
    filters,
    config: {
      pageSize,
      initialPage,
      enableInfiniteScroll: false,
      prefetchNextPage: true
    }
  });
}

export default usePaginatedReports;
