
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
      console.log('User:', user);
      
      if (user) {
        setUserRole(user.role);
        console.log('User role:', user.role);
      } else {
        console.warn('User məlumatı mövcud deyil');
      }
      
      // Chart data-nı hazırlayırıq
      setChartData(getChartData(t));
      
      // User-in rolundan asılı olaraq dashboard data-nı təyin edirik
      if (userRole === 'superadmin') {
        setDashboardData(getSuperAdminData());
      } else if (userRole === 'regionadmin') {
        setDashboardData(getRegionAdminData());
      } else if (userRole === 'sectoradmin') {
        setDashboardData(getSectorAdminData());
      } else if (userRole === 'schooladmin') {
        const schoolAdminData = getSchoolAdminData();
        console.log('School admin data is ready:', schoolAdminData);
        console.log('Forms data:', schoolAdminData.forms);
        setDashboardData(schoolAdminData);
      } else {
        console.warn('User role unknown or not set:', userRole);
        setDashboardData(getBaseData());
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [t, user, userRole]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  return { dashboardData, loading: isLoading, error, isLoading, chartData, userRole };
};
