import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, FullUserData } from '@/types/user';
import { useAuth } from '@/context/auth';

interface UseUserDataResult {
  user: FullUserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
}

export const useUserData = (): UseUserDataResult => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: userError } = await supabase
        .from('profiles')
        .select(
          `
          id,
          email,
          full_name,
          avatar_url,
          updated_at,
          phone,
          position,
          language,
          status,
          created_at,
          region_id,
          sector_id,
          school_id,
          last_login,
          notification_settings,
          regions ( name ),
          sectors ( name ),
          schools ( name )
        `
        )
        .eq('id', session.user.id)
        .single();

      if (userError) {
        setError(userError.message);
        console.error('Error fetching user data:', userError);
        return;
      }

      if (data) {
        const regionName = data.regions && data.regions.length > 0 ? data.regions[0].name : '';
        const sectorName = data.sectors && data.sectors.length > 0 ? data.sectors[0].name : '';
        const schoolName = data.schools && data.schools.length > 0 ? data.schools[0].name : '';

        const fullUserData: FullUserData = {
          id: data.id,
          email: data.email,
          full_name: data.full_name,
          avatar: data.avatar_url,
          updated_at: data.updated_at,
          phone: data.phone,
          position: data.position,
          language: data.language,
          status: data.status,
          created_at: data.created_at,
          region_id: data.region_id,
          sector_id: data.sector_id,
          school_id: data.school_id,
          last_login: data.last_login,
          notificationSettings: data.notification_settings,
          region_name: regionName,
          sector_name: sectorName,
          school_name: schoolName,
          entityName: {
            region: regionName,
            sector: sectorName,
            school: schoolName,
          },
        };
        setUser(fullUserData);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Unexpected error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return { user, loading, error, fetchUserData };
};
