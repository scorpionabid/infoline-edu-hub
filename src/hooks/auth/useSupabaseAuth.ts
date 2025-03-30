
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
    
    // İlkin yükləmə
    const initializeAuth = async () => {
      try {
        console.log('Auth inisializasiya başladı');
        
        // ƏVVƏLCƏ mövcud sessiyanı yoxlayaq
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiya əldə etmə xətası:', sessionError);
          if (mounted) setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', currentSession ? 'Var' : 'Yoxdur');
        
        if (currentSession && mounted) {
          setSession(currentSession);
          
          try {
            const userData = await fetchUserData(currentSession.user.id);
            if (mounted) {
              setUser(userData);
            }
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
            // Sessiya var amma user data yoxdur - minimal user obyekti yaradaq
            if (mounted) {
              // Minimal user obyekti yaradaq ki, isAuthenticated true olsun
              setUser({
                id: currentSession.user.id,
                email: currentSession.user.email || '',
                role: 'authenticated',
                // Digər sahələr üçün default dəyərlər
                full_name: '',
                avatar_url: null,
                created_at: new Date().toISOString()
              });
              console.log('Minimal user obyekti yaradıldı:', currentSession.user.id);
            }
          }
        }
        
        // SONRA Auth state dəyişikliklərinə abunə olaq
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state dəyişdi:', event);
          
          if (!mounted) return;
          
          setSession(newSession);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (newSession?.user) {
              try {
                setLoading(true);
                const userData = await fetchUserData(newSession.user.id);
                if (mounted) {
                  setUser(userData);
                  setLoading(false);
                }
              } catch (userError) {
                console.error('Giriş sonrası istifadəçi məlumatlarını əldə edərkən xəta:', userError);
                if (mounted) {
                  // Minimal user obyekti yaradaq ki, isAuthenticated true olsun
                  setUser({
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    role: 'authenticated',
                    // Digər sahələr üçün default dəyərlər
                    full_name: '',
                    avatar_url: null,
                    created_at: new Date().toISOString()
                  });
                  console.log('SIGNED_IN hadisəsi zamanı minimal user obyekti yaradıldı:', newSession.user.id);
                  setLoading(false);
                }
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (mounted) {
              setUser(null);
              setLoading(false);
            }
          }
        });
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth inisializasiya xətası:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();
    
    // Cleanup
    return () => {
      mounted = false;
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
