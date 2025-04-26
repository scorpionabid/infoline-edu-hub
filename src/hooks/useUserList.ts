
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { User, FullUserData } from '@/types/user';

export interface UserFilter {
  role?: string[] | string;
  region?: string[] | string;
  sector?: string[] | string;
  school?: string[] | string;
  search?: string;
  status?: string[] | string;
}

export const useUserList = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<UserFilter>({});

  const { isSectorAdmin, isRegionAdmin, sectorId, regionId } = usePermissions();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            role,
            region_id,
            sector_id,
            school_id
          )
        `, { count: 'exact' });

      // Filter tətbiq et
      if (filter.role) {
        if (Array.isArray(filter.role)) {
          query = query.in('user_roles.role', filter.role);
        } else {
          query = query.eq('user_roles.role', filter.role);
        }
      }

      // Region filterləməsi
      if (filter.region) {
        if (Array.isArray(filter.region)) {
          query = query.in('user_roles.region_id', filter.region);
        } else {
          query = query.eq('user_roles.region_id', filter.region);
        }
      }

      // Sektor filterləməsi
      if (filter.sector) {
        if (Array.isArray(filter.sector)) {
          query = query.in('user_roles.sector_id', filter.sector);
        } else {
          query = query.eq('user_roles.sector_id', filter.sector);
        }
      }

      // İxtisaslaşmış filterlər tətbiq et
      if (isSectorAdmin && sectorId) {
        query = query
          .eq('user_roles.sector_id', sectorId)
          .eq('user_roles.role', 'schooladmin');
      } else if (isRegionAdmin && regionId) {
        query = query.eq('user_roles.region_id', regionId);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Format data
      const formattedUsers = data?.map(profile => {
        const userRole = profile.user_roles?.[0];
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          name: profile.full_name,
          role: userRole?.role || 'user',
          region_id: userRole?.region_id,
          sector_id: userRole?.sector_id,
          school_id: userRole?.school_id,
          regionId: userRole?.region_id,
          sectorId: userRole?.sector_id,
          schoolId: userRole?.school_id,
          phone: profile.phone || '',
          position: profile.position || '',
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: profile.status || 'active',
          last_login: profile.last_login,
          lastLogin: profile.last_login,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          notificationSettings: {
            email: true,
            system: true
          }
        } as FullUserData;
      }) || [];

      // Client-side search
      let filteredUsers = formattedUsers;
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredUsers = formattedUsers.filter(user => 
          user.full_name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm)
        );
      }

      setUsers(filteredUsers);
      setTotalCount(count || filteredUsers.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filter, isSectorAdmin, isRegionAdmin, sectorId, regionId]);

  const updateFilter = useCallback((newFilter: Partial<UserFilter>) => {
    setFilter(prev => ({...prev, ...newFilter}));
    setCurrentPage(1);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, currentPage]);

  return {
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages: Math.ceil(totalCount / 10),
    currentPage,
    setCurrentPage,
    refetch: fetchUsers
  };
};
