
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export const useUserList = (initialFilter: UserFilter = {}) => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>(initialFilter);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      if (filter.search) {
        query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
      }

      if (filter.role) {
        query = query.eq('role', filter.role);
      }

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setUsers(data || []);
      setTotalCount(count || 0);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err: any) {
      setError(err);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const updateFilter = useCallback((newFilter: UserFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  };
};
