
import { useState, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export function useUserList(initialFilters?: UserFilter) {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilter>(initialFilters || {});
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (newFilters?: UserFilter) => {
    setLoading(true);
    try {
      const currentFilters = newFilters || filters;
      console.log('Fetching users list with filters:', currentFilters);
      // Implementation will go here when needed
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilter = useCallback((newFilter: UserFilter) => {
    setFilters(newFilter);
    setCurrentPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    filters,
    setFilters,
    filter: filters,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  };
}

export default useUserList;
