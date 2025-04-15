
import { UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  avatar?: string;
  status?: string;
  phone?: string;
  language?: string;
  position?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  created_at?: string;
  updated_at?: string;
  passwordResetDate?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// UserFormData interfeysi əlavə edildi
export interface UserFormData {
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  role: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: string;
  language?: string;
  password?: string;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface FullUserData extends User {
  userRoleId: string;
  region_name?: string;
  sector_name?: string;
  school_name?: string;
  language: string; // Ana modeldə optional, burada mütləq
  created_at: string;
  updated_at: string;
}

// Helper functions
export function userToFullUserData(user: User): FullUserData {
  return {
    ...user,
    userRoleId: user.id,
    language: user.language || 'az',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString()
  };
}

export function fullUserDataToUser(fullUserData: FullUserData): User {
  return {
    id: fullUserData.id,
    email: fullUserData.email,
    role: fullUserData.role,
    full_name: fullUserData.full_name,
    avatar: fullUserData.avatar,
    phone: fullUserData.phone,
    status: fullUserData.status,
    language: fullUserData.language,
    position: fullUserData.position,
    regionId: fullUserData.regionId,
    sectorId: fullUserData.sectorId,
    schoolId: fullUserData.schoolId,
    created_at: fullUserData.created_at,
    updated_at: fullUserData.updated_at,
    lastLogin: fullUserData.lastLogin,
    passwordResetDate: fullUserData.passwordResetDate,
    twoFactorEnabled: fullUserData.twoFactorEnabled,
    notificationSettings: fullUserData.notificationSettings
  };
}
