
import { UserRole } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
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
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  passwordResetDate?: string;
  twoFactorEnabled?: boolean;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
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

export interface UserFilter {
  role?: UserRole | '';
  status?: string | '';
  regionId?: string | '';
  sectorId?: string | '';
  schoolId?: string | '';
  search?: string;
}
