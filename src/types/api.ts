/**
 * API sorğuları üçün ümumi tip definisiyaları
 */

/**
 * Sorğu nəticələri üçün ümumi tip
 */
export interface QueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

/**
 * Sorğu parametrləri üçün ümumi tip
 */
export interface QueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number | false;
}

/**
 * Pagination parametrləri
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * Filter parametrləri
 */
export interface FilterParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  [key: string]: any;
}

/**
 * API xətası
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Mutasiya parametrləri
 */
export interface MutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
