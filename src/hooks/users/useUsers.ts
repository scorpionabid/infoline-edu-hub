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

      const { data, error: queryError, count: resultCount } = await query;

      if (queryError) {
        setError(queryError.message);
        console.error('Error fetching users:', queryError);
      } else {
        const usersList = data.map((userData: any) => {
          return {
            id: userData?.id || '',
            email: userData?.email || '',
            full_name: userData?.full_name || '',
            name: userData?.full_name || '',
            phone: userData?.phone || '',
            position: userData?.position || '',
            language: userData?.language || '',
            status: userData?.status || '',
            created_at: userData?.created_at || '',
            updated_at: userData?.updated_at || ''
          } as User;
        });
        setUsers(usersList);
        setCount(resultCount || 0);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Unexpected error fetching users:', err);
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
