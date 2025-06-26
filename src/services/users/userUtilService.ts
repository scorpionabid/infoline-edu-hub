
import { supabase } from '@/integrations/supabase/client';

export async function fetchAdminEntityData(roleItem: any) {
  const rolStr = String(roleItem.role);
  if (!rolStr.includes('admin') || 
     (rolStr === 'regionadmin' && !roleItem.region_id) ||
     (rolStr === 'sectoradmin' && !roleItem.sector_id) || 
     (rolStr === 'schooladmin' && !roleItem.school_id)) {
    return null;
  }
  
  try {
    let adminEntity: any = null;
    
    if (rolStr === 'regionadmin' && roleItem.region_id) {
      const { data: regionData } = await supabase
        .from('regions')
        .select('name, status')
        .eq('id', roleItem.region_id)
        .single();
      
      if (regionData) {
        adminEntity = {
          type: 'region',
          name: regionData.name,
          status: regionData.status
        };
      }
    } else if (rolStr === 'sectoradmin' && roleItem.sector_id) {
      const { data: sectorData } = await supabase
        .from('sectors')
        .select('name, status, regions!inner(name)')
        .eq('id', roleItem.sector_id)
        .single();
      
      if (sectorData) {
        const regionName = Array.isArray(sectorData.regions) 
          ? sectorData.regions[0]?.name || 'Unknown'
          : (sectorData.regions as any)?.name || 'Unknown';
          
        adminEntity = {
          type: 'sector',
          name: sectorData.name,
          status: sectorData.status,
          // regionName
        };
      }
    } else if (rolStr === 'schooladmin' && roleItem.school_id) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name, status, type, sectors!inner(name), regions!inner(name)')
        .eq('id', roleItem.school_id)
        .single();
      
      if (schoolData) {
        const sectorName = Array.isArray(schoolData.sectors)
          ? schoolData.sectors[0]?.name || 'Unknown'
          : (schoolData.sectors as any)?.name || 'Unknown';
          
        const regionName = Array.isArray(schoolData.regions)
          ? schoolData.regions[0]?.name || 'Unknown'
          : (schoolData.regions as any)?.name || 'Unknown';
          
        adminEntity = {
          type: 'school',
          name: schoolData.name,
          status: schoolData.status,
          schoolType: schoolData.type,
          sectorName,
          // regionName
        };
      }
    }
    
    return adminEntity;
  } catch (err) {
    console.error('Admin entity məlumatları əldə edilərkən xəta:', err);
    return null;
  }
}

export function formatUserData(
  userData: any[], 
  profilesMap: Record<string, any>, 
  adminEntities: any[]
) {
  return userData.map((user, index) => {
    const profile = profilesMap[user.id] || {};
    const now = new Date().toISOString();
    
    let typedStatus: 'active' | 'inactive' | 'blocked' = 'active';
    const statusValue = profile.status || 'active';
    
    if (statusValue === 'active' || statusValue === 'inactive' || statusValue === 'blocked') {
      typedStatus = statusValue as 'active' | 'inactive' | 'blocked';
    }
    
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
      created_at: user.created_at || now,
      updated_at: user.updated_at || now,
      
      name: profile.full_name || 'İsimsiz İstifadəçi',
      regionId: user.region_id,
      sectorId: user.sector_id,
      schoolId: user.school_id,
      lastLogin: profile.last_login,
      createdAt: user.createdAt || user.created_at || now,
      updatedAt: user.updatedAt || user.updated_at || now,
      
      adminEntity: adminEntities[index],
      
      twoFactorEnabled: false,
      notificationSettings: {
        email: true,
        system: true
      }
    };
  });
}
