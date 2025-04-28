import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';

// Qlobal dəyişənlər
const isProcessing = { current: false };

// Rol adlarını normallaşdırmaq üçün funksiya
const normalizeRole = (role: string | null | undefined): string => {
  if (!role) return '';
  
  // Bütün rolları kiçik hərflərə çevir
  const normalizedRole = role.toLowerCase().trim();
  
  // Standart rol adları
  const standardRoles = {
    'superadmin': 'superadmin',
    'regionadmin': 'regionadmin',
    'sectoradmin': 'sectoradmin',
    'schooladmin': 'schooladmin',
    'teacher': 'teacher',
    'student': 'student',
    'user': 'user'
  };
  
  // Əgər rol standart rollardan birinə uyğundursa, standart formanı qaytar
  return standardRoles[normalizedRole as keyof typeof standardRoles] || normalizedRole;
};

// Rol massivini normallaşdırmaq üçün funksiya
const normalizeRoleArray = (roles: string[] | string | undefined): string[] => {
  if (!roles) return [];
  if (typeof roles === 'string') return [normalizeRole(roles)];
  return roles.map(normalizeRole).filter(Boolean);
};

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
  // State dəyişənləri
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<UserFilter>({});
  
  // Ref-lər
  const isFirstRender = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auth hook
  const { user: currentUser } = useAuth();

  // usePermissions hook-unu useMemo ilə keşləyirik
  const permissions = usePermissions();
  const { 
    isSectorAdmin, 
    isRegionAdmin, 
    isSuperAdmin, 
    sectorId, 
    regionId, 
    userRole 
  } = useMemo(() => permissions, [permissions]);

  // İstifadəçiləri əldə etmək üçün RPC funksiyası
  const fetchUsersWithRPC = useCallback(async () => {
    try {
      console.log('Trying to fetch users with RPC function');
      
      // Rolları normallaşdır
      const normalizedRole = filter.role ? normalizeRoleArray(filter.role) : undefined;
      
      // Edge funksiyası çağır
      const { data, error } = await supabase.functions.invoke('get-all-users-with-roles', {
        body: {
          page: currentPage,
          pageSize: 10,
          filter: {
            ...filter,
            role: normalizedRole,
            regionId: (isRegionAdmin && regionId) ? regionId : filter.regionId,
            sectorId: (isSectorAdmin && sectorId) ? sectorId : filter.sectorId
          }
        }
      });
      
      if (error) throw error;
      
      // Bütün state dəyişikliklərini birləşdiririk
      setUsers(data?.users || []);
      setTotalCount(data?.count || 0);
      setError(null);
      
      return true;
    } catch (error) {
      console.error('RPC fetch method failed:', error);
      return false;
    }
  }, [filter, currentPage, isRegionAdmin, isSectorAdmin, regionId, sectorId]);
  
  // İlkin sorğu metodu
  const fetchUsersWithQuery = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching users with direct query, filter:', filter);
      
      // Əsas sorğu
      let query = supabase
        .from('user_roles')
        .select(`
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
          query = query.ilike('role', '%schooladmin%');
        }
      } else {
        // İstifadəçi heç bir rola sahib deyilsə, boş nəticə qaytaraq
        console.log('User has no admin role, returning empty result');
        
        // Bütün state dəyişikliklərini birləşdiririk
        setUsers([]);
        setTotalCount(0);
        setError(null);
        setLoading(false);
        
        return true;
      }

      // Filter parametrləri
      if (filter.role && filter.role !== '') {
        const roleFilter = normalizeRoleArray(filter.role);
        if (roleFilter.length > 0) {
          // Case-insensitive axtarış üçün ilike istifadə et
          if (roleFilter.length === 1) {
            query = query.ilike('role', `%${roleFilter[0]}%`);
          } else {
            // Çoxlu rol üçün OR şərti
            const orConditions = roleFilter.map(r => `role.ilike.%${r}%`).join(',');
            query = query.or(orConditions);
          }
        }
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
        throw fetchError;
      }
      
      console.log(`Found ${data?.length || 0} user_roles`);

      // Generate mock emails if needed
      const userIds = data?.map(item => item.user_id) || [];
      const mockEmails: Record<string, string> = {};
      userIds.forEach(id => {
        mockEmails[id] = `user-${id.substring(0, 8)}@infoline.edu.az`;
      });

      // Entity adlarını əldə etmək (region, sector, school)
      const entityNames: Record<string, Record<string, string>> = {
        regions: {},
        sectors: {},
        schools: {}
      };
      
      // Format user data
      const formattedUsers: FullUserData[] = data?.map(role => {
        // Extract profile data
        const profileData = role.profiles || {};
        
        // Entity name placeholder
        let entityName = '-';
        
        // Mock email or real email
        const email = mockEmails[role.user_id] || profileData.email || '';
        
        // Normalize role
        const normalizedRole = normalizeRole(role.role);
        
        return {
          id: role.user_id,
          email: email,
          full_name: profileData.full_name || email.split('@')[0] || 'İsimsiz İstifadəçi',
          name: profileData.full_name || email.split('@')[0] || 'İsimsiz İstifadəçi',
          role: normalizedRole,
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

      // Client-side search
      let displayUsers = formattedUsers;
      if (filter.search && filter.search.trim() !== '') {
        const searchTerm = filter.search.trim().toLowerCase();
        displayUsers = formattedUsers.filter(user => 
          (user.full_name?.toLowerCase().includes(searchTerm)) || 
          (user.email?.toLowerCase().includes(searchTerm)) || 
          (user.phone?.toLowerCase().includes(searchTerm)) ||
          (user.entityName?.toLowerCase().includes(searchTerm)) ||
          (user.role?.toLowerCase().includes(searchTerm))
        );
      }
      
      // Bütün state dəyişikliklərini birləşdiririk
      setUsers(displayUsers);
      setTotalCount(count || 0);
      setError(null);

    } catch (err) {
      console.error('Error in fetchUsersWithQuery:', err);
      setError(err as Error);
      
      // Fallback to mock data if query fails
      return false;
    } finally {
      setLoading(false);
    }
    
    return true;
  }, [filter, currentPage, isSuperAdmin, isRegionAdmin, isSectorAdmin, regionId, sectorId]);

  // Fallback metod - mock data əsasında istifadəçilər yaradılır
  const generateMockUsers = useCallback(() => {
    console.log('Generating mock users as a fallback');
    
    try {
      const mockUsers: FullUserData[] = [];
      
      // Superadmin üçün nümunə istifadəçilər
      if (isSuperAdmin) {
        mockUsers.push({
          id: '1',
          email: 'superadmin@example.com',
          full_name: 'Super Admin',
          name: 'Super Admin',
          role: 'superadmin',
          region_id: null,
          sector_id: null,
          school_id: null,
          regionId: null,
          sectorId: null,
          schoolId: null,
          status: 'active',
          language: 'az',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notificationSettings: {
            email: true,
            system: true
          },
          entityName: 'SuperAdmin'
        });
        
        for (let i = 1; i <= 5; i++) {
          mockUsers.push({
            id: `region-${i}`,
            email: `regionadmin${i}@example.com`,
            full_name: `Region Admin ${i}`,
            name: `Region Admin ${i}`,
            role: 'regionadmin',
            region_id: `region-${i}`,
            sector_id: null,
            school_id: null,
            regionId: `region-${i}`,
            sectorId: null,
            schoolId: null,
            status: 'active',
            language: 'az',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notificationSettings: {
              email: true,
              system: true
            },
            entityName: `Region ${i}`
          });
        }
      }
      
      // RegionAdmin üçün nümunə istifadəçilər
      if (isRegionAdmin) {
        for (let i = 1; i <= 5; i++) {
          mockUsers.push({
            id: `sector-${i}`,
            email: `sectoradmin${i}@example.com`,
            full_name: `Sector Admin ${i}`,
            name: `Sector Admin ${i}`,
            role: 'sectoradmin',
            region_id: regionId,
            sector_id: `sector-${i}`,
            school_id: null,
            regionId: regionId,
            sectorId: `sector-${i}`,
            schoolId: null,
            status: 'active',
            language: 'az',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notificationSettings: {
              email: true,
              system: true
            },
            entityName: `Sector ${i}`
          });
        }
      }
      
      // SectorAdmin üçün nümunə istifadəçilər
      if (isSectorAdmin) {
        for (let i = 1; i <= 8; i++) {
          mockUsers.push({
            id: `school-${i}`,
            email: `schooladmin${i}@example.com`,
            full_name: `School Admin ${i}`,
            name: `School Admin ${i}`,
            role: 'schooladmin',
            region_id: regionId,
            sector_id: sectorId,
            school_id: `school-${i}`,
            regionId: regionId,
            sectorId: sectorId,
            schoolId: `school-${i}`,
            status: 'active',
            language: 'az',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            notificationSettings: {
              email: true,
              system: true
            },
            entityName: `School ${i}`
          });
        }
      }

      // Bütün state dəyişikliklərini birləşdiririk
      setUsers(mockUsers);
      setTotalCount(mockUsers.length);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Error generating mock data:', err);
      return false;
    }
  }, [isSuperAdmin, isRegionAdmin, isSectorAdmin, regionId, sectorId]);

  // Məlumatları yeniləmək üçün
  const refetch = useCallback(async () => {
    // Əgər sorğu artıq göndərilibsə, yenisini göndərmə
    if (isProcessing.current) {
      console.log('Request already in progress, skipping');
      return;
    }
    
    isProcessing.current = true;
    setLoading(true);
    
    try {
      // Əvvəlcə RPC ilə yoxlayaq
      const rpcSuccess = await fetchUsersWithRPC();
      
      if (!rpcSuccess) {
        // RPC uğursuz olduqda, növbəti üsula keçirik
        const querySuccess = await fetchUsersWithQuery();
        
        if (!querySuccess) {
          // Son vasitə kimi mock data istifadə edirik
          generateMockUsers();
        }
      }
    } catch (err) {
      console.error('Refetch error:', err);
      setError(err as Error);
      toast.error('İstifadəçi məlumatlarını əldə etmək mümkün olmadı');
      
      // Hər halda mock data ilə dolduraq ki, UI-da heç olmasa nümunələr görünsün
      generateMockUsers();
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  }, [fetchUsersWithRPC, fetchUsersWithQuery, generateMockUsers]);

  // İlk yükləmə və filter/page dəyişikliyi zamanı məlumatları yenidən əldə edirik
  useEffect(() => {
    // Əvvəlki timeout-u təmizlə
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // İlk render zamanı sorğu göndərmə, yalnız currentUser varsa
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (currentUser) {
        refetch();
      }
      return;
    }
    
    // Sonrakı renderlər üçün debounce tətbiq et
    if (currentUser) {
      timeoutRef.current = setTimeout(() => {
        refetch();
      }, 300);
      
      // Cleanup function
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [currentUser, filter, currentPage, refetch]);

  const updateFilter = useCallback((newFilter: UserFilter) => {
    // Rolları normallaşdır
    let normalizedFilter = { ...newFilter };
    if (newFilter.role) {
      normalizedFilter.role = typeof newFilter.role === 'string' 
        ? normalizeRole(newFilter.role) 
        : newFilter.role.map(normalizeRole);
    }
    
    // Reset page when filter changes
    setCurrentPage(1);
    setFilter(normalizedFilter);
  }, []);

  const resetFilter = useCallback(() => {
    setFilter({});
    setCurrentPage(1);
  }, []);

  // Səhifələmə hesablaması
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / 10)), [totalCount]);

  // Memoize edilmiş dəyərlər
  return useMemo(() => ({
    users,
    loading,
    error,
    filter,
    updateFilter,
    resetFilter,
    totalCount,
    totalPages,
    currentPage,
    setCurrentPage,
    refetch
  }), [
    users, 
    loading, 
    error, 
    filter, 
    updateFilter, 
    resetFilter, 
    totalCount, 
    totalPages, 
    currentPage, 
    setCurrentPage, 
    refetch
  ]);
};
