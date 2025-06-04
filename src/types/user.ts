
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface NotificationSettings {
  email: boolean;
  system: boolean;
  inApp?: boolean;
  sms?: boolean;
  push?: boolean;
  deadlineReminders?: boolean;
  statusUpdates?: boolean;
  weeklyReports?: boolean;
}

export interface UserFilter {
  role: string;
  search: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  avatar_url?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  last_login?: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface FullUserData extends User {
  // Database fields
  full_name: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  last_login?: string;
  language?: string;
  avatar?: string;
  
  // Alias fields for compatibility
  name?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Additional fields
  adminEntity?: any;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
  twoFactorEnabled?: boolean;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface UserFormData {
  fullName?: string;
  email?: string;
  role?: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: UserStatus;
  phone?: string;
  position?: string;
  language?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface CreateUserData extends Omit<UserFormData, 'status'> {
  password?: string;
}

export interface UpdateUserData extends Partial<FullUserData> {
  password?: string;
}
