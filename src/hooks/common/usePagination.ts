
import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  setTotalCount: (count: number) => void;
  goToPage: (page: number) => void;
  setPageSize: (size: number) => void;
  getTotalPages: () => number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const usePagination = (options: UsePaginationOptions = {}): UsePaginationReturn => {
  const { initialPage = 1, initialPageSize = 10 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalCount, setTotalCount] = useState(0);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getTotalPages = useCallback(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  const hasNextPage = currentPage < getTotalPages();
  const hasPreviousPage = currentPage > 1;

  return {
    currentPage,
    pageSize,
    totalCount,
    setTotalCount,
    goToPage,
    setPageSize,
    getTotalPages,
    hasNextPage,
    hasPreviousPage
  };
};
