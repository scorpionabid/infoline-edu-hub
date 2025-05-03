
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { FullUserData } from '@/types/user';
import { toast } from 'sonner';
import { AuthContext } from './context';
import { AuthContextType } from './types';

export const AuthProvider: React.FC<{ 
  children: React.ReactNode,
  supabaseClient?: typeof supabase 
}> = ({ 
  children,
  supabaseClient = supabase 
}) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Xəta təmizləmə funksiyası
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        console.log('AuthProvider: initializing auth state');

        // Əvvəlcə auth state listener-ini quraşdıraq
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log('Auth state changed:', event);
            setSession(currentSession);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (currentSession?.user) {
                // İstifadəçi məlumatlarını əldə etmək üçün ayrıca bir işləm başladırıq
                // Bu zaman UI bloklanmayacaq
                setTimeout(() => {
                  fetchUserProfile(currentSession.user.id);
                }, 0);
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        );
        
        // Sonra mövcud sessiyanı yoxlayaq
        const { data, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }
        
        console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
        setSession(data.session);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        } else {
          setIsLoading(false);
          setUser(null);
          setIsAuthenticated(false);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [supabaseClient]);

  // İstifadəçi profil məlumatlarını əldə etmək üçün funksiya
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // İstifadəçinin profil məlumatlarını əldə edək
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.warn('Profile fetch error:', profileError);
      }
      
      // İstifadəçinin rol məlumatlarını əldə edək
      const { data: roleData, error: roleError } = await supabaseClient
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (roleError) {
        console.warn('Role fetch error:', roleError);
      }

      // Supabase auth user məlumatlarını əldə edək
      const { data: authData } = await supabaseClient.auth.getUser();
      
      if (!authData || !authData.user) {
        console.error('Auth user data not found');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Profil və rol məlumatlarını birləşdirib tam istifadəçi məlumatlarını yaradırıq
      const profile = profileData || {};
      const role = roleData || {};
      
      const userData: FullUserData = {
        id: userId,
        email: authData.user.email || '',
        full_name: profile.full_name || authData.user.email?.split('@')[0] || '',
        role: role.role || 'user',
        region_id: role.region_id || null,
        sector_id: role.sector_id || null,
        school_id: role.school_id || null,
        avatar: profile.avatar || '',
        status: profile.status || 'active'
      };
      
      console.log('User profile fetched:', userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Login funksiyası
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      clearError(); // Əvvəlki xətaları təmizləyirik
      setIsLoading(true);
      
      console.log('Login attempt with email:', email);
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }
      
      console.log('Login successful');
      // Burada setUser və isAuthenticated-i yeniləməyə ehtiyac yoxdur
      // çünki auth state listener bunu avtomatik olaraq edəcək
      
      return true;
    } catch (err: any) {
      console.error('Unexpected login error:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
    }
  };

  // Çıxış funksiyası
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        setError(error.message);
      }
      
      // onAuthStateChange listener SIGNED_OUT eventini tutacaq və
      // user və isAuthenticated-i yeniləyəcək
    } catch (err: any) {
      console.error('Unexpected logout error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // İstifadəçi məlumatlarını yeniləmək üçün funksiya
  const updateUser = async (updates: Partial<FullUserData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setError('İstifadəçi məlumatları mövcud deyil');
        return false;
      }
      
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          full_name: updates.full_name,
          avatar: updates.avatar,
          status: updates.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Profile update error:', error);
        setError(error.message);
        return false;
      }
      
      // Məlumatları yenilənmiş istifadəçini əldə edək
      await fetchUserProfile(user.id);
      toast.success('Profil məlumatları yeniləndi');
      
      return true;
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Context dəyərini memoize edək
  const contextValue = useMemo<AuthContextType>(() => ({
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError
  }), [
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    clearError
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
