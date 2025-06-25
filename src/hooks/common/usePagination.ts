
import React from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  startIndex: number;
  endIndex: number;
  paginatedItems: T[];
  paginatedData: T[];
}

export function usePagination<T>(
  items: T[],
  initialPageSize = 10
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / currentPageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = Math.min(startIndex + currentPageSize, totalItems);

  // Calculate paginated items
  const paginatedItems = React.useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    currentPage,
    pageSize: currentPageSize,
    totalPages,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    prevPage: previousPage,
    setPageSize: setCurrentPageSize,
    startIndex,
    endIndex,
    paginatedItems,
    paginatedData: paginatedItems
  };
}
