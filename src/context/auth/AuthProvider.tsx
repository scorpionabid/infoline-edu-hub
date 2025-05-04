
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { AuthContext } from './context';
import { AuthContextType, AuthErrorType } from './types';
import { Session } from '@supabase/supabase-js';

// Keşləmə üçün sabitlər
const USER_CACHE_KEY = 'infolineUserCache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 dəqiqə (millisaniyə ilə)
const DEBOUNCE_DELAY = 100; // Debounce gecikməsi (millisaniyə ilə)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<AuthErrorType>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  
  const lastFetchedUserId = useRef<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const authSubscription = useRef<{ subscription: { unsubscribe: () => void } } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Keşləmə funksiyaları
  const getCachedUser = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(USER_CACHE_KEY);
      if (!cachedData) return null;
      
      const { data, expiry } = JSON.parse(cachedData);
      const now = Date.now();
      
      if (expiry > now) {
        return data;
      }
      
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    } catch (err) {
      console.warn('Cache oxuma xətası:', err);
      return null;
    }
  }, []);

  const setCachedUser = useCallback((userData: FullUserData | null) => {
    try {
      if (!userData) {
        localStorage.removeItem(USER_CACHE_KEY);
        return;
      }
      
      const expiry = Date.now() + CACHE_EXPIRY;
      localStorage.setItem(
        USER_CACHE_KEY,
        JSON.stringify({
          data: userData,
          expiry
        })
      );
    } catch (err) {
      console.warn('Cache yazma xətası:', err);
    }
  }, []);

  // İstifadəçi məlumatlarını əldə etmə funksiyası
  const fetchUserData = useCallback(async (currentSession: Session | null, forceRefresh = false) => {
    if (!currentSession?.user) {
      console.log('Session yoxdur, istifadəçi məlumatlarını təmizləyirik');
      setUser(null);
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      setCachedUser(null);
      return null;
    }
    
    const userId = currentSession.user.id;
    console.log(`İstifadəçi məlumatları yüklənir ID: ${userId}`);

    // Keş yoxlaması
    const now = Date.now();
    if (!forceRefresh && 
        user && 
        lastFetchedUserId.current === userId && 
        now - lastFetchTime.current < CACHE_EXPIRY) {
      console.log('Keşdən istifadəçi məlumatı istifadə olunur:', userId);
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: true }));
      return user;
    }
    
    // İstifadəçi keşdən əldə edilməsə, bazadan əldə edirik
    try {
      // Auth token yeniləmə
      if (currentSession.access_token) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token || ''
        });
      }
      
      // Paralel sorğular göndərərək performansı yaxşılaşdırırıq
      const [userRolesResult, profileResult] = await Promise.all([
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

      // Rol məlumatları
      const userRole = userRolesResult.data?.role || 'user';
      const region_id = userRolesResult.data?.region_id || null;
      const sector_id = userRolesResult.data?.sector_id || null;
      const school_id = userRolesResult.data?.school_id || null;
      
      // Profil məlumatları
      const profile = profileResult.data || {
        id: userId,
        full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
        email: currentSession.user.email,
        language: 'az',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Profil tapılmadısa və profil yaratma xətası oldusa, davam edirik
      if (profileResult.error && profileResult.error.code === 'PGRST116') {
        try {
          await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
              email: currentSession.user.email,
              language: 'az',
              status: 'active'
            });
        } catch (createError) {
          console.warn('Profil yaratma xətası:', createError);
        }
      }

      // AdminEntity məlumatlarını əldə etmək 
      let adminEntity = { 
        type: userRole,
        name: profile.full_name || currentSession.user.email?.split('@')[0] || ''
      };

      // Extra entity details for different admin types
      if (userRole === 'regionadmin' && region_id) {
        try {
          const { data } = await supabase
            .from('regions')
            .select('name')
            .eq('id', region_id)
            .single();
            
          if (data) {
            adminEntity.name = data.name || adminEntity.name;
            adminEntity.regionName = data.name;
          }
        } catch (error) {
          console.warn('Region məlumatları əldə edilə bilmədi:', error);
        }
      } else if (userRole === 'sectoradmin' && sector_id) {
        try {
          const { data } = await supabase
            .from('sectors')
            .select('name, regions(name)')
            .eq('id', sector_id)
            .single();
            
          if (data) {
            adminEntity.name = data.name || adminEntity.name;
            adminEntity.sectorName = data.name;
            adminEntity.regionName = data.regions?.name;
          }
        } catch (error) {
          console.warn('Sektor məlumatları əldə edilə bilmədi:', error);
        }
      } else if (userRole === 'schooladmin' && school_id) {
        try {
          const { data } = await supabase
            .from('schools')
            .select('name, sectors(name), regions(name)')
            .eq('id', school_id)
            .single();
            
          if (data) {
            adminEntity.name = data.name || adminEntity.name;
            adminEntity.schoolName = data.name;
            adminEntity.sectorName = data.sectors?.name;
            adminEntity.regionName = data.regions?.name;
          }
        } catch (error) {
          console.warn('Məktəb məlumatları əldə edilə bilmədi:', error);
        }
      }

      // İstifadəçi məlumatlarını birləşdirik
      const fullUserData: FullUserData = {
        id: userId,
        email: currentSession.user.email || profile.email || '',
        full_name: profile.full_name || currentSession.user.email?.split('@')[0] || '',
        role: userRole,
        avatar: profile.avatar || '',
        region_id: region_id,
        sector_id: sector_id,
        school_id: school_id,
        phone: profile.phone || '',
        position: profile.position || '',
        language: profile.language || 'az',
        status: profile.status || 'active',
        last_login: profile.last_login || null,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        adminEntity: adminEntity,
        // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
        name: profile.full_name || currentSession.user.email?.split('@')[0] || '',
        regionId: region_id,
        sectorId: sector_id,
        schoolId: school_id,
        lastLogin: profile.last_login || null,
        createdAt: profile.created_at || new Date().toISOString(),
        updatedAt: profile.updated_at || new Date().toISOString(),
      };

      // Keş və referans dəyərlərini yeniləyirik
      lastFetchedUserId.current = userId;
      lastFetchTime.current = now;
      setCachedUser(fullUserData);
      
      // State-ləri yeniləyirik
      setUser(fullUserData);
      setAuthState({
        isAuthenticated: true,
        isLoading: false
      });
      
      return fullUserData;
    } catch (error) {
      console.error('fetchUserData xətası:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [setCachedUser, user]);

  // Auth state dinləyicisi
  useEffect(() => {
    console.log('Auth state dinləyicisi quraşdırılır');
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Öncə keşi yoxlayırıq
    const cachedUser = getCachedUser();
    if (cachedUser) {
      console.log('Keşdən istifadəçi məlumatı istifadə olunur');
      setUser(cachedUser);
      lastFetchedUserId.current = cachedUser.id;
      setAuthState(prev => ({ ...prev, isAuthenticated: true }));
    }

    // Auth state dinləyicisini quraşdırırıq
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state dəyişikliyi:', event);
      
      // Session məlumatlarını yeniləyirik
      setSession(currentSession);
      
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Dəyişən event-ə görə müvafiq əməliyyatlar
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // Debounce mexanizmi ilə fetchUserData çağırırıq
        debounceTimer.current = setTimeout(() => {
          fetchUserData(currentSession);
        }, DEBOUNCE_DELAY);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
        setCachedUser(null);
        lastFetchedUserId.current = null;
      }
    });
    
    // Dinləyicinin referansını saxlayırıq
    authSubscription.current = data;
    
    // Mövcud sessiyanı yoxlayırıq
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('İlkin sessiya yoxlaması:', currentSession ? 'Sessiya mövcuddur' : 'Sessiya yoxdur');
      setSession(currentSession);
      
      // Sessiya varsa və keşdə istifadəçi məlumatı yoxdursa
      // və ya keşdəki istifadəçi IDsi ilə sessiya istifadəçi IDsi fərqlidirsə
      if (currentSession?.user) {
        if (!cachedUser || cachedUser.id !== currentSession.user.id) {
          fetchUserData(currentSession);
        } else {
          // Keşdən əldə edilmiş istifadəçi olsa da, arxa planda yeniləyirik
          setTimeout(() => {
            fetchUserData(currentSession, true);
          }, 1000);
          
          setAuthState({
            isAuthenticated: true,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    // Təmizləmə funksiyası
    return () => {
      if (authSubscription.current) {
        authSubscription.current.subscription.unsubscribe();
      }
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [fetchUserData, getCachedUser, setCachedUser]);

  // Giriş funksiyası - artıq signOut çağırmırıq!
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      console.log('Giriş cəhdi edilir:', email);
      
      if (!email.trim() || !password.trim()) {
        setError('Email və şifrə daxil edilməlidir');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      // Birbaşa giriş edirik
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error('Giriş xətası:', signInError);
        
        if (signInError.message?.includes('Invalid login credentials')) {
          setError('Yanlış email və ya şifrə');
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError('Email təsdiqlənməyib');
        } else if (signInError.message === 'Failed to fetch') {
          setError('Server ilə əlaqə qurula bilmədi. İnternet bağlantınızı yoxlayın.');
        } else {
          setError(signInError.message || 'Giriş zamanı xəta baş verdi');
        }
        
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      console.log('Giriş uğurlu oldu, session təyin olunur');
      // Yeni sessiya təyin edirik (bu avtomatik olaraq onAuthStateChange triggerləyəcək)
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        // Sessiyanı təyin edirik və istifadəçi məlumatlarını yeniləyirik
        setSession(data.session);
        
        // fetchUserData çağırmağa ehtiyac yoxdur - onAuthStateChange bunu edəcək
      }
      
      return true;
    } catch (error: any) {
      console.error('Gözlənilməz giriş xətası:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Login xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Çıxış funksiyası
  const logout = useCallback(async () => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Öncə keşi təmizləyirik
      setCachedUser(null);
      lastFetchedUserId.current = null;
      
      // Sonra çıxış edirik
      await supabase.auth.signOut();
      
      // Məlumatları təmizləyirik
      setUser(null);
      setSession(null);
      
      console.log('Çıxış uğurlu oldu');
    } catch (error: any) {
      console.error('Çıxış xətası:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Çıxış xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
    }
  }, [setCachedUser]);

  // İstifadəçi profilini yeniləmək
  const updateUser = useCallback(async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          position: updates.position,
          language: updates.language,
          avatar: updates.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // İstifadəçi məlumatlarını yeniləyirik
      if (session) {
        await fetchUserData(session, true);
      }
      
      toast.success('Profil uğurla yeniləndi');
      return true;
    } catch (error: any) {
      console.error('Profil yeniləmə xətası:', error);
      setError(error.message || 'Profil yeniləmə zamanı xəta baş verdi');
      toast.error('Profil yeniləmə xətası', {
        description: error.message || 'Profil yeniləmə zamanı xəta baş verdi'
      });
      return false;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [user, session, fetchUserData]);

  // İstifadəçi profilini manual yeniləmək
  const refreshProfile = useCallback(async (): Promise<FullUserData | null> => {
    if (!session) {
      // Sessiyanı yenidən əldə etməyə çalışırıq
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.warn('refreshProfile: Session məlumatları tapılmadı');
        return null;
      }
      
      // Sessiya tapıldıqda onu təyin edir və istifadəçi məlumatlarını yeniləyirik
      setSession(data.session);
      return await fetchUserData(data.session, true);
    }
    
    try {
      const updatedUser = await fetchUserData(session, true);
      return updatedUser;
    } catch (error) {
      console.error('Profil yeniləmə xətası:', error);
      return null;
    }
  }, [session, fetchUserData]);

  // Xəta mesajını təmizləmək
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context dəyəri
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError,
    refreshProfile
  }), [
    user, 
    session, 
    authState.isAuthenticated, 
    authState.isLoading, 
    error, 
    login, 
    logout, 
    updateUser, 
    clearError,
    refreshProfile
  ]);

  // Auth Provider-ı təqdim edirik
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
