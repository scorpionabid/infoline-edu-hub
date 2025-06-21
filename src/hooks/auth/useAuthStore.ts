
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  preferences?: Record<string, any>;
}

interface AuthState {
  user: User | null;
  session: any;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => void;
  initializeAuth: (loginOnly?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      initialized: false,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock authentication - replace with real implementation
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email,
            full_name: 'Test User',
            role: 'admin',
            region_id: '1',
            sector_id: '1',
            school_id: '1',
            regionId: '1',
            sectorId: '1',
            schoolId: '1',
            phone: '+994501234567',
            position: 'Administrator',
            avatar: '',
            preferences: {}
          };
          
          const mockSession = {
            user: mockUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token'
          };
          
          set({ 
            user: mockUser, 
            session: mockSession,
            isAuthenticated: true, 
            isLoading: false,
            initialized: true
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
            session: null,
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

      logout: () => {
        set({ 
          user: null, 
          session: null,
          isAuthenticated: false, 
          isLoading: false,
          error: null
        });
      },

      initializeAuth: async (loginOnly?: boolean) => {
        // Check if user is already authenticated from persisted state
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true, initialized: true });
        } else {
          set({ initialized: true });
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true });
        
        try {
          // Mock profile update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const updatedUser = { ...currentUser, ...updates };
          set({ 
            user: updatedUser,
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Profile update failed', 
            isLoading: false 
          });
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ isLoading: true });
        
        try {
          // Mock password update
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Password update failed', 
            isLoading: false 
          });
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
export const selectError = (state: AuthState) => state.error;
export const selectSession = (state: AuthState) => state.session;
export const selectUserRole = (state: AuthState) => state.user?.role;
export const selectRegionId = (state: AuthState) => state.user?.region_id || state.user?.regionId;
export const selectSectorId = (state: AuthState) => state.user?.sector_id || state.user?.sectorId;
export const selectSchoolId = (state: AuthState) => state.user?.school_id || state.user?.schoolId;
export const selectUpdateProfile = (state: AuthState) => state.updateProfile;
export const selectUpdatePassword = (state: AuthState) => state.updatePassword;
export const selectSignOut = (state: AuthState) => state.signOut;
