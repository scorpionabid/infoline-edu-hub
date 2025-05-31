
// Define UserRole type and export it directly
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | string;

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | string;

export interface User {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role?: UserRole;
  status?: UserStatus | string;
  name?: string;
  entityName?: string;
  created_at?: string;
  updated_at?: string;
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
  deadlineReminders: boolean;
  statusUpdates: boolean;
  weeklyReports: boolean;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: UserStatus;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  last_login?: string;
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
  phone?: string;
  position?: string;
}

export interface UserFormData {
  id?: string;
  email: string;
  full_name?: string;
  password?: string;
  confirmPassword?: string;
  role?: UserRole;
  status?: string;
  school_id?: string;
  region_id?: string;
  sector_id?: string;
  language?: string;
  avatar_url?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
}
