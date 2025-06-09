
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | 'teacher' | string;

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | string;

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  system: boolean;
  deadline: boolean;
  deadlineReminders: boolean;
  statusUpdates: boolean;
  weeklyReports: boolean;
}

export interface User {
  id: string;
  fullName: string;
  full_name?: string;
  name?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
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
  avatar_url?: string;
  school_name?: string;
  region_name?: string;
  sector_name?: string;
  last_login?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface FullUserData extends User {
  entityName?: string | {
    region?: string;
    sector?: string;
    school?: string;
  };
  preferences?: any;
  last_sign_in_at?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFormData {
  id?: string;
  fullName: string;
  full_name?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  status?: UserStatus;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar_url?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface UserFilter {
  role?: string | string[];
  search?: string;
  status?: UserStatus | UserStatus[];
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  page?: number;
  limit?: number;
}

export type { UserRole as Role };
export type { FullUserData as UserData };
