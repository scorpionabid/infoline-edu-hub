import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseUserRegionResult {
  regionId: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get the current user's region ID based on their role
 * This is used for filtering assignable users by region
 */
export const useUserRegion = (): UseUserRegionResult => {
  const { user } = useAuth();
  const [regionId, setRegionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRegion = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if region_id is already available in user object
        if (user.region_id) {
          setRegionId(user.region_id);
          setIsLoading(false);
          return;
        }

        // Fetch user role data to get region_id if not available
        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('region_id, role')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error('Error fetching user region:', fetchError);
          setError('Failed to fetch user region');
          return;
        }

        // Set region ID if user has one
        setRegionId(data?.region_id || null);
        
      } catch (err) {
        console.error('Error in fetchUserRegion:', err);
        setError('Unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRegion();
  }, [user?.id, user?.region_id]);

  return {
    regionId,
    isLoading,
    error
  };
};

export default useUserRegion;