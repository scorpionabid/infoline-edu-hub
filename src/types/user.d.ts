
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  full_name?: string;
  fullName?: string;
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
  id?: string;
  email: string;
  full_name: string;
  fullName?: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: string;
  role?: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  password?: string;
  name?: string; // Sometimes used interchangeably with full_name
}

export interface FullUserData extends User {
  full_name?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  language?: string;
  status?: string;
  last_login?: string | Date;
  lastLogin?: string | Date;
  created_at?: string | Date;
  createdAt?: string | Date;
  updated_at?: string | Date;
  updatedAt?: string | Date;
  adminEntity?: AdminEntity;
  name?: string;
  notificationSettings?: NotificationSettings;
}

export interface AdminEntity {
  type?: string;
  name?: string;
  status?: string;
  schoolType?: string;
  sectorName?: string;
  regionName?: string;
  schoolName?: string;
}
