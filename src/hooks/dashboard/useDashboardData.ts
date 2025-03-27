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
import { mockCategories } from '@/data/mock/mockCategories';

export type { FormItem, DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData };

// Xəta statusu tipi
type ErrorStatus = {
  code: string;
  message: string;
  details?: any;
}

// Məlumatların vəziyyəti və xətaları izləmək üçün helper funksiya
function logStatus(status: string, data: any = null, error: any = null) {
  console.group(`useDashboardData: ${status}`);
  if (data) console.log('Data:', data);
  if (error) console.error('Error:', error);
  console.trace('Call stack:');
  console.groupEnd();
}

export const useDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [chartData, setChartData] = useState<ChartData>({
    activityData: [],
    regionSchoolsData: [],
    categoryCompletionData: []
  });
  
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  // Mockdata kontrol funksiyası
  const checkMockData = useCallback(() => {
    console.group("Mock data yoxlaması");
    console.log("mockCategories:", {
      type: typeof mockCategories,
      isArray: Array.isArray(mockCategories),
      length: Array.isArray(mockCategories) ? mockCategories.length : "N/A",
      sample: Array.isArray(mockCategories) && mockCategories.length > 0 ? mockCategories[0] : null
    });
    console.groupEnd();
  }, []);
  
  const fetchData = useCallback(async () => {
    const startTime = performance.now();
    logStatus('Məlumat yüklənməyə başladı', { user });
    
    setIsLoading(true);
    try {
      // İlk olaraq mock datanı yoxlayaq
      checkMockData();
      
      // User rolunu təyin edək
      if (user) {
        setUserRole(user.role);
        logStatus('User rolu təyin edildi', { role: user.role });
      } else {
        logStatus('User məlumatı mövcud deyil', null, new Error('Default rol təyin edilir'));
        setUserRole('schooladmin'); // Test üçün default rol təyin edirik
      }
      
      // Chart data-nı hazırlayırıq
      try {
        const chartDataResult = getChartData(t);
        setChartData(chartDataResult);
        logStatus('Chart data hazırlandı', { chartDataLength: chartDataResult.activityData.length });
      } catch (chartError) {
        logStatus('Chart data xətası', null, chartError);
      }
      
      // User-in rolundan asılı olaraq dashboard data-nı təyin edirik
      let dashboardResult: DashboardData;
      const currentRole = user?.role || 'schooladmin';
      
      logStatus('Role uyğun məlumat əldə edilir', { role: currentRole });
      
      // Try-catch blokları ilə hər bir data provideri əhatə edərək
      // xətaların daha dəqiq təsvirini əldə edək
      try {
        if (currentRole === 'superadmin') {
          dashboardResult = getSuperAdminData();
        } else if (currentRole === 'regionadmin') {
          dashboardResult = getRegionAdminData();
        } else if (currentRole === 'sectoradmin') {
          dashboardResult = getSectorAdminData();
        } else {
          // Default olaraq schooladmin data-sını göstərək
          dashboardResult = getSchoolAdminData();
        }
        
        logStatus('Dashboard data hazırlandı', { 
          pendingFormsCount: dashboardResult.pendingForms.length,
          deadlinesCount: dashboardResult.upcomingDeadlines.length
        });
        
        setDashboardData(dashboardResult);
      } catch (dashboardError: any) {
        const errorStatus: ErrorStatus = {
          code: 'DASHBOARD_DATA_ERROR',
          message: dashboardError.message || 'Dashboard məlumatları əldə edilərkən xəta baş verdi',
          details: dashboardError.stack
        };
        logStatus('Dashboard data xətası', null, errorStatus);
        throw new Error(`Dashboard data xətası: ${errorStatus.message}`);
      }
      
    } catch (err: any) {
      logStatus('Məlumat yüklənməsi xətası', null, err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Bilinməyən xəta'));
    } finally {
      setIsLoading(false);
      const endTime = performance.now();
      logStatus(`Məlumat yüklənməsi tamamlandı (${Math.round(endTime - startTime)}ms)`);
    }
  }, [t, user, checkMockData]);
  
  useEffect(() => {
    // İstifadəçi auth olduğunu yoxlayaq və səhifə yükləndikdə data-nı fetch edək
    logStatus('useDashboardData hook işə düşdü');
    logStatus('İstifadəçi authentication statusu', { isAuthenticated });
    
    if (isAuthenticated) {
      fetchData();
    } else {
      logStatus('İstifadəçi autentifikasiya olmayıb', null, { warning: 'Dashboard data yüklənmir' });
      setIsLoading(false);
    }
  }, [fetchData, isAuthenticated]);
  
  return { dashboardData, isLoading, error, chartData, userRole };
};
