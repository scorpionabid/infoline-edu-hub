
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  system: boolean;
  deadline: boolean;
  deadlineReminders: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: {
    defaultView: string;
    compactMode: boolean;
  };
}

export interface EntityName {
  region: string | null;
  sector: string | null;  
  school: string | null;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  entityName?: EntityName;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name: string;
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
  created_at: string;
  updated_at: string;
  notification_settings?: NotificationSettings;
}
