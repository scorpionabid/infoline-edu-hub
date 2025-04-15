
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { getSchoolAdminDashboardData } from '@/services/dashboardService';
import { SchoolAdminDashboardData, FormItem } from '@/types/dashboard';

export const useSchoolAdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [data, setData] = useState<SchoolAdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchDashboardData = useCallback(async () => {
    if (!user || !user.schoolId) {
      setError(new Error(t('noSchoolAssociated')));
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const dashboardData = await getSchoolAdminDashboardData(user.schoolId);
      setData(dashboardData);
      
    } catch (err: any) {
      console.error("Məktəb admin dashboard məlumatlarını əldə edərkən xəta:", err);
      setError(err);
      toast({
        title: t('error'),
        description: t('errorFetchingDashboardData'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, t, toast]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  
  const navigateToDataEntry = useCallback(() => {
    navigate('/data-entry');
  }, [navigate]);
  
  const handleFormClick = useCallback((formId: string) => {
    navigate(`/data-entry/${formId}`);
  }, [navigate]);
  
  return {
    data: data || {
      forms: { pending: 0, approved: 0, rejected: 0, dueSoon: 0, overdue: 0, total: 0 },
      pendingForms: [],
      completionRate: 0,
      notifications: []
    },
    isLoading,
    error,
    refetch: fetchDashboardData,
    navigateToDataEntry,
    handleFormClick
  };
};

export default useSchoolAdminDashboard;
