
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
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  logOut: () => Promise<void>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
  session: any;
}

export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  updateProfile: (data: Partial<User>) => Promise<{ error?: string }>;
  isAuthenticated: boolean;
}

// Auth store interface
export interface AuthState {
  user: FullUserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  session: any;
  // Yeni əlavə olunan rekursiya-əleyhinə bayrağı
  initialized: boolean;
  initializationAttempted: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<FullUserData>) => void;
  clearError: () => void;
  // loginOnly parametri əlavə edildi
  initializeAuth: (loginOnly?: boolean) => Promise<void>;
}
