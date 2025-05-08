
export interface User {
  id: string;
  email: string;
  role?: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push?: boolean;
  system?: boolean;
  deadline?: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
}

export interface FullUserData extends User {
  full_name?: string;
  name?: string; // Added for backward compatibility
  fullName?: string; // Added for backward compatibility
  avatar?: string;
  phone?: string;
  position?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  notificationSettings?: NotificationSettings;
}

export interface UserFormData {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  status?: string;
  language?: string;
  notificationSettings?: NotificationSettings;
  full_name?: string; // Added for backward compatibility
  name?: string; // Added for backward compatibility
  region_id?: string; // Added for backward compatibility
  sector_id?: string; // Added for backward compatibility
  school_id?: string; // Added for backward compatibility
}
