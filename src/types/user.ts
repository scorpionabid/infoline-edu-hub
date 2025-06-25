
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language: string;
  is_active: boolean;
  notifications: NotificationSettings;
}
