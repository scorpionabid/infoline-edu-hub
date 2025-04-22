import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, UserRole } from '@/types/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserFilter } from '@/hooks/useUserList';

export const useUserFetch = (
  filter: UserFilter,
  currentPage: number,
  pageSize: number
) => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const { session } = useAuth();
  const { isRegionAdmin, isSectorAdmin, isSuperAdmin, currentUser } = usePermissions();
  
  // JWT token əldə etmək üçün köməkçi funksiya
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Session varsa, token əlavə edirik
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    } else {
      console.warn('No access token available, using only API key');
    }
    
    return headers;
  }, [session]);

  // Region, sektor və məktəb məlumatlarını əldə etmək üçün köməkçi funksiya
  const fetchEntityNames = async (rolesData: any[], headers?: Record<string, string>) => {
    try {
      const regionIds = Array.from(new Set(rolesData.filter(r => r.region_id).map(r => r.region_id)));
      const sectorIds = Array.from(new Set(rolesData.filter(r => r.sector_id).map(r => r.sector_id)));
      const schoolIds = Array.from(new Set(rolesData.filter(r => r.school_id).map(r => r.school_id)));
      
      const regionNames: Record<string, string> = {};
      const sectorNames: Record<string, string> = {};
      const schoolNames: Record<string, string> = {};
      
      // Region adlarını əldə et
      if (regionIds.length > 0) {
        const regionsQuery = supabase
          .from('regions')
          .select('id, name')
          .in('id', regionIds);
        
        // Headers-i tətbiq et
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            if (value) regionsQuery.headers[key] = value;
          });
        }
        
        const { data: regionsData } = await regionsQuery;
        
        if (regionsData) {
          regionsData.forEach((region: any) => {
            regionNames[region.id] = region.name;
          });
        }
      }
      
      // Sektor adlarını əldə et
      if (sectorIds.length > 0) {
        const sectorsQuery = supabase
          .from('sectors')
          .select('id, name')
          .in('id', sectorIds);
        
        // Headers-i tətbiq et
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            if (value) sectorsQuery.headers[key] = value;
          });
        }
        
        const { data: sectorsData } = await sectorsQuery;
        
        if (sectorsData) {
          sectorsData.forEach((sector: any) => {
            sectorNames[sector.id] = sector.name;
          });
        }
      }
      
      // Məktəb adlarını əldə et
      if (schoolIds.length > 0) {
        const schoolsQuery = supabase
          .from('schools')
          .select('id, name')
          .in('id', schoolIds);
        
        // Headers-i tətbiq et
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            if (value) schoolsQuery.headers[key] = value;
          });
        }
        
        const { data: schoolsData } = await schoolsQuery;
        
        if (schoolsData) {
          schoolsData.forEach((school: any) => {
            schoolNames[school.id] = school.name;
          });
        }
      }
      
      return { regionNames, sectorNames, schoolNames };
    } catch (error) {
      console.error('Error fetching entity names:', error);
      return { regionNames: {}, sectorNames: {}, schoolNames: {} };
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // JWT token əldə et
      const authHeaders = getAuthHeaders();
      
      // Supabase client-dən API key-i əldə et
      const supabaseAnonKey = supabase.supabaseKey;
      
      // API key-i əlavə et - bu, "No API key found in request" xətasını həll edəcək
      const headers = {
        ...authHeaders,
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      };
      
      console.log('Auth headers (sensitive data hidden):', JSON.stringify({
        ...headers,
        Authorization: headers.Authorization ? '***HIDDEN***' : undefined,
        apikey: '***HIDDEN***'
      }));
      
      console.log('Fetching users with filter:', JSON.stringify(filter, null, 2));
      
      // Sorğunu yaradaq
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      // Headers-i tətbiq edək
      Object.entries(headers).forEach(([key, value]) => {
        if (value) query.headers[key] = value;
      });
      
      // İstifadəçi roluna əsasən filter tətbiq et
      if (isRegionAdmin && currentUser?.regionId) {
        console.log('RegionAdmin filter tətbiq olunur:', currentUser.regionId);
        query = query.eq('region_id', currentUser.regionId);
      } 
      else if (isSectorAdmin && currentUser?.sectorId) {
        console.log('SectorAdmin filter tətbiq olunur:', currentUser.sectorId);
        query = query.eq('sector_id', currentUser.sectorId);
      }
      else {
        // Seçilmiş filterlərə əsasən sorğunu filtrlə
        // Rol filteri
        if (filter.role && Array.isArray(filter.role) && filter.role.length > 0) {
          console.log('Rol filter tətbiq olunur:', filter.role);
          query = query.in('role', filter.role);
        }
        
        // Region filteri
        if (filter.region && Array.isArray(filter.region) && filter.region.length > 0) {
          console.log('Region filter tətbiq olunur:', filter.region);
          query = query.in('region_id', filter.region);
        }
        
        // Sektor filteri
        if (filter.sector && Array.isArray(filter.sector) && filter.sector.length > 0) {
          console.log('Sektor filter tətbiq olunur:', filter.sector);
          query = query.in('sector_id', filter.sector);
        }
        
        // Məktəb filteri
        if (filter.school && Array.isArray(filter.school) && filter.school.length > 0) {
          console.log('Məktəb filter tətbiq olunur:', filter.school);
          query = query.in('school_id', filter.school);
        }
        
        // Status filteri
        if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
          console.log('Status filter tətbiq olunur:', filter.status);
          query = query.in('status', filter.status);
        }
      }
      
      // Paginasiya
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      // Sorğunu icra et
      console.log('Executing query...');
      const { data: rolesData, error: rolesError, count } = await query;
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }
      
      console.log('Fetched roles data:', rolesData ? rolesData.length : 0);
      
      if (!rolesData || rolesData.length === 0) {
        console.log('No roles data found, returning empty result');
        setUsers([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      // İstifadəçi ID-lərini əldə et
      const userIds = rolesData.map(item => item.user_id);
      console.log('User IDs count:', userIds.length);
      
      // Profil məlumatlarını əldə et
      console.log('Fetching profiles...');
      const profilesQuery = supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      // Headers-i tətbiq et
      Object.entries(headers).forEach(([key, value]) => {
        if (value) profilesQuery.headers[key] = value;
      });
      
      const { data: profilesData, error: profilesError } = await profilesQuery;
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      console.log('Fetched profiles:', profilesData ? profilesData.length : 0);
      
      // Profil məlumatlarını map-ə çevir
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // E-poçt məlumatlarını əldə et
      console.log('Fetching emails...');
      const emailsQuery = supabase
        .rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      // Headers-i tətbiq et
      Object.entries(headers).forEach(([key, value]) => {
        if (value) emailsQuery.headers[key] = value;
      });
      
      const { data: emailsData, error: emailsError } = await emailsQuery;
      
      if (emailsError) {
        console.error('Warning: Could not fetch user emails:', emailsError);
      }
      
      console.log('Fetched emails:', emailsData ? emailsData.length : 0);
      
      // E-poçt məlumatlarını map-ə çevir
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          emailMap[item.id] = item.email;
        });
      }
      
      // Entity adlarını əldə et
      const { regionNames, sectorNames, schoolNames } = await fetchEntityNames(rolesData, headers);
      
      // Tam istifadəçi məlumatlarını birləşdir
      console.log('Building full user data...');
      let fullUsers = rolesData.map(role => {
        const profile = profilesMap[role.user_id] || {};
        const email = emailMap[role.user_id] || '';
        
        // fullName sahəsi üçün alternativ dəyərlər
        const fullName = profile.full_name || role.full_name || email.split('@')[0] || '';
        
        return {
          id: role.user_id,
          fullName: fullName,
          email: email,
          role: role.role,
          status: role.status || 'active',
          regionId: role.region_id,
          sectorId: role.sector_id,
          schoolId: role.school_id,
          regionName: role.region_id ? regionNames[role.region_id] || '' : '',
          sectorName: role.sector_id ? sectorNames[role.sector_id] || '' : '',
          schoolName: role.school_id ? schoolNames[role.school_id] || '' : '',
          entityName: role.school_id ? schoolNames[role.school_id] : 
                     role.sector_id ? sectorNames[role.sector_id] : 
                     role.region_id ? regionNames[role.region_id] : '',
          phone: profile.phone || '',
          position: profile.position || '',
          language: profile.language || 'az',
          createdAt: role.created_at,
          updatedAt: role.updated_at,
        };
      });
      
      // Axtarış filterini client-side tətbiq et
      if (filter.search && filter.search.trim() !== '') {
        const searchTerm = filter.search.trim().toLowerCase();
        console.log('Applying client-side search for:', searchTerm);
        
        fullUsers = fullUsers.filter(user => 
          (user.fullName && user.fullName.toLowerCase().includes(searchTerm)) || 
          (user.email && user.email.toLowerCase().includes(searchTerm)) ||
          (user.phone && user.phone.toLowerCase().includes(searchTerm)) ||
          (user.position && user.position.toLowerCase().includes(searchTerm)) ||
          (user.regionName && user.regionName.toLowerCase().includes(searchTerm)) ||
          (user.sectorName && user.sectorName.toLowerCase().includes(searchTerm)) ||
          (user.schoolName && user.schoolName.toLowerCase().includes(searchTerm))
        );
        
        console.log('Users after search filter:', fullUsers.length);
      }
      
      console.log('Final user count:', fullUsers.length);
      setUsers(fullUsers);
      setTotalCount(count || fullUsers.length);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      setError(error as Error);
      toast.error(`İstifadəçi məlumatları əldə edilərkən xəta baş verdi: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter, currentPage, pageSize, isSuperAdmin, isRegionAdmin, isSectorAdmin, getAuthHeaders]);

  // İlk yüklənmə və filter dəyişiklikləri zamanı istifadəçiləri əldə et
  useEffect(() => {
    console.log('useEffect - fetchUsers çağırılır');
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, totalCount, fetchUsers };
};
