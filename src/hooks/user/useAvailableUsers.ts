
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  created_at: string;
}

export interface UserFilter {
  search: string;
  role: string;
  status: string;
}

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<UserFilter>({
    search: '',
    role: '',
    status: 'active'
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (dbError) throw dbError;
      setUsers(data || []);
      setTotalRecords(data?.length || 0);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    refetch: fetchUsers,
    fetchUsers
  };
};
