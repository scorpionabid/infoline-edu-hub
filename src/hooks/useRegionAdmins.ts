import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/auth/useAuthStore';

interface RegionAdmin {
  id: string;
  full_name: string;
  email: string;
  role: string;
  region_id: string | null;
}

interface UseRegionAdminsResult {
  admins: RegionAdmin[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for fetching region administrators
 * @returns {UseRegionAdminsResult} The fetched region admins, loading state and error
 */
export function useRegionAdmins(): UseRegionAdminsResult {
  const [admins, setAdmins] = useState<RegionAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchRegionAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            user_roles!inner (
              role,
              region_id
            )
          `)
          .eq('user_roles.role', 'regionadmin');

        if (error) throw new Error(error.message);

        // Transform data format to match expected interface
        const transformedData: RegionAdmin[] = data?.map((item: any) => ({
          id: item.id,
          full_name: item.full_name,
          email: item.email,
          role: item.user_roles?.[0]?.role || 'regionadmin',
          region_id: item.user_roles?.[0]?.region_id || null
        })) || [];

        setAdmins(transformedData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching region admins:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch region admins'));
        setLoading(false);
      }
    };

    fetchRegionAdmins();
  }, [isAuthenticated]);

  return { admins, loading, error };
}
