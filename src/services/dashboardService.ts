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

/**
 * Region admin üçün dashboard məlumatlarını əldə etmək
 * @param regionId - Region ID
 */
export async function fetchRegionAdminDashboard(regionId: string): Promise<any> {
  try {
    if (!regionId) {
      throw new Error('Region ID təqdim edilməyib');
    }
    
    const { data, error } = await supabase
      .from('region_dashboard_data')
      .select('*')
      .eq('region_id', regionId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Region admin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
}

/**
 * Sector admin üçün dashboard məlumatlarını əldə etmək
 * @param sectorId - Sector ID
 */
export async function fetchSectorAdminDashboard(sectorId: string): Promise<any> {
  try {
    if (!sectorId) {
      throw new Error('Sector ID təqdim edilməyib');
    }
    
    const { data, error } = await supabase
      .from('sector_dashboard_data')
      .select('*')
      .eq('sector_id', sectorId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Sector admin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
}

/**
 * Məktəb admin üçün dashboard məlumatlarını əldə etmək
 * @param schoolId - Məktəb ID
 */
export async function fetchSchoolAdminDashboard(schoolId: string): Promise<any> {
  try {
    if (!schoolId) {
      throw new Error('Məktəb ID təqdim edilməyib');
    }
    
    const { data, error } = await supabase
      .from('school_dashboard_data')
      .select('*')
      .eq('school_id', schoolId)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('Məktəb admin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
}

/**
 * SuperAdmin üçün dashboard məlumatlarını əldə etmək
 */
export async function fetchSuperAdminDashboard(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('super_admin_dashboard')
      .select('*')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
  }
}
