
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface UserFilter {
  role?: string;
  region_id?: string;
  sector_id?: string;
  search?: string;
}

export const useAvailableUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({});
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const pageSize = 10;

  const fetchUsers = async (page = 1, currentFilter = filter) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('user_profiles')
        .select('*', { count: 'exact' });

      // Apply filters based on current user's role
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('sector_id', user.sector_id);
      }

      // Apply additional filters
      if (currentFilter.role) {
        query = query.eq('role', currentFilter.role);
      }
      if (currentFilter.region_id) {
        query = query.eq('region_id', currentFilter.region_id);
      }
      if (currentFilter.sector_id) {
        query = query.eq('sector_id', currentFilter.sector_id);
      }
      if (currentFilter.search) {
        query = query.or(`full_name.ilike.%${currentFilter.search}%,email.ilike.%${currentFilter.search}%`);
      }

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setUsers(data || []);
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
      setCurrentPage(page);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (newFilter: Partial<UserFilter>) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    fetchUsers(1, updatedFilter);
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  const refetch = () => {
    return fetchUsers(currentPage);
  };

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    totalPages,
    currentPage,
    totalRecords,
    handlePageChange,
    refetch
  };
};
