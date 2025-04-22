import { useState, useCallback } from 'react';
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
  const { user: currentUser, session } = useAuth();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // JWT token əldə etmə funksiyası
  const getAuthHeaders = useCallback(() => {
    // Supabase API key həmişə olmalıdır
    const headers: Record<string, string> = {
      apikey: supabase.supabaseKey
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
  const fetchEntityNames = async (userRoles: any[]) => {
    try {
      const authHeaders = getAuthHeaders();
      
      // Unikal region, sektor və məktəb ID-lərini toplayaq
      const regionIds = Array.from(new Set(userRoles.map(role => role.region_id).filter(Boolean)));
      const sectorIds = Array.from(new Set(userRoles.map(role => role.sector_id).filter(Boolean)));
      const schoolIds = Array.from(new Set(userRoles.map(role => role.school_id).filter(Boolean)));
      
      // Nəticələri saxlamaq üçün obyektlər
      const regionNames: Record<string, string> = {};
      const sectorNames: Record<string, string> = {};
      const schoolNames: Record<string, string> = {};
      
      // Region adlarını əldə edək
      if (regionIds.length > 0) {
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('id, name', { headers: authHeaders })
          .in('id', regionIds);
          
        if (!regionsError && regionsData) {
          regionsData.forEach(region => {
            regionNames[region.id] = region.name;
          });
        }
      }
      
      // Sektor adlarını əldə edək
      if (sectorIds.length > 0) {
        const { data: sectorsData, error: sectorsError } = await supabase
          .from('sectors')
          .select('id, name', { headers: authHeaders })
          .in('id', sectorIds);
          
        if (!sectorsError && sectorsData) {
          sectorsData.forEach(sector => {
            sectorNames[sector.id] = sector.name;
          });
        }
      }
      
      // Məktəb adlarını əldə edək
      if (schoolIds.length > 0) {
        const { data: schoolsData, error: schoolsError } = await supabase
          .from('schools')
          .select('id, name', { headers: authHeaders })
          .in('id', schoolIds);
          
        if (!schoolsError && schoolsData) {
          schoolsData.forEach(school => {
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
      
      console.log('Fetching users with filter:', filter);
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact', headers: authHeaders });
      
      // Rol filteri - enum tipləri ilə işləmək üçün düzgün format
      if (filter.role && Array.isArray(filter.role) && filter.role.length > 0) {
        // Enum tipləri ilə işləmək üçün in operatorunu istifadə edirik
        query = query.in('role', filter.role);
        console.log('Applied role filter:', filter.role);
      }
      
      // İstifadəçi tipinə görə filtrlənmə
      if (isRegionAdmin && currentUser?.regionId) {
        // Regionadmin yalnız öz regionundakı istifadəçiləri görə bilər
        query = query.eq('region_id', currentUser.regionId);
        console.log('Filtered by region_id:', currentUser.regionId);
      } 
      else if (isSectorAdmin && currentUser?.sectorId) {
        // Sektoradmin yalnız öz sektorundakı istifadəçiləri görə bilər
        query = query.eq('sector_id', currentUser.sectorId);
        console.log('Filtered by sector_id:', currentUser.sectorId);
      }
      // Digər filter parametrləri ilə filtrlənmə
      else {
        if (filter.region && Array.isArray(filter.region) && filter.region.length > 0) {
          // Çoxlu region seçimi üçün
          query = query.in('region_id', filter.region);
          console.log('Filtered by regions:', filter.region);
        }
        
        if (filter.sector && Array.isArray(filter.sector) && filter.sector.length > 0) {
          // Çoxlu sektor seçimi üçün
          query = query.in('sector_id', filter.sector);
          console.log('Filtered by sectors:', filter.sector);
        }
      }
      
      if (filter.school && Array.isArray(filter.school) && filter.school.length > 0) {
        // Çoxlu məktəb seçimi üçün
        query = query.in('school_id', filter.school);
        console.log('Filtered by schools:', filter.school);
      }
      
      // Status filteri - enum tipləri ilə işləmək üçün düzgün format
      if (filter.status && Array.isArray(filter.status) && filter.status.length > 0) {
        // Enum tipləri ilə işləmək üçün in operatorunu istifadə edirik
        query = query.in('status', filter.status);
        console.log('Applied status filter:', filter.status);
      }
      
      // Axtarış funksionallığı - profiles cədvəlində axtarış
      if (filter.search && filter.search.trim() !== '') {
        try {
          console.log('Searching for:', filter.search);
          // Profil cədvəlində axtarış
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id', { headers: authHeaders })
            .ilike('full_name', `%${filter.search}%`);
            
          if (profilesError) {
            console.error('Error searching profiles:', profilesError);
            // Xəta olsa da davam edirik
          } else if (profilesData && profilesData.length > 0) {
            const userIds = profilesData.map(p => p.id);
            console.log('Found matching profiles:', userIds.length);
            query = query.in('user_id', userIds);
          } else {
            // Axtarış nəticəsi boşdursa, e-poçt üzrə axtarış edək
            console.log('No matching profiles, trying email search');
            const { data: emailsData, error: emailsError } = await supabase
              .rpc('get_user_emails_by_ids', { user_ids: [] }, { headers: authHeaders });
              
            if (emailsError) {
              console.error('Error fetching emails for search:', emailsError);
            } else if (emailsData && emailsData.length > 0) {
              // Axtarış şərtinə uyğun e-poçtları filtrlə
              const searchTerm = filter.search.toLowerCase();
              const matchingUsers = emailsData.filter(user => 
                user.email && user.email.toLowerCase().includes(searchTerm)
              );
              
              if (matchingUsers.length > 0) {
                const userIds = matchingUsers.map(u => u.id);
                console.log('Found matching emails:', userIds.length);
                query = query.in('user_id', userIds);
              } else {
                // Axtarış nəticəsi boşdursa, boş nəticə qaytaraq
                console.log('No matching emails, returning empty result');
                setUsers([]);
                setTotalCount(0);
                setLoading(false);
                return;
              }
            } else {
              // Axtarış nəticəsi boşdursa, boş nəticə qaytaraq
              console.log('No email data available, returning empty result');
              setUsers([]);
              setTotalCount(0);
              setLoading(false);
              return;
            }
          }
        } catch (searchErr) {
          console.error('Error during search:', searchErr);
          // Axtarışda xəta olsa da davam edirik
        }
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      console.log('Final query:', query);
      
      const { data: rolesData, error: rolesError, count } = await query;
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        throw rolesError;
      }
      
      console.log('Fetched roles data:', rolesData ? rolesData.length : 0);
      
      if (!rolesData || rolesData.length === 0) {
        setUsers([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      const userIds = rolesData.map(item => item.user_id);
      
      // Profil məlumatlarını əldə edirik
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { headers: authHeaders })
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Xəta olsa da davam edirik
      }
      
      console.log('Fetched profiles:', profilesData ? profilesData.length : 0);
      
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // User e-poçtlarını əldə edirik
      const { data: emailsData, error: emailsError } = await supabase
        .rpc('get_user_emails_by_ids', { user_ids: userIds }, { headers: authHeaders });
      
      if (emailsError) {
        console.error('Warning: Could not fetch user emails:', emailsError);
        // İdeal halda xəta atmamalıyıq, əməliyyata davam edə bilərik
      }
      
      console.log('Fetched emails:', emailsData ? emailsData.length : 0);
      
      const emailMap: Record<string, string> = {};
      if (emailsData) {
        emailsData.forEach((item: { id: string, email: string }) => {
          emailMap[item.id] = item.email;
        });
      }
      
      // Entity adlarını əldə edək
      const { regionNames, sectorNames, schoolNames } = await fetchEntityNames(rolesData);
      
      // Tam istifadəçi məlumatlarını birləşdiririk
      const fullUsers = rolesData.map(role => {
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

  return {
    users,
    loading,
    error,
    fetchUsers,
    setUsers,
    totalCount,
    setTotalCount
  };
};
