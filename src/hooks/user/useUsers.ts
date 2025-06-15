
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserFilter } from '@/types/user';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export const useUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const currentUser = useAuthStore(selectUser);

  const fetchUsers = useCallback(async (filters: UserFilter = {}) => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('profiles').select(`
        *,
        user_roles!inner(
          role,
          region_id,
          sector_id,
          school_id
        )
      `, { count: 'exact' });

      // Apply role-based restrictions
      if (currentUser.role === 'regionadmin' && currentUser.region_id) {
        query = query.eq('user_roles.region_id', currentUser.region_id);
      } else if (currentUser.role === 'sectoradmin' && currentUser.sector_id) {
        query = query.eq('user_roles.sector_id', currentUser.sector_id);
      }

      // Apply filters
      if (filters.role && Array.isArray(filters.role) && filters.role.length > 0) {
        query = query.in('user_roles.role', filters.role);
      }
      
      if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const processedUsers: UserData[] = data?.map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.user_roles.role,
        region_id: user.user_roles.region_id,
        sector_id: user.user_roles.sector_id,
        school_id: user.user_roles.school_id,
        phone: user.phone,
        position: user.position,
        language: user.language,
        avatar: user.avatar,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      })) || [];

      setUsers(processedUsers);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const updateFilters = useCallback((newFilters: Partial<UserFilter>) => {
    fetchUsers(newFilters);
  }, [fetchUsers]);

  const refreshUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    totalCount,
    refreshUsers,
    updateFilters
  };
};
