
import { NotificationSettings, UserStatus } from './user';
import { UserRole } from './role';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: FullUserData | null;
  error: string | null;
}

export interface FullUserData {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  role?: UserRole;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  // Aliases
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  // Status
  status?: UserStatus;
  // Time fields
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
  // Aliases
  createdAt?: string;
  updatedAt?: string;
  lastSignIn?: string;
  // Display fields
  name?: string;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  } | string;
  // Additional fields
  phone?: string;
  position?: string;
  language?: string;
  // Settings
  notification_settings?: NotificationSettings;
  notificationSettings?: NotificationSettings;
  preferences?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword?: string;
  full_name?: string;
  error?: string;
  success?: string;
}
