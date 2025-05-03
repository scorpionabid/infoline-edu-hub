
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

  // İstifadəçi profil məlumatlarını əldə etmək üçün funksiya
  const fetchUserProfile = useCallback(async (userId: string) => {
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
        regionId: role.region_id || null,
        sectorId: role.sector_id || null,
        schoolId: role.school_id || null,
        name: profile.full_name || authData.user.email?.split('@')[0] || '',
        phone: profile.phone || '',
        position: profile.position || '',
        avatar: profile.avatar || '',
        status: profile.status || 'active',
        twoFactorEnabled: profile.two_factor_enabled || false,
        notificationSettings: profile.notification_settings || {
          email: true,
          push: false,
          sms: false
        }
      };
      
      console.log('User profile fetched:', userId);
      
      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [supabaseClient]);

  useEffect(() => {
    let isMounted = true;
    console.log('AuthProvider: initializing auth state');

    // Əvvəlcə auth state listener-ini quraşdıraq
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          setSession(currentSession);
          
          if (currentSession?.user) {
            // UI bloklanmaması üçün timeout ilə çağırırıq
            setTimeout(() => {
              if (isMounted) fetchUserProfile(currentSession.user.id);
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    // Sonra cari sessiyanı yoxlayaq
    const checkSession = async () => {
      try {
        const { data, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (isMounted) {
            setIsLoading(false);
            setIsAuthenticated(false);
          }
          return;
        }
        
        if (isMounted) {
          console.log('Initial session check:', data.session ? 'Session exists' : 'No session');
          setSession(data.session);
          
          if (data.session?.user) {
            fetchUserProfile(data.session.user.id);
          } else {
            setIsLoading(false);
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        if (isMounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseClient, fetchUserProfile]);

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
    } catch (err: any) {
      console.error('Unexpected logout error:', err);
      setError(err.message);
    } finally {
      // Çıxış edərkən hər halda məlumatları sıfırlayırıq
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // İstifadəçi məlumatlarını yeniləmək üçün funksiya
  const updateUser = async (updates: Partial<FullUserData>): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setError('İstifadəçi məlumatları mövcud deyil');
        setIsLoading(false);
        return false;
      }
      
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Yalnız mövcud olan sahələri əlavə edirik
      if (updates.full_name) updateData.full_name = updates.full_name;
      if (updates.name) updateData.full_name = updates.name;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.position) updateData.position = updates.position;
      if (updates.avatar) updateData.avatar = updates.avatar;
      if (updates.status) updateData.status = updates.status;
      if (updates.twoFactorEnabled !== undefined) updateData.two_factor_enabled = updates.twoFactorEnabled;
      if (updates.notificationSettings) updateData.notification_settings = updates.notificationSettings;
      
      const { error } = await supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) {
        console.error('Profile update error:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }
      
      // Profil yeniləndikdən sonra user məlumatlarını yeniləyirik
      if (user) {
        fetchUserProfile(user.id);
      }
      
      toast.success('Profil məlumatları yeniləndi');
      return true;
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message);
      setIsLoading(false);
      return false;
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
