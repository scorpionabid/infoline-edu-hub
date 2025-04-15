
import { FullUserData as SupabaseFullUserData, UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked';
  last_login?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
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
  };
  twoFactorEnabled?: boolean;
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
  };
  twoFactorEnabled?: boolean;
}

// User tipi adapteri
export const userToFullUserData = (user: User): FullUserData => {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name || user.name || '',
    name: user.name || user.full_name || '',
    role: user.role || 'user',
    region_id: user.region_id || user.regionId,
    sector_id: user.sector_id || user.sectorId,
    school_id: user.school_id || user.schoolId,
    regionId: user.regionId || user.region_id,
    sectorId: user.sectorId || user.sector_id,
    schoolId: user.schoolId || user.school_id,
    phone: user.phone,
    position: user.position,
    language: user.language || 'az',
    avatar: user.avatar,
    status: user.status || 'active',
    last_login: user.last_login || user.lastLogin,
    lastLogin: user.lastLogin || user.last_login,
    created_at: user.created_at || user.createdAt || new Date().toISOString(),
    updated_at: user.updated_at || user.updatedAt || new Date().toISOString(),
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
    userRoleId: user.userRoleId,
    adminEntity: user.adminEntity,
    notificationSettings: user.notificationSettings || {
      email: true,
      system: true,
      push: false,
      sms: false
    },
    twoFactorEnabled: user.twoFactorEnabled || false
  };
};

// SupabaseFullUserData'nı UserData tipinə çevirmək adapter funksiyası
export const fullUserDataToUser = (fullUserData: SupabaseFullUserData): User => {
  return {
    id: fullUserData.id,
    email: fullUserData.email,
    full_name: fullUserData.full_name,
    name: fullUserData.name,
    role: fullUserData.role,
    region_id: fullUserData.region_id,
    sector_id: fullUserData.sector_id,
    school_id: fullUserData.school_id,
    regionId: fullUserData.regionId,
    sectorId: fullUserData.sectorId,
    schoolId: fullUserData.schoolId,
    phone: fullUserData.phone,
    position: fullUserData.position,
    language: fullUserData.language,
    avatar: fullUserData.avatar,
    status: fullUserData.status,
    last_login: fullUserData.last_login,
    lastLogin: fullUserData.lastLogin,
    created_at: fullUserData.created_at,
    updated_at: fullUserData.updated_at,
    createdAt: fullUserData.createdAt,
    updatedAt: fullUserData.updatedAt,
    adminEntity: fullUserData.adminEntity,
    notificationSettings: fullUserData.notificationSettings,
    twoFactorEnabled: fullUserData.twoFactorEnabled
  };
};
