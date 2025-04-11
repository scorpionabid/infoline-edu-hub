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
