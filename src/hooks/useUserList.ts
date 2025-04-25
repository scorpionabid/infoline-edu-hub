import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';

export interface UserFilter {
  role: string[] | string;
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
  const [filter, setFilter] = useState<UserFilter>({
    role: '',
  });

  const { isSectorAdmin, isRegionAdmin, sectorId, regionId } = usePermissions();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('useUserList hook: fetchUsers çağırıldı');
      
      // Əvvəlcə cari sessiyanı yoxlayaq
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('Aktiv sessiya tapılmadı');
        setError(new Error('Aktiv sessiya tapılmadı. Zəhmət olmasa yenidən daxil olun.'));
        setLoading(false);
        return;
      }
      
      console.log('Aktiv sessiya tapıldı, token mövcuddur');
      
      // Sorğunu user_roles cədvəlindən başlayaq, çünki region_id, sector_id və school_id sütunları buradadır
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profiles(*)
        `, { count: 'exact' });
      
      // Filtirləri tətbiq edək
      if (filter.role && filter.role !== '') {
        if (Array.isArray(filter.role)) {
          if (filter.role.length > 0) {
            query = query.in('role', filter.role);
          }
        } else {
          query = query.eq('role', filter.role);
        }
      }
      
      if (filter.region && filter.region !== '') {
        if (Array.isArray(filter.region)) {
          if (filter.region.length > 0) {
            query = query.in('region_id', filter.region);
          }
        } else {
          query = query.eq('region_id', filter.region);
        }
      }
      
      if (filter.sector && filter.sector !== '') {
        if (Array.isArray(filter.sector)) {
          if (filter.sector.length > 0) {
            query = query.in('sector_id', filter.sector);
          }
        } else {
          query = query.eq('sector_id', filter.sector);
        }
      }
      
      if (filter.school && filter.school !== '') {
        if (Array.isArray(filter.school)) {
          if (filter.school.length > 0) {
            query = query.in('school_id', filter.school);
          }
        } else {
          query = query.eq('school_id', filter.school);
        }
      }
      
      if (filter.status && filter.status !== '') {
        if (Array.isArray(filter.status)) {
          if (filter.status.length > 0) {
            query = query.in('profiles.status', filter.status);
          }
        } else {
          query = query.eq('profiles.status', filter.status);
        }
      }
      
      // SectorAdmin üçün - onun sektorunda olan məktəb adminlərini filtirlə
      if (isSectorAdmin && sectorId) {
        console.log('SectorAdmin üçün filterləmə: Sector ID =', sectorId);
        query = query
          .eq('sector_id', sectorId)
          .eq('role', 'schooladmin');
      }

      // RegionAdmin üçün - onun regionunda olan istifadəçiləri filtirlə
      else if (isRegionAdmin && regionId) {
        console.log('RegionAdmin üçün filterləmə: Region ID =', regionId);
        query = query.eq('region_id', regionId);
      }
      
      console.log('Sorğu hazırlanır...');
      const { data, error: fetchError, count } = await query;
      
      if (fetchError) {
        console.error('Sorğu xətası:', fetchError);
        throw fetchError;
      }
      
      console.log('Əldə edilmiş data sayı:', data?.length || 0);
      console.log('İlk nəticə nümunəsi:', data && data.length > 0 ? JSON.stringify(data[0]).slice(0, 200) + '...' : 'Boş');
      
      if (!data || data.length === 0) {
        setUsers([]);
        setTotalCount(0);
        setError(null);
        setLoading(false);
        return;
      }
      
      // İstifadəçi məlumatlarını format edək
      const formattedUsers = data?.map(item => {
        // profiles artıq bir obyekt olacaq, array deyil
        if (!item.profiles) {
          console.error('Profile məlumatları tapılmadı:', item);
          return null;
        }
        
        const profile = item.profiles;
        console.log('Profile məlumatları:', profile);
        
        return {
          id: item.user_id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          name: profile.full_name || '',
          role: item.role,
          region_id: item.region_id,
          sector_id: item.sector_id,
          school_id: item.school_id,
          regionId: item.region_id,
          sectorId: item.sector_id,
          schoolId: item.school_id,
          status: profile.status || 'active',
          phone: profile.phone || '',
          position: profile.position || '',
          language: profile.language || 'az',
          avatar: profile.avatar || '',
          last_login: profile.last_login || '',
          lastLogin: profile.last_login || '',
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          notificationSettings: {
            email: true,
            system: true
          },
          twoFactorEnabled: false
        };
      }).filter(Boolean) || [];

      // Client tərəfdə axtarış filtrini tətbiq edək
      let filteredUsers = formattedUsers;
      
      if (filter.search && filter.search.trim() !== '') {
        const searchTerm = filter.search.trim().toLowerCase();
        console.log('Axtarış üçün filtirlənir:', searchTerm);
        
        filteredUsers = formattedUsers.filter(user => 
          (user.full_name?.toLowerCase().includes(searchTerm)) ||
          (user.email?.toLowerCase().includes(searchTerm)) ||
          (user.phone?.toLowerCase().includes(searchTerm)) ||
          (user.position?.toLowerCase().includes(searchTerm))
        );
        
        console.log('Axtarışdan sonra istifadəçi sayı:', filteredUsers.length);
      }

      setUsers(filteredUsers);
      setTotalCount(count || filteredUsers.length);
      setError(null);
    } catch (err) {
      console.error('Istifadəçilər əldə edilərkən xəta:', err);
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
    setFilter({
      role: '',
    });
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    console.log('useUserList hook: useEffect çağırıldı. CurrentPage:', currentPage);
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
    fetchUsers
  };
};
