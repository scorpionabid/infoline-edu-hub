
// Supabase üçün tip tərifləri

// Profil interfeysi
export interface Profile {
  id: string; // auth.users cədvəlindəki id ilə eynidir
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
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

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
}
