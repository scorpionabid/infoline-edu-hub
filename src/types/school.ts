
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Region extends BaseEntity {
  name: string;
  status: 'active' | 'inactive';
  description?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface Sector extends BaseEntity {
  name: string;
  region_id: string;
  status: 'active' | 'inactive';
  description?: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
}

export interface School extends BaseEntity {
  name: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  type?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  admin_id?: string;
  admin_email?: string;
  student_count?: number;
  teacher_count?: number;
  language?: string;
  logo?: string;
  completion_rate?: number;
}

export interface SchoolWithDetails extends School {
  region_name?: string;
  sector_name?: string;
  admin_name?: string;
}

export interface RegionWithCounts extends Region {
  sectors_count?: number;
  schools_count?: number;
}

export interface SectorWithCounts extends Sector {
  schools_count?: number;
  region_name?: string;
}
