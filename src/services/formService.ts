
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

// Tamamlanmış formların sayını əldə et
export const getCompletedFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (error) {
      console.error("Tamamlanmış formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Tamamlanmış formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Gözləyən formların sayını əldə et
export const getPendingFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    if (error) {
      console.error("Gözləyən formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Gözləyən formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Rədd edilmiş formların sayını əldə et
export const getRejectedFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected');

    if (error) {
      console.error("Rədd edilmiş formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Rədd edilmiş formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Bütün formların sayını əldə et
export const getTotalFormsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('data_entries')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Ümumi formların sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Ümumi formların sayı əldə edilərkən xəta:", error);
    return 0;
  }
};
