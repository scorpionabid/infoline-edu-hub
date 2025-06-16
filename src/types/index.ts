// ============================================================================
// İnfoLine Main Types Export - Central Index
// ============================================================================
// Bu fayl bütün type exports-ları mərkəzləşdirir və import path-ların 
// standartlaşdırılmasını təmin edir

// Auth Types (Əsas) - Explicit exports to avoid conflicts
export type {
  UserRole,
  UserStatus,
  FullUserData,
  User,
  AuthContextType,
  UseAuthResult,
  AuthState,
  PermissionLevel,
  PermissionChecker,
  PermissionResult,
  UsePermissionsResult,
  DataAccessConfig,
  DataAccessResult,
  AuthUtilities,
  ProtectedRouteProps,
  PublicRouteProps,
  NotificationSettings as AuthNotificationSettings, // Aliased to avoid conflict
  LoginFormData,
  RegisterFormData,
  ResetPasswordFormData,
  UpdatePasswordFormData,
  UserFormData,
  AuthApiResponse,
  SignInResponse,
  ProfileUpdateResponse,
  AuthReducerAction,
  AuthReducerState,
  AuthError,
  AuthErrorCode
} from './auth';

// Core Business Types - Explicit exports
export type {
  Category
} from './category';

export type {
  ColumnType,
  ColumnOption,
  Column,
  ColumnFormValues,
  ColumnFormData,
  UseColumnFormProps
} from './column';

export type {
  DataEntryStatus,
  ApprovalItem,
  DataEntryFormData,
  ValidationRule,
  FieldValidation,
  DataEntry,
  DataEntryTableData,
  ValidationResult,
  FormField,
  FormFieldProps,
  FormFieldsProps,
  DataEntrySaveStatusType,
  DataEntryForm,
  DataEntrySaveBarProps
} from './dataEntry';

export type {
  School
} from './school';

export type {
  Sector,
  EnhancedSector,
  SectorFormData,
  CreateSectorData
} from './sector';

export type {
  Region
} from './region';

// Database and Supabase Types
export * from './supabase';
export * from './database.d';

// Form and UI Types
export * from './form';

// Notification types - Explicit exports to avoid conflicts
export type {
  AppNotification,
  DashboardNotification,
  Notification,
  NotificationData,
  NotificationFilters,
  NotificationStats,
  NotificationType,
  NotificationPriority,
  NotificationsCardProps,
  NotificationSettings as UINotificationSettings, // Aliased to avoid conflict
  adaptDashboardNotificationToApp
} from './notification';

// Report ilə bağlı tiplər artıq core/report-dan export olunur
export * from './core/report';

// Utility Types
export * from './permissions';
export * from './api';
export * from './excel';
export * from './file';
export * from './link';

// Backward Compatibility Aliases
export type { UserRole as Role } from './auth';
export type { FullUserData as UserData } from './auth';

// Convenience re-exports for NotificationSettings
export type { 
  NotificationSettings as DefaultNotificationSettings // Default to auth version
} from './auth';

// ============================================================================
// Deprecated Exports (Keçid dövründə uyğunluq üçün)
// Bu exports-lar yeni fayllardan yönləndirilir və tədricən silinəcək
// ============================================================================

// DEPRECATED: Use './auth' instead
export type { UserRole as UserRoleOld } from './auth';
