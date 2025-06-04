
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'blocked';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FullUserData extends User {
  // Database fields
  full_name: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  last_login?: string;
  language?: string;
  avatar?: string;
  
  // Alias fields for compatibility
  name?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Additional fields
  adminEntity?: any;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

export interface UserFormData {
  fullName: string;
  email: string;
  role: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: UserStatus;
  phone?: string;
  position?: string;
  language?: string;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

export interface CreateUserData extends Omit<UserFormData, 'status'> {
  password?: string;
}

export interface UpdateUserData extends Partial<FullUserData> {
  password?: string;
}
