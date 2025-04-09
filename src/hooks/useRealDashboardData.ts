
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { 
  fetchSuperAdminDashboardData, 
  fetchRegionAdminDashboardData,
  fetchSectorAdminDashboardData,
  fetchDashboardChartData 
} from '@/services/dashboardService';
import { DashboardData, ChartData } from '@/types/dashboard';

interface UseRealDashboardDataProps {
  enableCharts?: boolean;
}

interface UseRealDashboardDataResult {
  dashboardData: DashboardData | null;
  chartData: ChartData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  userRole: string | undefined;
}

export const useRealDashboardData = ({ 
  enableCharts = true 
}: UseRealDashboardDataProps = {}): UseRealDashboardDataResult => {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching real dashboard data for role: ${user.role}`);
      
      // İstifadəçi roluna əsasən uyğun servis funksiyasını çağır
      let data = null;
      
      switch (user.role) {
        case 'superadmin':
          data = await fetchSuperAdminDashboardData();
          break;
        case 'regionadmin':
          if (user.regionId) {
            data = await fetchRegionAdminDashboardData(user.regionId);
          } else {
            throw new Error('Region ID tapılmadı');
          }
          break;
        case 'sectoradmin':
          if (user.sectorId) {
            data = await fetchSectorAdminDashboardData(user.sectorId);
          } else {
            throw new Error('Sektor ID tapılmadı');
          }
          break;
        case 'schooladmin':
          // SchoolAdmin dashboard-ı üçün ayrı hook istifadə edirik
          console.log('SchoolAdmin üçün ayrı hook istifadə edilir');
          break;
        default:
          console.warn(`Naməlum rol: ${user.role}`);
      }
      
      setDashboardData(data);
      
      // Qrafik məlumatlarını əldə et (yalnız SuperAdmin üçün)
      if (enableCharts && user.role === 'superadmin') {
        const charts = await fetchDashboardChartData();
        setChartData(charts);
      }
      
    } catch (error: any) {
      console.error('Dashboard məlumatlarını əldə edərkən xəta:', error);
      setError(error instanceof Error ? error : new Error(error.message || 'Bilinməyən xəta'));
      toast.error('Məlumatları yükləyərkən xəta baş verdi', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, enableCharts]);
  
  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [fetchData, authLoading, user]);
  
  return {
    dashboardData,
    chartData,
    isLoading,
    error,
    refetch: fetchData,
    userRole: user?.role
  };
};
