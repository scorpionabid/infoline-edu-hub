
// src/types/user.d.ts
export interface UserFormData {
  id?: string;
  email: string;
  password?: string;
  full_name: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  avatar?: string;
  phone?: string;
  position?: string;
  name?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export interface FullUserData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  regionId?: string;  // Əlavə edilən alternatif ad
  sectorId?: string;  // Əlavə edilən alternatif ad
  schoolId?: string;  // Əlavə edilən alternatif ad
  adminEntity?: {
    schoolName?: string;
    sectorName?: string;
    regionName?: string;
  };
  // ProfileSettings komponentində istifadə olunan xüsusiyyətlər
  name?: string;
  phone?: string;
  position?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}
