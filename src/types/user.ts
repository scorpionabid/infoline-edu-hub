
// ============================================================================
// İnfoLine User Types - Re-exports from auth.ts
// ============================================================================
// Bu fayl auth.ts-dən core user tipləri re-export edir
// Təkrarçılığı önləmək üçün central type definitions auth.ts-də saxlanılır

// Re-export core types from auth.ts
export type {
  UserRole,
  UserStatus,
  FullUserData,
  NotificationSettings
} from './auth';

// Legacy aliases for backward compatibility
export type { FullUserData as User, FullUserData as UserData } from './auth';

export interface UserCreateData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
}

export interface UpdateUserData {
  full_name?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: UserStatus;
}

export interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  status?: UserStatus;
}

export interface UserDeletionResult {
  success: boolean;
  message?: string;
  error?: string;
  delete_type?: 'soft' | 'hard';
}

export interface SoftDeletedUser {
  id: string;
  email: string;
  full_name: string;
  deleted_at: string;
  deleted_by: string;
  created_at: string;
  role?: UserRole;
  region_name?: string;
  sector_name?: string;
  school_name?: string;
}

export interface UserAuditLog {
  id: string;
  user_id: string;
  action: 'soft_delete' | 'hard_delete' | 'restore';
  entity_type: 'user';
  entity_id: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
  deleter_name?: string;
}

export interface UserFilter {
  search?: string;
  role?: string | string[];
  status?: string | string[];
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  system: boolean;
  deadlineReminders: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
}
