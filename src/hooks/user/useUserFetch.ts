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
  const { user: currentUser } = useAuth();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Region, sektor və məktəb məlumatlarını əldə etmək üçün köməkçi funksiya
  const fetchEntityNames = async (userRoles: any[]) => {
    try {
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
          .select('id, name')
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
          .select('id, name')
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
          .select('id, name')
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
      console.log('Fetching users with filter:', filter);
      let query = supabase
        .from('user_roles')
        .select('*', { count: 'exact' });
      
      if (filter.role) {
        query = query.eq('role', filter.role as any);
      }
      
      // Regionadmin üçün filtrlənmə
      if (isRegionAdmin && currentUser?.regionId) {
        query = query.eq('region_id', currentUser.regionId);
      } 
      // Sektoradmin üçün filtrlənmə
      else if (isSectorAdmin && currentUser?.sectorId) {
        query = query.eq('sector_id', currentUser.sectorId);
      }
      // Filter parametrləri ilə filtrlənmə
      else {
        if (filter.region) {
          query = query.eq('region_id', filter.region);
        }
        
        if (filter.sector) {
          query = query.eq('sector_id', filter.sector);
        }
      }
      
      if (filter.school) {
        query = query.eq('school_id', filter.school);
      }
      
      if (filter.status) {
        query = query.eq('status', filter.status);
      }
      
      if (filter.search) {
        query = query.ilike('full_name', `%${filter.search}%`);
      }
      
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);
      
      const { data: rolesData, error: rolesError, count } = await query;
      
      if (rolesError) {
        throw rolesError;
      }
      
      if (!rolesData || rolesData.length === 0) {
        setUsers([]);
        setTotalCount(0);
        setLoading(false);
        return;
      }
      
      const userIds = rolesData.map(item => item.user_id);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profilesError) {
        throw profilesError;
      }
      
      const profilesMap: Record<string, any> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
      }
      
      // User e-poçtlarını əldə edirik
      const { data: emailsData, error: emailsError } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
      
      if (emailsError) {
        console.log('Warning: Could not fetch user emails:', emailsError);
        // İdeal halda xəta atmamalıyıq, əməliyyata davam edə bilərik
      }
      
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
        
        return {
          id: role.user_id,
          fullName: profile.full_name || role.full_name || '',
          email: email,
          role: role.role,
          status: role.status || 'active',
          regionId: role.region_id,
          sectorId: role.sector_id,
          schoolId: role.school_id,
          regionName: role.region_id ? regionNames[role.region_id] || '' : '',
          sectorName: role.sector_id ? sectorNames[role.sector_id] || '' : '',
          schoolName: role.school_id ? schoolNames[role.school_id] || '' : '',
          phone: profile.phone || '',
          position: profile.position || '',
          language: profile.language || 'az',
          createdAt: role.created_at,
          updatedAt: role.updated_at,
        };
      });
      
      setUsers(fullUsers);
      setTotalCount(count || fullUsers.length);
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
      setError(error);
      toast.error(`Error fetching users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [currentUser, filter, currentPage, pageSize, isSuperAdmin, isRegionAdmin, isSectorAdmin]);

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
