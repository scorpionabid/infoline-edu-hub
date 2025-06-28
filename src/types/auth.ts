// ============================================================================
// İnfoLine Auth Types - Unified Type System
// ============================================================================
// Bu fayl bütün auth-related type definitions-ları birləşdirir
// Authoritative source: Supabase database enums
// Əvvəlki duplikat fayllar: hooks/auth/authTypes.ts, hooks/auth/permissionTypes.ts

import type { Database } from '../integrations/supabase/types';

// UserRole - Database enum-undan extend edilir
export type UserRole = Database['public']['Enums']['app_role'] | 'teacher' | 'user';

// Legacy compatibility
export type UserRoleLegacy = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// Database type aliases for convenience
export type DatabaseEnums = Database['public']['Enums'];
export type AppRole = DatabaseEnums['app_role'];
export type ColumnType = DatabaseEnums['column_type'];
export type DataStatus = DatabaseEnums['data_status'];

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

// ============================================================================
// Auth Configuration Constants
// ============================================================================

// Timeout configuration
export const AUTH_TIMEOUT_CONFIG = {
  MAX_RETRIES: 3,
  INIT_TIMEOUT: 30000, // 30 seconds
  RETRY_DELAY: 5000,   // 5 seconds
  SIGNIN_TIMEOUT: 20000 // 20 seconds
};

// ============================================================================
// Core User Interfaces
// ============================================================================

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  school_name?: string;
  region_name?: string;
  sector_name?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: UserStatus;
  lastLogin?: string;
  last_login?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: string[];
  preferences?: any;
  entityName?: string | {
    region?: string;
    sector?: string;
    school?: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  school_name?: string;
  region_name?: string;
  sector_name?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Auth Context and Hook Interfaces
// ============================================================================

export interface AuthContextType {
  user: FullUserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
  session: any;
}

export interface UseAuthResult {
  user: FullUserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
}

// ============================================================================
// Auth Store Interface (Zustand)
// ============================================================================

export interface AuthState {
  user: FullUserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | Error | null;
  session: any;
  initialized: boolean;
  initializationAttempted: boolean;
  loadingStartTime?: number; // Track when loading state started
  signInAttemptTime?: number; // Track when sign-in attempts start
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => void;
  clearError: () => void;
  initializeAuth: (loginOnly?: boolean) => Promise<void>;
  performInitialization: (loginOnly?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<{ success: boolean, error?: any }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean, error?: any }>;
  hasPermission: (permission: string) => boolean;
}

// ============================================================================
// Permission System Types
// ============================================================================
// Birləşdirildi: hooks/auth/permissionTypes.ts

export type PermissionLevel = 'read' | 'write' | 'admin' | 'owner';

export interface PermissionChecker {
  canRead: boolean;
  canWrite: boolean;
  canAdmin: boolean;
  canOwn: boolean;
  hasMinimumLevel: (level: PermissionLevel) => boolean;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  level?: PermissionLevel;
}

export interface UsePermissionsResult {
  hasRole: (role: string | string[]) => boolean;
  hasRoleAtLeast: (minimumRole: string) => boolean;
  canAccessRoute: (allowedRoles: string[]) => boolean;
  isSuperAdmin: boolean;
  isRegionAdmin: boolean;
  isSectorAdmin: boolean;
  isSchoolAdmin: boolean;
  isTeacher: boolean;
  isUser: boolean;
  userEntityId: string | undefined;
  userRole: string | undefined;
  regionId: string | undefined;
  sectorId: string | undefined;
  schoolId: string | undefined;
  canManageCategories: boolean;
  canManageColumns: boolean;
  canManageSchools: boolean;
  canManageSectors: boolean;
  canManageRegions: boolean;
  canManageUsers: boolean;
  canApproveData: boolean;
  canEditData: boolean;
  canViewReports: boolean;
  canEditCategory: boolean;
  canDeleteCategory: boolean;
  canAddCategory: boolean;
  hasSubmitPermission: boolean;
}

// ============================================================================
// Data Access Control Types
// ============================================================================
// Birləşdirildi: useDataAccessControl types

export interface DataAccessConfig {
  entityType: 'region' | 'sector' | 'school' | 'category' | 'data';
  entityId?: string;
  operation: 'read' | 'write' | 'delete' | 'approve';
  targetUserId?: string;
}

export interface DataAccessResult {
  hasAccess: boolean;
  reason?: string;
  allowedFields?: string[];
  restrictedFields?: string[];
}

// ============================================================================
// Auth Utilities and Helpers
// ============================================================================

export interface AuthUtilities {
  shouldAuthenticate: (route: string) => boolean;
  isProtectedRoute: (route: string) => boolean;
  getRedirectPath: (userRole: UserRole) => string;
  normalizeRole: (role: string) => UserRole;
  hasMinimumRole: (userRole: UserRole, minimumRole: UserRole) => boolean;
}

// ============================================================================
// Route Protection Types
// ============================================================================

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectUrl?: string;
  requireAuth?: boolean;
}

export interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

// ============================================================================
// Notification Settings (Auth Related)
// ============================================================================

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  system: boolean;
  deadline: boolean;
  sms: boolean;
  deadlineReminders: boolean;
  statusUpdates: boolean;
  weeklyReports: boolean;
}

// ============================================================================
// Login/Register Form Types
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role?: UserRole;
  phone?: string;
  position?: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdatePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserFormData {
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  language?: string;
  status?: UserStatus;
  notifications?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AuthApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SignInResponse extends AuthApiResponse {
  data?: {
    user: FullUserData;
    session: any;
    accessToken: string;
  };
}

export interface ProfileUpdateResponse extends AuthApiResponse {
  data?: {
    user: FullUserData;
  };
}

// ============================================================================
// State Management Types
// ============================================================================

export interface AuthReducerAction {
  type: 'SIGN_IN' | 'SIGN_OUT' | 'SET_USER' | 'SET_LOADING' | 'SET_ERROR' | 'CLEAR_ERROR';
  payload?: any;
}

export interface AuthReducerState {
  user: FullUserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export type AuthErrorCode = 
  | 'AUTH_ERROR'
  | 'INVALID_CREDENTIALS' 
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_TOO_WEAK'
  | 'EMAIL_ALREADY_EXISTS'
  | 'NETWORK_ERROR'
  | 'PERMISSION_DENIED'
  | 'SESSION_EXPIRED';

// ============================================================================
// Exports for backward compatibility
// ============================================================================

// Type aliases for existing code compatibility
export type { UserRole as Role };
export type { FullUserData as UserData };
export type { AuthState as AuthStoreState };

// Export all types for convenience
// TypeScript-də tipler dəyər kimi istifadə edilə bilməz
// Buna görə də boş bir namespace ixrac edirik
export const AuthTypes = {};
