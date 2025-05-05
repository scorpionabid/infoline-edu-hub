
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AuthContext } from './context';
import { AuthContextType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

/**
 * AuthProvider - Auth state və əməliyyatlarını təqdim edir
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // References
  const lastFetchedUserId = useRef<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);
  const authInitialized = useRef<boolean>(false);

  // Keşləmə funksiyaları
  const USER_CACHE_KEY = 'info_line_user_cache';

  // Cache funksiyaları
  const getCachedUser = () => {
    try {
      const cachedUserStr = localStorage.getItem(USER_CACHE_KEY);
      if (!cachedUserStr) return null;
      
      const cachedUser = JSON.parse(cachedUserStr);
      const now = Date.now();
      
      if (cachedUser.expiry && cachedUser.expiry > now) {
        return cachedUser.user as FullUserData;
      }
      
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    } catch (e) {
      console.warn('User cache parsing error:', e);
      return null;
    }
  };

  const setCachedUser = (user: FullUserData | null) => {
    try {
      if (!user) {
        localStorage.removeItem(USER_CACHE_KEY);
        return;
      }
      
      const expiry = Date.now() + (30 * 60 * 1000); // 30 minutes
      localStorage.setItem(
        USER_CACHE_KEY,
        JSON.stringify({
          user,
          expiry
        })
      );
    } catch (e) {
      console.warn('User cache writing error:', e);
    }
  };

  // İstifadəçi məlumatlarını fetch etmək
  const fetchUserData = async (sessionData: Session | null, forceRefresh = false): Promise<void> => {
    if (!sessionData?.user) {
      setUser(null);
      setCachedUser(null);
      setIsLoading(false);
      return;
    }

    const userId = sessionData.user.id;
    
    // Artıq bu istifadəçi üçün məlumat cachlənibsə və force refresh deyilsə, return
    if (
      !forceRefresh && 
      user && 
      lastFetchedUserId.current === userId && 
      Date.now() - lastFetchTime.current < 10000
    ) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Tokeni yeniləyirik
      try {
        await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token || ''
        });
      } catch (e) {
        console.warn('Session token update failed:', e);
      }

      // Parallel olaraq user_roles və profile əldə edirik
      const [roleResult, profileResult] = await Promise.all([
        supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .maybeSingle(),
          
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
      ]);

      // User role məlumatlarını alırıq
      const userRole = roleResult.data?.role || 'user';
      const regionId = roleResult.data?.region_id;
      const sectorId = roleResult.data?.sector_id;
      const schoolId = roleResult.data?.school_id;
      
      // Profile məlumatları
      let profile = profileResult.data;
      
      // Əgər profil tapılmadısa, yaradaq
      if (!profile) {
        try {
          const { data: newProfile } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: sessionData.user.email,
              full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
            
          profile = newProfile;
        } catch (e) {
          console.error('Profile creation failed:', e);
          // Default profil yaradırıq əgər yaratma əməliyyatı uğursuz olsa
          profile = {
            id: userId,
            email: sessionData.user.email,
            full_name: sessionData.user.email?.split('@')[0] || 'İstifadəçi',
            language: 'az',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      }

      // İstifadəçi məlumatlarını birləşdiririk
      const userData: FullUserData = {
        id: userId,
        email: sessionData.user.email || '',
        role: userRole,
        region_id: regionId,
        sector_id: sectorId,
        school_id: schoolId,
        regionId: regionId,
        sectorId: sectorId,
        schoolId: schoolId,
        name: profile?.full_name || '',
        full_name: profile?.full_name || '',
        avatar: profile?.avatar || '',
        phone: profile?.phone || '',
        position: profile?.position || '',
        language: profile?.language || 'az',
        status: profile?.status || 'active',
        lastLogin: profile?.last_login || null,
        last_login: profile?.last_login || null,
        createdAt: profile?.created_at || new Date().toISOString(),
        updatedAt: profile?.updated_at || new Date().toISOString(),
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: profile?.updated_at || new Date().toISOString(),
        adminEntity: {
          type: userRole,
          name: profile?.full_name || '',
          schoolName: '',
          sectorName: '',
          regionName: ''
        },
        notificationSettings: {
          email: true,
          system: true
        }
      };

      // Keşləmə məlumatlarını yeniləyirik
      lastFetchedUserId.current = userId;
      lastFetchTime.current = Date.now();
      
      // State yeniləyirik
      setUser(userData);
      setCachedUser(userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login funksiyası
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      // Login edilir
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error.message);
        setError(error.message);
        return false;
      }
      
      setSession(data.session);
      
      // İstifadəçi məlumatlarını yükləmək üçün
      // auth listener tərəfindən avtomatik ediləcək
      
      return true;
    } catch (err: any) {
      console.error('Login exception:', err);
      setError(err.message || 'Giriş zamanı xəta baş verdi');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout funksiyası
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Çıxış edilir
      await supabase.auth.signOut();
      
      // State təmizləyirik
      setUser(null);
      setSession(null);
      setCachedUser(null);
      
      toast.success('Sistemdən uğurla çıxış edildi');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Çıxış zamanı xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  // İstifadəçi profilini yeniləmək
  const updateUser = async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      
      // Yeniləmək üçün məlumatları hazırlayırıq
      const updateData = {
        full_name: updates.full_name,
        phone: updates.phone,
        position: updates.position,
        language: updates.language,
        avatar: updates.avatar,
        updated_at: new Date().toISOString()
      };
      
      // Profili yeniləyirik
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Profile update error:', error);
        setError(error.message);
        return false;
      }
      
      // User state yeniləyirik
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      // Keşi yeniləyirik
      if (user) {
        setCachedUser({
          ...user,
          ...updates
        });
      }
      
      toast.success('Profil uğurla yeniləndi');
      return true;
    } catch (err: any) {
      console.error('Profile update exception:', err);
      setError(err.message || 'Profil yeniləmə zamanı xəta baş verdi');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Xəta mesajını təmizləmək
  const clearError = () => {
    setError(null);
  };

  // İstifadəçi profilini yeniləmək üçün funksiya
  const refreshProfile = async (): Promise<FullUserData | null> => {
    if (!session) return null;
    
    try {
      setIsLoading(true);
      await fetchUserData(session, true);
      return user;
    } catch (error: any) {
      console.error('Profile refresh error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auth state listener və session yoxlaması
  useEffect(() => {
    if (authInitialized.current) return;
    
    authInitialized.current = true;
    console.log('Setting up auth state listener');

    // Yüklənmə göstərilir
    setIsLoading(true);
    
    // Keşdən istifadəçini yükləyirik
    const cachedUser = getCachedUser();
    if (cachedUser) {
      console.log('Using cached user data during initialization');
      setUser(cachedUser);
    }
    
    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event);
      
      // Session update
      setSession(currentSession);
      
      // Event handling
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Təxirə salmaq üçün setTimeout istifadə edək
        setTimeout(() => {
          fetchUserData(currentSession);
        }, 100);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCachedUser(null);
        setIsLoading(false);
      }
    });
    
    // Subscription referansını saxlayırıq
    authSubscription.current = subscription;
    
    // İlkin session yoxlaması
    const checkSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        console.log('Initial session check:', initialSession ? 'Session exists' : 'No session');
        
        setSession(initialSession);
        
        if (initialSession) {
          await fetchUserData(initialSession);
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        console.error('Initial session check error:', e);
        setIsLoading(false);
      }
    };
    
    // Session yoxlaması
    checkSession();
    
    // Təmizləmə
    return () => {
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, []);

  // İstifadəçi məlumatları dəyişdikdə isAuthenticated dəyərini yeniləyək
  const isAuthenticated = useMemo(() => {
    return !!session && !!user;
  }, [session, user]);

  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    refreshProfile,
    // Legacy support
    signIn: login,
    signOut: logout,
    createUser: async () => ({ data: null, error: new Error('Not implemented') })
  }), [user, session, isAuthenticated, isLoading, error, login, logout, updateUser, clearError, refreshProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
