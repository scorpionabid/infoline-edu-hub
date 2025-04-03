
import { UserRole } from './supabase';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;  // Use UserRole from supabase types instead of Role
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
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
};

export type CreateUserData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;  // Use UserRole from supabase types
  status?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  language?: string;
  avatar?: string;  // Adding avatar property to fix error
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
};

export type UpdateUserData = Partial<Omit<User, 'id'>> & {
  password?: string;  // Adding password for update operations
};

export type UserFormData = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;  // Use UserRole from supabase types
  status?: string;
  regionId?: string | null;
  sectorId?: string | null;
  schoolId?: string | null;
  language?: string;
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
