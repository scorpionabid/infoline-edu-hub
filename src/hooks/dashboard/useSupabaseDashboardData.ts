import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user';
import { createMockDashboardData } from './mockDashboardData';
import {
  SuperAdminDashboardData,
  RegionAdminDashboardData,
  SectorAdminDashboardData,
  SchoolAdminDashboardData,
  ChartData
} from '@/types/dashboard';

export const useSupabaseDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [chartData, setChartData] = useState<ChartData>({
    categoryCompletionData: [],
    activityData: [],
    regionSchoolsData: [],
    categoryCompletion: [],
    statusDistribution: []
  });

  const refreshData = useCallback(() => {
    console.log('Refreshing dashboard data');
    // Implementasiya ediləcək
  }, []);

  // SuperAdmin Dashboard Data
  const superAdminData = useCallback(async (user: User): Promise<SuperAdminDashboardData> => {
    try {
      // Regionların sayı
      const { count: regionsCount, error: regionsError } = await supabase
        .from('regions')
        .select('id', { count: 'exact', head: true });
        
      if (regionsError) throw regionsError;
      
      // Sektorların sayı
      const { count: sectorsCount, error: sectorsError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true });
        
      if (sectorsError) throw sectorsError;
      
      // Məktəblərin sayı
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true });
        
      if (schoolsError) throw schoolsError;
      
      // İstifadəçilərin sayı
      const { count: usersCount, error: usersError } = await supabase
        .from('user_roles')
        .select('id', { count: 'exact', head: true });
        
      if (usersError) throw usersError;
      
      // Məktəblər üzrə completion rate
      let completionRate = 0;
      
      // Kateqoriyalar üzrə verilənlər
      const categoriesQuery = supabase.from('categories')
        .select('id, name, column_count')
        .eq('status', 'active')
        .order('priority', { ascending: true });
        
      const { data: categories, error: categoriesError } = await categoriesQuery;
      
      if (categoriesError) throw categoriesError;

      // Bildirişlər gətirildikdə useNotifications hook-dan əldə ediləcək
      
      // Son aktivlikləri əldə etmək
      // Real layihədə buradan activity_logs cədvəlindən məlumatlar gətirilərdi
      
      // Diaqram verilənləri - bu verilənlər real məlumatlardan əldə ediləcək
      const categoryCompletion = categories.map(cat => ({
        name: cat.name,
        completion: Math.floor(Math.random() * 100)
      }));
      
      const statusDistribution = [
        { status: 'Pending', count: Math.floor(Math.random() * 100) },
        { status: 'Approved', count: Math.floor(Math.random() * 200) },
        { status: 'Rejected', count: Math.floor(Math.random() * 50) }
      ];
      
      // Mock Dashboard data ilə birləşdirib qaytaraq
      const mockData = createMockDashboardData('superadmin', user.id) as SuperAdminDashboardData;
      
      return {
        ...mockData,
        regions: regionsCount || 0,
        sectors: sectorsCount || 0, 
        schools: schoolsCount || 0,
        users: usersCount || 0,
        completionRate,
        categoryCompletion,
        statusDistribution
      };
    } catch (err) {
      console.error('SuperAdmin dashboard data fetchində xəta:', err);
      return createMockDashboardData('superadmin', user.id) as SuperAdminDashboardData;
    }
  }, []);

  // Region Admin Dashboard Data
  const regionAdminData = useCallback(async (user: User): Promise<RegionAdminDashboardData> => {
    try {
      if (!user.region_id && !user.regionId) {
        throw new Error('Region ID tapılmadı');
      }
      
      const regionId = user.region_id || user.regionId;
      
      // Region adını əldə et
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('name')
        .eq('id', regionId)
        .single();
        
      if (regionError) throw regionError;
      
      // Regionda sektorların sayı
      const { count: sectorsCount, error: sectorsError } = await supabase
        .from('sectors')
        .select('id', { count: 'exact', head: true })
        .eq('region_id', regionId);
        
      if (sectorsError) throw sectorsError;
      
      // Regionda məktəblərin sayı
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('region_id', regionId);
        
      if (schoolsError) throw schoolsError;
      
      // Mock data ilə birləşdirək
      const mockData = createMockDashboardData('regionadmin', user.id) as RegionAdminDashboardData;
      
      return {
        ...mockData,
        regionName: regionData?.name || 'Unknown Region',
        sectors: sectorsCount || 0,
        schools: schoolsCount || 0
      };
    } catch (err) {
      console.error('RegionAdmin dashboard data fetchində xəta:', err);
      return createMockDashboardData('regionadmin', user.id) as RegionAdminDashboardData;
    }
  }, []);

  // Sector Admin Dashboard Data
  const sectorAdminData = useCallback(async (user: User): Promise<SectorAdminDashboardData> => {
    try {
      if (!user.sector_id && !user.sectorId) {
        throw new Error('Sector ID tapılmadı');
      }
      
      const sectorId = user.sector_id || user.sectorId;
      
      // Sektor adını əldə et
      const { data: sectorData, error: sectorError } = await supabase
        .from('sectors')
        .select('name, regions!inner(name)')
        .eq('id', sectorId)
        .single();
        
      if (sectorError) throw sectorError;
      
      // Sektorda məktəblərin sayı
      const { count: schoolsCount, error: schoolsError } = await supabase
        .from('schools')
        .select('id', { count: 'exact', head: true })
        .eq('sector_id', sectorId);
        
      if (schoolsError) throw schoolsError;
      
      // Mock data ilə birləşdirək
      const mockData = createMockDashboardData('sectoradmin', user.id) as SectorAdminDashboardData;
      
      return {
        ...mockData,
        sectorName: sectorData?.name || 'Unknown Sector',
        regionName: sectorData?.regions?.name || 'Unknown Region',
        schools: schoolsCount || 0
      };
    } catch (err) {
      console.error('SectorAdmin dashboard data fetchində xəta:', err);
      return createMockDashboardData('sectoradmin', user.id) as SectorAdminDashboardData;
    }
  }, []);

  // School Admin Dashboard Data
  const schoolAdminData = useCallback(async (user: User): Promise<SchoolAdminDashboardData> => {
    try {
      if (!user.school_id && !user.schoolId) {
        throw new Error('School ID tapılmadı');
      }
      
      const schoolId = user.school_id || user.schoolId;
      
      // Məktəb məlumatlarını əldə et
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select(`
          name,
          sectors!inner(name, regions!inner(name))
        `)
        .eq('id', schoolId)
        .single();
        
      if (schoolError) throw schoolError;
      
      // Mock data ilə birləşdirək
      const mockData = createMockDashboardData('schooladmin', user.id) as SchoolAdminDashboardData;
      
      return {
        ...mockData,
        schoolName: schoolData?.name || 'Unknown School',
        sectorName: schoolData?.sectors?.name || 'Unknown Sector',
        regionName: schoolData?.sectors?.regions?.name || 'Unknown Region'
      };
    } catch (err) {
      console.error('SchoolAdmin dashboard data fetchində xəta:', err);
      return createMockDashboardData('schooladmin', user.id) as SchoolAdminDashboardData;
    }
  }, []);

  return {
    dashboardData,
    isLoading,
    error,
    chartData,
    refreshData,
    superAdminData,
    regionAdminData,
    sectorAdminData,
    schoolAdminData
  };
};
