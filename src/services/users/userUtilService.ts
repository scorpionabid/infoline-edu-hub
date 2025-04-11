import { supabase } from '@/integrations/supabase/client';

// userUtilService.ts faylında əvvəlki kodda name xüsusiyyətinə aid xəta var
// Bu xətanı düzəltmək üçün kod hissəsini yeniləyirik:

export const fetchAdminEntityData = async (roleData: any) => {
  try {
    if (roleData.role === 'regionadmin' && roleData.region_id) {
      const { data: region, error } = await supabase
        .from('regions')
        .select('id, name, description, status')
        .eq('id', roleData.region_id)
        .single();
      
      if (error) throw error;
      
      if (region) {
        return {
          type: 'region',
          name: region.name || '', // Əmin oluruq ki, name xüsusiyyəti təyin edilib
          status: region.status || 'active',
          regionName: region.name || ''
        };
      }
    } else if (roleData.role === 'sectoradmin' && roleData.sector_id) {
      const { data: sector, error } = await supabase
        .from('sectors')
        .select('id, name, description, status, region_id')
        .eq('id', roleData.sector_id)
        .single();
      
      if (error) throw error;
      
      if (sector) {
        // Region adını əldə edirik
        const { data: region } = await supabase
          .from('regions')
          .select('name')
          .eq('id', sector.region_id)
          .single();
        
        return {
          type: 'sector',
          name: sector.name || '', // Əmin oluruq ki, name xüsusiyyəti təyin edilib
          status: sector.status || 'active',
          regionName: region ? region.name || '' : ''
        };
      }
    } else if (roleData.role === 'schooladmin' && roleData.school_id) {
      const { data: school, error } = await supabase
        .from('schools')
        .select('id, name, address, status, region_id, sector_id, type')
        .eq('id', roleData.school_id)
        .single();
      
      if (error) throw error;
      
      if (school) {
        // Region və sektor adlarını əldə edirik
        const { data: region } = await supabase
          .from('regions')
          .select('name')
          .eq('id', school.region_id)
          .single();
        
        const { data: sector } = await supabase
          .from('sectors')
          .select('name')
          .eq('id', school.sector_id)
          .single();
        
        return {
          type: 'school',
          name: school.name || '', // Əmin oluruq ki, name xüsusiyyəti təyin edilib
          status: school.status || 'active',
          regionName: region ? region.name || '' : '',
          sectorName: sector ? sector.name || '' : '',
          schoolType: school.type
        };
      }
    }
    
    return {
      type: '',
      name: '',
      status: 'active'
    };
  } catch (error) {
    console.error('Admin məlumatı əldə edilərkən xəta:', error);
    return {
      type: '',
      name: '',
      status: 'active'
    };
  }
};

export const formatUserData = (user: any) => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    regionId: user.region_id,
    sectorId: user.sector_id,
    schoolId: user.school_id,
    phone: user.phone,
    position: user.position,
    language: user.language,
    avatar: user.avatar,
    status: user.status,
    lastLogin: user.last_login,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    adminEntity: user.adminEntity
  };
};
