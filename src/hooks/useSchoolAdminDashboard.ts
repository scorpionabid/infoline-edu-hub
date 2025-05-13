
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolAdminDashboardData, CategoryItem, FormItem, DeadlineItem } from '@/types/dashboard';

/**
 * Hook to fetch and manage dashboard data for School Admins
 */
const useSchoolAdminDashboard = () => {
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  /**
   * Fetches dashboard data from the API
   */
  const fetchDashboardData = useCallback(async () => {
    if (!user || !user.school_id) {
      console.warn('School ID not found, cannot load data.');
      setIsLoading(false);
      setError(new Error(t('schoolIdNotFound')));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Loading school admin dashboard data...', user.school_id);
      
      // Try to get data from edge function
      const { data: dashboardData, error: apiError } = await supabase.functions.invoke('get-dashboard-data', {
        body: { schoolId: user.school_id }
      });

      if (apiError) {
        console.error('Dashboard API error:', apiError);
        throw new Error(apiError.message || t('failedToLoadData'));
      }

      if (!dashboardData) {
        console.warn('Data is empty, using default data');
        
        // Default minimal data
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
            draft: 0,
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
            total: 0,
            draft: 0
          },
          pendingForms: [],
          completionRate: 0,
          notifications: []
        };
        
        setData(defaultData);
      } else {
        console.log('Dashboard data loaded successfully:', dashboardData);
        
        // Ensure required properties exist and are properly typed
        const enhancedData: SchoolAdminDashboardData = {
          ...dashboardData,
          status: dashboardData.status || {
            pending: 0,
            approved: 0,
            rejected: 0,
            draft: 0,
            total: 0,
            active: 0,
            inactive: 0
          },
          formStats: dashboardData.formStats || {
            pending: 0,
            approved: 0,
            rejected: 0,
            dueSoon: 0,
            overdue: 0,
            total: 0,
            draft: 0
          },
          // Ensure these are arrays of the right type
          categories: Array.isArray(dashboardData.categories) 
            ? dashboardData.categories as CategoryItem[]
            : [],
          upcoming: Array.isArray(dashboardData.upcoming) 
            ? dashboardData.upcoming as DeadlineItem[]
            : [],
          pendingForms: Array.isArray(dashboardData.pendingForms) 
            ? dashboardData.pendingForms as FormItem[]
            : [],
          notifications: dashboardData.notifications || [],
          // Handle completion/completionRate properly
          completionRate: dashboardData.completionRate || (
            typeof dashboardData.completion === 'object' 
              ? dashboardData.completion?.percentage || 0
              : (dashboardData.completion || 0)
          )
        };
        
        setData(enhancedData);
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      setError(error);
      toast.error(t('errorLoadingDashboard'), {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Navigate to specific form for data entry
   */
  const handleFormClick = (formId: string) => {
    navigate(`/data-entry/${formId}`);
  };

  /**
   * Navigate to general data entry page
   */
  const navigateToDataEntry = () => {
    navigate('/data-entry');
  };

  return {
    data,
    isLoading,
    error,
    refreshDashboard: fetchDashboardData,
    handleFormClick,
    navigateToDataEntry
  };
};

export default useSchoolAdminDashboard;
