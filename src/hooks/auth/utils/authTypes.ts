import { Session } from '@supabase/supabase-js';
import { FullUserData } from '@/types/user';

/**
 * AuthState interface - autentifikasiya məlumatı üçün data modeli
 */
export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  authInitialized: boolean;
}

/**
 * AuthActions interface - autentifikasiya əməliyyatları üçün metodlar
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  refreshUserData: () => Promise<FullUserData | null>;
  clearError: () => void;
  updateUserPreferences: (preferences: any) => Promise<void>;
}

/**
 * UseAuthResult interface - useAuth hook-unun geri qaytardığı tam məlumat modeli
 */
export interface UseAuthResult extends AuthState, AuthActions {
  // Legacy support və aliases
  authenticated?: boolean;
  loading?: boolean;
  logIn?: (email: string, password: string) => Promise<boolean>;
  logOut?: () => Promise<void>;
  signOut?: () => Promise<void>;
  updateProfile?: (userData: Partial<FullUserData>) => void;
  updateUserProfile?: (userData: Partial<FullUserData>) => void;
  updateUserData?: (userData: Partial<FullUserData>) => void;
}
