
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock authentication - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email,
            full_name: 'Test User',
            role: 'admin'
          };
          
          set({ 
            user: mockUser, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Authentication failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });
        
        try {
          // Mock sign out
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Sign out failed', 
            isLoading: false 
          });
        }
      },

      initializeAuth: () => {
        // Check if user is already authenticated from persisted state
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
