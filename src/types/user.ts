
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  name?: string; // Compatibility with existing code
  created_at?: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  avatar?: string; // Compatibility with existing code
  phone?: string;
  status?: 'active' | 'inactive' | 'blocked';
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  language?: string;
  twoFactorEnabled?: boolean;
  passwordResetDate?: string;
  updatedAt?: string;
  notificationSettings?: {
    email?: boolean;
    system?: boolean;
  };
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'blocked';
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  language?: string;
  avatar?: string;
  passwordResetDate?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email?: boolean;
    system?: boolean;
  };
}

export interface FullUserData {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  avatar_url?: string;
  phone?: string;
  status: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  two_factor_enabled?: boolean;
  password_reset_date?: string;
  notification_settings?: {
    email?: boolean;
    system?: boolean;
  };
}

// Helper functions to convert between User and FullUserData types
export function userToFullUserData(user: User): FullUserData {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.name || user.full_name || '',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updatedAt,
    last_sign_in_at: user.last_sign_in_at,
    avatar_url: user.avatar || user.avatar_url,
    phone: user.phone,
    status: user.status || 'active',
    region_id: user.regionId,
    sector_id: user.sectorId,
    school_id: user.schoolId,
    language: user.language,
    two_factor_enabled: user.twoFactorEnabled,
    password_reset_date: user.passwordResetDate,
    notification_settings: user.notificationSettings
  };
}

export function fullUserDataToUser(data: FullUserData): User {
  return {
    id: data.id,
    email: data.email,
    role: data.role,
    name: data.full_name,
    full_name: data.full_name,
    created_at: data.created_at,
    last_sign_in_at: data.last_sign_in_at,
    avatar: data.avatar_url,
    avatar_url: data.avatar_url,
    phone: data.phone,
    status: data.status as 'active' | 'inactive' | 'blocked',
    regionId: data.region_id,
    sectorId: data.sector_id,
    schoolId: data.school_id,
    language: data.language,
    twoFactorEnabled: data.two_factor_enabled,
    passwordResetDate: data.password_reset_date,
    updatedAt: data.updated_at,
    notificationSettings: data.notification_settings
  };
}
