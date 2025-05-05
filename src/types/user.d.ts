
export interface UserFormData {
  id?: string;
  email: string;
  password?: string;
  full_name: string;
  name?: string; // name və fullName uyumluluğu üçün
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  phone?: string;
  position?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FullUserData extends UserFormData {
  // UserSettings tiplərini əlavə edirik
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    browser: boolean;
    push?: boolean;
    sms?: boolean;
    system?: boolean;
  };
  adminEntity?: {
    id: string;
    name: string;
    type: 'region' | 'sector' | 'school';
  };
  // UserFormData-dan camelCase uyğunluğunu təmin edək
  fullName?: string; // full_name ilə eyni
  regionId?: string; // region_id ilə eyni
  sectorId?: string; // sector_id ilə eyni
  schoolId?: string; // school_id ilə eyni
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
