
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { School, Region, Sector } from '@/types/school';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

export const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = useAuthStore(selectUser);
  
  const fetchRegions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      setRegions(data || []);
    } catch (err) {
      console.error('Error fetching regions:', err);
    }
  }, []);

  const fetchSectors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('status', 'active');
      
      if (error) throw error;
      setSectors(data || []);
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  }, []);
  
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
    fetchRegions();
    fetchSectors();
    fetchSchools();
  }, [fetchRegions, fetchSectors, fetchSchools]);
  
  return { 
    schools, 
    regions, 
    sectors, 
    loading, 
    error, 
    refetch: fetchSchools 
  };
};

export default useSchoolsData;
