// Fix only the problematic parts - update references to UserFilter properties
import { useState, useCallback } from 'react';
import { User, UserFilter } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaginationResult<T> {
  data: T[];
  total: number;
}

export const useOptimizedUserList = (initialFilters?: UserFilter) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [filters, setFilters] = useState<UserFilter>(initialFilters || {});

  const itemsPerPage = 10;

  const buildFilterQuery = useCallback((query: any, filters: UserFilter) => {
    let builtQuery = query;

    // Apply filters
    if (filters.role && filters.role.length > 0) {
      builtQuery = builtQuery.in('role', filters.role);
    }

    if (filters.status && filters.status.length > 0) {
      builtQuery = builtQuery.in('status', filters.status);
    }

    if (filters.regionId) {
      builtQuery = builtQuery.eq('region_id', filters.regionId);
    }

    if (filters.sectorId) {
      builtQuery = builtQuery.eq('sector_id', filters.sectorId);
    }

    if (filters.schoolId) {
      builtQuery = builtQuery.eq('school_id', filters.schoolId);
    }

    if (filters.search && filters.search.trim() !== '') {
      builtQuery = builtQuery.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    return builtQuery;
  }, []);

  const fetchUsers = useCallback(async (page = 1, newFilters?: UserFilter) => {
    setLoading(true);
    setError(null);

    try {
      const activeFilters = newFilters || filters;

      // Build RLS filters
      const rlsFilters: any = {};
      if (activeFilters.role && activeFilters.role.length > 0) {
        rlsFilters.role = activeFilters.role;
      }
      if (activeFilters.regionId) {
        rlsFilters.region_id = activeFilters.regionId;
      }
      if (activeFilters.sectorId) {
        rlsFilters.sector_id = activeFilters.sectorId;
      }
      if (activeFilters.schoolId) {
        rlsFilters.school_id = activeFilters.schoolId;
      }

      // Fetch total count
      let countQuery = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      countQuery = buildFilterQuery(countQuery, activeFilters);
      const { count, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      const total = count || 0;
      setTotalUsers(total);

      // Calculate total pages
      const totalPageCount = Math.ceil(total / itemsPerPage);
      setTotalPages(totalPageCount);

      // Fetch paginated data
      let query = supabase
        .from('profiles')
        .select('*')
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      query = buildFilterQuery(query, activeFilters);
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setUsers(data || []);
      setPage(page);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [buildFilterQuery, filters]);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      fetchUsers(page + 1);
    }
  }, [page, totalPages, fetchUsers]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      fetchUsers(page - 1);
    }
  }, [page, fetchUsers]);

  const applyFilters = useCallback(
    (newFilters: UserFilter) => {
      setFilters(newFilters);
      setPage(1); // Reset to first page when filters change
      fetchUsers(1, newFilters); // Apply filters on the first page
    },
    [fetchUsers]
  );

  return {
    users,
    totalUsers,
    loading,
    error,
    page,
    totalPages,
    fetchUsers,
    refetch: () => fetchUsers(page),
    nextPage,
    prevPage,
    filters,
    setFilters,
    applyFilters
  };
};

export default useOptimizedUserList;
