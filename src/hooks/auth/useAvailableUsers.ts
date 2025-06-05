
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AvailableUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at: string;
}

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailableUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get profiles instead of auth.users as we can't query auth.users directly
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: AvailableUser[] = data?.map(user => ({
        id: user.id,
        email: user.email || '',
        full_name: user.full_name || '',
        role: 'user', // Default role
        created_at: user.created_at
      })) || [];

      setUsers(formattedUsers);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch users';
      setError(errorMessage);
      toast.error(errorMessage);
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
    refetch: fetchAvailableUsers
  };
};

export default useAvailableUsers;
