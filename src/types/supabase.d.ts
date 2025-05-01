
export * from './category';
export * from './column';
export * from './dataEntry';
export * from './dashboard';

export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string | null;
  admin_email?: string | null;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string | null;
  admin_email?: string | null;
  status?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  sector_id: string;
  region_id: string;
  admin_id?: string | null;
  admin_email?: string | null;
  principal_name?: string;
  phone?: string;
  email?: string;
  logo?: string;
  type?: string;
  language?: string;
  student_count?: number;
  teacher_count?: number;
  status?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  status: 'active' | 'inactive' | 'blocked';
  avatar?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  user_id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  priority?: string;
  created_at: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: 'draft' | 'published' | 'archived';
  content?: any;
  filters?: any;
  insights?: string[];
  recommendations?: string[];
  created_by?: string;
  shared_with?: any[];
  is_template?: boolean;
  created_at: string;
  updated_at: string;
}
