import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { AuthContext } from './context';
import { AuthContextType, AuthErrorType, UserFormData, AdminEntity } from './types';
import { Session } from '@supabase/supabase-js';

// Keşləmə və digər sabitlər
const USER_CACHE_KEY = 'infolineUserCache';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 dəqiqə (millisaniyə ilə)
const DEBOUNCE_DELAY = 300; // Debounce gecikməsi (millisaniyə ilə)
const AUTH_STATE_CHANGE_LOG_KEY = 'lastAuthStateChangeLog';
const AUTH_STATE_CHANGE_INTERVAL = 5000; // 5 saniyə
const FETCH_TIMEOUT = 15000; // 15 saniyə maksimum sorğu müddəti

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State-lər
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<AuthErrorType>(null);
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true
  });
  
  // Referanslar
  const lastFetchedUserId = useRef<string | null>(null);
  const lastFetchTime = useRef<number>(0);
  const authSubscription = useRef<{ subscription: { unsubscribe: () => void } } | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const fetchingUserData = useRef<boolean>(false); // Qarşılıqlı kilidlənmə üçün
  const fetchAbortController = useRef<AbortController | null>(null);
  const fetchTimeoutTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Auth state dinləyicisinin inisializasiya statusu
  const authListenerInitialized = useRef(false);

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
      localStorage.removeItem(USER_CACHE_KEY);
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

  // Auth state dəyişikliklərini loqlamaq üçün funksiya
  const shouldLogAuthStateChange = useCallback(() => {
    const now = Date.now();
    const lastLog = localStorage.getItem(AUTH_STATE_CHANGE_LOG_KEY);
    
    if (!lastLog) {
      localStorage.setItem(AUTH_STATE_CHANGE_LOG_KEY, now.toString());
      return true;
    }
    
    const lastLogTime = parseInt(lastLog, 10);
    if (now - lastLogTime > AUTH_STATE_CHANGE_INTERVAL) {
      localStorage.setItem(AUTH_STATE_CHANGE_LOG_KEY, now.toString());
      return true;
    }
    
    return false;
  }, []);

  // Əvvəlki sorğuları ləğv etmək üçün
  const cancelPreviousFetch = useCallback(() => {
    if (fetchTimeoutTimer.current) {
      clearTimeout(fetchTimeoutTimer.current);
      fetchTimeoutTimer.current = null;
    }
    
    if (fetchAbortController.current) {
      fetchAbortController.current.abort();
      fetchAbortController.current = null;
    }
  }, []);

  // İstifadəçi məlumatlarını əldə etmə funksiyası
  const fetchUserData = useCallback(async (currentSession: Session | null, forceRefresh = false): Promise<FullUserData | null> => {
    // Əgər artıq sorğu icra olunursa, təkrar sorğuya ehtiyac yoxdur
    if (fetchingUserData.current && !forceRefresh) {
      console.log('Artıq istifadəçi məlumatları sorğusu icra olunur, gözləyirik...');
      return user;
    }
    
    // Sessiya yoxdursa, istifadəçi məlumatlarını təmizləyirik
    if (!currentSession?.user) {
      console.log('Session yoxdur, istifadəçi məlumatlarını təmizləyirik');
      setUser(null);
      setAuthState({ isLoading: false, isAuthenticated: false });
      setCachedUser(null);
      return null;
    }
    
    const userId = currentSession.user.id;
    
    // Keş yoxlaması
    const now = Date.now();
    const shouldUseCache = !forceRefresh && 
                        user && 
                        lastFetchedUserId.current === userId && 
                        now - lastFetchTime.current < CACHE_EXPIRY;
                        
    if (shouldUseCache) {
      if (shouldLogAuthStateChange()) {
        console.log('Keşdən istifadəçi məlumatı istifadə olunur:', userId);
      }
      
      if (!authState.isAuthenticated) {
        setAuthState({ isLoading: false, isAuthenticated: true });
      }
      return user;
    }
    
    // Əvvəlki sorğuları ləğv edirik
    cancelPreviousFetch();
    
    // Yeni sorğu üçün abort controller yaradırıq
    fetchAbortController.current = new AbortController();
    
    // Sorğunun vaxtını keçməməsi üçün timeout qururuq
    fetchTimeoutTimer.current = setTimeout(() => {
      if (fetchingUserData.current) {
        console.warn('İstifadəçi məlumatlarını əldə etmə vaxtı keçdi');
        cancelPreviousFetch();
        fetchingUserData.current = false;
        
        // User artıq varsa, onu saxlayırıq, yoxdursa yüklənmə vəziyyətini sonlandırırıq
        if (user) {
          setAuthState({ isLoading: false, isAuthenticated: true });
        } else {
          setAuthState({ isLoading: false, isAuthenticated: false });
        }
      }
    }, FETCH_TIMEOUT);
    
    // Yüklənmə vəziyyətini təyin edirik
    fetchingUserData.current = true;
    
    if (!authState.isLoading) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
    }
    
    try {
      // Auth token yeniləməsi - session-un hələ də etibarlı olduğundan əmin oluruq
      try {
        if (currentSession.access_token) {
          await supabase.auth.setSession({
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token || ''
          });
        }
      } catch (tokenError) {
        console.warn('Token yeniləmə xətası:', tokenError);
      }
      
      // Rol və profil məlumatlarını paralel şəkildə əldə edirik
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
      
      // Xəta halında rolları yaratmağa çalışaq
      if (userRolesResult.error && userRolesResult.error.code === 'PGRST116') {
        try {
          // Default rol yaratmağa cəhd edirik
          console.log('İstifadəçi rolu tapılmadı, default rol yaratmağa cəhd edilir');
          await supabase.from('user_roles').insert({
            user_id: userId,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (createRoleError) {
          console.warn('Rol yaratma xətası:', createRoleError);
        }
      }
      
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

      // Profil tapılmadısa profil yaratmağa çalışırıq
      if (profileResult.error && profileResult.error.code === 'PGRST116') {
        try {
          console.log('İstifadəçi profili tapılmadı, profil yaratmağa cəhd edilir');
          await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: currentSession.user.email?.split('@')[0] || 'İstifadəçi',
              email: currentSession.user.email,
              language: 'az',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (createProfileError) {
          console.warn('Profil yaratma xətası:', createProfileError);
        }
      }

      // Admin qurumuna aid məlumatlar
      let adminEntity: AdminEntity = { 
        type: userRole,
        name: profile.full_name || currentSession.user.email?.split('@')[0] || ''
      };

      // Rola görə əlavə admin qurumu məlumatları
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

      // Xəta baş verə bilər - Abort signal ilə yoxlayırıq
      if (fetchAbortController.current?.signal.aborted) {
        console.log('İstifadəçi məlumatları sorğusu ləğv edildi');
        return null;
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

      // Sorğu artıq ləğv edilməyibsə, yeni məlumatları tətbiq edirik
      if (!fetchAbortController.current?.signal.aborted) {
        // Keş və referansları yeniləyirik
        lastFetchedUserId.current = userId;
        lastFetchTime.current = now;
        setCachedUser(fullUserData);
        
        // Render sayını optimallaşdırmaq üçün əvvəlcə istifadəçi məlumatlarını təyin edirik
        setUser(fullUserData);
        
        // Sonra autentifikasiya vəziyyətini yeniləyirik
        setAuthState({
          isAuthenticated: true,
          isLoading: false
        });
      }
      
      return fullUserData;
    } catch (error) {
      console.error('İstifadəçi məlumatları yükləmə xətası:', error);
      setError(error instanceof Error ? error.message : String(error));
      
      // Əgər istifadəçi məlumatları varsa, autentifikasiya vəziyyətini saxlayırıq
      if (user) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
      
      return null;
    } finally {
      // Clean-up
      fetchingUserData.current = false;
      cancelPreviousFetch();
    }
  }, [authState.isAuthenticated, authState.isLoading, cancelPreviousFetch, setCachedUser, shouldLogAuthStateChange, user]);

  // Auth state dinləyicisi
  useEffect(() => {
    // Əgər dinləyici artıq quraşdırılıbsa, yenidən quraşdırmırıq
    if (authListenerInitialized.current) {
      return;
    }
    
    console.log('Auth state dinləyicisi quraşdırılır');
    authListenerInitialized.current = true;
    
    // Əvvəlki temizlənmələr
    if (authSubscription.current) {
      authSubscription.current.subscription.unsubscribe();
    }
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // İlkin vəziyyəti təyin edirik
    setAuthState({ isAuthenticated: false, isLoading: true });
    
    // Keşdən istifadəçi məlumatlarını yükləyirik
    const cachedUser = getCachedUser();
    if (cachedUser) {
      console.log('Keşdən istifadəçi məlumatı istifadə olunur');
      setUser(cachedUser);
      lastFetchedUserId.current = cachedUser.id;
      setAuthState(prev => ({ ...prev, isAuthenticated: true }));
    }

    // Auth state dinləyicisini quraşdırırıq
    const { data } = supabase.auth.onAuthStateChange((event, currentSession) => {
      // Loqları azaltmaq üçün
      if (shouldLogAuthStateChange()) {
        console.log('Auth state dəyişikliyi:', event);
      }
      
      // Session təyin edirik
      setSession(currentSession);
      
      // Debounce təmizləyirik
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Event emal etmə
      if (event === 'SIGNED_IN') {
        // SIGNED_IN: Yeni giriş edildi
        if (!user || user.id !== currentSession?.user?.id) {
          debounceTimer.current = setTimeout(() => {
            fetchUserData(currentSession, true);
          }, DEBOUNCE_DELAY);
        }
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        // TOKEN_REFRESHED, USER_UPDATED: Mövcud sessiya yeniləndi
        if (user && user.id === currentSession?.user?.id) {
          // Eyni istifadəçi, məlumatları arxa planda yeniləyirik
          debounceTimer.current = setTimeout(() => {
            fetchUserData(currentSession, false);
          }, DEBOUNCE_DELAY);
        } else if (currentSession?.user) {
          // Fərqli istifadəçi, məlumatları dərhal yeniləyirik
          debounceTimer.current = setTimeout(() => {
            fetchUserData(currentSession, true);
          }, DEBOUNCE_DELAY);
        }
      } else if (event === 'SIGNED_OUT') {
        // SIGNED_OUT: Çıxış edildi
        cancelPreviousFetch();
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
    
    // Mövcud sessiyani yoxlayırıq
    const checkInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('İlkin sessiya yoxlaması:', currentSession ? 'Sessiya mövcuddur' : 'Sessiya yoxdur');
        
        // Sessiya təyin edirik
        setSession(currentSession);
        
        if (currentSession?.user) {
          if (!cachedUser || cachedUser.id !== currentSession.user.id) {
            // Keşdə istifadəçi yoxdursa, məlumatları yükləyirik
            await fetchUserData(currentSession, true);
          } else {
            // Keşdən əldə edilmiş istifadəçi varsa, onu istifadə edirik
            setUser(cachedUser);
            setAuthState({
              isAuthenticated: true,
              isLoading: false
            });
            
            // Arxa planda məlumatları yeniləyirik, amma render dövrünü azaltmaq üçün
            // bunu daha uzun gecikmə ilə edirik
            setTimeout(() => {
              fetchUserData(currentSession, false);
            }, 2000);
          }
        } else {
          setAuthState({
            isAuthenticated: false,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('İlkin sessiya yoxlama xətası:', error);
        setAuthState({
          isAuthenticated: false,
          isLoading: false
        });
      }
    };
    
    checkInitialSession();

    // Təmizləmə funksiyası
    return () => {
      if (authSubscription.current) {
        authSubscription.current.subscription.unsubscribe();
        authSubscription.current = null;
      }
      
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      
      cancelPreviousFetch();
    };
  }, [cancelPreviousFetch, fetchUserData, getCachedUser, setCachedUser, shouldLogAuthStateChange, user]);

  // Giriş funksiyası - KRİTİK: artıq signOut çağırmırıq!
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      // Əvvəlki xəta və məlumatları təmizləyirik
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      console.log('Giriş cəhdi edilir:', email);
      
      // Giriş məlumatlarını yoxlayırıq
      if (!email.trim() || !password.trim()) {
        setError('Email və şifrə daxil edilməlidir');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
      
      // Giriş edirik - KRİTİK: signOut çağırmadan birbaşa giriş edirik!
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Giriş xətasını emal edirik
      if (signInError) {
        console.error('Giriş xətası:', signInError);
        
        // Giriş xətası mesajları
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
      
      // Giriş uğurludursa, session-u təyin edirik
      console.log('Giriş uğurlu oldu, session təyin olunur');
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        
        // Sessiyanı təyin edirik
        setSession(data.session);
        
        // İstifadəçi məlumatlarını onAuthStateChange avtomatik olaraq yükləyəcək
        // Biz əlavə bir şey etməyə ehtiyac yoxdur
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
      
      // Əvvəlki sorğuları ləğv edirik
      cancelPreviousFetch();
      
      // Keşi təmizləyirik
      setCachedUser(null);
      lastFetchedUserId.current = null;
      
      // Çıxış edirik
      await supabase.auth.signOut();
      
      // Məlumatları təmizləyirik
      setUser(null);
      setSession(null);
      
      console.log('Çıxış uğurlu oldu');
      setAuthState({
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error: any) {
      console.error('Çıxış xətası:', error);
      setError(error.message || 'Gözlənilməz xəta baş verdi');
      toast.error('Çıxış xətası', {
        description: error.message || 'Gözlənilməz xəta baş verdi'
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, [cancelPreviousFetch, setCachedUser]);

  // İstifadəçi profilini yeniləmək
  const updateUser = useCallback(async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Yalnız uyğun sahələri seçirik
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // Sahələri yoxlayırıq və yalnız təqdim olunanları əlavə edirik
      if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
      
      // Profil məlumatlarını yeniləyirik
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [fetchUserData, session, user]);

  // İstifadəçi yaratma funksiyası (uyumluluk üçün əlavə edilib)
  const createUser = useCallback(async (userData: UserFormData) => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Supabase auth system üzərindən istifadəçi yaratmaq
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || Math.random().toString(36).slice(-8),
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Profiles tablosuna istifadəçi əlavə etmək
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (profileError) {
          throw profileError;
        }
        
        // Rol tablosuna əlavə etmək
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: data.user.id,
          role: userData.role,
          region_id: userData.region_id,
          sector_id: userData.sector_id,
          school_id: userData.school_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (roleError) {
          throw roleError;
        }
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('İstifadəçi yaratma xətası:', error);
      setError(error.message || 'İstifadəçi yaratma zamanı xəta baş verdi');
      return { data: null, error };
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Compatibility functions for legacy interface
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const success = await login(email, password);
      if (success) {
        return { data: { user: user }, error: null };
      } else {
        return { data: null, error: new Error(error || 'Giriş uğursuz oldu') };
      }
    } catch (err: any) {
      return { data: null, error: err };
    }
  }, [login, user, error]);

  const signOut = useCallback(async () => {
    return await logout();
  }, [logout]);

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

  // Debug məlumatları - loqları azaltmaq üçün şərti loqlama edirik
  useEffect(() => {
    if (shouldLogAuthStateChange()) {
      console.log('Auth state dəyişdi:', { 
        isAuthenticated: authState.isAuthenticated, 
        isLoading: authState.isLoading,
        userId: user?.id || 'null'
      });
    }
  }, [authState.isAuthenticated, authState.isLoading, shouldLogAuthStateChange, user]);
  
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
    refreshProfile,
    // Legacy support
    signIn,
    signOut,
    createUser
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
    refreshProfile,
    signIn,
    signOut,
    createUser
  ]);

  // Auth Provider-ı təqdim edirik
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};