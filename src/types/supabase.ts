// Supabase üçün tip tərifləri

// Profil interfeysi
export interface Profile {
  id: string;
  full_name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  status: 'active' | 'inactive' | 'blocked';
}

// İstifadəçi rolu
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// İstifadəçi rolu cədvəli interfeysi
export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at: string;
  updated_at: string;
}

// Bildiriş interfeysi
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  related_entity_id?: string;
  related_entity_type?: string;
  is_read: boolean;
  priority: string;
  created_at: string;
}

// Audit log interfeysi
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_value?: Record<string, any>;
  new_value?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Admin entity interfeysi
export interface AdminEntity {
  type: 'region' | 'sector' | 'school';
  name: string;
  status?: string;
  regionName?: string;
  sectorName?: string;
  schoolType?: string;
}

// Auth ilə bağlı tiplər
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  aud: string;
  role: string;
  app_metadata: {
    provider?: string;
  };
  user_metadata: Record<string, any>;
}

// İstifadəçi yaratmaq üçün data formatı
export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
}

// İstifadəçi məlumatlarını yeniləmək üçün data formatı
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  password?: string;
}

// İstifadəçi tam məlumatları (profil + rol)
export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  last_login?: string;
  created_at: string;
  updated_at: string;
  
  // App tərəfindən istifadə edilən alternatif adlar
  name: string; // full_name ilə eyni
  regionId?: string; // region_id ilə eyni
  sectorId?: string; // sector_id ilə eyni 
  schoolId?: string; // school_id ilə eyni
  lastLogin?: string; // last_login ilə eyni
  createdAt: string; // created_at ilə eyni
  updatedAt: string; // updated_at ilə eyni
  
  // Admin entity məlumatları
  adminEntity?: {
    type: string;
    name: string;
    status?: string;
    regionName?: string;
    sectorName?: string;
    schoolType?: string;
  };
  
  // Əlavə tətbiq xüsusiyyətləri
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

// Database tipi üçün dummy təyin eləyirik
export interface Database {
  public: {
    Tables: {
      columns: {
        Row: any;
        Insert: any;
        Update: any;
      };
      categories: {
        Row: any;
        Insert: any;
        Update: any;
      };
      schools: {
        Row: any;
        Insert: any;
        Update: any;
      };
      regions: {
        Row: any;
        Insert: any;
        Update: any;
      };
      sectors: {
        Row: any;
        Insert: any;
        Update: any;
      };
      data_entries: {
        Row: any;
        Insert: any;
        Update: any;
      };
      user_roles: {
        Row: any;
        Insert: any;
        Update: any;
      };
      profiles: {
        Row: any;
        Insert: any;
        Update: any;
      };
    };
    Functions: {
      [key: string]: any;
    };
  };
};

// Məktəb interfeysi
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  admin_email?: string;
  admin_id?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  logo?: string;
  region_id: string;
  sector_id: string;
  completion_rate?: number;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Region interfeysi
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_email?: string;
  admin_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Sektor interfeysi
export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  admin_email?: string;
  admin_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Data entry interfeysi
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}
