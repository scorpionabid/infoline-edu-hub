
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export const useRegionAdmins = () => {
  const [admins, setAdmins] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegionAdmins = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles (
              role,
              region_id,
              sector_id,
              school_id
            )
          `)
          .eq('user_roles.role', 'regionadmin');

        if (error) throw error;
        setAdmins(data as FullUserData[] || []);
      } catch (err) {
        console.error('Error fetching region admins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionAdmins();
  }, []);

  return {
    admins,
    loading
  };
};
