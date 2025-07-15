import { useState, useEffect } from 'react';
import { FullUserData } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_assignable_users_safe');

      if (fetchError) throw fetchError;

      const transformedUsers: FullUserData[] = (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        region_id: user.region_id,
        sector_id: user.sector_id,
        school_id: user.school_id,
        phone: user.phone,
        position: user.position,
        language: user.language,
        avatar: user.avatar,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      setUsers(transformedUsers);
    } catch (err) {
      console.error('Error fetching available users:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers,
    refresh: fetchAvailableUsers
  };
};