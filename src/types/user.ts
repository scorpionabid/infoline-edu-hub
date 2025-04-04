
import { Role } from '@/context/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language?: string;
  lastLogin?: string;  // Date -> string
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  createdAt?: string;  // Date -> string
  updatedAt?: string;  // Date -> string
  status?: 'active' | 'inactive' | 'blocked';
  passwordResetDate?: string; // Əlavə edildi
}

export interface UserFormData {
  id?: string;
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: Role;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  phone?: string;
  position?: string;
  language?: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'blocked'; // Əlavə edildi
  twoFactorEnabled?: boolean; // Əlavə edildi
  passwordResetDate?: string; // Əlavə edildi
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}

export interface UserFilter {
  role?: Role;
  status?: string;
  region?: string;
  sector?: string;
  school?: string;
  search?: string;
}
