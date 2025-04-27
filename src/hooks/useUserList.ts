
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';

export interface UserFilter {
  role?: string[] | string;
  region?: string[] | string;
  sector?: string[] | string;
  school?: string[] | string;
  search?: string;
  status?: string[] | string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export const useUserList = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<UserFilter>({});

  const { isSectorAdmin, isRegionAdmin, isSuperAdmin, sectorId, regionId } = usePermissions();

  // Userləri çəkmək üçün optimizə edilmiş funksiya
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching users with filters:', filter);
      
      // İstifadəçiləri JSONb formatında almaq üçün funksiyanı çağırmaq
      const { data, error: fetchError } = await supabase
        .rpc('get_filtered_users', {
          p_role: filter.role ? Array.isArray(filter.role) ? filter.role : [filter.role] : null,
          p_region_id: filter.regionId || filter.region || regionId || null,
          p_sector_id: filter.sectorId || filter.sector || sectorId || null,
          p_school_id: filter.schoolId || filter.school || null,
          p_status: filter.status ? Array.isArray(filter.status) ? filter.status : [filter.status] : null,
          p_search: filter.search || null,
          p_page: currentPage,
          p_limit: 10
        });
      
      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw fetchError;
      }
      
      console.log(`Found ${data?.length || 0} users`);

      // Məlumatları formatla
      const formattedUsers = data?.map((item: any) => {
        // JSON verilərini parse edək
        const userData = typeof item === 'string' ? JSON.parse(item) : item;
        
        return {
          id: userData.id,
          email: userData.email || '',
          full_name: userData.full_name || userData.name || '',
          name: userData.name || userData.full_name || '',
          role: userData.role || 'user',
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          regionId: userData.region_id,
          sectorId: userData.sector_id,
          schoolId: userData.school_id,
          phone: userData.phone || '',
          position: userData.position || '',
          language: userData.language || 'az',
          avatar: userData.avatar,
          status: userData.status || 'active',
          last_login: userData.last_login,
          lastLogin: userData.last_login,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
          entityName: userData.entity_name || '-', // Entity adını əlavə edirik
          notificationSettings: {
            email: true,
            system: true
          }
        } as FullUserData;
      }) || [];

      // Client-side search əgər server-side axtarış işləmirsə
      let filteredUsers = formattedUsers;
      if (filter.search && filter.search.trim() !== '' && formattedUsers.length > 0) {
        const searchTerm = filter.search.toLowerCase();
        filteredUsers = formattedUsers.filter(user => 
          user.full_name?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.phone?.toLowerCase().includes(searchTerm)
        );
      }

      setUsers(filteredUsers);
      
      // Count-u serverdən əldə et
      const { count } = await supabase.rpc('get_filtered_users_count', {
        p_role: filter.role ? Array.isArray(filter.role) ? filter.role : [filter.role] : null,
        p_region_id: filter.regionId || filter.region || regionId || null,
        p_sector_id: filter.sectorId || filter.sector || sectorId || null,
        p_school_id: filter.schoolId || filter.school || null,
        p_status: filter.status ? Array.isArray(filter.status) ? filter.status : [filter.status] : null,
        p_search: filter.search || null
      });
      
      setTotalCount(count || filteredUsers.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, isSectorAdmin, isRegionAdmin, isSuperAdmin, sectorId, regionId]);

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
  }, [fetchUsers]);

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
