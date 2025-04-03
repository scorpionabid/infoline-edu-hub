
import { UserRole } from './supabase';

export interface User {
  id: string;
  email: string;
  full_name: string; 
  name?: string;  // full_name ilə yanaşı name də təmin edirik geriyə uyğunluq üçün
  position?: string;
  status: "active" | "inactive" | "blocked";
  role: UserRole;
  region_id?: string;
  regionId?: string; // region_id ilə yanaşı regionId də təmin edirik geriyə uyğunluq üçün
  sector_id?: string;
  sectorId?: string; // sector_id ilə yanaşı sectorId də təmin edirik geriyə uyğunluq üçün
  school_id?: string;
  schoolId?: string; // school_id ilə yanaşı schoolId də təmin edirik geriyə uyğunluq üçün
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    push?: boolean;
    system?: boolean;
  };
  avatar?: string;
  lastLoginAt?: string;
  passwordResetDate?: string;
  twoFactorEnabled?: boolean;
  lastLogin?: string;
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

// UserFormData interfeysi
export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  regionId?: string;
  region_id?: string;
  sectorId?: string;
  sector_id?: string;
  schoolId?: string;
  school_id?: string;
  status: "active" | "inactive" | "blocked";
  avatar?: string;
  language?: string;
  phone?: string;
  position?: string;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
    push?: boolean;
    system?: boolean;
  };
}
