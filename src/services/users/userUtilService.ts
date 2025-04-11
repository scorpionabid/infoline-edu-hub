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

// Admin entity məlumatlarını əldə etmək üçün funksiya
export const fetchAdminEntityData = async (roleData: any) => {
  try {
    // Rol məlumatları əsasında admin entitysini əldə edirik
    if (!roleData) return null;
    
    if (roleData.region_id) {
      const { data: region } = await supabase
        .from('regions')
        .select('id, name, description, status')
        .eq('id', roleData.region_id)
        .single();
        
      return {
        type: 'region',
        entity: region
      };
    }
    
    if (roleData.sector_id) {
      const { data: sector } = await supabase
        .from('sectors')
        .select('id, name, description, status, region_id')
        .eq('id', roleData.sector_id)
        .single();
        
      return {
        type: 'sector',
        entity: sector
      };
    }
    
    if (roleData.school_id) {
      const { data: school } = await supabase
        .from('schools')
        .select('id, name, address, status, region_id, sector_id')
        .eq('id', roleData.school_id)
        .single();
        
      return {
        type: 'school',
        entity: school
      };
    }
    
    return null;
  } catch (error) {
    console.error('Admin entity məlumatları əldə edilərkən xəta:', error);
    return null;
  }
};

// İstifadəçi məlumatlarını formatlayan funksiya
export const formatUserData = (userData: any, profileData: any, adminEntity: any = null) => {
  return {
    id: userData.id,
    email: userData.email || '',
    full_name: profileData?.full_name || '',
    role: userData.role || 'user',
    region_id: userData.region_id || null,
    sector_id: userData.sector_id || null,
    school_id: userData.school_id || null,
    phone: profileData?.phone || null,
    position: profileData?.position || null,
    language: profileData?.language || 'az',
    avatar: profileData?.avatar || null,
    status: profileData?.status || 'active',
    last_login: profileData?.last_login || null,
    created_at: profileData?.created_at || null,
    updated_at: profileData?.updated_at || null,
    adminEntity
  };
};
