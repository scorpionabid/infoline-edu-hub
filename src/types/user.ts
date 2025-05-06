
// İlk yaradan Region tipi
export interface RegionFormData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  fullName?: string;
  full_name?: string; // Uyğunluq üçün əlavə edildi
  name?: string; // Uyğunluq üçün əlavə edildi
  position?: string;
  phoneNumber?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  region?: {
    id: string;
    name: string;
  };
  sector?: {
    id: string;
    name: string;
  };
  school?: {
    id: string;
    name: string;
  };
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

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  fullName?: string; // Uyğunluq üçün
  phone?: string;
  position?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  language: string;
  last_login?: string;
  lastLogin?: string; // Uyğunluq üçün
  created_at: string;
  updated_at: string;
  createdAt?: string; // Uyğunluq üçün
  updatedAt?: string; // Uyğunluq üçün
  role?: UserRole | string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string; // Uyğunluq üçün
  sectorId?: string; // Uyğunluq üçün
  schoolId?: string; // Uyğunluq üçün
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
    browser?: boolean;
    sms?: boolean;
    system?: boolean;
  };
  adminEntity?: {
    id: string;
    name: string;
    type: 'region' | 'sector' | 'school';
    regionName?: string;
    sectorName?: string;
    schoolName?: string;
  };
  name?: string; // Uyğunluq üçün əlavə edildi
}

export interface UserFormData {
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  password?: string;
  name?: string; // Uyğunluq üçün əlavə edildi
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
}
