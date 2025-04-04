
export type UserRole = 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin' | 'user' | string;
export type UserStatus = 'active' | 'inactive' | 'blocked' | string;

export interface User {
  id: string;
  email: string;
  full_name: string;
  name?: string; // Keçid uyğunluğu
  avatar?: string;
  phone?: string;
  position?: string;
  status: UserStatus;
  language: string;
  role?: UserRole;
  regionId?: string;
  sectorId?: string;
  schoolId?: string;
}

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  language?: string;
  type?: string;
  teacher_count?: number;
  student_count?: number;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Json {
  [key: string]: Json | string | number | boolean | null | Json[];
}

export interface SideBarNavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  items?: SideBarNavItem[];
}
