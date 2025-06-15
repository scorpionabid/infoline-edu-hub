
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
  email_notifications?: boolean; // Made optional with proper name
  sms_notifications?: boolean;   // Made optional with proper name
  push_notifications?: boolean;
  notification_frequency?: 'immediate' | 'daily' | 'weekly';
  // UI-specific notification preferences
  email?: boolean;
  inApp?: boolean;
  push?: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
  statusUpdates?: boolean;
  weeklyReports?: boolean;
  system?: boolean;
  deadline?: boolean;
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
