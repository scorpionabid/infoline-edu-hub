import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { ChartData, CategoryStat, DashboardFormStats, PendingApproval, SuperAdminDashboardData } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

export const useRealDashboardData = () => {
  const [superAdminDashboard, setSuperAdminDashboard] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch form statistics
        const { data: formStatsData, error: formStatsError } = await supabase.from('data_entries')
          .select('status')
          .returns<{ status: string }[]>();

        if (formStatsError) throw formStatsError;

        const pendingCount = formStatsData.filter(item => item.status === 'pending').length;
        const approvedCount = formStatsData.filter(item => item.status === 'approved').length;
        const rejectedCount = formStatsData.filter(item => item.status === 'rejected').length;
        const totalCount = formStatsData.length;

        // Fetch region completion data
        const { data: regionCompletionData, error: regionCompletionError } = await supabase.from('regions')
          .select('name, id')
          .returns<{ name: string; id: string }[]>();

        if (regionCompletionError) throw regionCompletionError;

        // Fetch recent forms
        const { data: recentFormsData, error: recentFormsError } = await supabase.from('data_entries')
          .select(`
            id, status, created_at,
            schools ( id, name ),
            categories ( id, name )
          `)
          .limit(5)
          .returns<
            {
              id: string;
              status: string;
              created_at: string;
              schools: { id: string; name: string } | null;
              categories: { id: string; name: string } | null;
            }[]
          >();

        if (recentFormsError) throw recentFormsError;

        const recentForms: PendingApproval[] = recentFormsData.map(item => ({
          id: item.id,
          schoolId: item.schools?.id,
          schoolName: item.schools?.name || 'Unknown School',
          categoryId: item.categories?.id,
          categoryName: item.categories?.name || 'Unknown Category',
          submittedAt: item.created_at,
          status: item.status as 'pending' | 'approved' | 'rejected'
        }));

        const regionCompletion = regionCompletionData.map(region => ({
          region: region.name,
          completionRate: Math.floor(Math.random() * 100)
        }));

        const superAdminDashboard: SuperAdminDashboardData = {
          formStats: {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
            total: totalCount,
            draft: 0 // Adding the missing property
          },
          regionCompletion: regionCompletion,
          recentForms: recentForms
        };

        setSuperAdminDashboard(superAdminDashboard);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data', err);
        setError(err.message);
        toast.error(t('errorFetchingData'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, t]);

  return {
    superAdminDashboard,
    loading,
    error
  };
};
