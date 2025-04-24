import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseAdmin } from '@/integrations/supabase/client';
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
              const userData = await fetchUserDetails(newSession.user.id);
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
            const userData = await fetchUserDetails(currentSession.user.id);
            
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
  const fetchUserDetails = useCallback(async (userId: string): Promise<FullUserData | null> => {
    console.log(`fetchUserDetails çağırıldı: userId=${userId}`);
    
    try {
      // Əvvəlcə istifadəçinin rolunu yoxlayaq
      console.log('İstifadəçi rolu yoxlanılır...');
      let isAdmin = false;
      
      try {
        // İstifadəçinin superadmin olub-olmadığını yoxlayaq
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (!roleError && roleData?.role === 'superadmin') {
          console.log('İstifadəçi superadmin-dir');
          isAdmin = true;
        }
      } catch (roleCheckError) {
        console.warn('Rol yoxlama xətası:', roleCheckError);
      }
      
      // Profil məlumatlarını əldə edək
      console.log('Profil məlumatları sorğulanır...');
      let profileData: any = null;
      let profileError: any = null;
      
      if (isAdmin) {
        // Superadmin üçün supabaseAdmin klientindən istifadə edək
        console.log('Superadmin üçün supabaseAdmin klienti istifadə edilir...');
        const { data, error } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        profileData = data;
        profileError = error;
      } else {
        // Normal istifadəçilər üçün standart klient
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        profileData = data;
        profileError = error;
      }
      
      if (profileError) {
        console.error('Profil məlumatları əldə etmə xətası:', profileError);
        
        // RLS xətası olub-olmadığını yoxlayaq
        if (profileError.message?.includes('row level security') || profileError.message?.includes('infinite recursion')) {
          console.warn('RLS xətası baş verdi. Supabase Admin klienti ilə yenidən cəhd edilir...');
          
          // RLS xətası halında supabaseAdmin klientindən istifadə edək
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
          
          if (adminError) {
            console.error('Admin klienti ilə profil məlumatları əldə etmə xətası:', adminError);
            throw new Error(`Profil məlumatlarını əldə etmə xətası: ${adminError.message}`);
          }
          
          profileData = adminData;
        } else {
          throw new Error(`Profil məlumatlarını əldə etmə xətası: ${profileError.message}`);
        }
      }
      
      if (!profileData) {
        console.error('Profil məlumatları tapılmadı');
        throw new Error('İstifadəçi profili tapılmadı');
      }
      
      console.log('Profil məlumatları əldə edildi:', profileData);
      
      // İstifadəçi rolunu əldə edək
      console.log('İstifadəçi rolu sorğulanır...');
      let roleData: any = null;
      let roleError: any = null;
      
      if (isAdmin) {
        // Superadmin üçün supabaseAdmin klientindən istifadə edək
        const { data, error } = await supabaseAdmin
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        roleData = data;
        roleError = error;
      } else {
        // Normal istifadəçilər üçün standart klient
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, region_id, sector_id, school_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        roleData = data;
        roleError = error;
      }
      
      if (roleError) {
        console.error('Rol məlumatları əldə etmə xətası:', roleError);
        
        // RLS xətası olub-olmadığını yoxlayaq
        if (roleError.message?.includes('row level security') || roleError.message?.includes('infinite recursion')) {
          console.warn('RLS xətası baş verdi. Supabase Admin klienti ilə yenidən cəhd edilir...');
          
          // RLS xətası halında supabaseAdmin klientindən istifadə edək
          const { data: adminRoleData, error: adminRoleError } = await supabaseAdmin
            .from('user_roles')
            .select('role, region_id, sector_id, school_id')
            .eq('user_id', userId)
            .maybeSingle();
          
          if (adminRoleError) {
            console.error('Admin klienti ilə rol məlumatları əldə etmə xətası:', adminRoleError);
            throw new Error(`İstifadəçi rolunu əldə etmə xətası: ${adminRoleError.message}`);
          }
          
          roleData = adminRoleData;
        } else {
          throw new Error(`İstifadəçi rolunu əldə etmə xətası: ${roleError.message}`);
        }
      }
      
      if (!roleData) {
        console.error('Rol məlumatları tapılmadı');
        throw new Error('İstifadəçi üçün rol təyin edilməyib');
      }
      
      console.log('Rol məlumatları əldə edildi:', roleData);
      
      // Tam istifadəçi məlumatlarını birləşdirək
      const fullUserData: FullUserData = {
        id: userId,
        email: profileData.email,
        full_name: profileData.full_name,
        phone: profileData.phone,
        position: profileData.position,
        language: profileData.language,
        avatar: profileData.avatar,
        status: profileData.status,
        role: roleData.role,
        region_id: roleData.region_id,
        sector_id: roleData.sector_id,
        school_id: roleData.school_id,
      };
      
      console.log('Tam istifadəçi məlumatları:', fullUserData);
      return fullUserData;
    } catch (error: any) {
      console.error('fetchUserDetails xətası:', error);
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
          const userData = await fetchUserDetails(result.user.id);
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
