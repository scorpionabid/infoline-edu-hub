
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChartData } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  totalSchools?: number;
  activeSchools?: number;
  pendingForms?: number;
  completedForms?: number;
  upcomingDeadlines?: any[];
  notifications?: any[];
  totalUsers?: number;
  activeUsers?: number;
  totalCategories?: number;
  totalColumns?: number;
  totalForms?: number;
  regionStatistics?: any[];
  sectorStatistics?: any[];
  schoolsInSector?: any[];
}

export const useSupabaseDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('İstifadəçi məlumatları tapılmadı');
      }

      let dashboardQuery = supabase.rpc('get_dashboard_data', { 
        p_user_id: user.id, 
        p_user_role: user.role 
      });

      const { data, error } = await dashboardQuery;

      if (error) throw error;

      setDashboardData(data || {});
      setChartData(await fetchChartData());
    } catch (err: any) {
      console.error('Dashboard məlumatlarını əldə edərkən xəta:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async (): Promise<ChartData> => {
    try {
      const { data, error } = await supabase.rpc('get_chart_data', { 
        p_user_id: user?.id, 
        p_user_role: user?.role 
      });

      if (error) throw error;

      return data || {
        activityData: [],
        regionSchoolsData: [],
        categoryCompletionData: []
      };
    } catch (err) {
      console.error('Qrafik məlumatlarını əldə edərkən xəta:', err);
      return {
        activityData: [],
        regionSchoolsData: [],
        categoryCompletionData: []
      };
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user?.id, user?.role]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    dashboardData,
    isLoading,
    error,
    chartData,
    refreshData
  };
};
