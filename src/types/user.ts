import { UserRole } from './role';

// UserStatus enum təyini
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  role: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status: UserStatus;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface FullUserData extends User {
  // Additional properties specific to the application
  notificationSettings?: NotificationSettings;
  entityTypes?: string[];
  entityName?: any;
  adminEntity?: any;
  // İstifadəçi seçimləri
  preferences?: Record<string, any>;
  metadata?: Record<string, any>; // Əlavə metaverilənlər üçün
  // Aliases for compatibility
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
  name?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  notification_settings?: NotificationSettings;
  lastSignIn?: string;
  last_sign_in_at?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  deadlineReminders: boolean;
  statusUpdates: boolean;
  weeklyReports: boolean;
  system: boolean;
  deadline: boolean;
}

export interface UserFormData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  position?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: string;
  language?: string;
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
}

// Helper function to normalize FullUserData between different sources
export function normalizeUserData(userData: any): FullUserData {
  const defaultNotificationSettings: NotificationSettings = {
    email: true,
    push: false,
    sms: false,
    inApp: true,
    deadlineReminders: true,
    statusUpdates: true,
    weeklyReports: false,
    system: true,
    deadline: true
  };

  return {
    ...userData,
    // Ensure status is compatible with UserStatus type
    status: userData.status || 'active',
    // Normalize role if needed
    role: userData.role || 'user',
    // Ensure all required fields are present
    id: userData.id || '',
    // Add aliases
    regionId: userData.region_id || userData.regionId,
    sectorId: userData.sector_id || userData.sectorId, 
    schoolId: userData.school_id || userData.schoolId,
    name: userData.full_name || userData.name,
    lastLogin: userData.last_login || userData.lastLogin,
    createdAt: userData.created_at || userData.createdAt,
    updatedAt: userData.updated_at || userData.updatedAt,
    avatar_url: userData.avatar_url || userData.avatar,
    avatar: userData.avatar_url || userData.avatar,
    notificationSettings: userData.notification_settings || userData.notificationSettings || defaultNotificationSettings,
    notification_settings: userData.notification_settings || userData.notificationSettings || defaultNotificationSettings,
    lastSignIn: userData.last_sign_in_at || userData.lastSignIn,
    last_sign_in_at: userData.last_sign_in_at || userData.lastSignIn
  };
}

// User filtrasiyası üçün interfeys
export interface UserFilter {
  role?: string | string[];
  status?: string | string[];
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Re-export UserRole here for backwards compatibility
export type { UserRole };
