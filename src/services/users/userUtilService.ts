import { supabase } from '@/integrations/supabase/client';

// Regionları əldə et
export const getRegions = async () => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');
    
    if (error) throw error;
    
    // Regionları formatlayaraq göndər
    const formattedRegions = data.map(region => ({
      value: region.id,
      label: region && region.name ? region.name : 'Naməlum region'
    }));
    
    return formattedRegions;
  } catch (error: any) {
    console.error('Regionları əldə edərkən xəta baş verdi:', error);
    throw error;
  }
};

// Sektorları əldə et
export const getSectors = async (regionId?: string) => {
  try {
    let query = supabase
      .from('sectors')
      .select('id, name, region_id');
    
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Sektorları formatlayaraq göndər
    const formattedSectors = data.map(sector => ({
      value: sector.id,
      label: sector && sector.name ? sector.name : 'Naməlum sektor',
      regionId: sector.region_id
    }));
    
    return formattedSectors;
  } catch (error: any) {
    console.error('Sektorları əldə edərkən xəta baş verdi:', error);
    throw error;
  }
};

// Məktəbləri əldə et
export const getSchools = async (sectorId?: string) => {
  try {
    let query = supabase
      .from('schools')
      .select('id, name, region_id, sector_id');
    
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Məktəbləri formatlayaraq göndər
    const formattedSchools = data.map(school => ({
      value: school.id,
      label: school && school.name ? school.name : 'Naməlum məktəb',
      regionId: school.region_id,
      sectorId: school.sector_id
    }));
    
    return formattedSchools;
  } catch (error: any) {
    console.error('Məktəbləri əldə edərkən xəta baş verdi:', error);
    throw error;
  }
};

// Admin entity məlumatlarını əldə et
export const fetchAdminEntityData = async (roleData: any) => {
  if (!roleData) return { type: '', name: '' };
  
  try {
    const { role, region_id, sector_id, school_id } = roleData;
    
    let name = '';
    let status = '';
    let regionName = '';
    let sectorName = '';
    let schoolType = '';
    
    // Admin roluna görə uyğun entity məlumatlarını əldə edirik
    if (role === 'regionadmin' && region_id) {
      const { data } = await supabase
        .from('regions')
        .select('name, status')
        .eq('id', region_id)
        .single();
      
      if (data) {
        name = data.name || '';
        status = data.status || 'active';
      }
    } else if (role === 'sectoradmin' && sector_id) {
      const { data } = await supabase
        .from('sectors')
        .select('name, status, regions(name)')
        .eq('id', sector_id)
        .single();
      
      if (data) {
        name = data.name || '';
        status = data.status || 'active';
        regionName = data.regions?.name || '';
      }
    } else if (role === 'schooladmin' && school_id) {
      const { data } = await supabase
        .from('schools')
        .select('name, status, type, sectors(name), regions(name)')
        .eq('id', school_id)
        .single();
      
      if (data) {
        name = data.name || '';
        status = data.status || 'active';
        schoolType = data.type || '';
        sectorName = data.sectors?.name || '';
        regionName = data.regions?.name || '';
      }
    }
    
    return {
      type: role.replace('admin', ''),
      name,
      status,
      regionName,
      sectorName,
      schoolType
    };
  } catch (error) {
    console.error('Admin entity məlumatlarını əldə edərkən xəta:', error);
    return { type: '', name: 'Xəta baş verdi' };
  }
};

// İstifadəçi məlumatlarını formatlayır
export const formatUserData = (userData: any) => {
  // Burada istifadəçi məlumatlarını formatlamaq üçün məntiqi yazmaq lazımdır
  return userData;
};
