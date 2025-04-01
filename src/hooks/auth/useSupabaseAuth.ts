
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, Profile } from '@/types/supabase';
import { AuthState, AuthActions, UseSupabaseAuthReturn } from './types';
import { 
  signIn, 
  signOut, 
  signUp, 
  resetPassword, 
  updateProfile, 
  updatePassword 
} from './authActions';
import { fetchUserData } from './userDataService';

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    loading: true,
    user: null,
    session: null,
    isAuthenticated: false,
    error: null
  });
  
  // İstifadəçi məlumatlarını yeniləmək üçün helper function
  const setUser = useCallback((user: FullUserData | null) => {
    setState(prevState => {
      // İstifadəçi varsa, hər zaman isAuthenticated true olmalıdır
      const isAuthenticated = !!user;
      
      return { 
        ...prevState, 
        user,
        isAuthenticated, // İstifadəçi varsa, autentifikasiya olunmuş sayılır
        // Əgər user null deyilsə, loading false olmalıdır
        loading: user === null ? prevState.loading : false
      };
    });
    console.log('[setUser] User state updated:', user ? `${user.email} (${user.role})` : 'null', 'isAuthenticated:', !!user);
  }, []);
  
  // Session-u yeniləmək üçün helper function
  const setSession = useCallback((session: any | null) => {
    setState(prevState => {
      // Sessiya varsa və istifadəçi məlumatları hələ yüklənməyibsə, isAuthenticated true olmalıdır
      // Amma istifadəçi məlumatları artıq yüklənibsə, onların dəyəri üstünlük təşkil edir
      const isAuthenticated = !!prevState.user || !!session;
      
      return { 
        ...prevState, 
        session,
        isAuthenticated
      };
    });
    console.log('[setSession] Session state updated:', session ? `Session ID: ${session.user?.id}` : 'null', 'isAuthenticated:', !!session);
    
    // Supabase klientində sessiyanı yeniləyək
    if (session) {
      supabase.auth.setSession(session);
    }
  }, []);
  
  // Loading state-ni yeniləmək üçün helper function
  const setLoading = useCallback((loading: boolean) => {
    setState(prevState => ({ ...prevState, loading }));
    console.log('[setLoading] Loading state updated:', loading);
  }, []);
  
  // Error state-ni yeniləmək üçün helper function
  const setError = useCallback((error: string | null) => {
    setState(prevState => ({ ...prevState, error }));
    console.log('[setError] Error state updated:', error);
  }, []);
  
  // Sessiya dəyişikliklərinə qulaq asaq və yeniləyək
  useEffect(() => {
    let mounted = true;
    
    // İlkin yükləmə
    const initializeAuth = async () => {
      try {
        console.log('Auth inisializasiya başladı');
        
        // ƏVVƏLCƏ mövcud sessiyanı yoxlayaq
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiya əldə etmə xətası:', sessionError);
          if (mounted) {
            setError(sessionError.message);
            setLoading(false);
          }
          return;
        }
        
        console.log('Mövcud sessiya:', currentSession ? `Var (${currentSession.user.id})` : 'Yoxdur');
        
        if (currentSession && mounted) {
          // Sessiya varsa, ilk öncə isAuthenticated=true olmalıdır
          setState(prevState => ({
            ...prevState,
            session: currentSession,
            isAuthenticated: true,
            loading: true
          }));
          
          try {
            console.log(`Istifadəçi məlumatları yüklənir: ${currentSession.user.id}`);
            const userData = await fetchUserData(currentSession.user.id);
            if (mounted) {
              setUser(userData);
              console.log('İstifadəçi məlumatları uğurla yükləndi:', userData.email, 'Role:', userData.role);
            }
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
            // Sessiya var amma user data yoxdur - minimal user obyekti yaradaq
            if (mounted) {
              // Düzəliş: FullUserData tipinə uyğun minimal user obyekti yaradaq
              const now = new Date().toISOString();
              const minimalUser: FullUserData = {
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                role: 'authenticated',
                name: currentSession.user.email?.split('@')[0] || 'User',
                full_name: currentSession.user.email?.split('@')[0] || 'User',
                language: 'az',
                status: 'active',
                createdAt: now,
                created_at: now,
                updatedAt: now,
                updated_at: now,
                // Digər tələb olunan sahələr
                school: null,
                school_id: null,
                schoolId: null,
                sector: null,
                sector_id: null,
                sectorId: null,
                region: null,
                region_id: null,
                regionId: null,
                twoFactorEnabled: false,
                notificationSettings: {
                  email: true,
                  system: true
                }
              };
              
              setUser(minimalUser);
              console.log('Minimal user obyekti yaradıldı:', currentSession.user.id);
            }
          }
        } else if (mounted) {
          // Sessiya yoxdursa, loading false və isAuthenticated false olmalıdır
          setState(prevState => ({
            ...prevState,
            loading: false,
            isAuthenticated: false,
            session: null,
            user: null
          }));
          console.log('Sessiya yoxdur, auth state sıfırlandı');
        }
        
        // SONRA Auth state dəyişikliklərinə abunə olaq
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state dəyişdi:', event, newSession ? 'Session var' : 'Session yoxdur');
          
          if (!mounted) return;
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log(`Auth event: ${event}, Session ID: ${newSession?.user?.id}`);
            
            // Sessiya varsa, ilk öncə isAuthenticated=true olmalıdır
            if (mounted && newSession) {
              setState(prevState => ({
                ...prevState,
                session: newSession,
                isAuthenticated: true,
                loading: true
              }));
              console.log(`Auth event: ${event}, isAuthenticated: true`);
            }
            
            if (newSession?.user) {
              try {
                console.log(`${event}: İstifadəçi məlumatları yüklənir: ${newSession.user.id}`);
                const userData = await fetchUserData(newSession.user.id);
                if (mounted) {
                  setUser(userData);
                  console.log(`${event}: İstifadəçi məlumatları uğurla yükləndi:`, userData.email, 'Role:', userData.role);
                }
              } catch (userError) {
                console.error(`${event}: İstifadəçi məlumatlarını əldə edərkən xəta:`, userError);
                if (mounted) {
                  // Düzəliş: FullUserData tipinə uyğun minimal user obyekti yaradaq
                  const now = new Date().toISOString();
                  const minimalUser: FullUserData = {
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    role: 'authenticated',
                    name: newSession.user.email?.split('@')[0] || 'User',
                    full_name: newSession.user.email?.split('@')[0] || 'User',
                    language: 'az',
                    status: 'active',
                    createdAt: now,
                    created_at: now,
                    updatedAt: now,
                    updated_at: now,
                    // Digər tələb olunan sahələr
                    school: null,
                    school_id: null,
                    schoolId: null,
                    sector: null,
                    sector_id: null,
                    sectorId: null,
                    region: null,
                    region_id: null,
                    regionId: null,
                    twoFactorEnabled: false,
                    notificationSettings: {
                      email: true,
                      system: true
                    }
                  };
                  
                  setUser(minimalUser);
                  console.log(`${event}: Minimal user obyekti yaradıldı:`, newSession.user.id);
                }
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setState({
                loading: false,
                user: null,
                session: null,
                isAuthenticated: false,
                error: null
              });
              console.log('İstifadəçi çıxış etdi');
            }
          }
        });
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth inisializasiya xətası:', error);
        if (mounted) {
          setState(prevState => ({
            ...prevState,
            loading: false,
            error: error.message
          }));
        }
      }
    };
    
    initializeAuth();
    
    // Cleanup
    return () => {
      mounted = false;
    };
  }, []);
  
  // Sessiya yeniləmə funksiyası
  const refreshSession = useCallback(async () => {
    try {
      // İlk öncə isAuthenticated=true olduğunu təmin edək
      setState(prevState => ({
        ...prevState,
        isAuthenticated: true,
        loading: true
      }));
      
      console.log('[refreshSession] Sessiyanı yeniləməyə çalışıram');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[refreshSession] Sessiyanı yeniləyərkən xəta:', error);
        setError(error.message);
        setLoading(false);
        return null;
      }
      
      console.log('[refreshSession] Sessiya uğurla yeniləndi:', data.session?.user?.id);
      
      // Sessiyanı birbaşa state-ə yerləşdirək
      setState(prevState => ({
        ...prevState,
        session: data.session,
        isAuthenticated: true
      }));
      
      if (data.session?.user) {
        try {
          console.log('[refreshSession] İstifadəçi məlumatlarını yeniləyirəm:', data.session.user.id);
          const userData = await fetchUserData(data.session.user.id);
          setUser(userData);
          console.log('[refreshSession] İstifadəçi məlumatları yeniləndi:', userData.email);
        } catch (userError) {
          console.error('[refreshSession] İstifadəçi məlumatlarını yeniləyərkən xəta:', userError);
        }
      }
      
      return data.session;
    } catch (error) {
      console.error('[refreshSession] Yeniləmə zamanı istisna:', error);
      setError(error instanceof Error ? error.message : 'Sessiyanı yeniləyərkən naməlum xəta');
      return null;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSession, setUser]);
  
  // fetchUserData-nın bağlı variantını yaradaq
  const handleFetchUserData = useCallback(async (userId: string) => {
    try {
      console.log('[handleFetchUserData] İstifadəçi məlumatlarını əldə edirəm:', userId);
      const userData = await fetchUserData(userId);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('[handleFetchUserData] İstifadəçi məlumatlarını əldə edərkən xəta:', error);
      setError(error instanceof Error ? error.message : 'İstifadəçi məlumatlarını əldə edərkən naməlum xəta');
      return null;
    }
  }, [setUser, setError]);
  
  // signIn-in bağlı variantını yaradaq
  const handleSignIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Əvvəlcə mövcud sessiyaları təmizləyək
      await supabase.auth.signOut();
      console.log('[handleSignIn] Əvvəlki sessiyalar təmizləndi, yeni giriş başlayır');
      
      const result = await signIn(email, password, setLoading);
      console.log('[handleSignIn] SignIn nəticəsi:', result ? 'Uğurlu' : 'Uğursuz');
      
      if (result) {
        // Sessiya məlumatlarını əldə edək
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[handleSignIn] Sessiya əldə edildi:', session.user.id);
          setSession(session);
          
          // İstifadəçi məlumatlarını əldə edək
          try {
            console.log('[handleSignIn] İstifadəçi məlumatlarını əldə edirəm:', session.user.id);
            const userData = await fetchUserData(session.user.id);
            setUser(userData);
            console.log('[handleSignIn] İstifadəçi məlumatları əldə edildi:', userData.email);
            
            // İstifadəçi məlumatları əldə edildikdən sonra vəziyyəti yeniləyək
            setState(prev => ({
              ...prev,
              isAuthenticated: true,
              loading: false
            }));
          } catch (userError) {
            console.error('[handleSignIn] İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('[handleSignIn] SignIn xətası:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSession, setUser]);
  
  // signOut-un bağlı variantını yaradaq
  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      await signOut(setLoading, setUser, setSession);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setLoading, setUser, setSession, setError]);
  
  // signUp-ın bağlı variantını yaradaq
  const handleSignUp = useCallback(async (email: string, password: string, userData: Partial<Profile>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await signUp(email, password, userData, setLoading);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setLoading, setError]);
  
  // resetPassword-in bağlı variantını yaradaq
  const handleResetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await resetPassword(email, setLoading);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [setLoading, setError]);
  
  // updateProfile-ın bağlı variantını yaradaq
  const handleUpdateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) return false;
    try {
      setError(null);
      return await updateProfile(updates, state.user.id, handleFetchUserData, setUser);
    } catch (error) {
      setError(error.message);
      return false;
    }
  }, [state.user, handleFetchUserData, setUser, setError]);
  
  // updatePassword-in bağlı variantını yaradaq
  const handleUpdatePassword = useCallback(async (password: string) => {
    try {
      setError(null);
      return await updatePassword(password);
    } catch (error) {
      setError(error.message);
      return false;
    }
  }, [setError]);

  // Hook return
  return {
    ...state,
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    fetchUserData: handleFetchUserData,
    refreshSession // refreshSession əlavə edildi
  };
};
