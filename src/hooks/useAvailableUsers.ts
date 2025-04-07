
import { useState, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from './user/userFetchService';

export const useAvailableUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('İstifadəçiləri yükləmə başladı...');
      
      const result = await fetchAvailableUsersService();
      
      if (result.error) {
        console.error('İstifadəçiləri yükləmə xətası:', result.error);
        setError(result.error);
        return;
      }
      
      console.log(`${result.users.length} istifadəçi uğurla yükləndi`);
      setUsers(result.users);
    } catch (err: any) {
      console.error('İstifadəçiləri yükləmə cəhdi zamanı xəta:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
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
