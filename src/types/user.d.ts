
export interface User {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  name?: string;
  entityName?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  name?: string;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  } | string;
  notification_settings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp?: boolean;
    system?: boolean;
    deadline?: boolean;
  };
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp?: boolean;
    system?: boolean;
    deadline?: boolean;
  };
}

export interface UserFormData {
  id?: string;
  email: string;
  full_name?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  status?: string;
  school_id?: string;
  region_id?: string;
  sector_id?: string;
  language?: string;
  avatar_url?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
}
