
import { useState } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

export const usePagination = (
  totalItems: number,
  options: UsePaginationOptions = {}
): UsePaginationReturn => {
  const { initialPage = 1, itemsPerPage = 10 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    // goToPreviousPage
  };
};
