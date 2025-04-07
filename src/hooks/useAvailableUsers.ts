
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from './user/userFetchService';

/**
 * Mövcud istifadəçiləri əldə etmək üçün hook
 * Admin təyinatı üçün uyğun olan (sektor admini olmayan və superadmin olmayan) istifadəçiləri qaytarır
 */
export const useAvailableUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { users: fetchedUsers, error: fetchError } = await fetchAvailableUsersService();
      
      if (fetchError) {
        throw fetchError;
      }
      
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
