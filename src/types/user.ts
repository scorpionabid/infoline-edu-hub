
import { UserRole } from './role';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending' | string;

export interface User {
  id: string;
  full_name?: string;
  email?: string;
  avatar?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: UserStatus;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  position?: string;
  phone?: string;
  language?: string;
  region_name?: string;
  sector_name?: string;
  school_name?: string;
  name?: string;
}

export interface FullUserData extends User {
  // Additional properties specific to the application
  notificationSettings?: any;
  entityTypes?: string[];
  entityName?: any;
  adminEntity?: any;
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
  notification_settings?: any;
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
}

// Helper function to normalize FullUserData between different sources
export function normalizeUserData(userData: any): FullUserData {
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
    notification_settings: userData.notificationSettings || userData.notification_settings
  };
}
