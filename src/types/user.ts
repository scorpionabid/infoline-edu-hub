
// İlk yaradan Region tipi
export interface RegionFormData {
  name: string;
  description?: string;
}

export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  role?: string;
  fullName?: string;
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
  phone?: string;
  position?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  language: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    inApp: boolean;
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
}
