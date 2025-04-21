
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  name?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: string;
  last_login?: string;
  lastLogin?: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
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
  region_name?: string;
  sector_name?: string;
  school_name?: string;
}
