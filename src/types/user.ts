
import { UserRole } from './supabase';

// User interfeysini yenidən təyin edirik
export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  name?: string; // full_name üçün alias əlavə edirik
  avatar?: string;
  avatar_url?: string; // Supabase-dən gələn avatar_url dəstəyi
  status?: string;
  phone?: string;
  language?: string;
  position?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  last_sign_in_at?: string; // Supabase-dən gələn last_sign_in_at dəstəyi
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // created_at üçün alias
  updatedAt?: string; // updated_at üçün alias
  passwordResetDate?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    system?: boolean; // System bildirimlerini əlavə edirik
  };
}

// UserFormData interfeysi
export interface UserFormData {
  full_name: string;
  name?: string; // name xüsusiyyətini əlavə edirik
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
  avatar?: string; // Avatar xüsusiyyəti
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    system?: boolean;
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
  // Əlavə tətbiq xüsusiyyətləri üçün alias-lar
  name?: string; // name alias-ını əlavə edirik
  createdAt?: string; // created_at-ın alias-ı
  updatedAt?: string; // updated_at-ın alias-ı
}

// Helper functions
export function userToFullUserData(user: User): FullUserData {
  return {
    ...user,
    userRoleId: user.id,
    language: user.language || 'az',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
    name: user.full_name, // name alias-ını əlavə edirik
    createdAt: user.created_at, // createdAt alias-ını əlavə edirik
    updatedAt: user.updated_at // updatedAt alias-ını əlavə edirik
  };
}

export function fullUserDataToUser(fullUserData: FullUserData): User {
  return {
    id: fullUserData.id,
    email: fullUserData.email,
    role: fullUserData.role,
    full_name: fullUserData.full_name,
    name: fullUserData.full_name, // name alias-ını birbaşa təyin edirik
    avatar: fullUserData.avatar,
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
