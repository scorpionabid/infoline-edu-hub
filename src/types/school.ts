
export interface School {
  id: string;
  name: string;
  address?: string;
  region_id?: string;
  regionId?: string;
  sector_id?: string;
  sectorId?: string;
  phone?: string;
  email?: string;
  type?: string;
  language?: string;
  logo?: string;
  principal_name?: string;
  status?: 'active' | 'inactive' | 'blocked';
  student_count?: number;
  teacher_count?: number;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
  adminId?: string;
  admin_id?: string;
  adminEmail?: string;
  admin_email?: string;
  regionName?: string;
  sectorName?: string;
}

export interface SchoolFormData {
  name: string;
  regionId: string;
  sectorId: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
}

export interface SchoolAdmin {
  id: string;
  email: string;
  name?: string;
  status?: 'active' | 'inactive' | 'blocked';
  phone?: string;
  lastLogin?: string | null;
  avatar?: string | null;
}

export interface SchoolCreateParams {
  name: string;
  regionId: string;
  sectorId: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
}

export interface SchoolUpdateParams {
  id: string;
  name?: string;
  regionId?: string;
  sectorId?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: 'active' | 'inactive' | 'blocked';
}

// Supabase School tipini App School tipinə adaptasiya edən funksiya
export const adaptSchoolFromSupabase = (school: any): School => {
  return {
    id: school.id,
    name: school.name,
    regionId: school.region_id,
    region_id: school.region_id,
    sectorId: school.sector_id,
    sector_id: school.sector_id,
    address: school.address || '',
    phone: school.phone || '',
    email: school.email || '',
    type: school.type || '',
    language: school.language || '',
    logo: school.logo || '',
    principal_name: school.principal_name || '',
    status: school.status || 'active',
    student_count: school.student_count || 0,
    teacher_count: school.teacher_count || 0,
    completion_rate: school.completion_rate || 0,
    created_at: school.created_at,
    updated_at: school.updated_at,
    adminId: school.admin_id,
    admin_id: school.admin_id,
    adminEmail: school.admin_email,
    admin_email: school.admin_email,
    regionName: school.regionName,
    sectorName: school.sectorName
  };
};

// App School tipini Supabase School tipinə adaptasiya edən funksiya
export const adaptSchoolToSupabase = (school: School): any => {
  return {
    id: school.id,
    name: school.name,
    region_id: school.regionId || school.region_id,
    sector_id: school.sectorId || school.sector_id,
    address: school.address,
    phone: school.phone,
    email: school.email,
    type: school.type,
    language: school.language,
    logo: school.logo,
    principal_name: school.principal_name,
    status: school.status || 'active',
    student_count: school.student_count,
    teacher_count: school.teacher_count,
    completion_rate: school.completion_rate,
    created_at: school.created_at,
    updated_at: school.updated_at,
    admin_id: school.adminId || school.admin_id,
    admin_email: school.adminEmail || school.admin_email
  };
};
