
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';

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
      const { data: dashboardData, error: apiError } = await supabase.functions.invoke('get-dashboard-data', {
        body: { schoolId: user.schoolId }
      });

      if (apiError) {
        console.error('Dashboard API xətası:', apiError);
        throw new Error(apiError.message || t('failedToLoadData'));
      }

      if (!dashboardData) {
        // Əgər edge function işləmirsə və ya məlumat boşdursa, default məlumatlar istifadə edək
        console.warn('Məlumatlar boşdur, default məlumatlar istifadə edilir');
        
        // Default minimal məlumatlar
        const defaultData: SchoolAdminDashboardData = {
          completion: {
            percentage: 0,
            total: 0,
            completed: 0
          },
          status: {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
            active: 0,
            inactive: 0
          },
          categories: [],
          upcoming: [],
          formStats: {
            pending: 0,
            approved: 0,
            rejected: 0,
            dueSoon: 0,
            overdue: 0,
            total: 0
          },
          pendingForms: [],
          completionRate: 0,
          notifications: []
        };
        
        setData(defaultData);
      } else {
        console.log('Dashboard məlumatları uğurla yükləndi:', dashboardData);
        
        // Ensure status has active and inactive properties
        const enhancedData = {
          ...dashboardData,
          status: {
            ...dashboardData.status,
            active: dashboardData.status?.active || 0,
            inactive: dashboardData.status?.inactive || 0
          }
        };
        
        setData(enhancedData);
      }
    } catch (err: any) {
      console.error('Dashboard məlumatlarını yükləyərkən xəta:', err);
      setError(new Error(err.message || t('failedToLoadData')));
      
      toast.error(t('errorLoadingDashboard'), {
        description: err.message || t('unexpectedError'),
      });
      
      // Minimal default məlumatlar - xəta halında
      const defaultData: SchoolAdminDashboardData = {
        completion: { percentage: 0, total: 0, completed: 0 },
        status: { 
          pending: 0, 
          approved: 0, 
          rejected: 0, 
          total: 0,
          active: 0,
          inactive: 0
        },
        categories: [],
        upcoming: [],
        formStats: { 
          pending: 0, 
          approved: 0, 
          rejected: 0, 
          dueSoon: 0, 
          overdue: 0, 
          total: 0 
        },
        pendingForms: [],
        completionRate: 0,
        notifications: []
      };
      
      setData(defaultData);
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
