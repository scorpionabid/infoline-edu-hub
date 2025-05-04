
import { Database } from './database';

// Supabase verilənlər bazası tipləri
export type Tables = Database['public']['Tables'];

// İstifadəçi rollari
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// İstifadəçi profil tipi
export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

// İstifadəçi rol tipi
export interface UserRoleData {
  id?: string;
  user_id: string;
  role: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  created_at?: string;
}

// Entity məlumatları
export interface AdminEntity {
  type?: string;
  name?: string;
  schoolName?: string;
  sectorName?: string;
  regionName?: string;
}

// İstifadəçi məlumatları
export interface FullUserData {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string | null;
  lastLogin?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  adminEntity?: AdminEntity;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

// Sütun tipi
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image'
  | 'table'
  | 'division';

// Kateqoriya
export interface Category {
  id: string;
  name: string;
  description?: string;
  assignment: 'all' | 'sectors' | 'schools';
  status: 'active' | 'inactive' | 'draft';
  deadline?: string | null;
  priority?: number;
  created_at: string;
  updated_at: string;
}

// Kateqoriya sütun məlumatları ilə
export interface CategoryWithColumns extends Category {
  columns: Column[];
}

// Sütun
export interface Column {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  type: ColumnType;
  is_required: boolean;
  order_index: number;
  options?: string[] | null;
  validation?: any;
  parent_id?: string | null;
  show_condition?: any;
  created_at: string;
  updated_at: string;
  display_name?: string;
  default_value?: any;
  placeholder?: string;
  help_text?: string;
}

// Region
export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
}

// Sektor
export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  region?: Region;
}

// Məktəb
export interface School {
  id: string;
  name: string;
  sector_id: string;
  region_id: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  principal_name?: string;
  school_type?: string;
  student_count?: number;
  teacher_count?: number;
  language?: string;
  status?: string;
  created_at: string;
  updated_at?: string;
  sector?: Sector;
  region?: Region;
}

// Məlumat
export interface Data {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  created_by?: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}

// Bildiriş
export interface Notification {
  id: string;
  type: 'system' | 'deadline' | 'approval' | 'rejection' | 'comment';
  title?: string;
  message: string;
  user_id: string;
  related_entity_id?: string;
  related_entity_type?: string;
  read: boolean;
  created_at: string;
  read_at?: string;
  priority?: 'normal' | 'high' | 'critical';
}
