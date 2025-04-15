
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData
} from '@/types/dashboard';
import { 
  createMockSuperAdminData,
  createMockRegionAdminData,
  createMockSectorAdminData,
  createMockSchoolAdminData,
  createMockChartData
} from '@/utils/dashboardUtils';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // API-dən məlumatları əldə etməyi simulyasiya edirik
      // Real layihədə bu hissəni API sorğuları ilə əvəz edəcəksiniz
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let data = null;
      
      // İstifadəçi roluna əsasən müvafiq dashboard məlumatlarını əldə et
      switch (user.role) {
        case 'superadmin':
          data = createMockSuperAdminData();
          break;
        case 'regionadmin':
          data = createMockRegionAdminData();
          break;
        case 'sectoradmin':
          data = createMockSectorAdminData();
          break;
        case 'schooladmin':
          data = createMockSchoolAdminData();
          break;
        default:
          throw new Error(t('unknownRole'));
      }
      
      setDashboardData(data);
      
      // Chart məlumatlarını əldə et
      const charts = createMockChartData();
      setChartData(charts);
      
    } catch (err: any) {
      console.error("Dashboard məlumatlarını əldə edərkən xəta:", err);
      setError(err);
      toast({
        title: t('error'),
        description: t('errorFetchingDashboardData'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, t, toast]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  return {
    dashboardData,
    chartData,
    isLoading,
    error,
    refetch: fetchDashboardData
  };
};

export default useRealDashboardData;
