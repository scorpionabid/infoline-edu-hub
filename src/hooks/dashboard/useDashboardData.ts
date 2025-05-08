
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        setLoading(true);
        // Get dashboard data based on user role
        const { data, error } = await supabase.functions.invoke('get-dashboard-data', {
          body: { userId: user.id, role: user.role }
        });

        if (error) throw error;
        setData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  return { data, loading, error };
}

export default useDashboardData;
