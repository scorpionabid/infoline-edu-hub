import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

// Regions cache system
let REGIONS_CACHE: any[] = [];
let isRegionsRequestInProgress = false;

export interface Region {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

interface UseRegionsResult {
  regions: Region[];
  loading: boolean;
  error: Error | null;
  fetchRegions: () => Promise<Region[]>;
}

/**
 * Hook for fetching regions with optimized caching
 * @returns UseRegionsResult object containing regions, loading state, error and fetchRegions function
 */
export const useRegions = (): UseRegionsResult => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  // Fetch regions function that can be called independently
  const fetchRegions = async (): Promise<Region[]> => {
    // If already have cached data, use it
    if (REGIONS_CACHE.length > 0) {
      console.log('Using cached regions data');
      setRegions(REGIONS_CACHE);
      setLoading(false);
      return REGIONS_CACHE;
    }

    // Avoid multiple concurrent requests
    if (isRegionsRequestInProgress) {
      console.log('Regions request already in progress, waiting...');
      return regions;
    }

    isRegionsRequestInProgress = true;
    setLoading(true);
    
    try {
      // Try first with RPC method
      let { data, error: rpcError } = await supabase
        .rpc('get_regions')
        .select('*');
        
      // If RPC fails, try direct table query
      if (rpcError || !data || data.length === 0) {
        console.log('RPC method failed, trying direct table query');
        
        const { data: tableData, error: tableError } = await supabase
          .from('regions')
          .select('*')
          .order('name', { ascending: true });
          
        if (tableError) throw tableError;
        data = tableData;
      }
      
      // If we have data, process it
      if (data && Array.isArray(data)) {
        // Format might be different depending on source
        const formattedData = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        // Update cache
        REGIONS_CACHE = formattedData;
        
        setRegions(formattedData);
        setError(null);
        return formattedData;
      } else {
        throw new Error('No regions data found');
      }
    } catch (err) {
      console.error('Error fetching regions:', err);
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch regions');
      setError(errorObj);
      return [];
    } finally {
      setLoading(false);
      isRegionsRequestInProgress = false;
    }
  };

  useEffect(() => {
    // Only fetch if authenticated
    if (isAuthenticated) {
      fetchRegions();
    }
  }, [isAuthenticated]);

  return { regions, loading, error, fetchRegions };
};

export default useRegions;
