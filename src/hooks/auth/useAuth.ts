
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { checkSession, fetchUserRole, fetchUserProfile, logoutUser } from '@/services/authService';
import { FullUserData } from '@/types/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // İstifadəçi məlumatlarını əldə etmək üçün funksiya
  const fetchUserData = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      // İstifadəçi rolunu əldə edirik
      const { role, regionId, sectorId, schoolId, error: roleError } = await fetchUserRole(userId);
      
      if (roleError) {
        throw new Error('İstifadəçi rolu əldə edilə bilmədi');
      }
      
      // İstifadəçi profilini əldə edirik
      const { profile, error: profileError } = await fetchUserProfile(userId);
      
      if (profileError) {
        throw new Error('İstifadəçi profili əldə edilə bilmədi');
      }
      
      // Auth istifadəçisini əldə edirik (e-poçt ünvanı üçün)
      const { data: authData } = await supabase.auth.getUser();
      const email = authData?.user?.email || '';
      
      if (profile) {
        // İstifadəçi məlumatlarını birləşdiririk
        const userData: FullUserData = {
          id: userId,
          email: email,
          full_name: profile.full_name || 'İsimsiz İstifadəçi',
          role: role || 'user',
          region_id: regionId,
          sector_id: sectorId,
          school_id: schoolId,
          phone: profile.phone,
          position: profile.position,
          language: profile.language || 'az',
          avatar: profile.avatar,
          status: profile.status || 'active',
          last_login: profile.last_login,
          created_at: profile.created_at || '',
          updated_at: profile.updated_at || '',
          
          // JavasScript üçün əlavə aliaslar
          name: profile.full_name || 'İsimsiz İstifadəçi',
          regionId: regionId,
          sectorId: sectorId,
          schoolId: schoolId,
          lastLogin: profile.last_login,
          createdAt: profile.created_at || '',
          updatedAt: profile.updated_at || '',
          
          // Notifikasiya parametrləri
          twoFactorEnabled: false,
          notificationSettings: {
            email: true,
            system: true
          }
        };
        
        setUser(userData);
        console.log('İstifadəçi məlumatları uğurla əldə edildi:', userData);
      } else {
        throw new Error('İstifadəçi profili boşdur');
      }
    } catch (err) {
      console.error('İstifadəçi məlumatları əldə edilərkən xəta:', err);
      setError(err instanceof Error ? err : new Error('İstifadəçi məlumatları əldə edilərkən xəta baş verdi'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Autentifikasiya dəyişikliklərini izləyir
  useEffect(() => {
    let mounted = true;
    
    // İlkin yüklənmə zamanı sessiya yoxlanışı
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log('Auth inisializasiya başladı');
        
        const { session, error } = await checkSession();
        
        if (error) {
          throw error;
        }
        
        if (session && session.user && mounted) {
          console.log('Mövcud sessiya: Var');
          console.log('Ilkin sessiya üçün istifadəçi məlumatları əldə edilir, ID:', session.user.id);
          await fetchUserData(session.user.id);
        } else {
          console.log('Mövcud sessiya: Yoxdur');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth inisializasiya xətası:', err);
        setError(err instanceof Error ? err : new Error('Autentifikasiya inisializasiyası zamanı xəta baş verdi'));
        setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    // Auth dəyişikliklərini izləmək üçün dinləyici
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state dəyişdi:', event, session ? 'Session var' : 'Session yoxdur');
      
      if (event === 'SIGNED_IN' && session && mounted) {
        await fetchUserData(session.user.id);
      } else if (event === 'SIGNED_OUT' && mounted) {
        setUser(null);
      }
    });
    
    initializeAuth();
    
    // Cleanup
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserData]);
  
  // Sistemdən çıxış funksiyası
  const logout = useCallback(async () => {
    const { success, error } = await logoutUser();
    
    if (!success && error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    }
    
    return success;
  }, []);
  
  return {
    user,
    isLoading,
    error,
    logout
  };
};
