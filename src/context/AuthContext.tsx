
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface AuthContextType {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  clearError: () => void;
  signingIn: boolean;
  signingUp: boolean;
  sendingPasswordReset: boolean;
  confirmingPasswordReset: boolean;
  signIn: (email: string, password: string) => Promise<FullUserData | null>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  confirmPasswordReset: (newPassword: string) => Promise<boolean>;
  updateProfile: (userData: Partial<FullUserData>) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  getUserData: (userId: string) => Promise<FullUserData | null>;
  // Autentifikasiya statusu əlavə et (əlaqəli komponentlər üçün)
  isAuthenticated: boolean;
  isLoading: boolean;
  // Auth əməliyyatları üçün alias funksiyalar
  login: (email: string, password: string) => Promise<FullUserData | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  clearError: () => {},
  signingIn: false,
  signingUp: false,
  sendingPasswordReset: false,
  confirmingPasswordReset: false,
  signIn: async () => null,
  signOut: async () => {},
  signUp: async () => false,
  sendPasswordReset: async () => false,
  confirmPasswordReset: async () => false,
  updateProfile: async () => false,
  updatePassword: async () => false,
  getUserData: async () => null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => null,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// useRole - istifadəçi rolunu yoxlamaq üçün köməkçi funksiya
export const useRole = (roles: string | string[]): boolean => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(roles)) {
    return roles.includes(user.role);
  }
  
  return user.role === roles;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [confirmingPasswordReset, setConfirmingPasswordReset] = useState(false);

  // Auth hookunu tam obyekt olaraq əldə edirik 
  const authHook = useSupabaseAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // supabase.auth.getUser() çağırmaqla cari istifadəçini əldə edirik
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth error:", error);
          setUser(null);
          setLoading(false);
          return;
        }
        
        if (data.user) {
          const userData = await getUserData(data.user.id);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        console.error("Fetch user error:", err);
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    
    // Auth vəziyyətinin dəyişikliklərini izləmək üçün
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (session?.user) {
          const userData = await getUserData(session.user.id);
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const signIn = async (email: string, password: string): Promise<FullUserData | null> => {
    setSigningIn(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw error;
      }

      if (data.user) {
        const userData = await getUserData(data.user.id);
        setUser(userData);
        return userData;
      }

      return null;
    } catch (err: any) {
      setError(err);
      setUser(null);
      return null;
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setSigningUp(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const userData = await getUserData(data.user.id);
        setUser(userData);
      }

      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setSigningUp(false);
    }
  };

  const sendPasswordReset = async (email: string): Promise<boolean> => {
    setSendingPasswordReset(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setSendingPasswordReset(false);
    }
  };

  const confirmPasswordReset = async (newPassword: string): Promise<boolean> => {
    setConfirmingPasswordReset(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setConfirmingPasswordReset(false);
    }
  };

  const updateProfile = async (userData: Partial<FullUserData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUser) {
        throw userError || new Error("No authenticated user");
      }

      const { error } = await supabase.auth.updateUser(userData);

      if (error) {
        throw error;
      }

      const updatedUserData = await getUserData(currentUser.id);
      setUser(updatedUserData);

      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        throw error;
      }

      return true;
    } catch (err: any) {
      setError(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async (userId: string): Promise<FullUserData | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      // Məlumat boş və ya tələb olunan sahələr olmadığında defaultları təyin edirik
      const fullUserData: FullUserData = {
        ...(data as any),
        id: data?.id || userId,
        email: data?.email || '',
        name: data?.full_name || data?.name || '',
        full_name: data?.full_name || data?.name || '',
        role: data?.role || 'schooladmin', // default role
        regionId: data?.region_id || null,
        sectorId: data?.sector_id || null,
        schoolId: data?.school_id || null,
        status: data?.status || 'active'
      };

      return fullUserData;
    } catch (err: any) {
      setError(err);
      console.error("Get user data error:", err);
      return null;
    }
  };

  // Əlavə funksionallıq və qədim ad ilə uyğun olması üçün alias funksiyalar
  const login = signIn;
  const logout = signOut;
  const isAuthenticated = !!user;
  const isLoading = loading;

  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    clearError,
    signingIn,
    signingUp,
    sendingPasswordReset,
    confirmingPasswordReset,
    signIn,
    signOut,
    signUp,
    sendPasswordReset,
    confirmPasswordReset,
    updateProfile,
    updatePassword,
    getUserData,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
