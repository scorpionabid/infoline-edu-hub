
import { supabase } from '@/integrations/supabase/client';

// Məktəblərin sayını əldə et
export const getSchoolsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('schools')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Məktəblərin sayı əldə edilərkən xəta:", error);
      throw error;
    }

    return count || 0;
  } catch (error: any) {
    console.error("Məktəblərin sayı əldə edilərkən xəta:", error);
    return 0;
  }
};

// Funksiya: Məktəblərin tamamlanma faizini əldə et
export const getCompletionRateBySchool = async (): Promise<{ id: string; name: string; completionRate: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, completion_rate');

    if (error) {
      console.error("Məktəblər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      completionRate: item.completion_rate || 0
    }));
  } catch (error: any) {
    console.error("Məktəblərin tamamlanma faizi əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Son əlavə olunan məktəbləri əldə et
export const getLatestSchools = async (limit: number = 5): Promise<{ id: string; name: string; createdAt: string }[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Son məktəblər əldə edilərkən xəta:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name,
      createdAt: item.created_at
    }));
  } catch (error: any) {
    console.error("Son məktəblər əldə edilərkən xəta:", error);
    return [];
  }
};

// Funksiya: Məktəb növləri üzrə məktəb sayını qrafik üçün əldə et
export const getSchoolCountByTypeForChart = async (): Promise<{ name: string; value: number }[]> => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('type');

    if (error) {
      console.error("Məktəb növləri əldə edilərkən xəta:", error);
      throw error;
    }

    // Məktəb növlərini saymaq
    const typeCounts: { [key: string]: number } = {};
    data.forEach(school => {
      const type = school.type || 'Digər';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Qrafik üçün məlumatları formatlayıb qaytaraq
    return Object.keys(typeCounts).map(type => ({
      name: type,
      value: typeCounts[type]
    }));
  } catch (error: any) {
    console.error("Məktəb növləri üzrə məktəb sayı qrafik üçün əldə edilərkən xəta:", error);
    return [];
  }
};
