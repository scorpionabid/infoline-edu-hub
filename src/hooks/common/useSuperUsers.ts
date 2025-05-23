
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';

export const useSuperUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuperUsers = async () => {
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
          .eq('user_roles.role', 'superadmin');

        if (error) throw error;
        setUsers(data as FullUserData[] || []);
      } catch (err) {
        console.error('Error fetching super users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperUsers();
  }, []);

  return {
    users,
    loading
  };
};
