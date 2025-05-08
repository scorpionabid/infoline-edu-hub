
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

export function useDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return;

      try {
        setLoading(true);
        // Get dashboard data based on user role
        const { data, error } = await supabase.functions.invoke('get-dashboard', {
          body: { userId: user.id, role: user.role }
        });

        if (error) throw error;
        setData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [user]);

  return { data, loading, error };
}
