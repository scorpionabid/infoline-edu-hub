
import { supabase } from '@/integrations/supabase/client';

// Admin entity (region, sector, və ya school) məlumatlarını əldə etmək üçün köməkçi funksiya
export async function fetchAdminEntityData(roleData: any) {
  if (!roleData) return null;
  
  try {
    // Region adminləri üçün
    if (roleData.role === 'regionadmin' && roleData.region_id) {
      const { data, error } = await supabase
        .from('regions')
        .select('name')
        .eq('id', roleData.region_id)
        .single();
      
      if (error) {
        console.error('Error fetching region data:', error);
        return null;
      }
      
      return {
        type: 'region',
        id: roleData.region_id,
        name: data?.name || 'Unknown Region'
      };
    }
    
    // Sektor adminləri üçün
    if (roleData.role === 'sectoradmin' && roleData.sector_id) {
      const { data, error } = await supabase
        .from('sectors')
        .select('name, region_id, regions(name)')
        .eq('id', roleData.sector_id)
        .single();
      
      if (error) {
        console.error('Error fetching sector data:', error);
        return null;
      }
      
      return {
        type: 'sector',
        id: roleData.sector_id,
        name: data?.name || 'Unknown Sector',
        regionId: data?.region_id,
        regionName: data?.regions?.name
      };
    }
    
    // Məktəb adminləri üçün
    if (roleData.role === 'schooladmin' && roleData.school_id) {
      const { data, error } = await supabase
        .from('schools')
        .select('name, region_id, sector_id, regions(name), sectors(name)')
        .eq('id', roleData.school_id)
        .single();
      
      if (error) {
        console.error('Error fetching school data:', error);
        return null;
      }
      
      return {
        type: 'school',
        id: roleData.school_id,
        name: data?.name || 'Unknown School',
        regionId: data?.region_id,
        regionName: data?.regions?.name,
        sectorId: data?.sector_id,
        sectorName: data?.sectors?.name
      };
    }
    
    // SuperAdmin-lər üçün null qaytarılır
    return null;
  } catch (error) {
    console.error('Error fetching admin entity data:', error);
    return null;
  }
}

// İstifadəçi məlumatlarını formatlamaq üçün köməkçi funksiya
export function formatUserData(userData: any, profileData: any, adminEntityData: any = null) {
  if (!userData) return null;
  
  const profile = profileData || {};
  const defaultStatus = 'active' as const;
  
  return {
    id: userData.id,
    email: userData.email || 'N/A',
    full_name: profile.full_name || 'İsimsiz İstifadəçi',
    role: userData.role || 'user',
    region_id: userData.region_id,
    sector_id: userData.sector_id,
    school_id: userData.school_id,
    phone: profile.phone,
    position: profile.position,
    language: profile.language || 'az',
    avatar: profile.avatar,
    status: profile.status || defaultStatus,
    last_login: profile.last_login,
    created_at: profile.created_at || '',
    updated_at: profile.updated_at || '',
    
    // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
    name: profile.full_name || 'İsimsiz İstifadəçi',
    regionId: userData.region_id,
    sectorId: userData.sector_id,
    schoolId: userData.school_id,
    lastLogin: profile.last_login,
    createdAt: profile.created_at || '',
    updatedAt: profile.updated_at || '',
    
    adminEntity: adminEntityData,
    
    twoFactorEnabled: false,
    notificationSettings: {
      email: true,
      system: true
    }
  };
}
