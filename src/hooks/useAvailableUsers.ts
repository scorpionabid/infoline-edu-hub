
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from './user/userFetchService';

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { users: fetchedUsers, error: fetchError } = await fetchAvailableUsersService();
      
      if (fetchError) {
        throw fetchError;
      }
      
      // Əgər istifadəçi məlumatları alınıbsa və array şəklindədirsə
      if (Array.isArray(fetchedUsers)) {
        setUsers(fetchedUsers);
      } else {
        console.warn('Məlumatlar array formatında deyil:', fetchedUsers);
        setUsers([]);
      }
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, []);

  // İlk yükləmə zamanı istifadəçiləri əldə et
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
