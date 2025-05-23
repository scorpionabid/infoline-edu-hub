
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          position,
          avatar,
          status,
          language,
          created_at,
          updated_at,
          user_roles (
            role,
            region_id,
            sector_id,
            school_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedUsers = data?.map(user => ({
        ...user,
        role: user.user_roles?.[0]?.role || 'user'
      })) || [];
      
      setUsers(transformedUsers as FullUserData[]);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    refetch: fetchUsers
  };
};
