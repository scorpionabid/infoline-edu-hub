import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, Profile } from '@/types/supabase';
import { AuthState, UseSupabaseAuthReturn } from './types';
import { signIn, signOut, signUp, resetPassword, updateProfile, updatePassword } from './authActions';

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
  
  // Session dəyişikliklərini izləmək
  useEffect(() => {
    let mounted = true;
    let unsubscribe: { data?: { subscription: { unsubscribe: () => void } } } = {};
    
    // Auth vəziyyətini ilkin yükləmə
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
        
        // Sinxron olaraq sessiyanı təyin edək
        if (mounted) setSession(currentSession);
        
        // Auth state dəyişikliklərinə abunə olaq
        unsubscribe = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state dəyişdi:', event, newSession ? 'Session var' : 'Session yoxdur');
          
          if (!mounted) return;
          
          // Əvvəlcə sinxron əməliyyatlar
          setSession(newSession);
          
          // SIGNED_OUT halında user-i null-layıb state yeniləyib bitirək
          if (event === 'SIGNED_OUT') {
            console.log('İstifadəçi çıxış etdi, state təmizlənir');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Sonra asinxron əməliyyatlar - yalnız lazım olduqda
          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
            try {
              console.log(`İstifadəçi məlumatları əldə edilir, ID: ${newSession.user.id}`);
              setLoading(true);
              
              // İstifadəçi məlumatlarını əldə edək
              const userData = await fetchUserDetails(newSession.user.id, newSession.user.email);
              console.log('İstifadəçi məlumatları əldə edildi:', userData ? 'Uğurlu' : 'Uğursuz');
              
              if (mounted) {
                setUser(userData);
                console.log('İstifadəçi state-i yeniləndi');
                
                // İstifadəçi son giriş tarixini yeniləyək
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
        if (currentSession?.user && mounted) {
          try {
            console.log(`İlkin sessiya üçün istifadəçi məlumatları əldə edilir, ID: ${currentSession.user.id}`);
            const userData = await fetchUserDetails(currentSession.user.id, currentSession.user.email);
            
            if (mounted) {
              console.log('İlkin sessiya üçün istifadəçi məlumatları təyin edilir');
              setUser(userData);
              
              // İstifadəçi son giriş tarixini yeniləyək
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
    
    // Inisializasiya edək
    initializeAuth();
    
    // Cleanup
    return () => {
      mounted = false;
      if (unsubscribe.data?.subscription) {
        unsubscribe.data.subscription.unsubscribe();
      }
    };
  }, [setLoading, setSession, setUser]);
  
  // İstifadəçi məlumatlarını əldə etmək
  const fetchUserDetails = useCallback(async (userId: string, userEmail: string) => {
    try {
      console.log(`İstifadəçi məlumatları əldə edilir (ID: ${userId}, Email: ${userEmail})`);
      
      // İstifadəçi profili əldə etmək
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Profil məlumatlarını əldə etmə xətası:', profileError);
        throw new Error('İstifadəçi profili tapılmadı');
      }
      
      if (!profileData) {
        console.error('Profil məlumatları boşdur');
        throw new Error('İstifadəçi profili tapılmadı');
      }
      
      console.log('Profil məlumatları əldə edildi:', profileData);
      
      // İstifadəçi rolunu əldə etmək - birbaşa SQL sorğusu ilə
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .single();
        
      if (roleError) {
        console.error('Rol məlumatlarını əldə etmə xətası:', roleError);
        
        // Edge Function ilə rol məlumatlarını əldə etməyə çalışaq
        try {
          console.log('Edge Function ilə rol məlumatları əldə edilir...');
          
          // Cari sessiyadan JWT token alırıq
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Sessiya məlumatlarını alarkən xəta:', sessionError);
            throw sessionError;
          }
          
          if (!sessionData.session) {
            console.error('Aktiv sessiya tapılmadı');
            throw new Error('Aktiv sessiya tapılmadı');
          }
          
          // Edge Function-a sorğu göndəririk
          const response = await fetch(
            'https://olbfnauhzpdskqnxtwav.supabase.co/functions/v1/get-user-role',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionData.session.access_token}`
              },
              body: JSON.stringify({
                userId,
                userEmail
              })
            }
          );
          
          if (!response.ok) {
            let errorMessage = 'Bilinməyən xəta';
            try {
              const errorData = await response.json();
              console.error('Edge Function xətası:', errorData);
              errorMessage = errorData.message || errorMessage;
            } catch (e) {
              console.error('Xəta məlumatlarını oxuyarkən problem:', e);
            }
            throw new Error(`Edge Function xətası: ${errorMessage}`);
          }
          
          const edgeFunctionData = await response.json();
          console.log('Edge Function cavabı:', edgeFunctionData);
          
          if (!edgeFunctionData.role) {
            throw new Error('İstifadəçi üçün rol təyin edilməyib');
          }
          
          // Edge Function-dan gələn rol məlumatlarını istifadə edək
          const fullUserData: FullUserData = {
            ...profileData,
            id: userId,
            email: userEmail,
            role: edgeFunctionData.role,
            region_id: edgeFunctionData.region_id,
            sector_id: edgeFunctionData.sector_id,
            school_id: edgeFunctionData.school_id
          };
          
          console.log('Tam istifadəçi məlumatları (Edge Function ilə):', fullUserData);
          return fullUserData;
          
        } catch (edgeFunctionError: any) {
          console.error('Edge Function çağırışı zamanı xəta:', edgeFunctionError);
          throw new Error('İstifadəçi rolu əldə edilə bilmədi');
        }
      }
      
      if (!roleData) {
        console.error('Rol məlumatları boşdur');
        throw new Error('İstifadəçi üçün rol təyin edilməyib');
      }
      
      console.log('Rol məlumatları əldə edildi:', roleData);
      
      // Tam istifadəçi məlumatlarını birləşdirək
      const fullUserData: FullUserData = {
        ...profileData,
        id: userId,
        email: userEmail,
        role: roleData.role,
        region_id: roleData.region_id,
        sector_id: roleData.sector_id,
        school_id: roleData.school_id
      };
      
      console.log('Tam istifadəçi məlumatları:', fullUserData);
      return fullUserData;
      
    } catch (error: any) {
      console.error('İstifadəçi məlumatlarını əldə etmə xətası:', error);
      throw error;
    }
  }, []);
  
  // signIn-in bağlı variantını yaradaq
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log(`useSupabaseAuth: ${email} ilə giriş edilir...`);
      const result = await signIn(email, password, setLoading);
      
      // Giriş uğurlu olduqda, istifadəçi məlumatlarını yenidən əldə edək
      if (result && result.user) {
        console.log(`Giriş uğurlu oldu, istifadəçi məlumatları yenilənir, ID: ${result.user.id}`);
        try {
          const userData = await fetchUserDetails(result.user.id, result.user.email);
          setUser(userData);
          console.log('İstifadəçi məlumatları uğurla yeniləndi');
          
          // İstifadəçi son giriş tarixini yeniləyək
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
  }, [setLoading, setUser]);
  
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
    return await updateProfile(updates, state.user.id, fetchUserDetails, setUser);
  }, [state.user, fetchUserDetails, setUser]);
  
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
    fetchUserDetails: fetchUserDetails
  };
};
