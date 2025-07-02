import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useUsers } from './useUsers';
import { UserFilter } from '@/types/user';

// Transform UserFilter to the format expected by useUsers
const transformFilters = (filters: UserFilter) => {
  const transformed: { role?: string; status?: string; searchTerm?: string } = {};
  
  if (filters.role && !Array.isArray(filters.role)) {
    transformed.role = filters.role;
  } else if (Array.isArray(filters.role) && filters.role.length > 0) {
    transformed.role = filters.role[0];
  }
  
  if (filters.status && !Array.isArray(filters.status)) {
    transformed.status = filters.status;
  } else if (Array.isArray(filters.status) && filters.status.length > 0) {
    transformed.status = filters.status[0];
  }
  
  if (filters.search) {
    transformed.searchTerm = filters.search;
  }
  
  return transformed;
};

interface UseUserListOptions {
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

export const useUserList = (
  externalFilters: UserFilter = {}, 
  options: UseUserListOptions = {}
) => {
  const [localFilters, setLocalFilters] = useState<UserFilter>(externalFilters);
  const [currentPage, setCurrentPage] = useState(options.page || 1);
  const [pageSize] = useState(options.pageSize || 10);
  const [sortField, setSortField] = useState(options.sortField || 'created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(options.sortDirection || 'desc');

  // Update local filters when external filters change
  useEffect(() => {
    console.log('External filters changed:', externalFilters);
    setLocalFilters(externalFilters);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [JSON.stringify(externalFilters)]);
  
  // Transformed filters for the useUsers hook
  const transformedFilters = useMemo(() => ({
    ...transformFilters(localFilters),
    page: currentPage,
    pageSize,
    sortField,
    sortDirection
  }), [localFilters, currentPage, pageSize, sortField, sortDirection]);
  
  const { 
    users, 
    isLoading: loading, 
    error, 
    refetch, 
    totalCount,
    totalPages
  } = useUsers(transformedFilters);

  const applyFilters = (newFilters: UserFilter) => {
    console.log('Applying filters:', newFilters);
    setLocalFilters(newFilters);
  };

  const refreshUsers = useCallback(() => {
    refetch();
  }, [refetch]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSort = useCallback((field: string) => {
    setCurrentPage(1); // Reset to first page when sorting
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  // Debug log
  useEffect(() => {
    console.log('Current filters in useUserList:', localFilters);
    console.log('Pagination:', currentPage, pageSize);
    console.log('Transformed filters:', transformedFilters);
    console.log(`Users ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`);
  }, [localFilters, currentPage, pageSize, transformedFilters, totalCount]);

  return {
    users,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    pageSize,
    sortField,
    sortDirection,
    refreshUsers: refetch,
    onPageChange: handlePageChange,
    onSort: handleSort,
    applyFilters,
    updateFilters: applyFilters
  };
};
