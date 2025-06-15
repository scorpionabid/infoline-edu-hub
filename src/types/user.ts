
import { UserRole } from '@/types/auth';

export { UserRole } from '@/types/auth';

export interface UserFormData {
  full_name: string;
  email: string;
  password?: string;
  phone?: string;
  position?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  status?: 'active' | 'inactive';
  notificationSettings?: NotificationSettings;
}

export interface UserFilter {
  role?: UserRole[];
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  status?: ('active' | 'inactive')[];
  search?: string;
}

export interface UserData {
  id: string;
  email: string;
  full_name: string;
  name?: string;
  phone?: string;
  position?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  language?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  entity_name?: string;
}

// Add missing type aliases for backward compatibility
export type User = UserData;
export type FullUserData = UserData;

export interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  by_role: Record<UserRole, number>;
}
