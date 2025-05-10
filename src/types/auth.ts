export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'teacher' | 'student' | 'parent';
export type UserStatus = 'active' | 'inactive' | 'pending';

export interface FullUserData {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar?: string;
  };
  full_name?: string;
  phone?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: UserStatus;
  position?: string;
  language?: string;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  notificationSettings?: {
    email: boolean;
    inApp: boolean;
    push: boolean;
    system: boolean;
    deadline: boolean;
  };
}

export interface UserWithPermissions extends FullUserData {
  permissions: string[];
}

export interface AuthContextType {
  user: FullUserData | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateUserData: (data: Partial<FullUserData>) => Promise<void>;
  refreshUser: () => Promise<void>;
}
