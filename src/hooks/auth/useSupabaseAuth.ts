import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, Profile } from '@/types/supabase';
import { AuthState, AuthActions, UseSupabaseAuthReturn } from './types';
import { fetchUserData } from './userDataService';

const signIn = async (email: string, password: string, setLoading: (loading: boolean) => void) => {
  try {
    console.log(`signIn: ${email} ilə giriş edilir...`);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('signIn xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

const signOut = async (
  setLoading: (loading: boolean) => void, 
  setUser: (user: FullUserData | null) => void,
  setSession: (session: any | null) => void
) => {
  try {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  } catch (error) {
    console.error('signOut xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

const signUp = async (email: string, password: string, userData: any, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('signUp xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

const resetPassword = async (email: string, setLoading: (loading: boolean) => void) => {
  try {
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('resetPassword xətası:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('updatePassword xətası:', error);
    throw error;
  }
};

const updateProfile = async (
  updates: any, 
  userId: string, 
  fetchUserDataFn: (userId: string) => Promise<FullUserData | null>, 
  setUser: (user: FullUserData | null) => void
) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
      
    if (error) throw error;
    
    const userData = await fetchUserDataFn(userId);
    
    if (userData) {
      setUser(userData);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('updateProfile xətası:', error);
    throw error;
  }
};

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    session: null,
    loading: true
  });
  
  const setUser = useCallback((user: FullUserData | null) => {
    setState(prevState => ({ ...prevState, user }));
  }, []);
  
  const setSession = useCallback((session: any | null) => {
    setState(prevState => ({ ...prevState, session }));
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    setState(prevState => ({ ...prevState, loading }));
  }, []);
  
  useEffect(() => {
    let mounted = true;
    let unsubscribe: { data?: { subscription: { unsubscribe: () => void } } } = {};
    
    const initializeAuth = async () => {
      try {
        console.log('Auth inisializasiya başladı');
        setLoading(true);
        
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Sessiya əldə etmə xətası:', sessionError);
          if (mounted) setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', currentSession ? 'Var' : 'Yoxdur');
        
        if (mounted) setSession(currentSession);
        
        unsubscribe = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state dəyişdi:', event, newSession ? 'Session var' : 'Session yoxdur');
          
          if (!mounted) return;
          
          setSession(newSession);
          
          if (event === 'SIGNED_OUT') {
            console.log('İstifadəçi çıxış etdi, state təmizlənir');
            setUser(null);
            setLoading(false);
            return;
          }
          
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
            try {
              console.log(`İstifadəçi məlumatları əldə edilir, ID: ${newSession.user.id}`);
              setLoading(true);
              
              const userData = await fetchUserData(newSession.user.id);
              console.log('İstifadəçi məlumatları əldə edildi:', userData ? 'Uğurlu' : 'Uğursuz');
              
              if (mounted) {
                setUser(userData);
                console.log('İstifadəçi state-i yeniləndi');
                
                if (userData?.id) {
                  try {
                    await supabase
                      .from('profiles')
                      .update({ last_login: new Date().toISOString() })
                      .eq('id', userData.id);
                    console.log('Son giriş tarixi yeniləndi');
                  } catch (updateError) {
                    console.error('Son giriş tarixi yenilənərkən xəta:', updateError);
                  }
                }
              }
            } catch (userError: any) {
              console.error('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
              
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
            } finally {
              if (mounted) setLoading(false);
            }
          } else {
            if (mounted) setLoading(false);
          }
        });
        
        if (currentSession?.user && mounted) {
          try {
            console.log(`Ilkin sessiya üçün istifadəçi məlumatları əldə edilir, ID: ${currentSession.user.id}`);
            const userData = await fetchUserData(currentSession.user.id);
            
            if (mounted) {
              console.log('Ilkin sessiya üçün istifadəçi məlumatları təyin edilir');
              setUser(userData);
              
              if (userData?.id) {
                try {
                  await supabase
                    .from('profiles')
                    .update({ last_login: new Date().toISOString() })
                    .eq('id', userData.id);
                  console.log('Son giriş tarixi yeniləndi');
                } catch (updateError) {
                  console.error('Son giriş tarixi yenilənərkən xəta:', updateError);
                }
              }
            }
          } catch (userError: any) {
            console.error('İlkin istifadəçi məlumatlarını əldə edərkən xəta:', userError);
            
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
    
    initializeAuth();
    
    return () => {
      mounted = false;
      if (unsubscribe.data?.subscription) {
        unsubscribe.data.subscription.unsubscribe();
      }
    };
  }, [setLoading, setSession, setUser]);
  
  const handleFetchUserData = useCallback(async (userId: string) => {
    return await fetchUserData(userId);
  }, []);
  
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log(`useSupabaseAuth: ${email} ilə giriş edilir...`);
      const result = await signIn(email, password, setLoading);
      
      if (result && result.user) {
        console.log(`Giriş uğurlu oldu, istifadəçi məlumatları yenilənir, ID: ${result.user.id}`);
        try {
          const userData = await fetchUserData(result.user.id);
          setState(prev => ({ ...prev, user: userData }));
          console.log('İstifadəçi məlumatları uğurla yeniləndi');
          
          if (userData?.id) {
            try {
              await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userData.id);
              console.log('Son giriş tarixi yeniləndi');
            } catch (updateError) {
              console.error('Son giriş tarixi yenilənərkən xəta:', updateError);
            }
          }
        } catch (userError) {
          console.error('Giriş sonrası istifadəçi məlumatlarını əldə edərkən xəta:', userError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('useSupabaseAuth signIn xətası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(setLoading, setUser, setSession);
      return true;
    } catch (error) {
      console.error('Çıxış zamanı xəta:', error);
      return false;
    }
  }, [setLoading, setUser, setSession]);
  
  const handleSignUp = useCallback(async (email: string, password: string, userData: any) => {
    return await signUp(email, password, userData, setLoading);
  }, [setLoading]);
  
  const handleResetPassword = useCallback(async (email: string) => {
    return await resetPassword(email, setLoading);
  }, [setLoading]);
  
  const handleUpdateProfile = useCallback(async (updates: any) => {
    if (!state.user) return false;
    return await updateProfile(updates, state.user.id, handleFetchUserData, setUser);
  }, [state.user, handleFetchUserData, setUser]);
  
  const handleUpdatePassword = useCallback(async (password: string) => {
    return await updatePassword(password);
  }, []);

  return {
    ...state,
    login: async (email: string, password: string) => {
      try {
        await handleSignIn(email, password);
        return true;
      } catch (error) {
        console.error('Login xətası:', error);
        return false;
      }
    },
    logout: async () => {
      try {
        await handleSignOut();
        return true;
      } catch (error) {
        console.error('Logout xətası:', error);
        return false;
      }
    },
    clearError: () => {
      setState(prev => ({ ...prev, error: null }));
    },
    signIn: handleSignIn,
    signOut: handleSignOut,
    signUp: handleSignUp,
    resetPassword: handleResetPassword,
    updateProfile: handleUpdateProfile,
    updatePassword: handleUpdatePassword,
    fetchUserData: handleFetchUserData
  };
};
