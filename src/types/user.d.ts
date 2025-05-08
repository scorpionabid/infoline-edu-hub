export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'pending';
  created_at?: string | Date;
  last_login?: string | Date;
  avatar?: string;
}

export interface UserListItem extends User {
  region?: string;
  sector?: string;
  school?: string;
}

export interface UserRoles {
  id: string;
  name: string;
  permissions: string[];
}

export interface UserPermission {
  id: string;
  name: string;
  description?: string;
  group?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setSession: (session: any) => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  resetAuth: () => void;
}
