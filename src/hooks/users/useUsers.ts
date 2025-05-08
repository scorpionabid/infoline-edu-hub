import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter } from '@/types/user';

interface UseUsersProps {
  filter?: UserFilter;
}

export const useUsers = ({ filter }: UseUsersProps = {}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select('*, count:users(*)', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filter) {
        if (filter.role && filter.role.length > 0) {
          query = query.in('role', filter.role);
        }
        if (filter.status && filter.status.length > 0) {
          query = query.in('status', filter.status);
        }
        if (filter.region_id) {
          query = query.eq('region_id', filter.region_id);
        }
        if (filter.sector_id) {
          query = query.eq('sector_id', filter.sector_id);
        }
        if (filter.school_id) {
          query = query.eq('school_id', filter.school_id);
        }
        if (filter.search) {
          query = query.ilike('full_name', `%${filter.search}%`);
        }
        if (filter.page && filter.limit) {
          const startIndex = (filter.page - 1) * filter.limit;
          const endIndex = startIndex + filter.limit - 1;
          query = query.range(startIndex, endIndex);
        }
      }

      const { data, error, count } = await query;

      if (error) {
        setError(error.message);
        console.error('Error fetching users:', error);
      } else {
        const usersList = data.map((data) => {
          const user = {
            email: data?.email || '',
            full_name: data?.full_name || '',
            name: data?.full_name || '',
            phone: data?.phone || '',
            position: data?.position || '',
            language: data?.language || '',
            status: data?.status || '',
            created_at: data?.created_at || '',
            updated_at: data?.updated_at || ''
          };
          return user;
        });
        setUsers(usersList);
        setCount(count || 0);
      }
    } catch (error: any) {
      setError(error.message);
      console.error('Unexpected error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    count,
    fetchUsers,
  };
};
