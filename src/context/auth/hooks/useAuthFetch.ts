import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, FullUserData } from '@/types/user';
import { fetchUserData, updateUserProfile } from '@/services/userDataService';
import { toast } from 'sonner';
import { useRouter } from '@/hooks/useRouter';
import { CACHE_KEYS, clearCache } from '@/lib/cache';

interface UseAuthFetchResult {
  user: FullUserData | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  updateUser: (updates: Partial<FullUserData>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<FullUserData>) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useAuthFetch = (): UseAuthFetchResult => {
  const [user, setUser] = useState<FullUserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const router = useRouter();

  // Fetch user data from Supabase
  const fetchUser = useCallback(async (sessionData: Session) => {
    try {
      if (!sessionData?.user?.id) {
        console.warn('No user ID in session');
        setUser(null);
        return;
      }

      const userData = await fetchUserData(sessionData.user.id, sessionData);
      
      if (userData) {
        setUser(userData);
      } else {
        console.warn('No user data returned from fetchUserData');
        setUser(null);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user data'));
      setUser(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchUser(currentSession);
        } else {
          setUser(null);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log('Auth state changed:', event);
            setSession(newSession);
            
            if (event === 'SIGNED_IN' && newSession) {
              await fetchUser(newSession);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              clearCache();
            } else if (event === 'USER_UPDATED' && newSession) {
              await fetchUser(newSession);
            } else if (event === 'TOKEN_REFRESHED' && newSession) {
              setSession(newSession);
            }
          }
        );
        
        setIsInitialized(true);
        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize auth'));
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, [fetchUser]);

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      clearCache();
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
    } finally {
      setLoading(false);
    }
  };

  // Update user function
  const updateUser = async (updates: Partial<FullUserData>): Promise<boolean> => {
    if (!user || !user.id) {
      console.error('Cannot update user: No user logged in');
      return false;
    }
    
    try {
      setLoading(true);
      const success = await updateUserProfile(user.id, updates);
      
      if (success) {
        // Update local user state with new values
        setUser(prevUser => {
          if (!prevUser) return null;
          return { ...prevUser, ...updates };
        });
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err : new Error('Failed to update user'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user || !user.email) {
      console.error('Cannot update password: No user logged in or email missing');
      return false;
    }
    
    try {
      setLoading(true);
      
      // First sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      });
      
      if (signInError) {
        toast.error('Current password is incorrect');
        return false;
      }
      
      // Then update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (updateError) {
        throw updateError;
      }
      
      return true;
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err : new Error('Failed to update password'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUserData = async (): Promise<void> => {
    if (!session) {
      console.warn('Cannot refresh user data: No active session');
      return;
    }
    
    try {
      setLoading(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }
      
      if (userData.user) {
        await fetchUser(session);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh user data'));
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user && !!session,
    isInitialized,
    updateUser,
    updatePassword,
    updateUserProfile: updateUser, // Alias for updateUser
    signOut,
    refreshUserData
  };
};

// Hook for getting current user
export const useCurrentUser = (): FullUserData | null => {
  const { user } = useAuthFetch();
  return user;
};

// Hook for checking if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuthFetch();
  return isAuthenticated;
};

// Hook for checking if auth is initialized
export const useIsAuthInitialized = (): boolean => {
  const { isInitialized } = useAuthFetch();
  return isInitialized;
};

// Hook for getting current session
export const useSession = (): Session | null => {
  const { session } = useAuthFetch();
  return session;
};

// Hook for signing out
export const useSignOut = (): (() => Promise<void>) => {
  const { signOut } = useAuthFetch();
  return signOut;
};

// Hook for refreshing user data
export const useRefreshUserData = (): (() => Promise<void>) => {
  const { refreshUserData } = useAuthFetch();
  return refreshUserData;
};

// Hook for updating user
export const useUpdateUser = (): ((updates: Partial<FullUserData>) => Promise<boolean>) => {
  const { updateUser } = useAuthFetch();
  return updateUser;
};

// Hook for updating password
export const useUpdatePassword = (): ((currentPassword: string, newPassword: string) => Promise<boolean>) => {
  const { updatePassword } = useAuthFetch();
  return updatePassword;
};

// Hook for checking if user is loading
export const useIsAuthLoading = (): boolean => {
  const { loading } = useAuthFetch();
  return loading;
};

// Hook for getting auth error
export const useAuthError = (): Error | null => {
  const { error } = useAuthFetch();
  return error;
};

// Hook for getting user ID
export const useUserId = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.id;
};

// Hook for getting user role
export const useUserRole = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.role;
};

// Hook for checking if user has a specific role
export const useHasRole = (role: string | string[]): boolean => {
  const { user } = useAuthFetch();
  
  if (!user || !user.role) {
    return false;
  }
  
  if (Array.isArray(role)) {
    return role.includes(user.role);
  }
  
  return user.role === role;
};

// Hook for checking if user is admin
export const useIsAdmin = (): boolean => {
  const { user } = useAuthFetch();
  
  if (!user || !user.role) {
    return false;
  }
  
  return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(user.role);
};

// Hook for checking if user is super admin
export const useIsSuperAdmin = (): boolean => {
  const { user } = useAuthFetch();
  return user?.role === 'superadmin';
};

// Hook for checking if user is region admin
export const useIsRegionAdmin = (): boolean => {
  const { user } = useAuthFetch();
  return user?.role === 'regionadmin';
};

// Hook for checking if user is sector admin
export const useIsSectorAdmin = (): boolean => {
  const { user } = useAuthFetch();
  return user?.role === 'sectoradmin';
};

// Hook for checking if user is school admin
export const useIsSchoolAdmin = (): boolean => {
  const { user } = useAuthFetch();
  return user?.role === 'schooladmin';
};

// Hook for getting user region ID
export const useUserRegionId = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.region_id || user?.regionId;
};

// Hook for getting user sector ID
export const useUserSectorId = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.sector_id || user?.sectorId;
};

// Hook for getting user school ID
export const useUserSchoolId = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.school_id || user?.schoolId;
};

// Hook for checking if auth is ready
export const useIsAuthReady = (): boolean => {
  const { isInitialized, loading } = useAuthFetch();
  return isInitialized && !loading;
};

// Hook for getting user email
export const useUserEmail = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.email;
};

// Hook for getting user name
export const useUserName = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.full_name || user?.name;
};

// Hook for getting user avatar
export const useUserAvatar = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.avatar;
};

// Hook for getting user language
export const useUserLanguage = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.language;
};

// Hook for getting user notification settings
export const useUserNotificationSettings = (): any => {
  const { user } = useAuthFetch();
  return user?.notificationSettings || user?.notification_settings;
};

// Hook for getting user status
export const useUserStatus = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.status;
};

// Hook for getting user position
export const useUserPosition = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.position;
};

// Hook for getting user phone
export const useUserPhone = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.phone;
};

// Hook for getting user last login
export const useUserLastLogin = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.last_login || user?.lastLogin;
};

// Hook for getting user created at
export const useUserCreatedAt = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.created_at || user?.createdAt;
};

// Hook for getting user updated at
export const useUserUpdatedAt = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.updated_at || user?.updatedAt;
};

// Hook for getting user entity name
export const useUserEntityName = (): any => {
  const { user } = useAuthFetch();
  return user?.entityName;
};

// Hook for getting user entity types
export const useUserEntityTypes = (): string[] | undefined => {
  const { user } = useAuthFetch();
  return user?.entityTypes;
};

// Hook for getting user admin entity
export const useUserAdminEntity = (): any => {
  const { user } = useAuthFetch();
  return user?.adminEntity;
};

// Hook for getting user region name
export const useUserRegionName = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.region_name || user?.regionName;
};

// Hook for getting user sector name
export const useUserSectorName = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.sector_name || user?.sectorName;
};

// Hook for getting user school name
export const useUserSchoolName = (): string | undefined => {
  const { user } = useAuthFetch();
  return user?.school_name || user?.schoolName;
};
