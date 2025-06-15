
// User related types and interfaces

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface NotificationSettings {
  email_notifications?: boolean;
  sms_notifications?: boolean;
  push_notifications?: boolean;
  email?: boolean;
  system?: boolean;
}

export interface UserFormData {
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  status?: UserStatus;
  notifications?: NotificationSettings;
}

export interface UserFilter {
  region?: string;
  sector?: string;
  school?: string;
  role?: UserRole | '';
  status?: UserStatus | '';
  search?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface FullUserData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  role: UserRole;
  status: UserStatus;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  avatar?: string;
  entityName?: string;
  notifications?: NotificationSettings;
}

export interface UserWithAssignments extends FullUserData {
  region?: string;
  sector?: string;
  school?: string;
}

// Legacy alias for backward compatibility
export interface User extends FullUserData {}
