
import { UserRole } from './supabase';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  avatar?: string | null;
  language?: string;
  phone?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string | null;
  twoFactorEnabled?: boolean;
  passwordResetDate?: string; // Added for EditUserDialog
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  language?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
};

export type UpdateUserData = Partial<Omit<User, 'id'>> & {
  password?: string;
};

export type UserFormData = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  status?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  language?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  passwordResetDate?: string; // Added for EditUserDialog
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
};

export type UserFilter = {
  role?: UserRole;
  status?: string;
  search?: string;
  regionId?: string;
  sectorId?: string;
};

export type PaginatedUsers = {
  users: User[];
  totalCount: number;
};
