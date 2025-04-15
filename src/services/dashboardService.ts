
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, ChartData, SchoolAdminDashboardData } from '@/types/dashboard';
import { 
  createMockChartData, 
  createMockSchoolAdminData,
  createMockSuperAdminData,
  createMockRegionAdminData,
  createMockSectorAdminData,
  generateDashboardDataByRole 
} from '@/utils/dashboardUtils';

/**
 * Dashboard məlumatlarını əldə etmək üçün ana funksiya
 */
export const fetchDashboardData = async (userRole?: string): Promise<DashboardData> => {
  try {
    // Əvvəlcə Supabase-dən real məlumatları əldə etməyə çalışırıq
    switch (userRole) {
      case 'superadmin':
        return await fetchSuperAdminDashboard();
      case 'regionadmin':
        return await fetchRegionAdminDashboard('');
      case 'sectoradmin':
        return await fetchSectorAdminDashboard('');
      case 'schooladmin':
        return await fetchSchoolAdminDashboard('');
      default:
        // Real data yoxdursa mock data istifadə et
        return generateDashboardDataByRole(userRole);
    }
  } catch (error) {
    console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
    // Xəta olduqda mock data istifadə et
    return generateDashboardDataByRole(userRole);
  }
};

/**
 * SuperAdmin dashboard məlumatlarını əldə et
 */
export const fetchSuperAdminDashboard = async (): Promise<DashboardData> => {
  try {
    // RPC funksiyası ilə dashboard məlumatlarını əldə etməyə çalışaq
    // Əgər RPC xəta verirsə, mock data istifadə edək
    try {
      // NOT: Əgər stored procedure mövcud deyilsə, bu çağırışı təhlükəsiz şəkildə wrap edin
      const { data, error } = await supabase.rpc('get_superadmin_dashboard_data');

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        return data as unknown as DashboardData;
      }
    } catch (rpcError) {
      console.warn('RPC xətası:', rpcError);
      // RPC xətası halında mock data istifadə edirik
    }
    
    // Alternativ: table-lərdən birbaşa məlumat əldə etmə (RPC uğursuz olduqda)
    try {
      // Supabase view və ya função olmadıqda, əsas məlumatları bir neçə sorğu ilə əldə edə bilərik
      const { data: regions } = await supabase
        .from('regions')
        .select('*');
        
      const { data: schools } = await supabase
        .from('schools')
        .select('*');
        
      const { data: categories } = await supabase
        .from('categories')
        .select('*');
      
      // Əldə edilən məlumatları formalaşdır
      // Real data qayıtması halında burada transformation və analiz aparılmalıdır
      if (regions && schools && categories) {
        // Burada real datanı DashboardData formatına transformasiya et
        // Əgər tam transformasiya mümkün deyilsə, hələlik mock data istifadə et
      }
    } catch (dbError) {
      console.warn('Verilənlər bazası xətası:', dbError);
    }
    
    // Son variant olaraq mock data istifadə et
    return createMockSuperAdminData();
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    return createMockSuperAdminData();
  }
};

/**
 * RegionAdmin dashboard məlumatlarını əldə et
 */
export const fetchRegionAdminDashboard = async (regionId: string): Promise<DashboardData> => {
  try {
    if (!regionId) {
      console.warn('Region ID təqdim edilmədi, mock data istifadə edilir');
      return createMockRegionAdminData();
    }
    
    // RPC funksiyası ilə dashboard məlumatlarını əldə etməyə çalışaq
    try {
      // NOT: Əgər stored procedure mövcud deyilsə, bu çağırışı təhlükəsiz şəkildə wrap edin
      const { data, error } = await supabase.rpc('get_region_dashboard_data', { region_id: regionId });

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        return data as unknown as DashboardData;
      }
    } catch (rpcError) {
      console.warn('RPC xətası:', rpcError);
    }
    
    // Funksional RPC olmadıqda birbaşa sorğular
    try {
      const { data: sectors } = await supabase
        .from('sectors')
        .select('*')
        .eq('region_id', regionId);
        
      const { data: schools } = await supabase
        .from('schools')
        .select('*')
        .eq('region_id', regionId);
      
      // Region admin üçün lazımi məlumatları formalaşdır
      if (sectors && schools) {
        // Burada real datanı DashboardData formatına transformasiya et
      }
    } catch (dbError) {
      console.warn('Verilənlər bazası xətası:', dbError);
    }
    
    // Mock data istifadə et
    return createMockRegionAdminData();
  } catch (error) {
    console.error('Region dashboard məlumatlarını əldə edərkən xəta:', error);
    return createMockRegionAdminData();
  }
};

/**
 * SectorAdmin dashboard məlumatlarını əldə et
 */
export const fetchSectorAdminDashboard = async (sectorId: string): Promise<DashboardData> => {
  try {
    if (!sectorId) {
      console.warn('Sektor ID təqdim edilmədi, mock data istifadə edilir');
      return createMockSectorAdminData();
    }
    
    // RPC funksiyası ilə dashboard məlumatlarını əldə etməyə çalışaq
    try {
      // NOT: Əgər stored procedure mövcud deyilsə, bu çağırışı təhlükəsiz şəkildə wrap edin
      const { data, error } = await supabase.rpc('get_sector_dashboard_data', { sector_id: sectorId });

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        return data as unknown as DashboardData;
      }
    } catch (rpcError) {
      console.warn('RPC xətası:', rpcError);
    }
    
    // Birbaşa sorğular
    try {
      const { data: schools } = await supabase
        .from('schools')
        .select('*')
        .eq('sector_id', sectorId);
      
      // Sector admin üçün lazımi məlumatları formalaşdır
      if (schools) {
        // Burada real datanı DashboardData formatına transformasiya et
      }
    } catch (dbError) {
      console.warn('Verilənlər bazası xətası:', dbError);
    }
    
    // Mock data istifadə et
    return createMockSectorAdminData();
  } catch (error) {
    console.error('Sector dashboard məlumatlarını əldə edərkən xəta:', error);
    return createMockSectorAdminData();
  }
};

/**
 * SchoolAdmin dashboard məlumatlarını əldə et
 * @param schoolId
 * @returns
 */
export const fetchSchoolAdminDashboard = async (schoolId: string): Promise<SchoolAdminDashboardData> => {
  try {
    if (!schoolId) {
      console.warn('Məktəb ID təqdim edilmədi');
      return createMockSchoolAdminData();
    }
    
    // Məktəb üçün məlumatları əldə et
    try {
      const { data: school } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
        
      if (school) {
        // Məktəb məlumatlarını əldə et və formlaşdır
        const { data: categoryData } = await supabase
          .from('data_entries')
          .select('category_id, status')
          .eq('school_id', schoolId);
          
        // Əldə edilən məlumatlardan məktəb-spesifik dashboard datası formalaşdır
        if (categoryData) {
          // Real məlumatları transformasiya et
          // Hələlik mock data qaytarırıq, amma gələcəkdə burada real data olacaq
        }
      }
    } catch (dbError) {
      console.warn('Məktəb məlumatlarını əldə edərkən xəta:', dbError);
    }
    
    // API müraciəti yoxdursa, mock data istifadə et
    return createMockSchoolAdminData();
  } catch (error) {
    console.error('Məktəb admin dashboard məlumatlarını əldə edərkən xəta:', error);
    return createMockSchoolAdminData();
  }
};

/**
 * Dashboard qrafik məlumatlarını əldə et
 */
export const fetchDashboardChartData = async (): Promise<ChartData> => {
  try {
    // Qrafik məlumatlarını əldə etmək üçün Supabase-i istifadə et
    try {
      // Data entries və ya statistics cədvəllərindən məlumatları çək
      const { data: activityData } = await supabase.rpc('get_monthly_activity_data');
      
      if (activityData) {
        // Əldə edilən məlumatları ChartData formatına çevir
        // İndiki halda mock data qaytarırıq
      }
    } catch (error) {
      console.warn('Qrafik məlumatlarını əldə edərkən xəta:', error);
    }
    
    // Mock data istifadə et
    return createMockChartData();
  } catch (error) {
    console.error('Qrafik məlumatlarını əldə edərkən xəta:', error);
    return createMockChartData();
  }
};
