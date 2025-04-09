
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  generateDashboardDataByRole, 
  generateMockChartData 
} from '@/utils/dashboardUtils';
import { Notification } from '@/types/notification';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData, 
  DashboardData,
  StatsItem,
  ChartData
} from '@/types/dashboard';

export const useDashboardData = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Dashboard məlumatları alınır...');
        
        // Təxminən API çağırışını simulyasiya etmək üçün gecikmə
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // İstifadəçi roluna əsasən mock data generasiya etmək
        const role = user?.role || 'schooladmin'; // Default rol təyin edirik
        console.log(`Dashboard yüklənir: ${role} rolu üçün`);
        
        // Mock data generasiya etmək
        const mockData = generateDashboardDataByRole(role);
        setDashboardData(mockData);
        
        // Qrafik datanı generasiya etmək
        const mockChartData = generateMockChartData();
        setChartData(mockChartData);
        
        console.log('Dashboard məlumatları uğurla alındı');
      } catch (err: any) {
        console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Auth yükləməsi bitdikdə dashboard məlumatlarını əldə et
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading]);
  
  return { dashboardData, isLoading, error, chartData, userRole: user?.role };
};
