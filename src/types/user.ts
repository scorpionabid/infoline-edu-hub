
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
  lastLogin?: string; // Compatibility with existing code
  createdAt?: string; // Compatibility with existing code
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
  phone?: string;
  position?: string;
}

export interface FullUserData {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  name: string; // For compatibility
  created_at: string;
  createdAt: string; // For compatibility
  updated_at?: string;
  updatedAt?: string; // For compatibility
  last_sign_in_at?: string;
  lastLogin?: string; // For compatibility
  avatar_url?: string;
  avatar?: string; // For compatibility
  phone?: string;
  status: string;
  region_id?: string;
  regionId?: string; // For compatibility
  sector_id?: string;
  sectorId?: string; // For compatibility
  school_id?: string;
  schoolId?: string; // For compatibility
  language?: string;
  two_factor_enabled?: boolean;
  twoFactorEnabled?: boolean; // For compatibility
  password_reset_date?: string;
  passwordResetDate?: string; // For compatibility
  notification_settings?: {
    email?: boolean;
    system?: boolean;
  };
  notificationSettings?: {
    email?: boolean;
    system?: boolean;
  }; // For compatibility
}

// Helper functions to convert between User and FullUserData types
export function userToFullUserData(user: User): FullUserData {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.name || user.full_name || '',
    name: user.name || user.full_name || '', // For compatibility
    created_at: user.created_at || new Date().toISOString(),
    createdAt: user.created_at || user.createdAt || new Date().toISOString(), // For compatibility
    updated_at: user.updatedAt,
    updatedAt: user.updatedAt, // For compatibility
    last_sign_in_at: user.last_sign_in_at || user.lastLogin,
    lastLogin: user.last_sign_in_at || user.lastLogin, // For compatibility
    avatar_url: user.avatar || user.avatar_url,
    avatar: user.avatar || user.avatar_url, // For compatibility
    phone: user.phone,
    status: user.status || 'active',
    region_id: user.regionId,
    regionId: user.regionId, // For compatibility
    sector_id: user.sectorId,
    sectorId: user.sectorId, // For compatibility
    school_id: user.schoolId,
    schoolId: user.schoolId, // For compatibility
    language: user.language,
    two_factor_enabled: user.twoFactorEnabled,
    twoFactorEnabled: user.twoFactorEnabled, // For compatibility
    password_reset_date: user.passwordResetDate,
    passwordResetDate: user.passwordResetDate, // For compatibility
    notification_settings: user.notificationSettings,
    notificationSettings: user.notificationSettings // For compatibility
  };
}

export function fullUserDataToUser(data: FullUserData): User {
  return {
    id: data.id,
    email: data.email,
    role: data.role,
    name: data.full_name || data.name,
    full_name: data.full_name || data.name,
    created_at: data.created_at,
    createdAt: data.created_at || data.createdAt,
    last_sign_in_at: data.last_sign_in_at || data.lastLogin,
    lastLogin: data.last_sign_in_at || data.lastLogin,
    avatar: data.avatar_url || data.avatar,
    avatar_url: data.avatar_url || data.avatar,
    phone: data.phone,
    status: data.status as 'active' | 'inactive' | 'blocked',
    regionId: data.region_id || data.regionId,
    sectorId: data.sector_id || data.sectorId,
    schoolId: data.school_id || data.schoolId,
    language: data.language,
    twoFactorEnabled: data.two_factor_enabled || data.twoFactorEnabled,
    passwordResetDate: data.password_reset_date || data.passwordResetDate,
    updatedAt: data.updated_at || data.updatedAt,
    notificationSettings: data.notification_settings || data.notificationSettings
  };
}
