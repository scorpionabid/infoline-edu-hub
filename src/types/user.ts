
import { UserRole } from './role';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
}

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
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  notificationSettings?: NotificationSettings;
  name?: string;
  avatar?: string;
}

export interface FullUserData extends User {
  avatar?: string;
  region_id?: string;
  regionId?: string;
  region_name?: string;
  regionName?: string;
  sector_id?: string;
  sectorId?: string;
  sector_name?: string;
  sectorName?: string;
  school_id?: string;
  schoolId?: string;
  school_name?: string;
  schoolName?: string;
  name?: string;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
  notificationSettings?: NotificationSettings;
}

export interface UserFilter {
  role?: UserRole[];
  status?: string[];
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  search?: string;
  page?: number;
  limit?: number;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface UserFormData {
  id?: string;
  email: string;
  password?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  role: string;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  phone?: string | null;
  position?: string | null;
  language?: string;
  avatar?: string | null;
  status?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

// Re-export for backward compatibility
export { UserRole } from './role';
