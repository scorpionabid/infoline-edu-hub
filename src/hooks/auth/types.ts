
import { FullUserData } from '@/types/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session?: Session | null;
  loading?: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateUser: (userData: Partial<FullUserData>) => Promise<boolean>;
  clearError: () => void;
  signIn?: (email: string, password: string) => Promise<any>;
  signOut?: () => Promise<void>;
  signUp?: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword?: (email: string) => Promise<boolean>;
  updateProfile?: (updates: any) => Promise<boolean>;
  updatePassword?: (password: string) => Promise<boolean>;
  fetchUserData?: (userId: string) => Promise<FullUserData | null>;
}

export interface UseSupabaseAuthReturn extends AuthState, AuthActions {}

/**
 * İcazə səviyyəsi tipləri
 */
export type PermissionLevel = 'read' | 'write' | 'full';

/**
 * İcazə yoxlayıcı funksiyaların qaytardığı nəticə tipi
 */
export type PermissionCheckResult = Promise<boolean>;

/**
 * İcazələrin yoxlanması üçün interfeys
 */
export interface PermissionCheckers {
  checkRegionAccess: (regionId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkSectorAccess: (sectorId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkSchoolAccess: (schoolId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkCategoryAccess: (categoryId: string, level?: PermissionLevel) => PermissionCheckResult;
  checkColumnAccess: (columnId: string, level?: PermissionLevel) => PermissionCheckResult;
  canSectorAdminAccessCategoriesColumns: () => boolean;
}

/**
 * İcazə yoxlama hook-unun qaytardığı nəticə tipi
 */
export interface UsePermissionsResult extends PermissionCheckers {
  userRole?: string;
  userId?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}
