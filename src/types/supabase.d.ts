
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';
export type Language = 'az' | 'en' | 'ru' | 'tr';

export interface Profile {
  id: string;
  email?: string;
  full_name: string;
  phone?: string;
  position?: string;
  avatar?: string;
  language: string;
  status: 'active' | 'inactive' | 'blocked';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

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

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  school_name?: string;
  phone?: string;
  position?: string;
  language: Language;
  avatar?: string;
  status: 'active' | 'inactive' | 'blocked';
  last_login?: string;
  lastLogin?: string;
  created_at: string;
  updated_at: string;
  createdAt: string;
  updatedAt: string;
  userRoleId?: string;
  adminEntity?: {
    type: string;
    name: string;
    status?: string;
    regionName?: string;
    sectorName?: string;
    schoolType?: string;
  };
  notificationSettings?: {
    email: boolean;
    system: boolean;
    push?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
  twoFactorEnabled?: boolean;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  cover_image?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  cover_image?: string;
}

export interface School {
  id: string;
  name: string;
  address?: string;
  region_id: string;
  sector_id: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
  logo?: string;
  coordinates?: { lat: number; lng: number };
}

export interface UpdateUserData {
  full_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  language?: Language;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  role?: UserRole;
  region_id?: string | null;
  sector_id?: string | null;
  school_id?: string | null;
  password?: string;
}
