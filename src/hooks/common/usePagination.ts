import { useState, useCallback, useMemo } from 'react';

interface UsePaginationReturn<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  paginatedItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  totalItems: number;
  startIndex: number;
  endIndex: number;
}

export const usePagination = <T>(
  items: T[] = [],
  initialPageSize: number = 10
): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / pageSize));
  }, [items.length, pageSize]);
  
  // Calculate start and end indices for display
  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize]);
  
  const endIndex = useMemo(() => {
    return Math.min(currentPage * pageSize, items.length);
  }, [currentPage, pageSize, items.length]);
  
  // Get current page items
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);
  
  // Navigation functions
  const goToPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);
  
  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);
  
  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);
  
  // Page size change handler
  const handleSetPageSize = useCallback((size: number) => {
    const newSize = Math.max(1, size);
    setPageSize(newSize);
    
    // Adjust current page if necessary
    const newTotalPages = Math.max(1, Math.ceil(items.length / newSize));
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [items.length, currentPage]);
  
  return {
    currentPage,
    pageSize,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: handleSetPageSize,
    totalItems: items.length,
    startIndex,
    endIndex
  };
};

export default usePagination;
