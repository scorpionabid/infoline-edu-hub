
// User types with proper enums
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'teacher' | 'user';

export type UserStatus = 'active' | 'inactive';

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role?: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: UserStatus;
  last_login?: string;
  lastLogin?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  entity_name?: string;
  entityName?: string;
  notification_settings?: NotificationSettings;
}

// Legacy aliases for backward compatibility
export type User = FullUserData;
export type UserData = FullUserData;

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
