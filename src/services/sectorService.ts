
import { supabase } from '@/integrations/supabase/client';

// Funksiya: Sektorlar üzrə məktəb sayını əldə et
export const getSchoolCountBySector = async (): Promise<{ id: string; name: string; schoolCount: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('sectors')
      .select('id, name');

    if (error) {
      console.error("Sektorlar əldə edilərkən xəta:", error);
      throw error;
    }

    const schoolCounts = await Promise.all(
      data.map(async (sector) => {
        const { count, error: schoolError } = await supabase
          .from('schools')
          .select('*', { count: 'exact', head: true })
          .eq('sector_id', sector.id);

        if (schoolError) {
          console.error(`Sektor üçün məktəb sayı əldə edilərkən xəta: ${sector.name}`, schoolError);
          return { ...sector, schoolCount: 0 };
        }

        return { ...sector, schoolCount: count || 0 };
      })
    );

    return schoolCounts.map(item => ({
      id: item.id,
      name: item.name,
      schoolCount: item.schoolCount
    }));
  } catch (error: any) {
    console.error("Sektorlar üzrə məktəb sayı əldə edilərkən xəta:", error);
    return [];
  }
};

// Sektorların sayını əldə et
export const getSectorsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('sectors')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Sektorların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Sektorların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektor üzrə formların ümumi sayını əldə et
export const getTotalFormsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    // Sektora aid məktəbləri əldə et
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('sector_id', sectorId);
    
    if (schoolsError) {
      console.error("Sektor məktəbləri əldə edilərkən xəta:", schoolsError);
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
      console.error("Sektor üzrə ümumi form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor üzrə ümumi form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektor üzrə tamamlanmış formların sayını əldə et
export const getCompletedFormsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    // Sektora aid məktəbləri əldə et
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id')
      .eq('sector_id', sectorId);
    
    if (schoolsError) {
      console.error("Sektor məktəbləri əldə edilərkən xəta:", schoolsError);
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
      console.error("Sektor üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor üzrə tamamlanmış form sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Sektora aid məktəblərin sayını əldə et
export const getSchoolsCountBySector = async (sectorId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true })
      .eq('sector_id', sectorId);

    if (error) {
      console.error("Sektor məktəblərinin sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Sektor məktəblərinin sayı əldə edilərkən xəta:", error);
    return 0;
  }
};
