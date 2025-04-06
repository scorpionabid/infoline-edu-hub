
import { useState, useCallback, useEffect } from 'react';
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
      
      if (!fetchedUsers || !Array.isArray(fetchedUsers)) {
        console.warn('Heç bir istifadəçi tapılmadı veya data massiv deyil', fetchedUsers);
        setUsers([]);
        return;
      }
      
      console.log('Alınan istifadəçilər:', fetchedUsers.length, fetchedUsers);
      
      // İstifadəçi region admini isə, yalnız onun bölgəsindəki və ya role olmayan istifadəçiləri göstər
      let filteredUsers = fetchedUsers;
      if (user && user.role === 'regionadmin' && user.regionId) {
        console.log('Region admin filter tətbiq edilir:', user.regionId);
        
        filteredUsers = fetchedUsers.filter(u => {
          // Rolsuz/sadəcə user olan istifadəçilər təyin edilə bilər
          const isBasicUser = !u.role || u.role === 'user';
          
          // Ya da eyni regiondan olan, lakin regionadmin/sectoradmin olmayan istifadəçilər
          const isSameRegion = u.region_id === user.regionId && 
                              u.role !== 'regionadmin' && 
                              u.role !== 'sectoradmin';
          
          return isBasicUser || isSameRegion;
        });
        
        console.log('Filterlənmiş istifadəçilər:', filteredUsers.length);
      }
      
      // Əlavə filter - artıq admin olan istifadəçiləri çıxaraq
      filteredUsers = filteredUsers.filter(u => u.role !== 'sectoradmin');
      
      console.log(`${filteredUsers.length} istifadəçi yükləndi`);
      setUsers(filteredUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçiləri yükləyərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // İlkin yükləmə - komponent ilk dəfə mount olduqda istifadəçiləri yüklə
  useEffect(() => {
    if (user) {
      fetchAvailableUsers();
    }
  }, [fetchAvailableUsers, user]);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
