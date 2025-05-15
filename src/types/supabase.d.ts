
// Types for Supabase specific functionality
import { UserRole, UserStatus } from './role';

export { UserRole, UserStatus };

export interface UserNotificationSettings {
  email: boolean;
  push?: boolean;
  app?: boolean;
  system?: boolean;
  inApp?: boolean;
  deadline?: boolean;
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status: UserStatus;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  notification_settings?: UserNotificationSettings;
  
  // Aliases used in some parts of the application
  name?: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  adminEntity?: {
    type?: string;
    name?: string;
    schoolName?: string;
    sectorName?: string;
    regionName?: string;
  };
  notificationSettings?: UserNotificationSettings;
  entityTypes?: string[];
  twoFactorEnabled?: boolean;
}

// Continue with other type definitions
export interface EnhancedSector extends Sector {
  region_name?: string;
  school_count?: number;
}

// Basic Sector interface
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
}

// Define Region interface
export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  admin_id?: string;
  admin_email?: string;
}

// Define School interface
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
  region_name?: string;
  sector_name?: string;
}

// Define SchoolStat interface for backward compatibility
export interface SchoolStat {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}
