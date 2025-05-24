
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthFetch } from './hooks/useAuthFetch';
import { FullUserData } from '@/types/auth';

export interface UseAuthResult {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<UseAuthResult | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { fetchUserData } = useAuthFetch();

  const loadUser = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await fetchUserData(authUser.id);
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err as Error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user || null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (updates: Partial<FullUserData>) => {
    if (!user) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    // Refresh user data
    await refetch();
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Basic role-based permissions
    switch (user.role) {
      case 'superadmin':
        return true;
      case 'regionadmin':
        return ['view_schools', 'manage_schools', 'view_sectors'].includes(permission);
      case 'sectoradmin':
        return ['view_schools', 'manage_schools'].includes(permission);
      case 'schooladmin':
        return ['view_own_data', 'edit_own_data'].includes(permission);
      default:
        return false;
    }
  };

  const refetch = async () => {
    if (user) {
      await loadUser({ id: user.id } as User);
    }
  };

  const value: UseAuthResult = {
    user,
    loading,
    error,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    hasPermission,
    refetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): UseAuthResult => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
