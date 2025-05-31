
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  name: string;
  role: UserRole;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  school_id?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: UserStatus;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: string[];
}

export interface User {
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
  status?: UserStatus;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: FullUserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
  session: any;
}

export interface UseAuthResult {
  user: FullUserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
}

// Auth store interface
export interface AuthState {
  user: FullUserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | Error | null;
  session: any;
  initialized: boolean;
  initializationAttempted: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => void;
  clearError: () => void;
  initializeAuth: (loginOnly?: boolean) => Promise<void>;
  updateProfile: (updates: Partial<FullUserData>) => Promise<{ success: boolean, error?: any }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean, error?: any }>;
  hasPermission: (permission: string) => boolean;
}
