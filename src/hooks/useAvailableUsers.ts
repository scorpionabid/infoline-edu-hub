
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from '@/hooks/user/userFetchService';

export interface UseAvailableUsersReturn {
  users: FullUserData[];
  loading: boolean;
  error: Error | null;
  fetchAvailableUsers: () => Promise<void>;
}

export const useAvailableUsers = (): UseAvailableUsersReturn => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mövcud istifadəçiləri əldə etmək
  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Mövcud istifadəçilər yüklənir...');
      
      // User fetch servisini istifadə et - bu bizə daha uyğun olacaq
      const { users: fetchedUsers, error: fetchError } = await fetchAvailableUsersService();
      
      if (fetchError) {
        console.error('İstifadəçiləri yükləyərkən xəta baş verdi:', fetchError);
        throw new Error(fetchError.message);
      }
      
      if (!fetchedUsers || fetchedUsers.length === 0) {
        console.warn('Heç bir istifadəçi tapılmadı');
        setUsers([]);
        return;
      }
      
      console.log(`${fetchedUsers.length} istifadəçi yükləndi`);
      setUsers(fetchedUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçiləri yükləyərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
