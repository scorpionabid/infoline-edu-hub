
import { useState, useEffect } from 'react';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { fetchUserData } from './auth/userDataService';
import { fetchAvailableUsersService } from './user/userFetchService';

export const useAvailableUsers = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // İstifadəçiləri əldə etmək üçün servis çağrısı
  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('İstifadəçiləri əldə etmə başladı');
      
      // İstifadəçilər servisindən məlumatları alaq
      const result = await fetchAvailableUsersService();
      
      if (result.error) {
        throw result.error;
      }
      
      setUsers(result.users || []);
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      toast.error('İstifadəçilər yüklənərkən xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  // İlk dəfə yüklənmə
  useEffect(() => {
    fetchAvailableUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
