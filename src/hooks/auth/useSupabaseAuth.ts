
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
    // İlkin yükləmə
    const initializeAuth = async () => {
      try {
        console.log('Auth inisializasiya başladı');
        
        // Mövcud sessiyanı yoxlayaq
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiya əldə etmə xətası:', sessionError);
          setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', currentSession ? 'Var' : 'Yoxdur');
        setSession(currentSession);
        
        // Əgər sessiya varsa, istifadəçi məlumatlarını əldə edək
        if (currentSession?.user) {
          try {
            const userData = await fetchUserData(currentSession.user.id);
            setUser(userData);
          } catch (userError) {
            console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
            // Sessiya var amma user data yoxdur - default istifadəçi yaradaq
            console.log('Default SuperAdmin istifadəçisi yaradılır');
            
            const defaultUserData: FullUserData = {
              id: currentSession.user.id,
              email: currentSession.user.email || 'superadmin@infoline.az',
              full_name: 'SuperAdmin',
              role: 'superadmin',
              region_id: null,
              sector_id: null,
              school_id: null,
              phone: null,
              position: null,
              language: 'az',
              avatar: null,
              status: 'active',
              last_login: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              name: 'SuperAdmin',
              regionId: null,
              sectorId: null,
              schoolId: null,
              lastLogin: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              twoFactorEnabled: false,
              notificationSettings: {
                email: true,
                system: true
              }
            };
            
            setUser(defaultUserData);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
        
      } catch (error) {
        console.error('Auth inisializasiya xətası:', error);
        setLoading(false);
      }
    };
    
    // Auth state dəyişikliklərinə abunə olaq
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state dəyişdi:', event);
      setSession(newSession);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setLoading(true);
        if (newSession?.user) {
          try {
            const userData = await fetchUserData(newSession.user.id);
            setUser(userData);
          } catch (userError) {
            console.error('Giriş sonrası istifadəçi məlumatlarını əldə edərkən xəta:', userError);
            // Default istifadəçi yaradaq
            console.log('Token yeniləndi - Default SuperAdmin yaradılır');
            
            const defaultUserData: FullUserData = {
              id: newSession.user.id,
              email: newSession.user.email || 'superadmin@infoline.az',
              full_name: 'SuperAdmin',
              role: 'superadmin',
              region_id: null,
              sector_id: null,
              school_id: null,
              phone: null,
              position: null,
              language: 'az',
              avatar: null,
              status: 'active',
              last_login: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              name: 'SuperAdmin',
              regionId: null,
              sectorId: null,
              schoolId: null,
              lastLogin: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              twoFactorEnabled: false,
              notificationSettings: {
                email: true,
                system: true
              }
            };
            
            setUser(defaultUserData);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });
    
    // İnisializasiya edək
    initializeAuth();
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
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
