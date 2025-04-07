
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from './user/userFetchService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
      console.log('Cari istifadəçi:', currentUser?.id, currentUser?.email);
      
      // Əvvəlcə mövcud sektor adminlərinin siyahısını alaq
      const { data: existingSectorAdmins, error: sectorAdminError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'sectoradmin');
        
      if (sectorAdminError) {
        console.error('Mövcud sektor adminlərini əldə edərkən xəta:', sectorAdminError);
        throw sectorAdminError;
      }
      
      // Mövcud admin ID-lərini array-ə çevirək
      const existingAdminIds = existingSectorAdmins.map(admin => admin.user_id);
      console.log(`${existingAdminIds.length} mövcud sektor admini tapıldı`);
      
      const { users: fetchedUsers, error: fetchError } = await fetchAvailableUsersService();
      
      if (fetchError) {
        console.error('İstifadəçi əldə etmə xətası:', fetchError);
        throw fetchError;
      }
      
      // Mövcud adminləri filtrlə
      const filteredUsers = fetchedUsers.filter(user => 
        !existingAdminIds.includes(user.id) && user.role !== 'superadmin' && user.role !== 'sectoradmin'
      );
      
      console.log(`${fetchedUsers.length} istifadəçidən ${filteredUsers.length} uyğun istifadəçi əldə edildi`);
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
