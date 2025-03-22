
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
  status: 'active' | 'inactive' | 'blocked';
  lastLogin?: Date;
  passwordResetDate?: Date;
  twoFactorEnabled?: boolean;
  language?: string;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin'> & {
  password?: string;
};

export type UserFilter = {
  role?: Role;
  status?: 'active' | 'inactive' | 'blocked';
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  search?: string;
};
