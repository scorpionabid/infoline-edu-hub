import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { ChartData, CategoryStat, SuperAdminDashboardData } from '@/types/dashboard';

export const useRealDashboardData = () => {
  const [dashboardData, setDashboardData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch form statistics
        const { data: formStatsData, error: formStatsError } = await supabase
          .from('data_entries')
          .select('status, count', { count: 'exact' });

        if (formStatsError) {
          throw new Error(`Error fetching form stats: ${formStatsError.message}`);
        }

        // Process form statistics
        const dataByStatus = formStatsData.reduce((acc: any, item: any) => {
          acc[item.status] = item.count;
          return acc;
        }, {});

        const totalForms = formStatsData.reduce((sum: number, item: any) => sum + item.count, 0);

        // Fetch region completion data
        const { data: regionCompletionData, error: regionCompletionError } = await supabase
          .from('regions')
          .select('name')
          .order('name', { ascending: true });

        if (regionCompletionError) {
          throw new Error(`Error fetching region completion data: ${regionCompletionError.message}`);
        }

        const regionData = regionCompletionData.map((region: any) => ({
          name: region.name,
          value: Math.floor(Math.random() * 100), // Mock completion rate
        }));

        // Fetch recent submissions
        const { data: recentSubmissions, error: recentSubmissionsError } = await supabase
          .from('data_entries')
          .select('id, school_id, category_id, created_at, status')
          .limit(5)
          .order('created_at', { ascending: false });

        if (recentSubmissionsError) {
          throw new Error(`Error fetching recent submissions: ${recentSubmissionsError.message}`);
        }

        // Make sure the returned object matches SuperAdminDashboardData type
        return {
          formStats: {
            pending: dataByStatus.pending || 0,
            approved: dataByStatus.approved || 0,
            rejected: dataByStatus.rejected || 0,
            total: totalForms,
            draft: dataByStatus.draft || 0,
            dueSoon: 0, // Add the missing properties
            overdue: 0  // Add the missing properties
          },
          regionCompletion: regionData,
          recentForms: recentSubmissions
        };
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData().then(data => {
      if (data) {
        setDashboardData(data as SuperAdminDashboardData);
      }
    });
  }, [user]);

  return {
    dashboardData,
    loading,
    error,
  };
};
