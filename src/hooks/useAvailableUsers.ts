
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from './user/userFetchService';
import { useAuth } from '@/context/AuthContext';

/**
 * Mövcud istifadəçiləri əldə etmək üçün hook
 * Admin təyinatı üçün uyğun olan (sektor admini olmayan və superadmin olmayan) istifadəçiləri qaytarır
 */
export const useAvailableUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: currentUser } = useAuth();

  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('İstifadəçiləri əldə etmə başladı...');
      console.log('Cari istifadəçi:', currentUser?.id, currentUser?.email);
      
      if (!currentUser) {
        console.warn('İstifadəçilər əldə edilərkən cari istifadəçi avtorizasiya olunmayıb');
      }
      
      const { users: fetchedUsers, error: fetchError } = await fetchAvailableUsersService();
      
      if (fetchError) {
        console.error('İstifadəçi əldə etmə xətası:', fetchError);
        throw fetchError;
      }
      
      console.log(`${fetchedUsers.length} istifadəçi əldə edildi`);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Cari istifadəçi dəyişdikdə istifadəçiləri yenidən əldə et
  useEffect(() => {
    if (currentUser) {
      fetchAvailableUsers();
    } else {
      console.log('Cari istifadəçi autentifikasiya olunmayıb, istifadəçi sorğusu edilmir');
      setUsers([]);
      setError(new Error('İstifadəçiləri əldə etmək üçün əvvəlcə daxil olun'));
      setLoading(false);
    }
  }, [fetchAvailableUsers, currentUser]);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
