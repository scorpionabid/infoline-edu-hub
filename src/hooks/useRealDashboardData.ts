
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { 
  getSuperAdminDashboardData,
  getRegionAdminDashboardData,
  getSectorAdminDashboardData,
  getSchoolAdminDashboardData,
  getDashboardChartData
} from '@/services/dashboardService';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [data, setData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let dashboardData = null;
      
      // İstifadəçi roluna əsasən müvafiq dashboard məlumatlarını əldə et
      switch (user.role) {
        case 'superadmin':
          dashboardData = await getSuperAdminDashboardData();
          break;
        case 'regionadmin':
          dashboardData = await getRegionAdminDashboardData(user.regionId || '');
          break;
        case 'sectoradmin':
          dashboardData = await getSectorAdminDashboardData(user.sectorId || '');
          break;
        case 'schooladmin':
          dashboardData = await getSchoolAdminDashboardData(user.schoolId || '');
          break;
        default:
          throw new Error(t('unknownRole'));
      }
      
      setData(dashboardData);
      
      // Chart məlumatlarını əldə et
      const charts = await getDashboardChartData({
        entityType: user.role === 'regionadmin' ? 'region' : 
                   user.role === 'sectoradmin' ? 'sector' : 
                   user.role === 'schooladmin' ? 'school' : undefined,
        entityId: user.role === 'regionadmin' ? user.regionId : 
                 user.role === 'sectoradmin' ? user.sectorId : 
                 user.role === 'schooladmin' ? user.schoolId : undefined
      });
      
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
    data,
    chartData,
    isLoading,
    error,
    refetch: fetchDashboardData
  };
};

export default useRealDashboardData;
