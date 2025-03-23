
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
  lastLogin?: Date;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
  status?: 'active' | 'inactive' | 'blocked';
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
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}
