
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { fetchAvailableUsersService } from '@/hooks/user/userFetchService';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();

  // Mövcud istifadəçiləri əldə etmək
  const fetchAvailableUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Mövcud istifadəçilər yüklənir...', user?.role, user?.regionId);
      
      // User fetch servisini istifadə et
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
      
      // İstifadəçi region admini isə, yalnız onun bölgəsindəki və ya role olmayan istifadəçiləri göstər
      let filteredUsers = fetchedUsers;
      if (user && user.role === 'regionadmin' && user.regionId) {
        filteredUsers = fetchedUsers.filter(u => 
          !u.role || // rolu olmayanlar
          u.role === 'user' || // sadəcə user olanlar
          (u.regionId === user.regionId && u.role !== 'regionadmin') // eyni regiondakı adminlər (regionadmin olmamaq şərtiylə)
        );
      }
      
      console.log(`${filteredUsers.length} istifadəçi yükləndi`);
      setUsers(filteredUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçiləri yükləyərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Component mount olduqda istifadəçiləri əldə et
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
