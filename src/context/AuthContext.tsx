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
  getUserData: async () => null
});

export const useAuth = () => useContext(AuthContext);

// Session xətasını düzəltmək üçün session dəyişənini çıxarırıq
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);
  const [confirmingPasswordReset, setConfirmingPasswordReset] = useState(false);

  // Auth kontextini komponent boyunca istifadə etmək üçün hook
  const { auth } = useSupabaseAuth();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        if (auth.currentUser) {
          const userData = await getUserData(auth.currentUser.id);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (err: any) {
        setError(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [auth.currentUser]);

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
      const { error } = await supabase.auth.updateUser(userData);

      if (error) {
        throw error;
      }

      const updatedUserData = await getUserData(auth.currentUser!.id);
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

      return data as FullUserData;
    } catch (err: any) {
      setError(err);
      return null;
    }
  };

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
    getUserData
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

