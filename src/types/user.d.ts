
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  language?: string;
  position?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  last_login?: string;
  lastLogin?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  notificationSettings?: NotificationSettings;
  name?: string;
  avatar?: string;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
}

export interface UserFormData {
  email: string;
  password?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  role: UserRole | string;
  region_id?: string | null;
  regionId?: string | null;
  sector_id?: string | null;
  sectorId?: string | null;
  school_id?: string | null;
  schoolId?: string | null;
  phone?: string | null;
  position?: string | null;
  language?: string;
  avatar?: string | null;
  status?: string;
  notificationSettings?: NotificationSettings;
}
