
import { createContext } from 'react';
import { AuthContextType } from '@/types/auth';

// Create the context with a default empty object
export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  authenticated: false,
  loading: true,
  error: null,
  logIn: async () => ({ data: null, error: null }),
  login: async () => false,
  register: async () => null,
  logOut: async () => {},
  logout: async () => {},
  resetPassword: async () => null,
  updatePassword: async () => ({ data: null, error: null }),
  sendPasswordResetEmail: async () => null,
  refreshSession: async () => {},
  getSession: async () => null,
  setSession: () => {},
  updateProfile: async () => ({ data: null, error: null }),
  fetchUserData: async () => null,
  clearErrors: () => {},
  setUser: () => {},
  setLoading: () => {},
  setError: () => {},
  updateUserData: async () => ({ data: null, error: null }),
  clearError: () => {},
  refreshProfile: async () => null,
  updateUser: () => {},
  updateUserProfile: async () => ({ data: null, error: null }),
  signOut: async () => {},
  createUser: async () => ({ data: null, error: null }),
  signup: async () => ({ user: null, error: null })
});
