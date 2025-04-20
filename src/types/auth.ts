
import { User } from '@supabase/supabase-js';

export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export interface FullUserData extends User {
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  role?: UserRole;
  status?: 'active' | 'inactive';
  language?: string;
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
}
