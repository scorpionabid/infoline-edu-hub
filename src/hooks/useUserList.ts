
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

  // İstifadəçiləri əldə etmək üçün əsas funksiya
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching users with filters:', filter);
      
      // RPC funksiyasını çağırmadan əvvəl istifadəçi rolları ilə əsas sorgunu yaratmaq
      let query = supabase.from('user_roles').select(`
        id,
        user_id,
        role,
        region_id,
        sector_id,
        school_id,
        profiles:profiles(*)
      `, { count: 'exact' });

      // Rol əsasında filtrasiya
      if (isSuperAdmin) {
        // SuperAdmin bütün istifadəçiləri görə bilər
        console.log('Superadmin user fetching all users');
      } else if (isRegionAdmin && regionId) {
        // RegionAdmin yalnız öz regionundakı istifadəçiləri görə bilər
        console.log('RegionAdmin filtering by region:', regionId);
        query = query.eq('region_id', regionId);
      } else if (isSectorAdmin && sectorId) {
        // SectorAdmin yalnız öz sektorundakı məktəblərə aid istifadəçiləri görə bilər
        console.log('SectorAdmin filtering by sector:', sectorId);
        query = query.eq('sector_id', sectorId);
        // Sadəcə məktəb adminlərini göstərmək üçün
        if (!filter.role || filter.role === '') {
          query = query.eq('role', 'schooladmin');
        }
      } else {
        // İstifadəçi heç bir rola sahib deyilsə, boş nəticə qaytaraq
        console.log('User has no admin role, returning empty result');
        setUsers([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }

      // Filter parametrləri
      if (filter.role && filter.role !== '') {
        const roleFilter = Array.isArray(filter.role) ? filter.role : [filter.role];
        query = query.in('role', roleFilter);
      }
      
      if ((filter.regionId || filter.region) && !isRegionAdmin) {
        query = query.eq('region_id', filter.regionId || filter.region);
      }
      
      if ((filter.sectorId || filter.sector) && !isSectorAdmin) {
        query = query.eq('sector_id', filter.sectorId || filter.sector);
      }
      
      if (filter.schoolId || filter.school) {
        query = query.eq('school_id', filter.schoolId || filter.school);
      }
      
      // Pagination
      const from = (currentPage - 1) * 10;
      const to = from + 9;
      query = query.range(from, to);
      
      // Order by creation date
      query = query.order('created_at', { ascending: false });
      
      // Execute query
      const { data, error: fetchError, count } = await query;
      
      if (fetchError) {
        console.error('Error fetching user_roles:', fetchError);
        throw fetchError;
      }
      
      console.log(`Found ${data?.length || 0} user_roles`);

      // Now get emails from auth.users for the found user_ids
      const userIds = data?.map(item => item.user_id) || [];
      
      // Email məlumatlarını əldə etmək üçün birbaşa sorğu
      // Bu servis sadəcə mock email verilərini qaytaracaq
      const mockEmails: Record<string, string> = {};
      userIds.forEach(id => {
        mockEmails[id] = `user-${id.substring(0, 8)}@infoline.edu.az`;
      });

      // Entity adlarını (region, sector, school) əldə etmək
      const entityNames: Record<string, Record<string, string>> = {
        regions: {},
        sectors: {},
        schools: {}
      };
      
      // Get region names
      const regionIds = Array.from(new Set(data?.filter(d => d.region_id).map(d => d.region_id) || []));
      if (regionIds.length > 0) {
        const { data: regionsData } = await supabase
          .from('regions')
          .select('id, name')
          .in('id', regionIds);
        
        if (regionsData) {
          regionsData.forEach(region => {
            entityNames.regions[region.id] = region.name;
          });
        }
      }
      
      // Get sector names
      const sectorIds = Array.from(new Set(data?.filter(d => d.sector_id).map(d => d.sector_id) || []));
      if (sectorIds.length > 0) {
        const { data: sectorsData } = await supabase
          .from('sectors')
          .select('id, name')
          .in('id', sectorIds);
        
        if (sectorsData) {
          sectorsData.forEach(sector => {
            entityNames.sectors[sector.id] = sector.name;
          });
        }
      }
      
      // Get school names
      const schoolIds = Array.from(new Set(data?.filter(d => d.school_id).map(d => d.school_id) || []));
      if (schoolIds.length > 0) {
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', schoolIds);
        
        if (schoolsData) {
          schoolsData.forEach(school => {
            entityNames.schools[school.id] = school.name;
          });
        }
      }

      // İstifadəçi məlumatlarını formatla
      const formattedUsers: FullUserData[] = data?.map(role => {
        // Extract profile data from join
        const profileData = role.profiles || {};
        
        // Entity name based on role
        let entityName = '-';
        if (role.school_id && entityNames.schools[role.school_id]) {
          entityName = entityNames.schools[role.school_id];
        } else if (role.sector_id && entityNames.sectors[role.sector_id]) {
          entityName = entityNames.sectors[role.sector_id];
        } else if (role.region_id && entityNames.regions[role.region_id]) {
          entityName = entityNames.regions[role.region_id];
        }
        
        // Mock email or real email from profile
        const email = mockEmails[role.user_id] || profileData.email || '';
        
        return {
          id: role.user_id,
          email: email,
          full_name: profileData.full_name || email.split('@')[0] || 'İsimsiz İstifadəçi',
          name: profileData.full_name || email.split('@')[0] || 'İsimsiz İstifadəçi',
          role: role.role || 'user',
          region_id: role.region_id || null,
          sector_id: role.sector_id || null,
          school_id: role.school_id || null,
          regionId: role.region_id || null,
          sectorId: role.sector_id || null,
          schoolId: role.school_id || null,
          phone: profileData.phone || '',
          position: profileData.position || '',
          language: profileData.language || 'az',
          avatar: profileData.avatar || null,
          status: profileData.status || 'active',
          last_login: profileData.last_login || null,
          lastLogin: profileData.last_login || null,
          created_at: profileData.created_at || role.created_at || new Date().toISOString(),
          updated_at: profileData.updated_at || role.updated_at || new Date().toISOString(),
          createdAt: profileData.created_at || role.created_at || new Date().toISOString(),
          updatedAt: profileData.updated_at || role.updated_at || new Date().toISOString(),
          entityName: entityName,
          notificationSettings: {
            email: true,
            system: true
          }
        };
      }) || [];

      // Search filter on client side
      if (filter.search && filter.search.trim() !== '') {
        const searchTerm = filter.search.trim().toLowerCase();
        const filteredUsers = formattedUsers.filter(user => 
          (user.full_name?.toLowerCase().includes(searchTerm)) || 
          (user.email?.toLowerCase().includes(searchTerm)) || 
          (user.phone?.toLowerCase().includes(searchTerm)) ||
          (user.entityName?.toLowerCase().includes(searchTerm))
        );
        
        setUsers(filteredUsers);
        // We don't update totalCount here since we want pagination to be based on total results
      } else {
        setUsers(formattedUsers);
      }
      
      setTotalCount(count || 0);
      setError(null);

    } catch (err) {
      console.error('Error in fetchUsers:', err);
      setError(err as Error);
      toast.error('İstifadəçi məlumatlarını əldə etmək mümkün olmadı');
      
      // Əgər əsas metod xəta verərsə, alternativ metod sınayaq
      try {
        console.log('Trying alternative fetching method...');
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .range((currentPage - 1) * 10, currentPage * 10 - 1)
          .order('created_at', { ascending: false });
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        } else if (profiles && profiles.length > 0) {
          console.log('Alternative method found profiles:', profiles.length);
          
          // Get roles for these profiles
          const profileIds = profiles.map(p => p.id);
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('*')
            .in('user_id', profileIds);
          
          // Create a map of user_id to role
          const roleMap: Record<string, any> = {};
          if (rolesData) {
            rolesData.forEach(role => {
              roleMap[role.user_id] = role;
            });
          }
          
          const altUsers = profiles.map(profile => {
            const role = roleMap[profile.id] || {};
            
            return {
              id: profile.id,
              email: profile.email || `user-${profile.id.substring(0, 8)}@infoline.edu.az`,
              full_name: profile.full_name || 'İsimsiz İstifadəçi',
              name: profile.full_name || 'İsimsiz İstifadəçi',
              role: role.role || 'user',
              region_id: role.region_id || null,
              sector_id: role.sector_id || null,
              school_id: role.school_id || null,
              regionId: role.region_id || null,
              sectorId: role.sector_id || null,
              schoolId: role.school_id || null,
              phone: profile.phone || '',
              position: profile.position || '',
              language: profile.language || 'az',
              avatar: profile.avatar || null,
              status: profile.status || 'active',
              last_login: profile.last_login || null,
              lastLogin: profile.last_login || null,
              created_at: profile.created_at || new Date().toISOString(),
              updated_at: profile.updated_at || new Date().toISOString(),
              createdAt: profile.created_at || new Date().toISOString(),
              updatedAt: profile.updated_at || new Date().toISOString(),
              entityName: '-',
              notificationSettings: {
                email: true,
                system: true
              }
            };
          });
          
          console.log('Alternative method found users:', altUsers.length);
          setUsers(altUsers);
          // We can only estimate the count with this method
          setTotalCount(altUsers.length * 10); // rough estimation
        }
      } catch (altError) {
        console.error('Alternative method also failed:', altError);
      }
    } finally {
      setLoading(false);
    }
  }, [filter, currentPage, regionId, sectorId, isSuperAdmin, isRegionAdmin, isSectorAdmin]);

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
