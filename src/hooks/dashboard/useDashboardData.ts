
import { useState, useEffect, useCallback, useRef } from 'react';
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
} from './providers';
import { getChartData } from './mockDashboardData';
import { mockCategories } from '@/data/mock/mockCategories';

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
  
  // İstəyin bir dəfə işləməsini təmin etmək üçün ref
  const dataFetchedRef = useRef(false);
  
  // Mockdata kontrol funksiyası
  const checkMockData = useCallback(() => {
    const mockDataValid = Array.isArray(mockCategories) && mockCategories.length > 0;
    
    if (!mockDataValid) {
      console.warn("Mock kateqoriya məlumatları yüklənmədi və ya boşdur");
    }
    
    return mockDataValid;
  }, []);
  
  const fetchData = useCallback(async () => {
    // Əgər məlumatlar artıq yüklənibsə, təkrar etmə
    if (dataFetchedRef.current && dashboardData) {
      return;
    }
    
    const startTime = performance.now();
    logStatus('Məlumat yüklənməyə başladı', { user });
    
    setIsLoading(true);
    try {
      // İlk olaraq mock datanı yoxlayaq
      checkMockData();
      
      // User rolunu təyin edək
      if (user && user.role) {
        // User role'u burada dəqiqləşdirək
        setUserRole(user.role);
        logStatus('User rolu təyin edildi', { role: user.role });
      } else {
        logStatus('User məlumatı mövcud deyil və ya role yoxdur', { user }, new Error('Default rol təyin edilir'));
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
        
        // Dashboard data-dan önəmli sahələrin mövcudluğunu yoxlayaq
        // və əgər olmazsa boş massivlər təyin edək
        if (!dashboardResult.pendingForms) {
          dashboardResult.pendingForms = [];
        }
        
        if (!dashboardResult.upcomingDeadlines) {
          dashboardResult.upcomingDeadlines = [];
        }
        
        if (!dashboardResult.notifications) {
          dashboardResult.notifications = [];
        }
        
        logStatus('Dashboard data hazırlandı', { 
          pendingFormsCount: dashboardResult.pendingForms.length,
          deadlinesCount: dashboardResult.upcomingDeadlines.length
        });
        
        setDashboardData(dashboardResult);
        // Məlumatlar uğurla yükləndikdə ref-i təyin edirik
        dataFetchedRef.current = true;
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
  }, [t, user, checkMockData, dashboardData]);
  
  useEffect(() => {
    // İstifadəçi auth olduğunu yoxlayaq və səhifə yükləndikdə data-nı fetch edək
    if (isAuthenticated && !dataFetchedRef.current) {
      fetchData();
    } else if (!isAuthenticated) {
      logStatus('İstifadəçi autentifikasiya olmayıb', null, { warning: 'Dashboard data yüklənmir' });
      setIsLoading(false);
    }
  }, [fetchData, isAuthenticated]);
  
  return { dashboardData, isLoading, error, chartData, userRole };
};

export type { FormItem, DashboardData, SuperAdminDashboardData, RegionAdminDashboardData, SectorAdminDashboardData, SchoolAdminDashboardData };
