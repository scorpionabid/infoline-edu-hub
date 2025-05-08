
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';

export function useDashboardData(entityId?: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      let endpoint = 'get-dashboard-data';
      let payload: any = { userId: user.id, role: user.role };
      
      if (entityId) {
        payload.entityId = entityId;
      }
      
      const { data: responseData, error: apiError } = await supabase.functions.invoke(endpoint, {
        body: payload
      });
      
      if (apiError) throw new Error(apiError.message);
      
      setData(responseData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, entityId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export default useDashboardData;
