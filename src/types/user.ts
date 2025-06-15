
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
export type UserStatus = 'active' | 'inactive';

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  name?: string; // alias for full_name
  role: UserRole;
  region_id?: string;
  regionId?: string; // alias for region_id
  sector_id?: string;
  sectorId?: string; // alias for sector_id
  school_id?: string;
  schoolId?: string; // alias for school_id
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status: UserStatus;
  last_login?: string;
  lastLogin?: string; // alias for last_login
  created_at: string;
  createdAt?: string; // alias for created_at
  updated_at: string;
  updatedAt?: string; // alias for updated_at
  entity_name?: string;
}

export interface UserFilter {
  role?: UserRole[];
  regionId?: string;
  region_id?: string; // alias for regionId
  sectorId?: string;
  sector_id?: string; // alias for sectorId
  schoolId?: string;
  school_id?: string; // alias for schoolId
  status?: UserStatus[];
  search?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  email?: boolean;
  inApp?: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
  system?: boolean;
}
