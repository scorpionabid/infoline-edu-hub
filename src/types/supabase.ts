
// UserRole tipi - təmirlə əlaqədar olaraq string enum kimi təyin edirik, 
// əvvəlki object tipindən fərqli olaraq
export type UserRole = "superadmin" | "regionadmin" | "sectoradmin" | "schooladmin";

// CreateUserData interfeysi - avatar əlavə edildi
export interface CreateUserData {
  full_name: string;
  email: string;
  password?: string;
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: 'active' | 'inactive' | 'blocked';
  language?: string;
  phone?: string;
  position?: string;
  avatar?: string;
}

// UpdateUserData interfeysi - password əlavə edildi
export interface UpdateUserData {
  full_name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: 'active' | 'inactive' | 'blocked';
  language?: string;
  phone?: string;
  position?: string;
  avatar?: string;
}

// FullUserData interfeysi
export interface FullUserData {
  id: string;
  email: string;
  name: string;
  full_name: string;
  role: UserRole;
  status: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  avatar?: string;
  language?: string;
  phone?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  twoFactorEnabled?: boolean;
  passwordResetDate?: string;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}
