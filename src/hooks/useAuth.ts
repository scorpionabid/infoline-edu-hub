import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FullUserData, UserRole } from '@/types/supabase';

export type AuthState = {
  user: FullUserData | null;
  loading: boolean;
  error: Error | null;
  session: any | null;
};

export type UseAuthReturn = AuthState & {
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (email: string, password: string, userData: Partial<FullUserData>) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<FullUserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null }>;
  clearError: () => void;
  isAuthenticated: boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
};

/**
 * Istifadəçi məlumatlarını əldə etmək üçün funksiya
 */
const getUserData = async (userId: string): Promise<FullUserData | null> => {
  try {
    // Full user data əldə etmək üçün stored function çağırırıq
    const { data, error } = await supabase
      .rpc('get_full_user_data', { user_id_param: userId });
    
    if (error) {
      console.error('Istifadəçi məlumatları alınarkən xəta:', error);
      throw error;
    }
    
    return data as FullUserData;
  } catch (error) {
    console.error('Istifadəçi məlumatları alınarkən xəta:', error);
    return null;
  }
};

/**
 * Auth hook - application-wide authentication state management
 */
export const useAuth = (): UseAuthReturn => {
  // State values
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    session: null
  });
  
  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      if (data.user) {
        try {
          const userData = await getUserData(data.user.id);
          setState(prev => ({ 
            ...prev, 
            user: userData, 
            session: data.session,
            loading: false
          }));
        } catch (err) {
          console.error('İstifadəçi məlumatları alınarkən xəta:', err);
        }
      }
      
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Signup function
  const signup = async (email: string, password: string, userData: Partial<FullUserData>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Əvvəlcə auth ilə qeydiyyatdan keç
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name || '',
            role: userData.role || 'user'
          }
        }
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setState({ user: null, loading: false, error: null, session: null });
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
    }
  };
  
  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      toast.success('Şifrə sıfırlama linki e-poçt adresinizə göndərildi');
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Update password
  const updatePassword = async (password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setState(prev => ({ ...prev, error, loading: false }));
        return { error };
      }
      
      toast.success('Şifrəniz uğurla yeniləndi');
      return { error: null };
    } catch (error: any) {
      setState(prev => ({ ...prev, error, loading: false }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Update profile
  const updateProfile = async (profileData: Partial<FullUserData>) => {
    try {
      if (!state.user) {
        throw new Error('No user is currently logged in');
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name || state.user.full_name,
          phone: profileData.phone || state.user.phone,
          position: profileData.position || state.user.position,
          language: profileData.language || state.user.language,
          avatar: profileData.avatar || state.user.avatar,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.user.id)
        .select();
      
      if (error) {
        setState(prev => ({ ...prev, error }));
        throw error;
      }
      
      // If the email has changed, update both auth and users
      if (profileData.email && profileData.email !== state.user.email) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          email: profileData.email
        });
        
        if (updateAuthError) {
          setState(prev => ({ ...prev, error: updateAuthError }));
          throw updateAuthError;
        }
      }
      
      // If role has changed, update the user_roles table
      if (profileData.role && profileData.role !== state.user.role) {
        const { error: updateRoleError } = await supabase
          .from('user_roles')
          .update({
            role: profileData.role,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', state.user.id);
        
        if (updateRoleError) {
          setState(prev => ({ ...prev, error: updateRoleError }));
          throw updateRoleError;
        }
      }
      
      // Get updated user data
      if (state.user) {
        const updatedUser = await getUserData(state.user.id);
        if (updatedUser) {
          setState(prev => ({ ...prev, user: updatedUser }));
        }
      }
      
      toast.success('Profil məlumatlarınız yeniləndi');
    } catch (error: any) {
      setState(prev => ({ ...prev, error }));
      throw error;
    }
  };
  
  // Clear any auth errors
  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };
  
  // Check if user has specific role
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(state.user.role as UserRole);
    }
    
    return state.user.role === role;
  };
  
  // Setup auth listener and get initial session
  useEffect(() => {
    setState(prev => ({ ...prev, loading: true }));
    
    // Set timeout to prevent hanging
    const authTimeout = setTimeout(() => {
      if (state.loading) {
        console.warn('Auth yüklənməsi timeout-a uğradı - 10 saniyə keçdi');
        setState(prev => ({ ...prev, loading: false }));
      }
    }, 10000);
    
    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state dəyişdi:', event, !!session);
        setState(prev => ({ ...prev, session }));
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            try {
              const userData = await getUserData(session.user.id);
              setState(prev => ({ 
                ...prev, 
                user: userData, 
                loading: false,
                session
              }));
              console.log('Auth state yeniləndi:', event, !!userData);
            } catch (error) {
              console.error('İstifadəçi məlumatları alınarkən xəta:', error);
              setState(prev => ({ 
                ...prev, 
                user: null, 
                loading: false,
                error: error as Error 
              }));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('İstifadəçi çıxış etdi');
          setState({ 
            user: null, 
            loading: false, 
            error: null, 
            session: null 
          });
        }
      }
    );
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setState(prev => ({ ...prev, session }));
        
        if (session?.user) {
          try {
            const userData = await getUserData(session.user.id);
            setState(prev => ({ 
              ...prev, 
              user: userData, 
              loading: false 
            }));
            console.log('İlkin sessiya məlumatları alındı:', !!userData);
          } catch (userError) {
            setState(prev => ({ 
              ...prev, 
              user: null, 
              loading: false,
              error: userError as Error 
            }));
          }
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          error: error as Error, 
          loading: false 
        }));
      }
    };
    
    initializeAuth();
    
    // Cleanup
    return () => {
      clearTimeout(authTimeout);
      subscription.unsubscribe();
    };
  }, []);
  
  // Açıq şəkildə isAuthenticated dəyərini hesablayaq
  const isAuthenticated = !!state.user && !!state.session;
  
  return {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    updatePassword,
    clearError,
    isAuthenticated,
    hasRole
  };
};

/**
 * Role check hook for conditional rendering
 */
export const useRole = (
  role: UserRole | UserRole[], 
  fallback: JSX.Element | null = null
): boolean | JSX.Element | null => {
  const { user, loading } = useAuth();
  
  if (loading) return fallback;
  
  if (!user) return fallback;
  
  if (Array.isArray(role)) {
    return role.includes(user.role as UserRole) || fallback;
  }
  
  return user.role === role || fallback;
};
