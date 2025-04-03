
// UserRole tipi - təmirlə əlaqədar olaraq string enum kimi təyin edirik, 
// əvvəlki object tipindən fərqli olaraq
export type UserRole = "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin";

// Interfeyslərə əlavə edilən xüsusiyyətlər
export interface CreateUserData {
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: 'active' | 'inactive' | 'blocked';
  language?: string;
  phone?: string;
  position?: string;
  avatar?: string;
}

// UpdateUserData interfeysi - password əlavə edildi
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: 'active' | 'inactive' | 'blocked';
  language?: string;
  phone?: string;
  position?: string;
  avatar?: string;
}

// FullUserData interfeysi
export interface FullUserData {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: UserRole;
  status: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  avatar?: string;
  language?: string;
  phone?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  twoFactorEnabled?: boolean;
  passwordResetDate?: string;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

// Profile interfeysi əlavə edildi
export interface Profile {
  id: string;
  full_name?: string;
  phone?: string;
  position?: string;
  language?: 'az' | 'en' | 'ru' | 'tr';
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  created_at?: string;
  updated_at?: string;
  email?: string;
  last_login?: string;
}

// School interfeysi əlavə edildi
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
  principal_name?: string;
  studentCount?: number;
  teacherCount?: number;
  student_count?: number;
  teacher_count?: number;
  schoolType?: 'elementary' | 'middle' | 'high' | 'vocational' | 'special';
  type?: string;
  teachingLanguage?: 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english';
  language?: string;
  regionId: string;
  sectorId: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  adminEmail?: string;
  admin_email?: string;
  adminCount?: number;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
  logo?: string;
}

// Region interfeysi əlavə edildi
export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  adminEmail?: string;
}

// Sector interfeysi əlavə edildi
export interface Sector {
  id: string;
  name: string;
  region_id: string;
  regionId?: string;
  description?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  admin_email?: string;
  adminEmail?: string;
}

// Json tipi əlavə edildi
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// DataEntry interfeysi əlavə edildi (artıq əsas tiplərdə də var, amma tam olsun deyə)
export interface DataEntry {
  id: string;
  category_id: string;
  column_id: string;
  school_id: string;
  value?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
}
