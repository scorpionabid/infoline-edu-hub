

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline?: boolean;
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

