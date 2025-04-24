
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData, Profile } from '@/types/supabase';
import { UseSupabaseAuthReturn } from './types';

export const useSupabaseAuth = (supabaseClient: any = supabase, initialSession = null): UseSupabaseAuthReturn => {
  const [state, setState] = useState<{
    loading: boolean;
    user: FullUserData | null;
    session: any | null;
  }>({
    loading: true,
    user: null,
    session: initialSession
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
      // Profil məlumatlarını əldə edək
      console.log('Profil məlumatları sorğulanır...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (profileError) {
        console.error('Profil məlumatları əldə etmə xətası:', profileError);
        throw new Error(`Profil məlumatlarını əldə etmə xətası: ${profileError.message}`);
      }
      
      if (!profileData) {
        console.error('Profil məlumatları tapılmadı');
        throw new Error('İstifadəçi profili tapılmadı');
      }
      
      console.log('Profil məlumatları əldə edildi:', profileData);
      
      // İstifadəçi rolunu əldə edək
      console.log('İstifadəçi rolu sorğulanır...');
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, region_id, sector_id, school_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (roleError) {
        console.error('Rol məlumatları əldə etmə xətası:', roleError);
        throw new Error(`İstifadəçi rolunu əldə etmə xətası: ${roleError.message}`);
      }
      
      if (!roleData) {
        console.error('Rol məlumatları tapılmadı');
        throw new Error('İstifadəçi üçün rol təyin edilməyib');
      }
      
      console.log('Rol məlumatları əldə edildi:', roleData);
      
      // İstifadəçi e-poçtunu əldə edək
      let userEmail = profileData.email;
      
      if (!userEmail) {
        try {
          const { data: userData } = await supabase.auth.getUser();
          userEmail = userData?.user?.email || '';
        } catch (emailError) {
          console.warn('E-poçt məlumatını əldə etmək mümkün olmadı:', emailError);
        }
      }
      
      // Tam istifadəçi məlumatlarını birləşdirək
      const fullUserData: FullUserData = {
        id: userId,
        email: userEmail || profileData.email || '',
        name: profileData.full_name,
        full_name: profileData.full_name,
        phone: profileData.phone,
        position: profileData.position,
        language: profileData.language || 'az',
        avatar: profileData.avatar,
        status: profileData.status || 'active',
        role: roleData.role,
        region_id: roleData.region_id,
        sector_id: roleData.sector_id,
        school_id: roleData.school_id,
        regionId: roleData.region_id,
        sectorId: roleData.sector_id,
        schoolId: roleData.school_id,
        last_login: profileData.last_login,
        lastLogin: profileData.last_login,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
        notificationSettings: {
          email: true,
          system: true
        }
      };
      
      console.log('Tam istifadəçi məlumatları:', fullUserData);
      return fullUserData;
    } catch (error: any) {
      console.error('fetchUserDetails xətası:', error);
      throw error;
    }
  }, []);

  // signIn metodu
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log(`useSupabaseAuth: ${email} ilə giriş edilir...`);
      
      // Auth əməliyyatını icra edək
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (!data || !data.user) {
        throw new Error('Giriş məlumatları əldə edilə bilmədi');
      }
      
      console.log('Giriş uğurlu oldu, istifadəçi məlumatları:', data.user.id);
      
      // İstifadəçi məlumatlarını əldə edək
      const userData = await fetchUserDetails(data.user.id);
      setUser(userData);
      
      return { data, error: null };
    } catch (error) {
      console.error('Giriş zamanı xəta:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [fetchUserDetails, setLoading, setUser]);
  
  // signOut metodu
  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error('Çıxış zamanı xəta:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [setLoading, setSession, setUser]);
  
  // updateProfile metodu
  const handleUpdateProfile = useCallback(async (updates: Partial<Profile>) => {
    try {
      const userId = state.user?.id;
      if (!userId) return false;
      
      // Profili yenilə
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      
      if (error) throw error;
      
      // Yenilənmiş istifadəçi məlumatlarını əldə et
      const updatedUser = await fetchUserDetails(userId);
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Profil yeniləmə zamanı xəta:', error);
      return false;
    }
  }, [fetchUserDetails, setUser, state.user?.id]);

  return {
    ...state,
    signIn: handleSignIn,
    signOut: handleSignOut,
    updateProfile: handleUpdateProfile,
    fetchUserDetails,
    signUp: async () => ({ data: null, error: new Error('Not implemented') }),
    resetPassword: async () => false,
    updatePassword: async () => false
  };
};
