
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    daily?: boolean;
    weekly?: boolean;
    immediate?: boolean;
  };
  app: {
    enabled: boolean;
    approvals?: boolean;
    deadlines?: boolean;
    system?: boolean;
  };
}

export interface UserFormData {
  id?: string;
  email: string;
  full_name: string;
  phone?: string;
  position?: string;
  language?: string;
  status?: string;
  role?: UserRole;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
}
