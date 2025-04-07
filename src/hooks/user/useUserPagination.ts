
import { useState, useCallback } from 'react';

export const useUserPagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const getTotalPages = useCallback(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  return {
    currentPage,
    pageSize,
    totalCount,
    setTotalCount,
    handlePageChange,
    getTotalPages
  };
};
