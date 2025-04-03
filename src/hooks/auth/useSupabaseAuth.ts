import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserData, getUserById } from './userDataService';
import { User, Session } from '@supabase/supabase-js';

export type AuthState = {
  loading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
};

export type AuthActions = {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  fetchUserData: (userId: string) => Promise<User>;
  refreshSession: () => Promise<any>;
};

export type UseSupabaseAuthReturn = AuthState & AuthActions;

export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      console.log('refreshSession çağrılır');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session yeniləmə xətası:', error);
        return null;
      }
      
      if (data.session) {
        console.log('Session yeniləndi');
        setSession(data.session);
        setIsAuthenticated(true);
        
        try {
          if (data.session.user.id) {
            const userData = await fetchUserData(data.session.user.id);
            setUser(userData);
          }
        } catch (userError) {
          console.error('İstifadəçi məlumatları yeniləmə xətası:', userError);
        }
      }
      
      return data.session;
    } catch (error) {
      console.error('Session yeniləmə xətası:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('getSession xətası:', sessionError);
          setLoading(false);
          return;
        }
        
        console.log('Mövcud sessiya:', sessionData?.session?.user?.id || 'yoxdur');
        
        if (sessionData?.session) {
          setSession(sessionData.session);
          setIsAuthenticated(true);
          
          try {
            const userData = await fetchUserData(sessionData.session.user.id);
            setUser(userData);
            console.log('İstifadəçi rolu:', userData.role);
          } catch (userError) {
            console.error('İstifadəçi məlumatları yükləmə xətası:', userError);
          }
        }
      } catch (error) {
        console.error('Auth initializing xətası:', error);
      } finally {
        setLoading(false);
      }
      
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state dəyişdi:', event, newSession?.user?.id);
          
          if (newSession) {
            setSession(newSession);
            setIsAuthenticated(true);
            
            try {
              const userData = await fetchUserData(newSession.user.id);
              setUser(userData);
              console.log('İstifadəçi rolu:', userData.role);
            } catch (userError) {
              console.error('İstifadəçi məlumatları yükləmə xətası:', userError);
            }
          } else {
            setSession(null);
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      );
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };
    
    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Login prosesi başlayır:', email);
      
      const isSuperAdmin = email.toLowerCase() === 'superadmin@infoline.az';
      
      if (isSuperAdmin) {
        try {
          console.log('SuperAdmin giriş aşkarlandı, safe-login istifadə edilir');
          
          const apiKey = supabase.auth.getSession().then(() => 
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sYmZuYXVoenBkc2txbnh0d2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3ODQwNzksImV4cCI6MjA1ODM2MDA3OX0.OfoO5lPaFGPm0jMqAQzYCcCamSaSr6E1dF8i4rLcXj4'
          );
          
          const result = await fetch(`${supabaseUrl}/functions/v1/safe-login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await apiKey}`
            },
            body: JSON.stringify({ email, password })
          });
          
          const responseData = await result.json();
          
          if (!result.ok) {
            console.error('Safe-login xətası:', responseData);
            throw new Error(responseData.error || 'SuperAdmin giriş xətası');
          }
          
          console.log('Safe-login uğurlu oldu');
          
          await supabase.auth.setSession({
            access_token: responseData.session.access_token,
            refresh_token: responseData.session.refresh_token
          });
          
          const { data: refreshedSession } = await supabase.auth.getSession();
          
          const userData = await fetchUserData(responseData.user.id);
          setUser(userData);
          setSession(refreshedSession.session);
          setIsAuthenticated(true);
          
          return responseData;
        } catch (safeLoginError) {
          console.error('Safe-login funksiyasında xəta:', safeLoginError);
          
          console.log('Standart giriş metoduna keçid edilir');
        }
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login xətası:', error.message);
        throw error;
      }
      
      console.log('Login uğurla tamamlandı:', data?.user?.id);
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log('Qeydiyyat prosesi başlayır:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        console.error('Qeydiyyat xətası:', error.message);
        throw error;
      }
      
      console.log('Qeydiyyat uğurla tamamlandı:', data?.user?.id);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Çıxış xətası:', error);
        throw error;
      }
      
      setSession(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('Çıxış uğurla tamamlandı');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) {
        console.error('İstifadəçi təyin olunmayıb, profil yeniləməsi mümkün deyil');
        return false;
      }
      
      console.log('Profil yenilənir:', updates);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) {
        console.error('Profil yeniləmə xətası:', error);
        return false;
      }
      
      const updatedUser = await fetchUserData(user.id);
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('Şifrə sıfırlama xətası:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        console.error('Şifrə yeniləmə xətası:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  };

  return {
    loading,
    isAuthenticated,
    user,
    session,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    fetchUserData,
    refreshSession,
  };
};

export default useSupabaseAuth;
