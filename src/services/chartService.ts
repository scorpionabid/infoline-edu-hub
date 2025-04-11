
import { ChartData } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';

export const fetchChartData = async (): Promise<ChartData> => {
  try {
    // Bölgələrdəki aktivlik dərəcəsi (məsələn, tamamlanma nisbəti üzrə)
    const activityData = [
      { name: 'Bakı', value: 85 },
      { name: 'Gəncə', value: 72 },
      { name: 'Sumqayıt', value: 78 },
      { name: 'Şəki', value: 65 },
      { name: 'Mingəçevir', value: 70 }
    ];

    // Bölgələrdəki məktəb sayı
    const regionSchoolsData = [
      { name: 'Bakı', value: 120 },
      { name: 'Gəncə', value: 45 },
      { name: 'Sumqayıt', value: 30 },
      { name: 'Şəki', value: 15 },
      { name: 'Mingəçevir', value: 18 }
    ];

    // Kateqoriyalar üzrə tamamlanma nisbəti
    // Burada 'completed' değerini 'value' olaraq yenidən adlandırırıq
    const categoryCompletionData = [
      { name: 'Təhsil', value: 92, completed: 92 },
      { name: 'İnfrastruktur', value: 78, completed: 78 },
      { name: 'Kadr', value: 65, completed: 65 },
      { name: 'Texniki', value: 85, completed: 85 },
      { name: 'Digər', value: 70, completed: 70 }
    ];

    return {
      activityData,
      regionSchoolsData,
      categoryCompletionData
    };
  } catch (error) {
    console.error('Chart məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
};
