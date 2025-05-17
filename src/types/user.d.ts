
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | string;

export type UserRoleType = 
  | 'superadmin'
  | 'regionadmin' 
  | 'sectoradmin' 
  | 'schooladmin' 
  | 'user';

export type UserRole = UserRoleType | string;

export interface User {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role?: UserRole | string;
  status?: 'active' | 'inactive' | 'pending' | string;
  name?: string;
  entityName?: string;
  // Adding support for notification settings
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  inApp: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
  statusUpdates?: boolean;
  weeklyReports?: boolean;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole | string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: UserStatus | string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  name?: string;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  } | string;
  // Support both camelCase and snake_case for backward compatibility
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
  preferences?: any;
  avatar?: string;
}

export interface UserFormData {
  id?: string;
  email: string;
  full_name?: string;
  password?: string;
  confirmPassword?: string;
  role?: UserRole | string;
  status?: string;
  school_id?: string;
  region_id?: string;
  sector_id?: string;
  language?: string;
  avatar_url?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
}
