
import { UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name: string;  // fullName əvəzinə full_name istifadə etmək
  position?: string;
  status: "active" | "inactive" | "blocked";
  role: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    push?: boolean;
    system?: boolean; // system bildirişlərini əlavə edirik
  };
  avatar?: string;
  lastLoginAt?: string;
  passwordResetDate?: string;
  twoFactorEnabled?: boolean;
  lastLogin?: string; // Compatibility with different variable names
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  language?: string;
}

export interface UserDetails extends User {
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
}
