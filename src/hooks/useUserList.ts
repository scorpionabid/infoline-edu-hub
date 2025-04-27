
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';

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

  // RPC funkciyasını istifadə edərək istifadəçiləri əldə etmək
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching users with filters:', filter);
      
      // Parametrləri hazırla
      const params: any = {
        p_role: filter.role ? Array.isArray(filter.role) ? filter.role : [filter.role] : null,
        p_region_id: filter.regionId || filter.region || regionId || null,
        p_sector_id: filter.sectorId || filter.sector || sectorId || null,
        p_school_id: filter.schoolId || filter.school || null,
        p_status: filter.status ? Array.isArray(filter.status) ? filter.status : [filter.status] : null,
        p_search: filter.search || null,
        p_page: currentPage,
        p_limit: 10
      };

      console.log('RPC params:', params);

      // RPC funksiyanı istifadə et - bu rekursiv RLS qaydalarından qaçmağa kömək edir
      const { data, error: fetchError } = await supabase
        .rpc('get_filtered_users', params);
      
      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw fetchError;
      }

      console.log(`Found ${data?.length || 0} users`);

      // Əgər data JSON string formatında qayıdırsa
      const formattedUsers = data?.map((item: any) => {
        // JSON verilərini parse edək əgər string formatındadırsa
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
          entityName: userData.entity_name || '-',
          notificationSettings: {
            email: true,
            system: true
          }
        } as FullUserData;
      }) || [];

      // Server-side search artıq RPC funksiyasında həll olunur
      setUsers(formattedUsers);
      
      // Count-u serverdən əldə et
      const { count, error: countError } = await supabase.rpc('get_filtered_users_count', {
        p_role: filter.role ? Array.isArray(filter.role) ? filter.role : [filter.role] : null,
        p_region_id: filter.regionId || filter.region || regionId || null,
        p_sector_id: filter.sectorId || filter.sector || sectorId || null,
        p_school_id: filter.schoolId || filter.school || null,
        p_status: filter.status ? Array.isArray(filter.status) ? filter.status : [filter.status] : null,
        p_search: filter.search || null
      });

      if (countError) {
        console.warn('Error fetching user count:', countError);
        setTotalCount(formattedUsers.length);
      } else {
        setTotalCount(count || formattedUsers.length);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err as Error);
      setUsers([]);
      
      // Yalnız xəta baş verəndə alternate sorğu metodunu sınayaq
      // region və sektor adminləri üçün xüsusi sorğu
      try {
        console.log('Trying alternative fetching method...');
        
        // Səlahiyyətləri əsasında tarix seç
        let query = supabase.from('user_roles').select('*');
        
        if (isRegionAdmin && regionId) {
          query = query.eq('region_id', regionId);
        } else if (isSectorAdmin && sectorId) {
          query = query.eq('sector_id', sectorId);
        }
        
        const { data: rolesData, error: rolesError } = await query;
        
        if (rolesError) {
          console.error('Alternative method error:', rolesError);
          throw rolesError;
        }
        
        if (rolesData && rolesData.length > 0) {
          // Bu istifadəçi ID-ləri üçün profilləri əldə et
          const userIds = rolesData.map(role => role.user_id);
          
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);
            
          // Verilərdi birləşdirib formatla
          const altUsers = rolesData.map(role => {
            const profile = profilesData?.find(p => p.id === role.user_id) || {};
            
            return {
              id: role.user_id,
              email: profile.email || '',
              full_name: profile.full_name || '',
              name: profile.full_name || '',
              role: role.role || 'user',
              region_id: role.region_id,
              sector_id: role.sector_id,
              school_id: role.school_id,
              regionId: role.region_id,
              sectorId: role.sector_id,
              schoolId: role.school_id,
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
          });
          
          console.log('Alternative method found users:', altUsers.length);
          setUsers(altUsers);
          setTotalCount(altUsers.length);
        }
      } catch (altError) {
        console.error('Alternative method failed:', altError);
        toast.error('İstifadəçi məlumatlarını əldə etmək mümkün olmadı');
      }
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, regionId, sectorId, isRegionAdmin, isSectorAdmin, isSuperAdmin]);

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
