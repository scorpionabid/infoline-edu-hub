
import { useState, useMemo } from 'react';

export interface UsePaginationOptions {
  totalItems: number;
  initialPageSize?: number;
  initialPage?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

export const usePagination = ({
  totalItems,
  initialPageSize = 10,
  initialPage = 1
}: UsePaginationOptions): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    setCurrentPage,
    setPageSize,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex
  };
};
