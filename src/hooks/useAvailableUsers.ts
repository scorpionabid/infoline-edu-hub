
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
  const { user: currentUser, isAuthenticated } = useAuth();

  const fetchAvailableUsers = useCallback(async () => {
    if (!isAuthenticated || !currentUser) {
      console.warn('İstifadəçilər əldə edilərkən cari istifadəçi avtorizasiya olunmayıb');
      setError(new Error('İstifadəçiləri əldə etmək üçün əvvəlcə daxil olun'));
      setUsers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('İstifadəçiləri əldə etmə başladı...');
      
      const { users: fetchedUsers, error: fetchError } = await fetchAvailableUsersService();
      
      if (fetchError) {
        console.error('İstifadəçi əldə etmə xətası:', fetchError);
        throw fetchError;
      }
      
      console.log(`${fetchedUsers.length} uyğun istifadəçi əldə edildi`);
      
      // Özünü çıxar (cari istifadəçi)
      const filteredUsers = fetchedUsers.filter(user => user.id !== currentUser.id);
      
      setUsers(filteredUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAuthenticated]);

  // Cari istifadəçi dəyişdikdə istifadəçiləri yenidən əldə et
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      fetchAvailableUsers();
    } else {
      console.log('Cari istifadəçi autentifikasiya olunmayıb, istifadəçi sorğusu edilmir');
      setUsers([]);
      setError(new Error('İstifadəçiləri əldə etmək üçün əvvəlcə daxil olun'));
      setLoading(false);
    }
  }, [fetchAvailableUsers, currentUser, isAuthenticated]);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
