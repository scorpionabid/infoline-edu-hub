
import { supabase } from '@/integrations/supabase/client';
import { ChartData, DashboardData } from '@/types/dashboard';
import { UserRole } from '@/types/user';

/**
 * Real-vaxt rejimində dashboard məlumatlarını əldə etmək
 */
export async function fetchDashboardData(role: UserRole): Promise<DashboardData> {
  try {
    // Supabase edge funksiyasına sorğu
    const { data, error } = await supabase.functions.invoke('get-dashboard-data', {
      method: 'POST',
      body: { role }
    });
    
    if (error) throw error;
    
    return data.data;
  } catch (error: any) {
    console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
}

/**
 * Dashboard üçün qrafik məlumatlarını əldə etmək
 */
export async function fetchDashboardChartData(): Promise<ChartData> {
  try {
    // Burada real dəyərlər üçün API sorğusu edilə bilər
    // Hələlik mock data qaytarırıq
    return {
      activityData: [
        { name: 'Yanvar', value: 145 },
        { name: 'Fevral', value: 230 },
        { name: 'Mart', value: 275 },
        { name: 'Aprel', value: 310 },
        { name: 'May', value: 350 },
        { name: 'İyun', value: 420 },
        { name: 'İyul', value: 380 }
      ],
      regionSchoolsData: [
        { name: 'Bakı', value: 185 },
        { name: 'Sumqayıt', value: 76 },
        { name: 'Gəncə', value: 54 },
        { name: 'Mingəçevir', value: 28 },
        { name: 'Şirvan', value: 23 }
      ],
      categoryCompletionData: [
        { name: 'Şagird statistikası', completed: 85 },
        { name: 'Müəllim heyəti', completed: 72 },
        { name: 'İnfrastruktur', completed: 63 },
        { name: 'Tədris proqramı', completed: 91 },
        { name: 'İnzibati işlər', completed: 56 }
      ]
    };
  } catch (error) {
    console.error('Dashboard qrafik məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
}
