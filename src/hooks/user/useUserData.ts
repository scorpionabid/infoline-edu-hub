
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

/**
 * İstifadəçi məlumatlarını supabase-dən əldə etmək üçün əsas funksiya
 */
export const fetchUserRoles = async () => {
  // Bütün istifadəçi rollarını əldə et
  const { data, error } = await supabase.rpc('get_user_emails_by_ids');
  
  if (error) {
    console.error('İstifadəçi rollarını əldə edərkən xəta:', error);
    throw error;
  }
  
  return data as any[] || [];
};

/**
 * İstifadəçi profilləri əldə et
 */
export const fetchUserProfiles = async (userIds: string[]) => {
  if (!userIds.length) return [];
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);
  
  if (error) {
    console.error('Profilləri əldə edərkən xəta:', error);
    throw error;
  }
  
  return data || [];
};

/**
 * Region məlumatlarını əldə et
 */
export const fetchRegionData = async (regionId: string) => {
  const { data, error } = await supabase
    .from('regions')
    .select('name, status')
    .eq('id', regionId)
    .single();
  
  if (error) {
    console.error('Region məlumatları əldə edilərkən xəta:', error);
    return null;
  }
  
  return data;
};

/**
 * Sektor məlumatlarını əldə et
 */
export const fetchSectorData = async (sectorId: string) => {
  const { data, error } = await supabase
    .from('sectors')
    .select('name, status, regions(name)')
    .eq('id', sectorId)
    .single();
  
  if (error) {
    console.error('Sektor məlumatları əldə edilərkən xəta:', error);
    return null;
  }
  
  return data;
};

/**
 * Məktəb məlumatlarını əldə et
 */
export const fetchSchoolData = async (schoolId: string) => {
  const { data, error } = await supabase
    .from('schools')
    .select('name, status, type, sectors(name), regions(name)')
    .eq('id', schoolId)
    .single();
  
  if (error) {
    console.error('Məktəb məlumatları əldə edilərkən xəta:', error);
    return null;
  }
  
  return data;
};

/**
 * User rolu üçün müvafiq admin entity məlumatlarını əldə et
 */
export const fetchAdminEntityData = async (user: any) => {
  if (!user.role?.includes('admin') || 
      (user.role === 'regionadmin' && !user.region_id) ||
      (user.role === 'sectoradmin' && !user.sector_id) || 
      (user.role === 'schooladmin' && !user.school_id)) {
    return null;
  }
  
  try {
    if (user.role === 'regionadmin' && user.region_id) {
      const regionData = await fetchRegionData(user.region_id);
      
      if (regionData) {
        return {
          type: 'region',
          name: regionData.name,
          status: regionData.status
        };
      }
    } else if (user.role === 'sectoradmin' && user.sector_id) {
      const sectorData = await fetchSectorData(user.sector_id);
      
      if (sectorData) {
        return {
          type: 'sector',
          name: sectorData.name,
          status: sectorData.status,
          regionName: sectorData.regions?.name
        };
      }
    } else if (user.role === 'schooladmin' && user.school_id) {
      const schoolData = await fetchSchoolData(user.school_id);
      
      if (schoolData) {
        return {
          type: 'school',
          name: schoolData.name,
          status: schoolData.status,
          schoolType: schoolData.type,
          sectorName: schoolData.sectors?.name,
          regionName: schoolData.regions?.name
        };
      }
    }
    
    return null;
  } catch (err) {
    console.error('Admin entity məlumatları əldə edilərkən xəta:', err);
    return null;
  }
};

/**
 * İstifadəçi məlumatlarını formatlaşdır
 */
export const formatUserData = (
  userData: any[],
  profilesMap: Record<string, any>,
  adminEntities: any[]
): FullUserData[] => {
  return userData.map((user: any, index: number) => {
    const profile = profilesMap[user.id] || {};
    
    // Status dəyərini düzgün tipə çevirmək
    const statusValue = profile.status || 'active';
    const typedStatus = (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') 
      ? statusValue as 'active' | 'inactive' | 'blocked'
      : 'active' as 'active' | 'inactive' | 'blocked';
    
    return {
      id: user.id,
      email: user.email || 'N/A',
      full_name: profile.full_name || 'İsimsiz İstifadəçi',
      role: user.role,
      region_id: user.region_id,
      sector_id: user.sector_id,
      school_id: user.school_id,
      phone: profile.phone,
      position: profile.position,
      language: profile.language || 'az',
      avatar: profile.avatar,
      status: typedStatus,
      last_login: profile.last_login,
      created_at: profile.created_at || '',
      updated_at: profile.updated_at || '',
      
      // Alias-lar
      name: profile.full_name || 'İsimsiz İstifadəçi',
      regionId: user.region_id,
      sectorId: user.sector_id,
      schoolId: user.school_id,
      lastLogin: profile.last_login,
      createdAt: profile.created_at || '',
      updatedAt: profile.updated_at || '',
      
      // Admin entity
      adminEntity: adminEntities[index],
      
      // Əlavə xüsusiyyətlər
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
  });
};
