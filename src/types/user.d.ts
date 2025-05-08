
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
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
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface UserFilter {
  role?: UserRole[];
  status?: string[];
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  search?: string;
}

export interface UserFormData {
  id?: string;
  email: string;
  password?: string;
  full_name: string;
  role: string;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  phone?: string | null;
  position?: string | null;
  language?: string;
  avatar?: string | null;
  status?: string;
  notification_settings?: any;
  // Additional compatibility properties
  fullName?: string;
  name?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  notificationSettings?: any;
}
