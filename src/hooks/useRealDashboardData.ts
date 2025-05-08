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
  ChartData,
  CategoryStat,
  PendingApproval
} from '@/types/dashboard';

// Müvəqqəti mock data - CORS xətaları həll olunana qədər
const mockCategoryData: CategoryStat[] = [
  {
    id: '1',
    name: 'Təhsil proqramları',
    completionRate: 78,
    completion: { total: 100, completed: 78, percentage: 78 }
  },
  {
    id: '2',
    name: 'İnfrastruktur',
    completionRate: 65,
    completion: { total: 100, completed: 65, percentage: 65 }
  },
  {
    id: '3',
    name: 'Müəllim hazırlığı',
    completionRate: 92,
    completion: { total: 100, completed: 92, percentage: 92 }
  },
  {
    id: '4',
    name: 'Tədris materialları',
    completionRate: 45,
    completion: { total: 100, completed: 45, percentage: 45 }
  },
  {
    id: '5',
    name: 'Şagird nailiyyətləri',
    completionRate: 83,
    completion: { total: 100, completed: 83, percentage: 83 }
  }
];

// Müvəqqəti mock chart data
const mockChartData: ChartData = {
  activityData: [
    { name: 'Yanvar', value: 45 },
    { name: 'Fevral', value: 52 },
    { name: 'Mart', value: 68 },
    { name: 'Aprel', value: 72 }
  ],
  regionSchoolsData: [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 45 },
    { name: 'Gəncə', value: 38 },
    { name: 'Lənkəran', value: 28 }
  ],
  categoryCompletionData: [
    { name: 'Təhsil proqramları', completed: 78 },
    { name: 'İnfrastruktur', completed: 65 },
    { name: 'Müəllim hazırlığı', completed: 92 },
    { name: 'Tədris materialları', completed: 45 }
  ]
};

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

      // CORS xətaları səbəbindən try-catch bloklarında API sorğularını edirik
      // və xəta baş verdikdə mock data istifadə edirik
      try {
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

        // SuperAdmin üçün kateqoriya tamamlanma məlumatlarını əldə edirik
        if (user.role === 'superadmin') {
          try {
            const { data: categoryResponse, error: categoryError } = await supabase.functions.invoke('get-category-completion-rate', {
              body: { level: 'national' }
            });
            
            if (categoryError) {
              console.error('Kateqoriya məlumatları əldə edilərkən xəta:', categoryError);
              // Xəta halında mock data istifadə edirik
              const superAdminData = response.data as SuperAdminDashboardData;
              superAdminData.categories = mockCategoryData;
              setDashboardData(superAdminData);
            } else if (categoryResponse && categoryResponse.categories) {
              const superAdminData = response.data as SuperAdminDashboardData;
              superAdminData.categories = categoryResponse.categories;
              setDashboardData(superAdminData);
            } else {
              // Cavab boşdursa mock data istifadə edirik
              const superAdminData = response.data as SuperAdminDashboardData;
              superAdminData.categories = mockCategoryData;
              setDashboardData(superAdminData);
            }
          } catch (categoryErr) {
            console.error('Kateqoriya məlumatları əldə edilərkən xəta:', categoryErr);
            // Xəta halında mock data istifadə edirik
            const superAdminData = response.data as SuperAdminDashboardData;
            superAdminData.categories = mockCategoryData;
            setDashboardData(superAdminData);
          }
        } else {
          setDashboardData(response.data);
        }
        
        // SuperAdmin üçün əlavə qrafik məlumatlarını əldə edirik
        if (user.role === 'superadmin') {
          try {
            const { data: chartsResponse, error: chartsError } = await supabase.functions.invoke('get-dashboard-charts');
            
            if (!chartsError && chartsResponse) {
              setChartData(chartsResponse);
            } else if (chartsError) {
              console.error('Qrafik məlumatları əldə edilərkən xəta:', chartsError);
              // Xəta halında mock data istifadə edirik
              setChartData(mockChartData);
            }
          } catch (chartErr) {
            console.error('Qrafik məlumatları əldə edilərkən xəta:', chartErr);
            // Xəta halında mock data istifadə edirik
            setChartData(mockChartData);
          }
        }
      } catch (mainErr) {
        console.error("Dashboard məlumatlarını əldə edərkən xəta:", mainErr);
        
        // CORS xətası halında mock data yaradaq
        if (user.role === 'superadmin') {
          const mockSuperAdminData: SuperAdminDashboardData = {
            stats: {
              regions: 12,
              sectors: 45,
              schools: 634,
              users: 912
            },
            formStats: {
              pending: 5,
              approved: 10,
              rejected: 8,
              total: 187
            },
            completionRate: 72,
            pendingApprovals: [
              { 
                id: '1', 
                title: 'Məktəb infrastruktur hesabatı', 
                date: new Date().toISOString(), 
                status: 'pending', 
                school: 'Bakı, 45 saylı məktəb',
                schoolName: 'Bakı 45 saylı məktəb',
                categoryName: 'İnfrastruktur',
                submittedAt: new Date().toISOString()
              },
              { 
                id: '2', 
                title: 'Müəllim hazırlığı hesabatı', 
                date: new Date().toISOString(), 
                status: 'pending', 
                school: 'Sumqayıt, 12 saylı məktəb',
                schoolName: 'Sumqayıt 12 saylı məktəb',
                categoryName: 'Müəllim hazırlığı',
                submittedAt: new Date().toISOString()
              },
              { 
                id: '3', 
                title: 'Tədris materialları hesabatı', 
                date: new Date().toISOString(), 
                status: 'pending', 
                school: 'Gəncə, 8 saylı məktəb',
                schoolName: 'Gəncə 8 saylı məktəb',
                categoryName: 'Tədris materialları',
                submittedAt: new Date().toISOString()
              }
            ],
            regions: [
              { id: '1', name: 'Bakı', sectorCount: 12, schoolCount: 120, completionRate: 85 },
              { id: '2', name: 'Sumqayıt', sectorCount: 5, schoolCount: 45, completionRate: 72 },
              { id: '3', name: 'Gəncə', sectorCount: 4, schoolCount: 38, completionRate: 68 }
            ],
            notifications: [],
            categories: mockCategoryData
          };
          
          setDashboardData(mockSuperAdminData);
          setChartData(mockChartData);
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
