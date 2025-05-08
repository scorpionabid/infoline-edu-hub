
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FullUserData } from '@/types/supabase';

type AuthState = {
  isAuthenticated: boolean;
  user: FullUserData | null;
  session: any | null;
  loading: boolean;
  isLoading: boolean; // Add alias for loading
  error: string | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: FullUserData | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoading: (loading: boolean) => void; // Add alias setter
  setError: (error: string | null) => void;
  clear: () => void;
  updateUser: (data: Partial<FullUserData>) => void;
  // Add missing methods that components are using
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  logIn: (email: string, password: string) => Promise<boolean>;
};

// Function that merges partial user data with existing user data
const mergeUserData = (
  existingUser: FullUserData | null, 
  newData: Partial<FullUserData>
): FullUserData | null => {
  if (!existingUser) return null;
  return {
    ...existingUser,
    ...newData,
  };
};

// Create the auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      loading: true,
      isLoading: true, // Add alias for loading
      error: null,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading, isLoading: loading }),
      setIsLoading: (isLoading) => set({ isLoading, loading: isLoading }), // Set both for compatibility
      setError: (error) => set({ error }),
      clear: () => set({ isAuthenticated: false, user: null, session: null, error: null }),
      updateUser: (data) => 
        set((state) => ({ 
          user: mergeUserData(state.user, data) 
        })),
      
      // Add implementation for missing methods
      login: async (email, password) => {
        set({ loading: true, isLoading: true, error: null });
        try {
          // This is a placeholder - in a real app, you'd implement actual login logic
          console.log(`Login attempt with ${email}`);
          // Simulate successful login
          set({ 
            isAuthenticated: true, 
            loading: false,
            isLoading: false,
            user: { 
              id: '1', 
              email, 
              role: 'user',
              full_name: email.split('@')[0]
            } as FullUserData 
          });
          return true;
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            loading: false,
            isLoading: false
          });
          return false;
        }
      },
      
      logIn: async (email, password) => {
        // Call the login method - this prevents duplicate code
        return get().login(email, password);
      },
      
      logout: async () => {
        set({ loading: true, isLoading: true });
        try {
          // This is a placeholder - in a real app, you'd implement actual logout logic
          console.log('Logging out');
          set({ 
            isAuthenticated: false, 
            user: null,
            session: null,
            loading: false,
            isLoading: false
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Logout failed', 
            loading: false,
            isLoading: false
          });
        }
      },
      
      refreshAuth: async () => {
        // This is a placeholder - in a real app, you'd implement session refresh
        console.log('Refreshing auth');
      },
      
      clearError: () => set({ error: null }),
      
      refreshSession: async () => {
        // This is a placeholder - in a real app, you'd refresh the session
        console.log('Refreshing session');
      }
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        session: state.session,
      }),
    }
  )
);

// Helper function to determine if user needs to authenticate
export const shouldAuthenticate = (currentPath = '', isLoading = false, isAuthenticated = false): boolean => {
  // If still loading, don't redirect
  if (isLoading) return false;
  
  // Already authenticated, don't need to redirect to login
  if (isAuthenticated) return false;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/reset-password', '/auth'];
  const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
  
  // Return true if we're not on a public path and not authenticated
  return !isPublicPath;
};

// Helper to check if path is a protected route
export const isProtectedRoute = (path: string): boolean => {
  const publicPaths = ['/login', '/register', '/reset-password', '/auth'];
  return !publicPaths.some(publicPath => path.startsWith(publicPath));
};

// Helper to get the redirect path after login
export const getRedirectPath = (role: string = 'user'): string => {
  switch (role) {
    case 'superadmin':
      return '/dashboard';
    case 'regionadmin':
      return '/dashboard';
    case 'sectoradmin':
      return '/dashboard';
    case 'schooladmin':
      return '/dashboard';
    default:
      return '/';
  }
};

export default useAuthStore;
