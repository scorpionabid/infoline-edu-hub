
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user';

export type UserStatus = 'active' | 'inactive' | 'pending' | 'blocked';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  fullName?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  language?: string;
  position?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  last_login?: string;
  lastLogin?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  notificationSettings?: NotificationSettings;
  name?: string; // Bu əlavə olundu çünki DeleteUserDialog-da istifadə olunur
}

export interface NotificationSettings {
  email: boolean;
  inApp: boolean;
  push: boolean;
  system: boolean;
  deadline: boolean;
  sms?: boolean;
  deadlineReminders?: boolean;
}

export interface FullUserData extends User {
  avatar?: string;
  region_id?: string;
  regionId?: string;
  region_name?: string;
  regionName?: string;
  sector_id?: string;
  sectorId?: string;
  sector_name?: string;
  sectorName?: string;
  school_id?: string;
  schoolId?: string;
  school_name?: string;
  schoolName?: string;
  entityName?: {
    region?: string;
    sector?: string;
    school?: string;
  };
}

export interface UserFormData {
  email: string;
  fullName: string;
  full_name?: string; // Bu əlavə olundu AddUserDialog və digər komponentləri dəstəkləmək üçün
  name?: string; // Bu əlavə olundu DeleteUserDialog-u dəstəkləmək üçün
  password?: string;
  role?: UserRole;
  regionId?: string;
  region_id?: string; // Bu əlavə olundu AddUserDialog üçün
  sectorId?: string;
  sector_id?: string; // Bu əlavə olundu AddUserDialog üçün
  schoolId?: string;
  school_id?: string; // Bu əlavə olundu AddUserDialog üçün
  language?: string;
  position?: string;
  phone?: string;
  status?: UserStatus;
  notificationSettings?: NotificationSettings;
}

export interface AuthErrorType {
  message: string;
  code?: string;
  status?: number;
}

export interface AuthContextType {
  user: FullUserData | null;
  session: any | null;
  isAuthenticated: boolean;
  authenticated: boolean;
  loading: boolean;
  error: AuthErrorType;
  login: (email: string, password: string) => Promise<{ user: any; error: AuthErrorType | null }>;
  signup: (email: string, password: string, options?: any) => Promise<{ user: any; error: AuthErrorType | null }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthErrorType | null }>;
  updatePassword: (newPassword: string) => Promise<{ data: any; error: AuthErrorType | null }>;
  updateProfile: (data: Partial<FullUserData>) => Promise<{ data: any; error: AuthErrorType | null }>;
  refreshSession: () => Promise<void>;
  createUser?: (userData: UserFormData) => Promise<{ data: any; error: any }>;
  updateUser?: (updates: Partial<FullUserData>) => Promise<boolean | void>;
  updateUserProfile?: (userData: Partial<FullUserData>) => Promise<void>;
}

