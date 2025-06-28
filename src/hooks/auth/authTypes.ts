// ============================================================================
// İnfoLine Auth System - Types File
// ============================================================================
// ⚠️ DEPRECATED: Use @/types/auth instead
// Bu fayl tədricən silinəcək. Yeni import-lar üçün @/types/auth istifadə edin.
// Bu fayl auth sisteminin bütün tiplərini və interfeyslərini saxlayır

import { Session } from '@supabase/supabase-js';
import type { UserRole } from '@/types/auth';

// User role types - Re-exported from unified auth types
export type { UserRole };

// User data interface - normalized
export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name: string; // Legacy/compatibility support
  role: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  regionId?: string | null; // Legacy/compatibility support
  sectorId?: string | null; // Legacy/compatibility support
  schoolId?: string | null; // Legacy/compatibility support
  phone?: string | null;
  position?: string | null;
  language?: string;
  avatar?: string | null;
  status?: string;
  last_login?: string | null;
  lastLogin?: string | null; // Legacy/compatibility support
  created_at?: string | null;
  createdAt?: string | null; // Legacy/compatibility support
  updated_at?: string | null;
  updatedAt?: string | null; // Legacy/compatibility support
}

// Auth store state interface
export interface AuthState {
  user: FullUserData | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialized: boolean;
  initializationAttempted: boolean;
  error: string | null;
  loadingStartTime: number | null; // Timestamp when loading started
  signInAttemptTime: number | null; // Timestamp when signin attempt started
  
  // Methods
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  performInitialization: (loginOnly?: boolean) => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<FullUserData>) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  fetchUser: () => Promise<void>;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
}

// Public route props
export interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

// Protected route props
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectUrl?: string;
}

// Timeout configuration
export const AUTH_TIMEOUT_CONFIG = {
  MAX_RETRIES: 3,
  INIT_TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 5000,   // 5 seconds
  SIGNIN_TIMEOUT: 20000 // 20 seconds
};
