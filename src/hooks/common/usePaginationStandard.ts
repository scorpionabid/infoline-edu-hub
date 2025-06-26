
import { useState, useMemo } from 'react';

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
}

export const usePaginationStandard = ({
  totalItems,
  initialPage = 1,
  initialPageSize = 10
}: UsePaginationProps): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize);
  }, [totalItems, pageSize]);

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const nextPage = () => {
    if (canGoNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (canGoPrevious) {
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
    previousPage,
    canGoNext,
    // canGoPrevious
  };
};
