
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  SuperAdminDashboardData, 
  RegionAdminDashboardData, 
  SectorAdminDashboardData, 
  SchoolAdminDashboardData,
  ChartData
} from '@/types/dashboard';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<
    SuperAdminDashboardData | 
    RegionAdminDashboardData | 
    SectorAdminDashboardData | 
    SchoolAdminDashboardData | 
    null
  >(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.role) return;
    
    try {
      setIsLoading(true);
      setError(null);

      const { data: response, error: apiError } = await supabase.functions.invoke('get-dashboard-data', {
        body: { 
          role: user.role,
          entity_id: user.regionId || user.sectorId || user.schoolId 
        }
      });

      if (apiError) throw new Error(apiError.message);

      if (!response) {
        throw new Error(t('errorFetchingDashboardData'));
      }

      setDashboardData(response.data);
      
      // SuperAdmin üçün əlavə qrafik məlumatlarını əldə edirik
      if (user.role === 'superadmin') {
        const { data: chartsResponse, error: chartsError } = await supabase.functions.invoke('get-dashboard-charts');
        
        if (!chartsError && chartsResponse) {
          setChartData(chartsResponse);
        } else if (chartsError) {
          console.error('Qrafik məlumatları əldə edilərkən xəta:', chartsError);
        }
      }

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

  // İlk yükləmə və user dəyişdikdə məlumatları yenilə
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time yeniləmələri dinlə
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'data_entries' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchDashboardData]);
  
  return {
    dashboardData,
    chartData,
    isLoading,
    error,
    refetch: fetchDashboardData
  };
};

export default useRealDashboardData;
