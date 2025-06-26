
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/common/useToast';

export interface User {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
  status?: string;
  name?: string;
  entityName?: string | {
    region?: string;
    sector?: string;
    school?: string;
  };
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({});
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const { error: toastError } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          // status
        `)
        .eq('status', 'active');

      if (filter.search) {
        query = query.or(`full_name.ilike.%${filter.search}%,email.ilike.%${filter.search}%`);
      }

      const { data, error: dbError, count } = await query
        .range((currentPage - 1) * 10, currentPage * 10 - 1)
        .order('full_name');

      if (dbError) throw dbError;

      setUsers(data || []);
      setTotalRecords(count || 0);
      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err);
      toastError('İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = fetchUsers;

  const updateFilter = (newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const refetch = async () => {
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, currentPage]);

  return {
    users,
    loading,
    error: error || new Error('No error'),
    filter,
    updateFilter,
    totalPages,
    currentPage,
    totalRecords,
    handlePageChange,
    refetch,
    fetchUsers,
    // fetchAvailableUsers
  };
};

export default useAvailableUsers;
