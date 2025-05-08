
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/school';
import { useAuth } from '@/context/auth';

export const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  
  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('schools').select('*');
      
      // Filter by region/sector based on user role
      if (user?.role === 'regionadmin' && user.region_id) {
        query = query.eq('region_id', user.region_id);
      } else if (user?.role === 'sectoradmin' && user.sector_id) {
        query = query.eq('sector_id', user.sector_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setSchools(data as School[]);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);
  
  return { schools, loading, error, refetch: fetchSchools };
};

export default useSchoolsData;
