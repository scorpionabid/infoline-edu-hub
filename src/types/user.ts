
import { UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  fullName?: string; // Əlavə edildi
  name?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'blocked';
  regionId?: string;
  regionName?: string;
  sectorId?: string;
  sectorName?: string;
  schoolId?: string;
  schoolName?: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  position?: string;
}

export interface UserFormData {
  email: string;
  fullName: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  language: string;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  notifyByEmail?: boolean;
  notifyInApp?: boolean;
  autoAssign?: boolean;
}
