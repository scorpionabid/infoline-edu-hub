import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { FullUserData } from '@/types/user';
import { UserRole } from '@/types/supabase';
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
      
      if (data && Array.isArray(data.users)) {
        // Bütün state dəyişikliklərini birləşdiririk
        setUsers(data.users as FullUserData[]);
        setTotalCount(data.totalCount || data.users.length);
        setError(null);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error in fetchUsersWithRPC:', err);
      return false;
    }
  }, [filter, currentPage, isRegionAdmin, isSectorAdmin, regionId, sectorId]);

  // İlkin sorğu metodu - optimallaşdırılmış versiya
  const fetchUsersWithQuery = useCallback(async () => {
    try {
      console.log('Fetching users with direct query');
      
      // user_roles cədvəlindən məlumatları əldə edirik
      let query = supabase
        .from('user_roles')
        .select('id, user_id, role, region_id, sector_id, school_id', { count: 'exact' });
      
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
      query = query.order('id', { ascending: false });
      
      // Execute query
      const { data: roleData, error: fetchError, count } = await query;
      
      if (fetchError) {
        throw fetchError;
      }
      
      console.log(`Found ${roleData?.length || 0} user_roles`);
      
      if (!roleData || roleData.length === 0) {
        setUsers([]);
        setTotalCount(0);
        return true;
      }
      
      // Bütün istifadəçi ID-lərini bir dəfəyə əldə edirik
      const userIds = roleData.map(item => item.user_id).filter(Boolean);
      
      // Bütün profil məlumatlarını bir sorğuda əldə edirik
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, position, language, avatar, status, last_login, created_at, updated_at')
        .in('id', userIds);
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Profil məlumatlarını ID-yə görə map edirik
      const profilesMap: Record<string, any> = {};
      profilesData?.forEach(profile => {
        profilesMap[profile.id] = profile;
      });
      
      // Region, sektor və məktəb adlarını əldə edirik
      const regionIds = Array.from(new Set(roleData.filter(d => d.region_id).map(d => d.region_id)));
      const sectorIds = Array.from(new Set(roleData.filter(d => d.sector_id).map(d => d.sector_id)));
      const schoolIds = Array.from(new Set(roleData.filter(d => d.school_id).map(d => d.school_id)));
      
      // Entity adlarını saxlamaq üçün obyekt
      const entityNames: Record<string, Record<string, string>> = {
        regions: {},
        sectors: {},
        schools: {}
      };
      
      // Region adlarını bir sorğuda əldə edirik
      if (regionIds.length > 0) {
        const { data: regionsData } = await supabase
          .from('regions')
          .select('id, name')
          .in('id', regionIds);
        
        regionsData?.forEach(region => {
          entityNames.regions[region.id] = region.name;
        });
      }
      
      // Sektor adlarını bir sorğuda əldə edirik
      if (sectorIds.length > 0) {
        const { data: sectorsData } = await supabase
          .from('sectors')
          .select('id, name')
          .in('id', sectorIds);
        
        sectorsData?.forEach(sector => {
          entityNames.sectors[sector.id] = sector.name;
        });
      }
      
      // Məktəb adlarını bir sorğuda əldə edirik
      if (schoolIds.length > 0) {
        const { data: schoolsData } = await supabase
          .from('schools')
          .select('id, name')
          .in('id', schoolIds);
        
        schoolsData?.forEach(school => {
          entityNames.schools[school.id] = school.name;
        });
      }
      
      // İstifadəçi məlumatlarını birləşdiririk
      const formattedUsers = roleData.map(role => {
        const profile = profilesMap[role.user_id] || {};
        
        // Entity name based on role
        let entityName = '-';
        if (role.school_id && entityNames.schools[role.school_id]) {
          entityName = entityNames.schools[role.school_id];
        } else if (role.sector_id && entityNames.sectors[role.sector_id]) {
          entityName = entityNames.sectors[role.sector_id];
        } else if (role.region_id && entityNames.regions[role.region_id]) {
          entityName = entityNames.regions[role.region_id];
        }
        
        return {
          id: role.user_id,
          email: profile.email || `user-${role.user_id.substring(0, 8)}@infoline.edu.az`,
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          name: profile.full_name || 'İsimsiz İstifadəçi',
          role: role.role as UserRole,
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
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
          createdAt: profile.created_at || new Date().toISOString(),
          updatedAt: profile.updated_at || new Date().toISOString(),
          notificationSettings: {
            email: true,
            system: true
          }
        };
      });

      // Client-side search
      let displayUsers = formattedUsers;
      if (filter.search && filter.search.trim() !== '') {
        const searchTerm = filter.search.trim().toLowerCase();
        displayUsers = formattedUsers.filter(user => 
          (user.full_name?.toLowerCase().includes(searchTerm)) || 
          (user.email?.toLowerCase().includes(searchTerm)) || 
          (user.phone?.toLowerCase().includes(searchTerm)) ||
          (user.role?.toLowerCase().includes(searchTerm))
        );
      }
      
      // Bütün state dəyişikliklərini birləşdiririk
      setUsers(displayUsers as FullUserData[]);
      setTotalCount(count || 0);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Error in fetchUsersWithQuery:', err);
      setError(err as Error);
      
      // Xəta halında boş siyahı göstər
      setUsers([]);
      setTotalCount(0);
      toast.error(`İstifadəçi məlumatlarını əldə etmək mümkün olmadı: ${(err as Error).message}`);
      
      return false;
    }
  }, [filter, currentPage, isSuperAdmin, isRegionAdmin, isSectorAdmin, regionId, sectorId]);
      
  // Yeniləmə metodu
  const refetch = useCallback(async () => {
    isProcessing.current = true;
    setLoading(true);
    
    try {
      // Əvvəlcə RPC ilə yoxlayaq
      const rpcSuccess = await fetchUsersWithRPC();
      
      if (!rpcSuccess) {
        // RPC uğursuz olduqda, növbəti üsula keçirik
        await fetchUsersWithQuery();
      }
    } catch (err) {
      console.error('Refetch error:', err);
      setError(err as Error);
      toast.error('İstifadəçi məlumatlarını əldə etmək mümkün olmadı');
      
      // Xəta halında boş siyahı göstər
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      isProcessing.current = false;
    }
  }, [fetchUsersWithRPC, fetchUsersWithQuery]);

  // İlk yükləmə və filter/page dəyişikliyi zamanı məlumatları yenidən əldə edirik
  useEffect(() => {
    // Əvvəlki timeout-u təmizlə
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Əgər sorğu artıq göndərilibsə, yenisini göndərmə
    if (isProcessing.current) {
      console.log('Request already in progress, skipping useEffect trigger');
      return;
    }
    
    // İlk render zamanı sorğu göndərmə, yalnız currentUser varsa
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (currentUser) {
        // İlk yükləmədə dərhal sorğu göndərmək əvəzinə kiçik bir gecikmə əlavə edirik
        // Bu, komponentlərin tam yüklənməsini təmin edir
        setTimeout(() => {
          refetch();
        }, 100);
      }
      return;
    }
    
    // Sonrakı renderlər üçün debounce tətbiq et
    if (currentUser) {
      timeoutRef.current = setTimeout(() => {
        refetch();
      }, 500); // Debounce müddətini 300ms-dən 500ms-ə artırırıq
      
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
