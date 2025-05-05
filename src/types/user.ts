
// İstifadəçi rolları
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

// İstifadəçi statusları
export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  deadlines: boolean;
  approvals: boolean;
  updates: boolean;
}

// İstifadəçi interfeysi
export interface User {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  role?: UserRole;
  avatar?: string;
  status?: UserStatus;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  notificationSettings?: NotificationSettings;
  twoFactorEnabled?: boolean;
  phone?: string;
  position?: string;
  language?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

// Genişləndirilmiş istifadəçi məlumatları
export interface FullUserData extends User {
  // Əlavə xüsusiyyətlər
  createdAt?: string; // created_at alias
  lastLogin?: string; // last_login alias
  entityName?: {
    regionName?: string;
    sectorName?: string;
    schoolName?: string;
  };
  status?: UserStatus;
  notificationSettings?: NotificationSettings;
  twoFactorEnabled?: boolean;
  phone?: string;
  position?: string;
  language?: string;
}

// İstifadəçi formu məlumatları
export interface UserFormData {
  fullName?: string;
  full_name?: string;
  email?: string;
  role?: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  status?: UserStatus;
  phone?: string;
  position?: string;
  language?: string;
  notificationSettings?: NotificationSettings;
}

// İstifadəçi filter parametrləri
export interface UserFilterParams {
  role?: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}
