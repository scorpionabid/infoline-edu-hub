
import { Json } from './json';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export type Language = 'az' | 'en' | 'ru' | 'tr';

export interface NotificationSettings {
  email: boolean;
  system: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface FullUserData {
  id: string;
  full_name?: string | null;
  name?: string | null; // NavigationMenu və ProfileSettings üçün əlavə edildi
  email?: string | null;
  role: UserRole;
  region_id?: string | null;
  regionId?: string | null;
  sector_id?: string | null;
  sectorId?: string | null;
  school_id?: string | null;
  schoolId?: string | null;
  region_name?: string | null;
  sector_name?: string | null;
  school_name?: string | null;
  status: UserStatus;
  last_login?: string | null;
  lastLogin?: string | null;
  phone?: string | null;
  position?: string | null;
  avatar?: string | null;
  language: Language;
  created_at?: string | null;
  updated_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  notificationSettings?: NotificationSettings;
  twoFactorEnabled?: boolean; // PreferencesForm və ProfileSettings üçün əlavə edildi
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
  region_name?: string; // SchoolsContainer üçün əlavə edildi
  sector_name?: string; // SchoolsContainer üçün əlavə edildi
}
