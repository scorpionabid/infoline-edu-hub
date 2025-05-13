
export interface User {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
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
  status?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  name?: string;
  entityName?: string;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
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
