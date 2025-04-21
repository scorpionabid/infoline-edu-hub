
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
  FormStatus,
  PendingItem,
  RegionStats,
  DashboardNotification
} from '@/types/dashboard';
import { usePermissions } from './auth/usePermissions';

// Mock verilər (API bağlantısı olmadıqda istifadə ediləcək)
const mockSuperAdminData: SuperAdminDashboardData = {
  stats: {
    regions: 12,
    sectors: 45,
    schools: 634,
    users: 912
  },
  formsByStatus: {
    pending: 145,
    approved: 489,
    rejected: 23,
    total: 657
  },
  completionRate: 72,
  pendingApprovals: [
    {
      id: 'pa1',
      title: 'İllik məktəb hesabatı',
      date: new Date().toISOString(),
      status: 'pending',
      schoolName: 'Bakı şəhəri 134 nömrəli orta məktəb',
      categoryName: 'İllik hesabat'
    },
    {
      id: 'pa2',
      title: 'Müəllimlər haqqında məlumat',
      date: new Date().toISOString(),
      status: 'pending',
      schoolName: 'Bakı şəhəri 158 nömrəli orta məktəb',
      categoryName: 'Kadr hesabatı'
    },
    {
      id: 'pa3',
      title: 'Şagird nailiyyətləri hesabatı',
      date: new Date().toISOString(),
      status: 'pending',
      schoolName: 'Sumqayıt şəhəri 12 nömrəli orta məktəb',
      categoryName: 'Akademik hesabat'
    }
  ],
  regions: [
    {
      id: 'r1',
      name: 'Bakı şəhəri',
      schoolCount: 286,
      sectorCount: 12,
      adminEmail: 'baku.admin@infolineaz.org',
      completionRate: 86
    },
    {
      id: 'r2',
      name: 'Sumqayıt şəhəri',
      schoolCount: 89,
      sectorCount: 5,
      adminEmail: 'sumgait.admin@infolineaz.org',
      completionRate: 75
    },
    {
      id: 'r3',
      name: 'Gəncə şəhəri',
      schoolCount: 72,
      sectorCount: 4,
      adminEmail: 'ganja.admin@infolineaz.org',
      completionRate: 68
    },
    {
      id: 'r4',
      name: 'Şəki şəhəri',
      schoolCount: 45,
      sectorCount: 3,
      adminEmail: 'sheki.admin@infolineaz.org',
      completionRate: 71
    }
  ],
  notifications: [
    {
      id: 'n1',
      title: 'Yeni hesabat tələbi',
      message: 'Növbəti ay üçün yeni hesabat tələbi əlavə edildi.',
      timestamp: new Date().toISOString(),
      type: 'info',
      read: false
    },
    {
      id: 'n2',
      title: 'Son tarix xəbərdarlığı',
      message: 'İllik məlumatlar üçün son tarix 5 gün qalıb.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      type: 'warning',
      read: true
    },
    {
      id: 'n3',
      title: 'Yeni məktəb əlavə edildi',
      message: 'Bakı şəhərində yeni məktəb sistemə əlavə edildi.',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      type: 'success',
      read: false
    }
  ]
};

// Mock qrafik verilər
const mockChartData: ChartData = {
  activityData: [
    { name: 'Məlumat giriş', value: 165 },
    { name: 'Təsdiqlər', value: 125 },
    { name: 'Rədd edilənlər', value: 18 },
    { name: 'Hesabatlar', value: 48 }
  ],
  regionSchoolsData: [
    { name: 'Bakı', value: 286 },
    { name: 'Sumqayıt', value: 89 },
    { name: 'Gəncə', value: 72 },
    { name: 'Şəki', value: 45 },
    { name: 'Digər', value: 142 }
  ],
  categoryCompletionData: [
    { name: 'İllik hesabat', completed: 512 },
    { name: 'Kadr hesabatı', completed: 489 },
    { name: 'Akademik hesabat', completed: 476 },
    { name: 'Maliyyə hesabatı', completed: 435 }
  ]
};

export const useRealDashboardData = () => {
  const { user } = useAuth();
  const { userRole, regionId, sectorId, schoolId } = usePermissions();
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

      // Rol və ID-yə görə əsas parametrləri təyin et
      const params: any = { 
        role: user.role,
      };
      
      if (userRole === 'regionadmin' && regionId) {
        params.entity_id = regionId;
      } else if (userRole === 'sectoradmin' && sectorId) {
        params.entity_id = sectorId;
      } else if (userRole === 'schooladmin' && schoolId) {
        params.entity_id = schoolId;
      }

      // API bağlantısını yoxla və real veriləri əldə etməyə çalış
      try {
        const { data: response, error: apiError } = await supabase.functions.invoke('get-dashboard-data', {
          body: params
        });

        if (apiError) {
          console.warn('Real API çağırışında xəta:', apiError);
          throw new Error(apiError.message);
        }

        if (response) {
          console.log('API-dən alınan məlumatlar:', response);
          setDashboardData(response);
          return; // Real data alındı, mock dataya keçməyə ehtiyac yoxdur
        }
      } catch (apiErr) {
        console.warn('API çağırışı mümkün olmadı, mock data istifadə edilir', apiErr);
      }

      // Əgər API bağlantısı uğursuz olsa, istifadəçi roluna görə mock data istifadə et
      if (userRole === 'superadmin') {
        console.log('SuperAdmin üçün mock data istifadə edilir');
        setDashboardData(mockSuperAdminData);
        setChartData(mockChartData);
      } else {
        // Digər rollar üçün uyğun mock datalar hazırlamaq olar
        console.log(`${userRole} rolu üçün mock data istifadə edilir`);
        // Burada digər rollar üçün mock datalar təyin edilə bilər
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
  }, [user, userRole, regionId, sectorId, schoolId, t, toast]);

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
