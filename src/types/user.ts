
import { Role } from '@/context/AuthContext';
import { FullUserData, UserRole } from '@/types/supabase';

// Supabase-dəki FullUserData tipinin əsas xüsusiyyətlərini daşıyan daha sadə User tipi
export interface User {
  id: string;
  name: string;
  full_name: string; // Artıq optional deyil, məcburidir
  email: string;
  role: Role;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  language: string; // Artıq optional deyil, məcburidir
  lastLogin?: string;  // Date -> string
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
  createdAt?: string;  // Date -> string
  updatedAt?: string;  // Date -> string
  status: 'active' | 'inactive' | 'blocked'; // Artıq optional deyil, məcburidir
  passwordResetDate?: string; // Əlavə edildi
  
  // FullUserData interface ilə uyğunluq üçün əlavə sahələr
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  created_at: string; // Artıq optional deyil, məcburidir
  updated_at: string; // Artıq optional deyil, məcburidir
  last_login?: string;
  adminEntity?: {
    type: string;
    name: string;
    status?: string;
    regionName?: string;
    sectorName?: string;
    schoolType?: string;
  };
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

// User və FullUserData arasında çevrilməni təmin etmək üçün köməkçi funksiyalar
export const userToFullUserData = (user: User): FullUserData => {
  // Role tipini string-ə çeviririk (UserRole tipi üçün)
  const roleValue = user.role;
  
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name || user.name || '',
    role: roleValue as UserRole,
    region_id: user.regionId || user.region_id,
    sector_id: user.sectorId || user.sector_id,
    school_id: user.schoolId || user.school_id,
    phone: user.phone,
    position: user.position,
    language: user.language || 'az',
    avatar: user.avatar,
    status: user.status || 'active',
    last_login: user.lastLogin || user.last_login,
    created_at: user.createdAt || user.created_at || new Date().toISOString(),
    updated_at: user.updatedAt || user.updated_at || new Date().toISOString(),
    
    // Alias sahələr
    name: user.name || user.full_name || '',
    regionId: user.regionId || user.region_id,
    sectorId: user.sectorId || user.sector_id,
    schoolId: user.schoolId || user.school_id,
    lastLogin: user.lastLogin || user.last_login,
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
    updatedAt: user.updatedAt || user.updated_at || new Date().toISOString(),
    
    // Admin entity
    adminEntity: user.adminEntity || {
      type: '',
      name: '',
    },
    
    // Əlavə sahələr
    twoFactorEnabled: user.twoFactorEnabled || false,
    notificationSettings: user.notificationSettings || {
      email: true,
      system: true
    }
  } as FullUserData;
};

export const fullUserDataToUser = (data: FullUserData): User => {
  // Role tipini string kimi qəbul edirik
  const roleValue = data.role as Role;
  
  return {
    id: data.id,
    name: data.full_name,
    full_name: data.full_name,
    email: data.email,
    role: roleValue,
    regionId: data.region_id,
    sectorId: data.sector_id,
    schoolId: data.school_id,
    phone: data.phone,
    position: data.position,
    language: data.language || 'az', // Default dəyər veririk
    avatar: data.avatar,
    status: data.status,
    lastLogin: data.last_login,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    
    // FullUserData interface ilə uyğunluq üçün əlavə sahələr
    region_id: data.region_id,
    sector_id: data.sector_id,
    school_id: data.school_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    last_login: data.last_login,
    adminEntity: data.adminEntity,
    
    twoFactorEnabled: data.twoFactorEnabled,
    notificationSettings: data.notificationSettings
  };
};
