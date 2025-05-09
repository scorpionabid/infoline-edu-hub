
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | 'guest';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  school_id?: string;
  sector_id?: string;
  region_id?: string;
  avatar?: string;
  created_at?: string;
  phone?: string;
  position?: string;
  status?: string;
}

export interface FullUserData extends User {
  permissions?: string[];
  settings?: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: Error | null;
}
