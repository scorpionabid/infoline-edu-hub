
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Edge function-dan bütün istifadəçiləri və rollarını əldə edirik
      const { data, error: functionError } = await supabase.functions.invoke('get_all_users_with_roles');
      
      if (functionError) {
        console.error('Edge function ilə istifadəçilər əldə edilərkən xəta:', functionError);
        throw new Error(`İstifadəçilər əldə edilərkən xəta: ${functionError.message}`);
      }
      
      if (!data || !data.users || data.users.length === 0) {
        console.log('Heç bir istifadəçi tapılmadı');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      console.log(`${data.users.length} istifadəçi əldə edildi, filtrlənir...`);
      
      // Admin olmayan və özü olmayan istifadəçiləri filtrləyirik
      const availableUsers = data.users.filter(user => 
        user.id !== currentUser.id && // özünü çıxarırıq
        user.role !== 'superadmin' && 
        user.role !== 'regionadmin' && 
        user.role !== 'sectoradmin' && 
        user.role !== 'schooladmin'
      );
      
      console.log(`${availableUsers.length} istifadəçi filtrləndikdən sonra qaldı`);
      
      // İstifadəçi məlumatlarını FullUserData formatına çeviririk
      const formattedUsers = availableUsers.map(user => ({
        id: user.id,
        email: user.email || '',
        full_name: user.full_name || 'İsimsiz İstifadəçi',
        role: user.role || 'user',
        region_id: user.region_id,
        sector_id: user.sector_id,
        school_id: user.school_id,
        phone: user.phone,
        position: user.position,
        language: user.language || 'az',
        avatar: user.avatar,
        status: user.status || 'active',
        last_login: user.last_login,
        created_at: user.created_at,
        updated_at: user.updated_at,
        
        // JavaScript/React tərəfində istifadə üçün CamelCase əlavə edir
        name: user.full_name || 'İsimsiz İstifadəçi',
        regionId: user.region_id,
        sectorId: user.sector_id,
        schoolId: user.school_id,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        
        // Admin olmadığı üçün boşdur
        adminEntity: null
      } as FullUserData));
      
      setUsers(formattedUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAuthenticated]);

  // Komponent yükləndikdə istifadəçiləri avtomatik əldə et
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

  // Document event dinamik yeniləmə üçün əlavə edildi
  useEffect(() => {
    const handleRefresh = () => {
      console.log('refresh-users event alındı, istifadəçilər yenilənir...');
      fetchAvailableUsers();
    };
    
    document.addEventListener('refresh-users', handleRefresh);
    
    return () => {
      document.removeEventListener('refresh-users', handleRefresh);
    };
  }, [fetchAvailableUsers]);

  return {
    users,
    loading,
    error,
    fetchAvailableUsers
  };
};
