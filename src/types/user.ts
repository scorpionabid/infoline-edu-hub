
// User types for compatibility
export interface User {
  id: string;
  email: string;
  full_name: string;
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  language?: string;
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

export interface UserWithRole extends User {
  user_roles?: {
    role: string;
    region_id?: string;
    sector_id?: string;
    school_id?: string;
  }[];
}

export interface FullUserData extends User {
  permissions?: string[];
}

export interface UserFilter {
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'instant' | 'daily' | 'weekly';
}
