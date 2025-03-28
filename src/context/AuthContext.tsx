import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/auth';  // hooks/auth/index.ts-dən import et
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// User roles
export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

// Auth state interface
interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: any | null;  // session əlavə et
}

// Auth context interface - əlavə funksiyaları daxil et
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
  signup: (email: string, password: string, userData: Partial<FullUserData>) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Context provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    loading,
    session,  // session əlavə et
    signIn,
    signOut,
    updateProfile,
    signUp,  // əlavə funksiyalar
    resetPassword,
    updatePassword,
    fetchUserData
  } = useSupabaseAuth();

  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Derive auth state
  const authState: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    error,
    session  // session əlavə et
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const data = await signIn(email, password);
      return !!data?.user;
    } catch (error: any) {
      setError(error.message || 'Bilinməyən giriş xətası');
      return false;
    }
  };

  // Signup function əlavə edək
  const signup = async (email: string, password: string, userData: Partial<FullUserData>): Promise<boolean> => {
    try {
      setError(null);
      const data = await signUp(email, password, userData);
      return !!data?.user;
    } catch (error: any) {
      setError(error.message || 'Qeydiyyat xətası');
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      await signOut();
      navigate('/login');
    } catch (error: any) {
      setError(error.message || 'Çıxış xətası');
      navigate('/login');
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setError(null);
      const profileUpdates = {
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language,
        avatar: userData.avatar,
        status: userData.status,
      };
      
      // undefined dəyərləri təmizləyək
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key as keyof typeof profileUpdates] === undefined) {
          delete profileUpdates[key as keyof typeof profileUpdates];
        }
      });
      
      return await updateProfile(profileUpdates);
    } catch (error: any) {
      setError(error.message || 'Profil yeniləmə xətası');
      return false;
    }
  };

  // updatePassword-i wrap edək
  const handleUpdatePassword = async (password: string): Promise<boolean> => {
    try {
      setError(null);
      return await updatePassword(password);
    } catch (error: any) {
      setError(error.message || 'Şifrə yeniləmə xətası');
      return false;
    }
  };

  // resetPassword-i wrap edək
  const handleResetPassword = async (email: string): Promise<boolean> => {
    try {
      setError(null);
      return await resetPassword(email);
    } catch (error: any) {
      setError(error.message || 'Şifrə sıfırlama xətası');
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        clearError,
        signup,
        resetPassword: handleResetPassword,
        updatePassword: handleUpdatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hooks
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRole = (role: Role | Role[]) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role as Role);
  }
  
  return user.role === role;
};