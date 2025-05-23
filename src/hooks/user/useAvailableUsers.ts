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
      
      // İstifadəçiləri istədiyimiz formata çeviririk
      const formattedUsers = data.map((user: any) => {
        // Region, sektor və məktəb adları null ola bilər, buna görə təhlükəsiz şəkildə yoxlayırıq
        const regionName = user.region_name || '';
        const sectorName = user.sector_name || '';
        const schoolName = user.school_name || '';
        
        // Cari istifadəçini siyahıdan çıxarırıq (özünü təyin edə bilməz)
        if (user.id === currentUser.id) {
          return null;
        }
        
        return {
          id: user.id,
          email: user.email,
          full_name: user.full_name || user.email.split('@')[0],
          role: user.role || 'user',
          status: user.status || 'active',
          regionId: user.region_id || null,
          regionName,
          sectorId: user.sector_id || null,
          sectorName,
          schoolId: user.school_id || null,
          schoolName,
          created_at: user.created_at || '',
          last_sign_in_at: user.last_sign_in_at || null,
          // Rolu və təşkilati iyerarxiyanı göstərən əlavə sahə
          rolePath: [
            user.role,
            regionName ? `region:${regionName}` : null,
            sectorName ? `sector:${sectorName}` : null,
            schoolName ? `school:${schoolName}` : null
          ].filter(Boolean).join(' > ') as string // null və undefined dəyərləri filtərləyib string yaradırıq
        };
      }).filter(Boolean); // null istifadəçiləri (cari istifadəçi) çıxarırıq
      
      // İstifadəçiləri adlarına görə sıralayırıq
      formattedUsers.sort((a, b) => a.full_name.localeCompare(b.full_name));
      
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('İstifadəçilər əldə edilərkən xəta:', err);
      setError(err);
      toast({
        title: 'Xəta',
        description: `İstifadəçilər əldə edilərkən xəta: ${err.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentUser, toast]);

  // Komponent yükləndikdə istifadəçiləri əldə edirik
  useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  // Filtrlənmiş istifadəçiləri qaytaran funksiya
  const getFilteredUsers = useCallback((role?: string, searchTerm?: string) => {
    if (!users.length) return [];
    
    return users.filter(user => {
      // Rol filtrini yoxlayırıq
      const roleMatch = !role || user.role === role || (role === 'admin' && user.role.includes('admin'));
      
      // Axtarış sözünü yoxlayırıq
      const searchMatch = !searchTerm || 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.rolePath && user.rolePath.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return roleMatch && searchMatch;
    });
  }, [users]);

  return {
    users,
    loading,
    error,
    refetch: fetchAvailableUsers,
    getFilteredUsers
  };
};

export default useAvailableUsers;
