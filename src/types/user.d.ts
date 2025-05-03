
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
  // Əlavə edilən alternativ adlar
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
  // Profile parametrləri
  name?: string;
  phone?: string;
  position?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  adminEntity?: {
    schoolName?: string;
    sectorName?: string;
    regionName?: string;
  };
  // Report üçün əlavə sahələr
  created_by_name?: string;
  created_by?: string;
  author?: string;
  last_updated?: string;
}
