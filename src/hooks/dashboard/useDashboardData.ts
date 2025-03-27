
import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  DashboardData, 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData,
  FormItem
} from '@/types/dashboard';
import { 
  getBaseData, 
  getSuperAdminData, 
  getRegionAdminData, 
  getSectorAdminData, 
  getSchoolAdminData 
} from './dashboardDataProviders';
import { getChartData } from './mockDashboardData';

export type { FormItem, DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData };

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(getBaseData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [chartData, setChartData] = useState<ChartData>({
    activityData: [],
    regionSchoolsData: [],
    categoryCompletionData: []
  });
  
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Dashboard data yüklənir...');
      
      if (user) {
        setUserRole(user.role);
        console.log('User role:', user.role);
      } else {
        console.warn('User məlumatı mövcud deyil');
        setUserRole('schooladmin'); // Test üçün default rol təyin edirik
      }
      
      // Chart data-nı hazırlayırıq
      const chartDataResult = getChartData(t);
      setChartData(chartDataResult);
      
      // User-in rolundan asılı olaraq dashboard data-nı təyin edirik
      let dashboardResult: DashboardData;
      
      if (user?.role === 'superadmin') {
        dashboardResult = getSuperAdminData();
      } else if (user?.role === 'regionadmin') {
        dashboardResult = getRegionAdminData();
      } else if (user?.role === 'sectoradmin') {
        dashboardResult = getSectorAdminData();
      } else {
        // Default olaraq schooladmin data-sını göstərək
        dashboardResult = getSchoolAdminData();
        console.log('School admin data is ready');
      }
      
      setDashboardData(dashboardResult);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [t, user]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { dashboardData, loading: isLoading, error, isLoading, chartData, userRole };
};
