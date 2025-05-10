
// Types for Supabase specific functionality

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface UserNotificationSettings {
  email: boolean;
  push?: boolean;
  app?: boolean;
  system?: boolean;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status: UserStatus;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  notification_settings?: UserNotificationSettings;
  
  // Aliases used in some parts of the application
  name?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  adminEntity?: {
    type?: string;
    name?: string;
    schoolName?: string;
    sectorName?: string;
    regionName?: string;
  };
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}
