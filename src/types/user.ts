
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface UserFilter {
  region?: string;
  sector?: string;
  role?: string;
  status?: string;
  search?: string;
  school?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface UserFormData {
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status: 'active' | 'inactive';
  language?: string;
  notifications?: NotificationSettings;
}

export interface FullUserData extends User {
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  notifications?: NotificationSettings;
  last_login?: string;
  entityName?: string;
}

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
