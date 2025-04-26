
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

  const { isSectorAdmin, isRegionAdmin, isSuperAdmin, sectorId, regionId } = usePermissions();

  // Userləri çəkmək üçün optimizə edilmiş funksiya
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching users with filters:', filter);
      
      // İstifadəçi roluna əsasən sorğu yaradılması
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles (
            id,
            role,
            region_id,
            sector_id,
            school_id
          )
        `, { count: 'exact' });

      // SuperAdmin üçün hər hansı bir əlavə filter yoxdur
      if (isSuperAdmin) {
        console.log('Querying as SuperAdmin');
      } 
      // RegionAdmin öz regionunda olan istifadəçiləri görə bilər
      else if (isRegionAdmin && regionId) {
        console.log('Querying as RegionAdmin for region:', regionId);
        query = query.eq('user_roles.region_id', regionId);
      } 
      // SectorAdmin öz sektorunda olan məktəblərin adminlərini görə bilər
      else if (isSectorAdmin && sectorId) {
        console.log('Querying as SectorAdmin for sector:', sectorId);
        query = query.eq('user_roles.sector_id', sectorId)
                     .eq('user_roles.role', 'schooladmin');
      } 
      // Digər istifadəçilər yalnız özlərini görə bilərlər
      else {
        console.log('Querying as regular user');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('İstifadəçi tapılmadı');
        }
        query = query.eq('id', user.id);
      }

      // Əlavə filterlər tətbiq et
      if (filter.role && filter.role.length > 0) {
        if (Array.isArray(filter.role)) {
          query = query.in('user_roles.role', filter.role);
        } else {
          query = query.eq('user_roles.role', filter.role);
        }
      }

      if (filter.region && filter.region.length > 0) {
        if (Array.isArray(filter.region)) {
          query = query.in('user_roles.region_id', filter.region);
        } else {
          query = query.eq('user_roles.region_id', filter.region);
        }
      }

      if (filter.sector && filter.sector.length > 0) {
        if (Array.isArray(filter.sector)) {
          query = query.in('user_roles.sector_id', filter.sector);
        } else {
          query = query.eq('user_roles.sector_id', filter.sector);
        }
      }

      if (filter.school && filter.school.length > 0) {
        if (Array.isArray(filter.school)) {
          query = query.in('user_roles.school_id', filter.school);
        } else {
          query = query.eq('user_roles.school_id', filter.school);
        }
      }

      if (filter.status && filter.status.length > 0) {
        if (Array.isArray(filter.status)) {
          query = query.in('status', filter.status);
        } else {
          query = query.eq('status', filter.status);
        }
      }

      // Sorğunu icra et
      console.log('Executing user query...');
      const { data, error: fetchError, count } = await query;
      
      if (fetchError) {
        console.error('Error fetching users:', fetchError);
        throw fetchError;
      }
      
      console.log(`Found ${data?.length || 0} users`);

      // Məlumatları formatla
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
      if (filter.search && filter.search.trim() !== '') {
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
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, isSectorAdmin, isRegionAdmin, isSuperAdmin, sectorId, regionId]);

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
