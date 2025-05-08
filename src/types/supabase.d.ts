
import { Session } from '@supabase/supabase-js';
import { User, UserRole, NotificationSettings } from './user';

export { User, UserRole } from './user';

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

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  regionId?: string;
  region_name?: string;
  regionName?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  completionRate?: number;
}

export interface EnhancedSector extends Sector {
  school_count?: number;
  schoolCount?: number;
  completion_rate: number;
  completionRate?: number;
  region_name?: string;
  regionName?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  principalName?: string; 
  address?: string;
  region_id: string;
  region_name?: string;
  regionName?: string;
  sector_id: string;
  sector_name?: string;
  sectorName?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status: string;
  type?: string;
  language?: string;
  created_at: string;
  updated_at?: string;
  completion_rate?: number;
  completionRate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: 'az' | 'en' | 'ru' | 'tr';
  status?: 'active' | 'inactive' | 'blocked';
  created_at: string;
  updated_at: string;
  last_login?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

export interface SchoolFormProps {
  initialData?: School;
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting?: boolean;
  regions?: Region[];
  sectors?: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}
