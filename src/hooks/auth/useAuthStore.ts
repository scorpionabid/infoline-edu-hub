
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FullUserData } from '@/types/supabase';

type AuthState = {
  isAuthenticated: boolean;
  user: FullUserData | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: FullUserData | null) => void;
  setSession: (session: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clear: () => void;
  updateUser: (data: Partial<FullUserData>) => void;
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
    (set) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      loading: true,
      error: null,
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clear: () => set({ isAuthenticated: false, user: null, session: null, error: null }),
      updateUser: (data) => 
        set((state) => ({ 
          user: mergeUserData(state.user, data) 
        })),
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
