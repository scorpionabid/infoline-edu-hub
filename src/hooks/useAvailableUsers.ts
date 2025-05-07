
import { useState, useEffect, useCallback } from 'react';
import { FullUserData } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Mövcud istifadəçiləri əldə etmək üçün hook
 * Admin təyinatı üçün uyğun olan istifadəçiləri qaytarır
 */
export const useAvailableUsers = () => {
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
      
      console.log('İstifadəçiləri əldə etmə başladı. Cari istifadəçi:', currentUser.id);
      
      // Yeni yaratdığımız get_full_user_data() funksiyasını çağırırıq
      const { data, error: functionError } = await supabase.rpc('get_full_user_data');
      
      if (functionError) {
        console.error('Funksiya ilə istifadəçilər əldə edilərkən xəta:', functionError);
        throw new Error(`İstifadəçilər əldə edilərkən xəta: ${functionError.message}`);
      }
      
      // Dataların təhlükəsiz şəkildə yoxlanması
      if (!data) {
        console.log('Funksiya boş data qaytardı');
        setUsers([]);
        setLoading(false);
        return;
      }
      
      console.log(`${data.length} istifadəçi əldə edildi`);
      
      // Özünü çıxaraq
      const otherUsers = data.filter(user => user && user.id && user.id !== currentUser.id);
      console.log(`Cari istifadəçi çıxarıldıqdan sonra ${otherUsers.length} istifadəçi qalır`);
      
      // Admin təyinatı üçün lazımi statusda olan istifadəçiləri filtrlə
      const availableUsers = otherUsers.filter(user => {
        // İstifadəçi aktiv vəziyyətdədirsə
        const isActive = user.status !== 'blocked' && user.full_name;
        
        // Təyin edilməmiş istifadəçilər (rolu user və ya boşdursa)
        const isUnassigned = (['user', ''].includes(user.role || '') || !user.role);
        
        // Məktəb direktoru (schooladmin) amma məktəbə təyin edilməyib
        const isUnassignedSchoolAdmin = user.role === 'schooladmin' && !user.school_id;
        
        console.log(`İstifadəçi ${user.id} (${user.full_name}): isActive=${isActive}, isUnassigned=${isUnassigned}, isUnassignedSchoolAdmin=${isUnassignedSchoolAdmin}`);
        
        return isActive && (isUnassigned || isUnassignedSchoolAdmin);
      });
      
      console.log(`Admin təyinatı üçün uyğun olan ${availableUsers.length} istifadəçi filtrləndi`);
      
      if (availableUsers.length === 0) {
        console.log('Heç bir uyğun istifadəçi tapılmadı');
        setUsers([]);
        setLoading(false);
        return;
      }
      
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
        position: user.user_position, // user_position kimi gəldiyi üçün position-a çeviririk
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
        
        // Admin entity məlumatları
        adminEntity: null
      } as FullUserData));
      
      setUsers(formattedUsers);
      
    } catch (err) {
      console.error('İstifadəçiləri əldə edərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçilər yüklənərkən xəta baş verdi'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, isAuthenticated, toast]);

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
