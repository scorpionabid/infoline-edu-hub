
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
  avatar?: string; // For backwards compatibility
  role?: UserRole | string;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  // Aliases
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  // Status
  status?: UserStatus | string;
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
  role?: UserRole | string;
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

export interface AuthContextType {
  user: FullUserData | null;
  session: any | null;
  isAuthenticated: boolean;
  authenticated: boolean; // Alias for isAuthenticated
  loading: boolean;
  error: string | null;
  logIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  login: (email: string, password: string) => Promise<boolean>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for logOut
  signOut: () => Promise<void>; // Alias for logOut
  updateUser: (data: Partial<FullUserData>) => void;
  updateUserData: (data: Partial<FullUserData>) => Promise<{data: any; error: any}>;
  clearError: () => void;
  refreshProfile: () => Promise<FullUserData | null>;
  refreshSession: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: any }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  updateUserProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: any }>;
  resetPassword: (email: string) => Promise<any>;
  register: (userData: any) => Promise<any>;
  setError: (error: string | null) => void;
  createUser: (userData: any) => Promise<{ data: any; error: any }>;
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: any }>;
  getSession?: () => Promise<any>;
  setSession?: (session: any | null) => void;
  fetchUserData?: () => Promise<FullUserData | null>;
  clearErrors?: () => void;
  setUser?: (userData: FullUserData | null) => void;
  setLoading?: (loading: boolean) => void;
  sendPasswordResetEmail?: (email: string) => Promise<any>;
}
