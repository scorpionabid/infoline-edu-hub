
import { supabase } from '@/integrations/supabase/client';

// Sektor üzrə gözləyən formların sayını əldə etmək
export const getPendingFormsCountBySector = async (sectorId: string): Promise<number> => {
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
    
    // Bu məktəblərə aid gözləyən formları say
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .in('school_id', schoolIds)
      .eq('status', 'pending');
    
    if (error) {
      console.error("Sektor üzrə gözləyən formlar sayılarkən xəta:", error);
      throw error;
    }
    
    return count || 0;
  } catch (error: any) {
    console.error("Sektor üzrə gözləyən formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};
