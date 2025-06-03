
export interface School {
  id?: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  completion_rate?: number;
  completionRate?: number;
  region_id: string;
  regionId?: string;
  sector_id: string;
  sectorId?: string;
  admin_id?: string;
  adminId?: string;
  admin_email?: string;
  adminEmail?: string;
  principal_name?: string;
  principalName?: string;
  student_count?: number;
  studentCount?: number;
  teacher_count?: number;
  teacherCount?: number;
  type?: string;
  language?: string;
  logo?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  adminId?: string;
  admin_email?: string;
  adminEmail?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  regionId?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  adminId?: string;
  admin_email?: string;
  adminEmail?: string;
  completion_rate?: number;
  completionRate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UploadFileData {
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface SchoolFormData {
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  principal_name?: string;
  principalName?: string;
  student_count?: number;
  studentCount?: number;
  teacher_count?: number;
  teacherCount?: number;
  type?: string;
  language?: string;
  region_id: string;
  regionId?: string;
  sector_id: string;
  sectorId?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  totalForms: number;
  completedForms: number;
  pendingForms: number;
  status: 'active' | 'inactive';
  lastUpdated: string;
}

// Adapter function for converting between different school stat formats
export const adaptToSchoolStat = (school: any): SchoolStat => {
  return {
    id: school.id || '',
    name: school.name || '',
    completionRate: school.completion_rate || school.completionRate || 0,
    totalForms: school.total_forms || school.totalForms || 0,
    completedForms: school.completed_forms || school.completedForms || 0,
    pendingForms: school.pending_forms || school.pendingForms || 0,
    status: school.status === 'active' ? 'active' : 'inactive',
    lastUpdated: school.updated_at || school.updatedAt || new Date().toISOString()
  };
};

// Adapter functions to convert between supabase and local types
export const adaptSchoolFromSupabase = (school: any): School => {
  return {
    ...school,
    status: (school.status === 'active' || school.status === 'inactive') ? school.status : 'active'
  } as School;
};

export const adaptRegionFromSupabase = (region: any): Region => {
  return {
    ...region,
    status: (region.status === 'active' || region.status === 'inactive') ? region.status : 'active'
  } as Region;
};

export const adaptSectorFromSupabase = (sector: any): Sector => {
  return {
    ...sector,
    status: (sector.status === 'active' || sector.status === 'inactive') ? sector.status : 'active'
  } as Sector;
};
