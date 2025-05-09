
// Centralized type definitions for Supabase-related data

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'teacher' | 'student' | 'parent';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
}

export interface FullUserData {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar?: string;
  };
  full_name?: string;
  phone?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: UserStatus;
  position?: string;
  language?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
  
  // Normalized entity names
  region_name?: string;
  sector_name?: string;
  school_name?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  logo?: string;
  language?: string;
  status?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
  principalName?: string;
  formsCompleted?: number;
  totalForms?: number;
  pendingForms?: number;
  lastUpdate?: string;
}

export interface EnhancedSector extends Sector {
  region_name?: string;
  school_count?: number;
}

export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted: number;
  totalForms: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}
