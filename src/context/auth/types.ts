
import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/supabase';

// Error type
export type AuthErrorType = string | null;

// Auth Context Type
export interface AuthContextType {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  authenticated: boolean; // Alias for isAuthenticated
  loading: boolean;
  error: AuthErrorType;
  
  // Auth operations
  logIn: (email: string, password: string) => Promise<{ data: any; error: any; }>;
  login: (email: string, password: string) => Promise<boolean>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // User data operations
  updateUser: (data: Partial<FullUserData>) => void;
  
  // Error handling
  clearError: () => void;
  setError: (error: string | null) => void;
  
  // Profile operations
  refreshProfile: () => Promise<FullUserData | null>;
  refreshSession: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  
  // Password operations
  resetPassword: (email: string) => Promise<any>;
  
  // User registration
  register: (userData: any) => Promise<any>;
  createUser: (userData: any) => Promise<any>;
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
}
