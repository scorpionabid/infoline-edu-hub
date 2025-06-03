
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  position?: string;
  school_name?: string;
  region_name?: string;
  sector_name?: string;
}

export interface UserFilter {
  role?: string;
  search?: string;
  status?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface CreateUserData {
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface FullUserData extends User {
  name?: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  system: boolean;
  deadline: boolean;
  deadlineReminders: boolean;
  statusUpdates: boolean;
  weeklyReports: boolean;
}

export interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  notifications?: NotificationSettings;
}
