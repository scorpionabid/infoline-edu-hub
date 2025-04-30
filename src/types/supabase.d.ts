
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export type Language = 'az' | 'en' | 'ru' | 'tr';

export interface Region {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector {
  id: string;
  region_id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  address?: string;
  region_id: string;
  sector_id: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status?: string;
  type?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
  logo?: string;
  admin_email?: string;
  admin_id?: string;
}

export interface FullUserData {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  avatar?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  region_name?: string;
  sector_name?: string;
  school_name?: string;
  status?: 'active' | 'inactive' | 'blocked';
  language?: Language;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRoleAssignment {
  user_id: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}

// Edge funksiyaları üçün parametrlər
export interface AssignUserRoleParams {
  userId: string;
  role: UserRole;
  entityId?: string; // region_id, sector_id, school_id
}

export interface ManageEntityParams {
  action: "create" | "read" | "update" | "delete";
  entityType: "column" | "region" | "sector" | "school" | "category";
  data: any;
}

export interface DashboardDataParams {
  role: UserRole;
  entityId?: string;
}

export interface CacheConfig {
  key: string;
  ttl: number; // saniyələrlə
  dependencies?: string[];
}
