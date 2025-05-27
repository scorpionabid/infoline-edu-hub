import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, UserStatus } from '@/types/user';

interface Filters {
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  search?: string;
}

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<Filters>({});

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_filtered_users', {
        p_role: filters.role ? [filters.role as 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin'] : null,
        p_region_id: filters.region_id ? [filters.region_id] : null,
        p_sector_id: filters.sector_id ? [filters.sector_id] : null,
        p_school_id: filters.school_id ? [filters.school_id] : null,
        p_search: filters.search || null,
      });

      if (error) throw error;

      const processedUsers: User[] = data?.map((row: any) => {
        const user = row.user_json;
        return {
          ...user,
          status: user.status as UserStatus || 'active'
        };
      }) || [];

      setUsers(processedUsers);
    } catch (err: any) {
      setError(err);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  return {
    users,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchUsers
  };
};
