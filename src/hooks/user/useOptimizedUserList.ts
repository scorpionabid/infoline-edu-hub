
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserFilter } from '@/types/user';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface UseOptimizedUserListResult {
  users: User[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  hasMore: boolean;
  fetchUsers: (filters?: UserFilter, page?: number) => Promise<void>;
  resetUsers: () => void;
  refetch: () => Promise<void>;
}

export const useOptimizedUserList = (): UseOptimizedUserListResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const user = useAuthStore(selectUser);
  const { userRole, regionId, sectorId } = usePermissions();

  const fetchUsers = useCallback(async (filters: UserFilter = {}, page: number = 1) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Role-based filtering
      let effectiveFilters = { ...filters };
      
      if (userRole === 'regionadmin' && regionId) {
        effectiveFilters.region_id = regionId;
      } else if (userRole === 'sectoradmin' && sectorId) {
        effectiveFilters.sector_id = sectorId;
      }

      console.log('Fetching users with filters:', effectiveFilters);

      // Build query
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(
            role,
            region_id,
            sector_id,
            school_id
          )
        `);

      // Apply role-based filters on join
      if (userRole === 'regionadmin' && regionId) {
        query = query.eq('user_roles.region_id', regionId);
      } else if (userRole === 'sectoradmin' && sectorId) {
        query = query.eq('user_roles.sector_id', sectorId);
      } else {
        // Manual filters for other roles
        if (effectiveFilters.region_id) {
          query = query.eq('user_roles.region_id', effectiveFilters.region_id);
        }
        if (effectiveFilters.sector_id) {
          query = query.eq('user_roles.sector_id', effectiveFilters.sector_id);
        }
        if (effectiveFilters.school_id) {
          query = query.eq('user_roles.school_id', effectiveFilters.school_id);
        }
      }

      if (effectiveFilters.role) {
        query = query.eq('user_roles.role', effectiveFilters.role);
      }

      if (effectiveFilters.status) {
        query = query.eq('status', effectiveFilters.status);
      }

      if (effectiveFilters.search) {
        query = query.or(`full_name.ilike.%${effectiveFilters.search}%,email.ilike.%${effectiveFilters.search}%`);
      }

      const limit = 20;
      const offset = (page - 1) * limit;
      
      const { data, error, count } = await query
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match User interface
      const transformedUsers: User[] = (data || []).map((item: any) => ({
        id: item.id,
        fullName: item.full_name || '',
        full_name: item.full_name,
        email: item.email,
        role: item.user_roles?.role || 'user',
        status: item.status || 'active',
        created_at: item.created_at,
        updated_at: item.updated_at,
        phone: item.phone,
        position: item.position,
        language: item.language,
        avatar: item.avatar,
        avatar_url: item.avatar,
        last_login: item.last_login,
        region_id: item.user_roles?.region_id,
        sector_id: item.user_roles?.sector_id,
        school_id: item.user_roles?.school_id,
        notification_settings: item.notification_settings
      }));

      if (page === 1) {
        setUsers(transformedUsers);
      } else {
        setUsers(prev => [...prev, ...transformedUsers]);
      }
      
      setTotalCount(count || 0);
      setHasMore(transformedUsers.length === limit);
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, userRole, regionId, sectorId]);

  const resetUsers = useCallback(() => {
    setUsers([]);
    setTotalCount(0);
    setHasMore(true);
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  return {
    users,
    loading,
    error,
    totalCount,
    hasMore,
    fetchUsers,
    resetUsers,
    refetch
  };
};

export default useOptimizedUserList;
