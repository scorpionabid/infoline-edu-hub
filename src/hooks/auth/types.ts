
import { UserRole } from '@/types/supabase';

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
  userRole?: UserRole | null;
  userId?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

/**
 * İstifadəçi rolu məlumatlarını saxlayan interfeysi
 */
export interface UserRoleData {
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

/**
 * Auth state tipləri
 */
export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  session: any | null;
  loading?: boolean;
}

/**
 * Auth əməliyyatları
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  signIn?: (email: string, password: string) => Promise<any>;
  signOut?: () => Promise<void>;
  signUp?: (email: string, password: string, userData: any) => Promise<any>;
  resetPassword?: (email: string) => Promise<boolean>;
  updatePassword?: (password: string) => Promise<boolean>;
  updateProfile?: (updates: any) => Promise<boolean>;
}

/**
 * UseSupabaseAuth hook qaytardığı tip
 */
export interface UseSupabaseAuthReturn extends AuthState, AuthActions {
  fetchUserData?: (userId: string) => Promise<any>;
}
