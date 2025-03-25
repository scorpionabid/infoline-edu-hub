
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { FullUserData } from '@/types/supabase';
import { toast } from 'sonner';

// User roles
export type Role = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

// Auth state interface
interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth context interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
  } = useSupabaseAuth();

  // Derive auth state from Supabase user
  const authState: AuthState = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log(`AuthContext: ${email} ilə giriş edilir...`);
      const data = await signIn(email, password);
      
      if (!data || !data.user) {
        console.error('AuthContext: Giriş uğursuz oldu - istifadəçi məlumatları yoxdur');
        return false;
      }
      
      console.log('AuthContext: Giriş uğurlu oldu');
      return true;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      // Əlavə notification göstərmirik, əsas xəta signIn funksiyasında göstərilir
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut();
      console.log('AuthContext: İstifadəçi uğurla çıxış etdi');
    } catch (error) {
      console.error('AuthContext: Çıxış zamanı xəta:', error);
      toast.error('Çıxış zamanı xəta baş verdi');
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<FullUserData>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Convert FullUserData to Profile format
      const profileUpdates = {
        full_name: userData.full_name,
        phone: userData.phone,
        position: userData.position,
        language: userData.language,
        avatar: userData.avatar,
        status: userData.status,
      };
      
      // Remove undefined values
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key as keyof typeof profileUpdates] === undefined) {
          delete profileUpdates[key as keyof typeof profileUpdates];
        }
      });
      
      const success = await updateProfile(profileUpdates);
      return success;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // Hər dəfə auth vəziyyəti dəyişdikdə log edək
  useEffect(() => {
    console.log('Auth vəziyyəti dəyişdi:', {
      isAuthenticated: !!user,
      isLoading: loading,
      user: user ? { id: user.id, email: user.email, role: user.role } : null
    });
  }, [user, loading]);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook to check for specific role
export const useRole = (role: Role | Role[]) => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(role)) {
    return role.includes(user.role as Role);
  }
  
  return user.role === role;
};
