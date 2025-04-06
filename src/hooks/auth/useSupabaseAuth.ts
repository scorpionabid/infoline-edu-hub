
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, Profile } from '@/types/supabase';
import { AuthState, AuthActions, UseSupabaseAuthReturn } from './types';
import { signIn, signOut, signUp, resetPassword, updateProfile, updatePassword } from './authActions';
import { fetchUserData } from './userDataService';

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    loading: true,
    user: null,
    session: null
  });
  
  // İstifadəçi məlumatlarını yeniləmək üçün helper function
  const setUser = useCallback((user: FullUserData | null) => {
    setState(prevState => ({ ...prevState, user }));
  }, []);
  
  // Session-u yeniləmək üçün helper function
  const setSession = useCallback((session: any | null) => {
    setState(prevState => ({ ...prevState, session }));
  }, []);
  
  // Loading state-ni yeniləmək üçün helper function
  const setLoading = useCallback((loading: boolean) => {
    setState(prevState => ({ ...prevState, loading }));
  }, []);
  
  // Sessiya dəyişikliklərinə qulaq asaq və yeniləyək
  useEffect(() => {
    let mounted = true;
    let unsubscribe: { data?: { subscription: { unsubscribe: () => void } } } = {};
    
    // İlkin yükləmə
    const initializeAuth = async () => {
      try {
        console.log('Auth inisializasiya başladı');
        setLoading(true);
        
        // Mövcud sessiyanı yoxlayaq
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiya əldə etmə xətası:', sessionError);
          if (mounted) setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', currentSession ? 'Var' : 'Yoxdur');
        if (mounted) setSession(currentSession);
        
        // Auth state dəyişikliklərinə abunə olaq
        unsubscribe = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state dəyişdi:', event);
          
          if (!mounted) return;
          
          // Sinxron əməliyyatlar əvvəlcə
          setSession(newSession);
          
          // SIGNED_OUT halında user-i null-layıb state yeniləyib bitirək
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Sonra asinxron əməliyyatlar - yalnız lazım olduqda
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
            try {
              setLoading(true);
              const userData = await fetchUserData(newSession.user.id);
              if (mounted) setUser(userData);
            } catch (userError: any) {
              console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
              
              // Profil xətası ciddi problemdirsə avtomatik logout
              if (userError.message?.includes('Profil məlumatları əldə edilə bilmədi') ||
                  userError.message?.includes('rol təyin edilə bilmədi') ||
                  userError.message?.includes('İstifadəçi profili tapılmadı')) {
                console.warn('İstifadəçi məlumatlarında problem var, sessiyadan çıxırıq');
                
                // Rekursiv çağrı yaratmamaq üçün async çağırmırıq
                supabase.auth.signOut().then(() => {
                  if (mounted) {
                    setSession(null);
                    setUser(null);
                  }
                });
              }
            } finally {
              if (mounted) setLoading(false);
            }
          } else {
            if (mounted) setLoading(false);
          }
        });
        
        // Əgər sessiya varsa, istifadəçi məlumatlarını əldə edək
        // Amma rekursiv çağrıları önləmək üçün yalnız bir dəfə
        if (currentSession?.user && mounted) {
          try {
            const userData = await fetchUserData(currentSession.user.id);
            if (mounted) setUser(userData);
          } catch (userError: any) {
            console.error('İlkin istifadəçi məlumatlarını əldə edərkən xəta:', userError);
            
            // Profil xətası ciddi problemdirsə avtomatik logout
            if (userError.message?.includes('Profil məlumatları əldə edilə bilmədi') ||
                userError.message?.includes('rol təyin edilə bilmədi') ||
                userError.message?.includes('İstifadəçi profili tapılmadı')) {
              console.warn('İstifadəçi məlumatlarında problem var, sessiyadan çıxırıq');
              
              await supabase.auth.signOut();
              if (mounted) {
                setSession(null);
                setUser(null);
              }
            }
          }
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('Auth inisializasiya xətası:', error);
        if (mounted) setLoading(false);
      }
    };
    
    // İnisializasiya edək
    initializeAuth();
    
    // Cleanup
    return () => {
      mounted = false;
      if (unsubscribe.data?.subscription) {
        unsubscribe.data.subscription.unsubscribe();
      }
    };
  }, [setLoading, setSession, setUser]);
  
  // fetchUserData-nın bağlı variantını yaradaq
  const handleFetchUserData = useCallback(async (userId: string) => {
    return await fetchUserData(userId);
  }, []);
  
  // signIn-in bağlı variantını yaradaq
  const handleSignIn = useCallback(async (email: string, password: string) => {
    return await signIn(email, password, setLoading);
  }, [setLoading]);
  
  // signOut-un bağlı variantını yaradaq
  const handleSignOut = useCallback(async () => {
    await signOut(setLoading, setUser, setSession);
  }, [setLoading, setUser, setSession]);
  
  // signUp-ın bağlı variantını yaradaq
  const handleSignUp = useCallback(async (email: string, password: string, userData: Partial<Profile>) => {
    return await signUp(email, password, userData, setLoading);
  }, [setLoading]);
  
  // resetPassword-in bağlı variantını yaradaq
  const handleResetPassword = useCallback(async (email: string) => {
    return await resetPassword(email, setLoading);
  }, [setLoading]);
  
  // updateProfile-ın bağlı variantını yaradaq
  const handleUpdateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!state.user) return false;
    return await updateProfile(updates, state.user.id, handleFetchUserData, setUser);
  }, [state.user, handleFetchUserData, setUser]);
  
  // updatePassword-in bağlı variantını yaradaq
  const handleUpdatePassword = useCallback(async (password: string) => {
    return await updatePassword(password);
  }, []);

  // Hook return
  return {
    ...state,
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    fetchUserData: handleFetchUserData
  };
};
