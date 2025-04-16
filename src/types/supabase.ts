
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  status: 'active' | 'inactive' | 'blocked';
  last_login?: string | null;
  role?: UserRole;
  role_data?: any;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  region_name?: string;
  sector_name?: string;
  school_name?: string;
  created_at?: string;
  updated_at?: string;
  avatar?: string;
  language: string;
  permissions?: string[];
  notificationSettings?: {
    email: boolean;
    system: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

export interface UserProfile {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  position?: string;
  avatar?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  school_count?: number;
  sector_count?: number;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status?: 'active' | 'inactive' | 'archived';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  region_name?: string;
  school_count?: number;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  status?: 'active' | 'inactive' | 'blocked';
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  region_name?: string;
  sector_name?: string;
  completion_rate?: number;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: any;
  new_value?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  is_read?: boolean;
  priority?: 'low' | 'normal' | 'high';
  created_at?: string;
}
