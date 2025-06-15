
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, EntityName } from '@/types/user';
import { UserRole, UserStatus } from '@/types/auth';

export interface FilterOption {
  label: string;
  value: string;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<UserFilter>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          phone,
          position,
          language,
          avatar,
          status,
          last_login,
          created_at,
          updated_at,
          role:user_roles (role, region_id, sector_id, school_id)
        `)
        .order('full_name');

      if (filters.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }

      if (filters.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const normalizedUsers = data?.map((user: any) => {
        const userRole = user.role ? user.role[0]?.role : 'schooladmin';
        const userStatus = user.status || 'active';
        
        let entityName: EntityName = {
          region: null,
          sector: null,
          school: null
        };
        
        if (user.role && user.role[0]) {
          const { region_id, sector_id, school_id } = user.role[0];
          entityName = {
            region: region_id || null,
            sector: sector_id || null,
            school: school_id || null
          };
        }

        return {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: userRole,
          status: userStatus,
          phone: user.phone,
          position: user.position,
          language: user.language,
          avatar: user.avatar,
          last_login: user.last_login,
          created_at: user.created_at,
          updated_at: user.updated_at,
          entityName: entityName
        };
      }) || [];

      setUsers(normalizedUsers);
    } catch (err: any) {
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserFilter = (newFilters: UserFilter) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  const filteredUsers = users.filter(user => {
    if (filters.role && filters.role !== 'all' && user.role !== filters.role) {
      return false;
    }
    
    if (filters.status && filters.status !== 'all' && user.status !== filters.status) {
      return false;
    }

    if (filters.region_id && user.entityName && user.entityName.region !== filters.region_id) {
      return false;
    }

    if (filters.sector_id && user.entityName && user.entityName.sector !== filters.sector_id) {
      return false;
    }

    if (filters.school_id && user.entityName && user.entityName.school !== filters.school_id) {
      return false;
    }

    if (filters.search && !user.full_name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  return {
    users: filteredUsers,
    loading,
    error,
    updateUserFilter,
    refetch: fetchUsers
  };
};
