
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
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
import { usePermissions } from '@/hooks/auth/usePermissions';

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin, isSchoolAdmin } = usePermissions();
  
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

      // SuperAdmin datası üçün mock data hazırla
      if (isSuperAdmin) {
        // Burada real Supabase funksiyasını çağıra bilərik, hələlik mock data ilə təmin edirik
        const mockSuperAdminData: SuperAdminDashboardData = {
          stats: {
            regions: 12,
            sectors: 48,
            schools: 634,
            users: 912
          },
          formsByStatus: {
            pending: 87,
            approved: 356,
            rejected: 23,
            total: 466
          },
          completionRate: 78,
          pendingApprovals: [
            {
              id: '1',
              title: 'Ümumi statistika',
              date: new Date().toISOString(),
              status: 'pending',
              schoolName: 'Məktəb #25',
              categoryName: 'Ümumi məlumatlar',
              submittedAt: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Şagird nailiyyətləri',
              date: new Date().toISOString(),
              status: 'pending',
              schoolName: 'Məktəb #17',
              categoryName: 'Akademik göstəricilər',
              submittedAt: new Date(Date.now() - 8600000).toISOString()
            }
          ],
          regions: [
            {
              id: '1',
              name: 'Bakı',
              sectorCount: 12,
              schoolCount: 167,
              completionRate: 85
            },
            {
              id: '2',
              name: 'Sumqayıt',
              sectorCount: 4,
              schoolCount: 42,
              completionRate: 72
            },
            {
              id: '3',
              name: 'Gəncə',
              sectorCount: 5,
              schoolCount: 38,
              completionRate: 68
            }
          ],
          notifications: []
        };

        setDashboardData(mockSuperAdminData);
        
        // Mock chart data
        setChartData({
          activityData: [
            { name: 'Yeni məktəblər', value: 24 },
            { name: 'Yeni məlumatlar', value: 85 },
            { name: 'Təsdiqlənmiş məlumatlar', value: 67 },
            { name: 'Rədd edilmiş məlumatlar', value: 12 }
          ],
          regionSchoolsData: [
            { name: 'Bakı', value: 167 },
            { name: 'Sumqayıt', value: 42 },
            { name: 'Gəncə', value: 38 },
            { name: 'Lənkəran', value: 29 },
            { name: 'Şəki', value: 25 }
          ],
          categoryCompletionData: [
            { name: 'Ümumi statistika', completed: 89 },
            { name: 'Şagird nailiyyətləri', completed: 65 },
            { name: 'Müəllim potensialı', completed: 78 },
            { name: 'İnfrastruktur', completed: 92 }
          ]
        });
      } else {
        // RegionAdmin, SectorAdmin və SchoolAdmin üçün Supabase funksiyasını çağırırıq
        const { data: response, error: apiError } = await supabase.functions.invoke('get-dashboard-data', {
          body: { 
            role: user.role,
            entity_id: user.regionId || user.sectorId || user.schoolId || user.region_id || user.sector_id || user.school_id
          }
        });

        if (apiError) throw new Error(apiError.message);

        if (!response) {
          throw new Error(t('errorFetchingDashboardData'));
        }

        setDashboardData(response.data);
        
        // Diğer roller için chart datasını fetch edebiliriz
        if (isRegionAdmin || isSectorAdmin) {
          try {
            const { data: chartsResponse, error: chartsError } = await supabase.functions.invoke('get-dashboard-charts');
            
            if (!chartsError && chartsResponse) {
              setChartData(chartsResponse);
            } else if (chartsError) {
              console.error('Qrafik məlumatları əldə edilərkən xəta:', chartsError);
            }
          } catch (chartErr) {
            console.error('Qrafik məlumatları əldə edilərkən xəta:', chartErr);
          }
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
  }, [user, t, toast, isSuperAdmin, isRegionAdmin, isSectorAdmin]);

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
