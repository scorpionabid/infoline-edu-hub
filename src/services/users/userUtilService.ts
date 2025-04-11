
import { supabase } from '@/integrations/supabase/client';

// Regionların siyahısını əldə etmək
export const getRegionList = async () => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name')
      .order('name');
      
    if (error) {
      console.error('Regionlar əldə edilərkən xəta:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Regionlar əldə edilərkən xəta:', error);
    return [];
  }
};

// Regionların baza id-name siyahısını əldə etmək
export const getSimpleRegionList = async () => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name')
      .eq('status', 'active')
      .order('name');
      
    if (error) {
      console.error('Region siyahısı əldə edilərkən xəta:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Region siyahısı əldə edilərkən xəta:', error);
    return [];
  }
};

// Sektorların siyahısını əldə etmək
export const getSectorList = async (regionId?: string) => {
  try {
    let query = supabase
      .from('sectors')
      .select('id, name, region_id, region:regions(name)');
      
    // Əgər region ID varsa, filter əlavə et
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data, error } = await query.order('name');
      
    if (error) {
      console.error('Sektorlar əldə edilərkən xəta:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Sektorlar əldə edilərkən xəta:', error);
    return [];
  }
};

// Sektorların baza id-name siyahısını əldə etmək
export const getSimpleSectorList = async (regionId?: string) => {
  try {
    let query = supabase
      .from('sectors')
      .select('id, name')
      .eq('status', 'active');
      
    // Əgər region ID varsa, filter əlavə et
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data, error } = await query.order('name');
      
    if (error) {
      console.error('Sektor siyahısı əldə edilərkən xəta:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Sektor siyahısı əldə edilərkən xəta:', error);
    return [];
  }
};

// Məktəblərin siyahısını əldə etmək
export const getSchoolList = async (sectorId?: string, regionId?: string) => {
  try {
    let query = supabase
      .from('schools')
      .select(`
        id, 
        name, 
        sector_id, 
        region_id, 
        status,
        sector:sectors(name), 
        region:regions(name)
      `);
      
    // Filterləri əlavə et
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }
    
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data, error } = await query.order('name');
      
    if (error) {
      console.error('Məktəblər əldə edilərkən xəta:', error);
      throw error;
    }
    
    return data.map(school => ({
      ...school,
      region_name: school.region ? school.region.name : '',
      sector_name: school.sector ? school.sector.name : ''
    }));
  } catch (error) {
    console.error('Məktəblər əldə edilərkən xəta:', error);
    return [];
  }
};

// Məktəblərin baza id-name siyahısını əldə etmək
export const getSimpleSchoolList = async (sectorId?: string, regionId?: string) => {
  try {
    let query = supabase
      .from('schools')
      .select('id, name')
      .eq('status', 'active');
      
    // Filterləri əlavə et
    if (sectorId) {
      query = query.eq('sector_id', sectorId);
    }
    
    if (regionId) {
      query = query.eq('region_id', regionId);
    }
    
    const { data, error } = await query.order('name');
      
    if (error) {
      console.error('Məktəb siyahısı əldə edilərkən xəta:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Məktəb siyahısı əldə edilərkən xəta:', error);
    return [];
  }
};
