
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolAdminDashboardData, FormItem, DashboardNotification } from '@/types/dashboard';

const useSchoolAdminDashboard = () => {
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    if (!user || !user.schoolId) {
      console.warn('Məktəb ID-si tapılmadı, məlumatlar yüklənə bilməz.');
      setIsLoading(false);
      setError(new Error(t('schoolIdNotFound')));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Məktəb admin dashboard məlumatları yüklənir...', user.schoolId);
      
      // Edge function vasitəsilə məlumatları əldə etməyə çalışaq
      const { data: dashboardData, error: apiError } = await supabase.functions.invoke('get-school-admin-dashboard', {
        body: { schoolId: user.schoolId }
      });

      if (apiError) {
        console.error('Dashboard API xətası:', apiError);
        throw new Error(apiError.message || t('failedToLoadData'));
      }

      if (!dashboardData) {
        // Əgər edge function işləmirsə və ya məlumat boşdursa, test məlumatları istifadə edək
        console.warn('Məlumatlar boşdur, test məlumatları istifadə edilir');
        
        // Məktəb verilənlərini hazırlayaq
        const mockData: SchoolAdminDashboardData = {
          completion: {
            percentage: 45,
            total: 20,
            completed: 9
          },
          status: {
            pending: 5,
            approved: 9,
            rejected: 2,
            total: 16
          },
          categories: [
            {
              id: '1',
              name: 'Əsas məlumatlar',
              completion: {
                percentage: 100,
                total: 5,
                completed: 5
              },
              status: 'approved',
              deadline: new Date(Date.now() + 864000000).toISOString()
            },
            {
              id: '2',
              name: 'Təhsil məlumatları',
              completion: {
                percentage: 60,
                total: 10,
                completed: 6
              },
              status: 'pending',
              deadline: new Date(Date.now() + 172800000).toISOString()
            }
          ],
          upcoming: [
            {
              id: '1',
              name: 'Büdcə məlumatları',
              deadline: new Date(Date.now() + 432000000).toISOString(),
              daysLeft: 5,
              completion: 0
            }
          ],
          forms: {
            pending: 5,
            approved: 9,
            rejected: 2,
            dueSoon: 1,
            overdue: 0,
            total: 16
          },
          pendingForms: [
            {
              id: '1',
              title: 'Əsas məlumatlar',
              category: 'Umumi',
              date: new Date(Date.now() + 172800000).toLocaleDateString(),
              status: 'pending' as const,
              completionPercentage: 60
            },
            {
              id: '2',
              title: 'Təhsil məlumatları',
              category: 'Təhsil',
              date: new Date(Date.now() + 432000000).toLocaleDateString(),
              status: 'dueSoon' as const,
              completionPercentage: 20
            }
          ],
          completionRate: 45,
          notifications: [
            {
              id: '1',
              title: 'Son tarix xəbərdarlığı',
              message: 'Təhsil məlumatları üçün son tarix 2 gün içindədir',
              timestamp: new Date().toISOString(),
              type: 'warning',
              read: false
            },
            {
              id: '2',
              title: 'Məlumatlar təsdiqləndi',
              message: 'Əsas məlumatlar kategoriyası sektor admini tərəfindən təsdiqləndi',
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              type: 'success',
              read: true
            }
          ]
        };
        
        setData(mockData);
      } else {
        console.log('Dashboard məlumatları uğurla yükləndi:', dashboardData);
        setData(dashboardData);
      }
    } catch (err: any) {
      console.error('Dashboard məlumatlarını yükləyərkən xəta:', err);
      setError(new Error(err.message || t('failedToLoadData')));
      
      toast.error(t('errorLoadingDashboard'), {
        description: err.message || t('unexpectedError'),
      });
      
      // Backup məlumatları hazırlayaq - əsas xətalar olduqda minimal göstəriş üçün
      setData({
        completion: { percentage: 0, total: 0, completed: 0 },
        status: { pending: 0, approved: 0, rejected: 0, total: 0 },
        categories: [],
        upcoming: [],
        forms: { pending: 0, approved: 0, rejected: 0, dueSoon: 0, overdue: 0, total: 0 },
        pendingForms: [],
        completionRate: 0,
        notifications: []
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Form elementini açmaq üçün
  const handleFormClick = useCallback((formId: string) => {
    navigate(`/data-entry/${formId}`);
  }, [navigate]);

  // Yeni məlumat daxil etmə səhifəsinə keçid
  const navigateToDataEntry = useCallback(() => {
    navigate('/data-entry');
  }, [navigate]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboardData,
    handleFormClick,
    navigateToDataEntry
  };
};

export default useSchoolAdminDashboard;
