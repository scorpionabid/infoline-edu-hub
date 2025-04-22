export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

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
  phone?: string;
  position?: string;
  language: string;
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
  notificationSettings: {
    email: boolean;
    system: boolean;
    push?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
  twoFactorEnabled?: boolean;
}
