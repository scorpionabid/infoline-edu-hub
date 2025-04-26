
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { Session } from '@supabase/supabase-js';

export function useSupabaseAuth(supabaseClient = supabase, initialSession = null) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Səhv ardıcıllıqla auth prosesinə səbəb olma
    let userFetchTimeout: any = null;

    // Auth dəyişikliklərinə abunə ol (bunu birinci et)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        // Vəziyyəti yenilə
        setSession(newSession);
        
        // Məlumat əldə etmək üçün timeout istifadə et - RLS rekursiyalarından qaçmaq üçün
        if (newSession?.user && !userFetchTimeout) {
          userFetchTimeout = setTimeout(async () => {
            try {
              // İstifadəçi məlumatlarını bir neçə pozisiyadan əldə et
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select(`
                  *,
                  user_roles (
                    id,
                    role,
                    region_id,
                    sector_id,
                    school_id
                  )
                `)
                .eq('id', newSession.user.id)
                .single();
                
              if (userError) {
                console.warn('İstifadəçi məlumatlarını əldə edərkən xəta:', userError);
                // Minimal istifadəçi məlumatları yaradaq
                const minimalUser: FullUserData = {
                  id: newSession.user.id,
                  email: newSession.user.email || '',
                  full_name: newSession.user.user_metadata?.full_name || '',
                  name: newSession.user.user_metadata?.full_name || '',
                  role: 'user',
                  language: 'az',
                  status: 'active',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  notificationSettings: {
                    email: true,
                    system: true
                  }
                };
                setUser(minimalUser);
              } else if (userData) {
                // Tam istifadəçi məlumatları əldə edildi
                const userRole = userData.user_roles?.[0]?.role || 'user';
                
                const fullUserData: FullUserData = {
                  id: userData.id,
                  email: newSession.user.email || '',
                  full_name: userData.full_name,
                  name: userData.full_name,
                  role: userRole,
                  region_id: userData.user_roles?.[0]?.region_id,
                  sector_id: userData.user_roles?.[0]?.sector_id,
                  school_id: userData.user_roles?.[0]?.school_id,
                  regionId: userData.user_roles?.[0]?.region_id,
                  sectorId: userData.user_roles?.[0]?.sector_id,
                  schoolId: userData.user_roles?.[0]?.school_id,
                  phone: userData.phone,
                  position: userData.position,
                  language: userData.language || 'az',
                  avatar: userData.avatar,
                  status: userData.status || 'active',
                  last_login: userData.last_login,
                  lastLogin: userData.last_login,
                  created_at: userData.created_at,
                  updated_at: userData.updated_at,
                  createdAt: userData.created_at,
                  updatedAt: userData.updated_at,
                  notificationSettings: {
                    email: true,
                    system: true
                  }
                };
                
                setUser(fullUserData);
                console.log('İstifadəçi məlumatları əldə edildi:', fullUserData);
              }
            } catch (err) {
              console.error('İstifadəçi məlumatları əldə edərkən xəta:', err);
            } finally {
              userFetchTimeout = null;
              setLoading(false);
            }
          }, 0); // 0 ms timeout - növbəti event loop-a qədər gözlət
        } else if (!newSession) {
          // Sessiyanın bitməsi
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Mövcud sessiya yoxlaması (abunəlikdən sonra)
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      
      if (existingSession?.user && !userFetchTimeout) {
        userFetchTimeout = setTimeout(async () => {
          try {
            console.log('İlkin istifadəçi məlumatları əldə edilir...');
            const { data: userData, error: userError } = await supabase
              .from('profiles')
              .select(`
                *,
                user_roles (
                  id,
                  role,
                  region_id,
                  sector_id,
                  school_id
                )
              `)
              .eq('id', existingSession.user.id)
              .single();
              
            if (userError) {
              console.warn('İlkin istifadəçi məlumatlarını əldə edərkən xəta:', userError);
              const minimalUser: FullUserData = {
                id: existingSession.user.id,
                email: existingSession.user.email || '',
                full_name: existingSession.user.user_metadata?.full_name || '',
                name: existingSession.user.user_metadata?.full_name || '',
                role: 'user',
                language: 'az',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notificationSettings: {
                  email: true,
                  system: true
                }
              };
              setUser(minimalUser);
            } else if (userData) {
              const userRole = userData.user_roles?.[0]?.role || 'user';
              
              const fullUserData: FullUserData = {
                id: userData.id,
                email: existingSession.user.email || '',
                full_name: userData.full_name,
                name: userData.full_name,
                role: userRole,
                region_id: userData.user_roles?.[0]?.region_id,
                sector_id: userData.user_roles?.[0]?.sector_id,
                school_id: userData.user_roles?.[0]?.school_id,
                regionId: userData.user_roles?.[0]?.region_id,
                sectorId: userData.user_roles?.[0]?.sector_id,
                schoolId: userData.user_roles?.[0]?.school_id,
                phone: userData.phone,
                position: userData.position,
                language: userData.language || 'az',
                avatar: userData.avatar,
                status: userData.status || 'active',
                last_login: userData.last_login,
                lastLogin: userData.last_login,
                created_at: userData.created_at,
                updated_at: userData.updated_at,
                createdAt: userData.created_at,
                updatedAt: userData.updated_at,
                notificationSettings: {
                  email: true,
                  system: true
                }
              };
              
              setUser(fullUserData);
            }
          } catch (err) {
            console.error('İlkin istifadəçi məlumatları əldə edərkən xəta:', err);
          } finally {
            userFetchTimeout = null;
            setLoading(false);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (userFetchTimeout) {
        clearTimeout(userFetchTimeout);
      }
    };
  }, []);

  // Giriş funksiyası
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      return { data, error };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Çıxış funksiyası
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Profili yeniləmə funksiyası
  const updateProfile = async (updates: Record<string, any>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
        
      if (error) throw error;
      
      // Profili yenidən əldə et
      const { data: newProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // İstifadəçi məlumatlarını yenilə
      setUser(prev => ({ ...prev!, ...newProfile } as FullUserData));
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  return {
    session,
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
  };
}
