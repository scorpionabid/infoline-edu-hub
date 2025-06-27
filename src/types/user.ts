
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
