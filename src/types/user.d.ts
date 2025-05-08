
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
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
}

export interface UserFormData {
  fullName: string;
  full_name?: string;
  name?: string;
  email: string;
  password?: string;
  role: UserRole;
  regionId?: string;
  region_id?: string;
  sectorId?: string;
  sector_id?: string;
  schoolId?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  status?: string;
  language?: string;
  notificationSettings?: NotificationSettings;
}

export interface UserFilter {
  role?: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: UserStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
