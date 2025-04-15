
import { supabase } from '@/integrations/supabase/client';
import { ChartData, DashboardData } from '@/types/dashboard';
import { UserRole } from '@/types/user';
import { createMockChartData, generateDashboardDataByRole } from '@/utils/dashboardUtils';

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
    
    if (error) {
      console.error('Dashboard data fetching error:', error);
      // Xəta halında mock data qaytaraq
      return generateDashboardDataByRole(role);
    }
    
    return data.data;
  } catch (error: any) {
    console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
    // Xəta halında mock data qaytaraq
    return generateDashboardDataByRole(role);
  }
}

/**
 * Dashboard üçün qrafik məlumatlarını əldə etmək
 */
export async function fetchDashboardChartData(): Promise<ChartData> {
  try {
    // Burada real dəyərlər üçün API sorğusu edilə bilər
    // Hələlik mock data qaytarırıq
    return createMockChartData();
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
    
    // Əvvəlcə Supabase-dən verilənləri əldə etməyə çalışaq
    const { data, error } = await supabase
      .from('region_dashboard_data')
      .select('*')
      .eq('region_id', regionId)
      .single();
    
    if (error) {
      console.warn('Region dashboard data fetching error:', error);
      // Verilənlər bazasından məlumat alınmadı, mock data qaytaraq
      return generateDashboardDataByRole('regionadmin');
    }
    
    return data;
  } catch (error: any) {
    console.error('Region admin dashboard məlumatlarını əldə edərkən xəta:', error);
    // Xəta halında mock data qaytaraq
    return generateDashboardDataByRole('regionadmin');
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
    
    // Əvvəlcə Supabase-dən verilənləri əldə etməyə çalışaq
    const { data, error } = await supabase
      .from('sector_dashboard_data')
      .select('*')
      .eq('sector_id', sectorId)
      .single();
    
    if (error) {
      console.warn('Sector dashboard data fetching error:', error);
      // Verilənlər bazasından məlumat alınmadı, mock data qaytaraq
      return generateDashboardDataByRole('sectoradmin');
    }
    
    return data;
  } catch (error: any) {
    console.error('Sector admin dashboard məlumatlarını əldə edərkən xəta:', error);
    // Xəta halında mock data qaytaraq
    return generateDashboardDataByRole('sectoradmin');
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
    
    // Əvvəlcə Supabase-dən verilənləri əldə etməyə çalışaq
    const { data, error } = await supabase
      .from('school_dashboard_data')
      .select('*')
      .eq('school_id', schoolId)
      .single();
    
    if (error) {
      console.warn('School dashboard data fetching error:', error);
      // Verilənlər bazasından məlumat alınmadı, mock data qaytaraq
      return createMockSchoolAdminData();
    }
    
    return data;
  } catch (error: any) {
    console.error('Məktəb admin dashboard məlumatlarını əldə edərkən xəta:', error);
    // Xəta halında mock data qaytaraq
    return createMockSchoolAdminData();
  }
}

/**
 * SuperAdmin üçün dashboard məlumatlarını əldə etmək
 */
export async function fetchSuperAdminDashboard(): Promise<any> {
  try {
    // Əvvəlcə Supabase-dən verilənləri əldə etməyə çalışaq
    const { data, error } = await supabase
      .from('super_admin_dashboard')
      .select('*')
      .single();
    
    if (error) {
      console.warn('SuperAdmin dashboard data fetching error:', error);
      // Verilənlər bazasından məlumat alınmadı, mock data qaytaraq
      return generateDashboardDataByRole('superadmin');
    }
    
    return data;
  } catch (error: any) {
    console.error('SuperAdmin dashboard məlumatlarını əldə edərkən xəta:', error);
    // Xəta halında mock data qaytaraq
    return generateDashboardDataByRole('superadmin');
  }
}
