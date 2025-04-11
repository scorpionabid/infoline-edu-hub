
import { supabase } from '@/integrations/supabase/client';

// Regionlar üzrə məktəb sayını qrafik üçün əldə et
export const getSchoolCountByRegionForChart = async (): Promise<{ name: string; value: number }[]> => {
  try {
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('id, name');

    if (regionsError) {
      console.error("Bölgələr əldə edilərkən xəta:", regionsError);
      throw regionsError;
    }

    const regionData = await Promise.all(
      regions.map(async (region) => {
        const { data: schools, error: schoolsError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true })
          .eq('region_id', region.id);

        if (schoolsError) {
          console.error(`Bölgə üçün məktəb sayı əldə edilərkən xəta: ${region.name}`, schoolsError);
          return { ...region, schoolCount: 0 };
        }

        return { ...region, schoolCount: schools ? schools.length : 0 };
      })
    );

    // Qrafik üçün məlumatları formatlayıb qaytaraq
    return regionData.map(region => ({
      name: region.name,
      value: region.schoolCount
    }));
  } catch (error: any) {
    console.error("Bölgələr üzrə məktəb sayı qrafik üçün əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Bölgələr üzrə məktəb sayını əldə et
export const getSchoolCountByRegion = async (): Promise<{ id: string; name: string; schoolCount: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select('id, name');

    if (error) {
      console.error("Bölgələr əldə edilərkən xəta:", error);
      throw error;
    }

    const schoolCounts = await Promise.all(
      data.map(async (region) => {
        const { count, error: schoolError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true })
          .eq('region_id', region.id);

        if (schoolError) {
          console.error(`Bölgə üçün məktəb sayı əldə edilərkən xəta: ${region.name}`, schoolError);
          return { ...region, schoolCount: 0 };
        }

        return { ...region, schoolCount: count || 0 };
      })
    );

    return schoolCounts.map(item => ({
      id: item.id,
      name: item.name,
      schoolCount: item.schoolCount
    }));
  } catch (error: any) {
    console.error("Bölgələr üzrə məktəb sayı əldə edilərkən xəta:", error);
    return [];
  }
};

// Yeni funksiya: Bölgələr üzrə məktəb sayını əldə et
export const getRegionsWithSchoolCounts = async () => {
  try {
    // Bölgələri məktəb sayı ilə birlikdə əldə edirik
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select(`
        id,
        name,
        schools (
          count
        )
      `);

    if (regionsError) {
      console.error("Bölgələr əldə edilərkən xəta:", regionsError);
      throw regionsError;
    }

    // Bölgə məlumatlarını formatlayıb qaytaraq
    return regions.map(region => ({
      id: region.id,
      name: region.name,
      schools: region.schools || []
    }));
  } catch (error: any) {
    console.error("Bölgələr üzrə məktəb sayı əldə edilərkən xəta:", error);
    return [];
  }
};

// Region üzrə məlumatları əldə et
export const getTotalFormsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    // Regiona aid məktəbləri əldə et
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('region_id', regionId);
    
    if (schoolsError) {
      console.error("Region məktəbləri əldə edilərkən xəta:", schoolsError);
      throw schoolsError;
    }
    
    if (!schools || schools.length === 0) {
      return 0;
    }
    
    // Məktəb ID-lərini siyahı şəklində hazırla
    const schoolIds = schools.map(school => school.id);
    
    // Bu məktəblərə aid bütün formları say
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .in('school_id', schoolIds);
    
    if (error) {
      console.error("Region üzrə ümumi form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə ümumi form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə tamamlanmış formların sayını əldə et
export const getCompletedFormsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    // Regiona aid məktəbləri əldə et
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('region_id', regionId);
    
    if (schoolsError) {
      console.error("Region məktəbləri əldə edilərkən xəta:", schoolsError);
      throw schoolsError;
    }
    
    if (!schools || schools.length === 0) {
      return 0;
    }
    
    // Məktəb ID-lərini siyahı şəklində hazırla
    const schoolIds = schools.map(school => school.id);
    
    // Bu məktəblərə aid təsdiqlənmiş formları say
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .in('school_id', schoolIds)
      .eq('status', 'approved');
    
    if (error) {
      console.error("Region üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Region üzrə gözləmədə olan formların sayını əldə et
export const getPendingFormsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    // Regiona aid məktəbləri əldə et
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('region_id', regionId);
    
    if (schoolsError) {
      console.error("Region məktəbləri əldə edilərkən xəta:", schoolsError);
      throw schoolsError;
    }
    
    if (!schools || schools.length === 0) {
      return 0;
    }
    
    // Məktəb ID-lərini siyahı şəklində hazırla
    const schoolIds = schools.map(school => school.id);
    
    // Bu məktəblərə aid gözləyən formları say
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .in('school_id', schoolIds)
      .eq('status', 'pending');
    
    if (error) {
      console.error("Region üzrə gözləyən form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Region üzrə gözləyən form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Bölgələrin sayını əldə et
export const getRegionsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('regions')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Bölgələrin sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Bölgələrin sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Regiona aid sektorların sayını əldə et
export const getSectorsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);

    if (error) {
      console.error("Region sektorlarının sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Region sektorlarının sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Regiona aid məktəblərin sayını əldə et
export const getSchoolsCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);

    if (error) {
      console.error("Region məktəblərinin sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Region məktəblərinin sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Regiona aid istifadəçilərin sayını əldə et
export const getUsersCountByRegion = async (regionId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('region_id', regionId);

    if (error) {
      console.error("Region istifadəçilərinin sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Region istifadəçilərinin sayı əldə edilərkən xəta:", error);
    return 0;
  }
};
