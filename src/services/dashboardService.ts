
import { supabase } from '@/integrations/supabase/client';
import { DashboardData, ChartData, SchoolAdminDashboardData } from '@/types/dashboard';
import { generateDashboardDataByRole, createMockChartData, createMockSchoolAdminData } from '@/utils/dashboardUtils';

/**
 * Dashboard məlumatlarını əldə etmək üçün ana funksiya
 */
export const fetchDashboardData = async (userRole?: string): Promise<DashboardData> => {
  try {
    // Mock məlumatları əldə et
    const dashboardData = generateDashboardDataByRole(userRole);
    return dashboardData;
  } catch (error) {
    console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
    throw error;
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
      const { data, error } = await supabase
        .rpc('get_superadmin_dashboard_data');

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        return data as DashboardData;
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
      // Burada daha dəqiq analiz aparmaq üçün əlavə sorğular lazım ola bilər
    } catch (dbError) {
      console.warn('Verilənlər bazası xətası:', dbError);
    }
    
    // Son variant olaraq mock data istifadə et
    return generateDashboardDataByRole('superadmin');
  } catch (error) {
    console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    return generateDashboardDataByRole('superadmin');
  }
};

/**
 * RegionAdmin dashboard məlumatlarını əldə et
 */
export const fetchRegionAdminDashboard = async (regionId: string): Promise<DashboardData> => {
  try {
    // RPC funksiyası ilə dashboard məlumatlarını əldə etməyə çalışaq
    try {
      const { data, error } = await supabase
        .rpc('get_region_dashboard_data', { region_id: regionId });

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        return data as DashboardData;
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
    } catch (dbError) {
      console.warn('Verilənlər bazası xətası:', dbError);
    }
    
    // Mock data istifadə et
    return generateDashboardDataByRole('regionadmin');
  } catch (error) {
    console.error('Region dashboard məlumatlarını əldə edərkən xəta:', error);
    return generateDashboardDataByRole('regionadmin');
  }
};

/**
 * SectorAdmin dashboard məlumatlarını əldə et
 */
export const fetchSectorAdminDashboard = async (sectorId: string): Promise<DashboardData> => {
  try {
    // RPC funksiyası ilə dashboard məlumatlarını əldə etməyə çalışaq
    try {
      const { data, error } = await supabase
        .rpc('get_sector_dashboard_data', { sector_id: sectorId });

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        return data as DashboardData;
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
    } catch (dbError) {
      console.warn('Verilənlər bazası xətası:', dbError);
    }
    
    // Mock data istifadə et
    return generateDashboardDataByRole('sectoradmin');
  } catch (error) {
    console.error('Sector dashboard məlumatlarını əldə edərkən xəta:', error);
    return generateDashboardDataByRole('sectoradmin');
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
    // Mock data istifadə et
    return createMockChartData();
  } catch (error) {
    console.error('Qrafik məlumatlarını əldə edərkən xəta:', error);
    return createMockChartData();
  }
};
