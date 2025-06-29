
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
 * Works for all user roles - returns region_id from user_roles table
 */
export const useUserRegion = (): UseUserRegionResult => {
  const { user } = useAuth();
  const [regionId, setRegionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRegion = async () => {
      if (!user?.id) {
        console.log('🔍 useUserRegion - No user ID available');
        setRegionId(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 useUserRegion - Fetching region for user:', user.id);

        // Fetch user role data to get region_id
        const { data, error: fetchError } = await supabase
          .from('user_roles')
          .select('region_id, role, sector_id, school_id')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error('❌ useUserRegion - Error fetching user region:', fetchError);
          setError('Failed to fetch user region');
          setRegionId(null);
          return;
        }

        if (!data) {
          console.warn('⚠️ useUserRegion - No user role data found');
          setRegionId(null);
          return;
        }

        console.log('✅ useUserRegion - User role data:', {
          role: data.role,
          region_id: data.region_id,
          sector_id: data.sector_id,
          school_id: data.school_id
        });

        // Set region ID based on user role
        let userRegionId = data.region_id;

        // If user doesn't have direct region_id, try to get it from sector
        if (!userRegionId && data.sector_id) {
          console.log('🔍 useUserRegion - Getting region from sector:', data.sector_id);
          
          const { data: sectorData, error: sectorError } = await supabase
            .from('sectors')
            .select('region_id')
            .eq('id', data.sector_id)
            .single();

          if (sectorError) {
            console.error('❌ useUserRegion - Error fetching sector region:', sectorError);
          } else if (sectorData?.region_id) {
            userRegionId = sectorData.region_id;
            console.log('✅ useUserRegion - Found region from sector:', userRegionId);
          }
        }

        // If still no region and user has school_id, get region from school
        if (!userRegionId && data.school_id) {
          console.log('🔍 useUserRegion - Getting region from school:', data.school_id);
          
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .select('region_id, sector_id')
            .eq('id', data.school_id)
            .single();

          if (schoolError) {
            console.error('❌ useUserRegion - Error fetching school region:', schoolError);
          } else if (schoolData?.region_id) {
            userRegionId = schoolData.region_id;
            console.log('✅ useUserRegion - Found region from school:', userRegionId);
          }
        }

        setRegionId(userRegionId || null);
        console.log('✅ useUserRegion - Final region ID:', userRegionId || 'null');
        
      } catch (err) {
        console.error('❌ useUserRegion - Unexpected error:', err);
        setError('Unexpected error occurred');
        setRegionId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRegion();
  }, [user?.id]);

  return {
    regionId,
    isLoading,
    error
  };
};

export default useUserRegion;
