
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
}

export interface UserFormData {
  email: string;
  full_name: string;
  password: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
