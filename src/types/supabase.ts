
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
