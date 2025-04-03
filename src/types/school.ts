
export type SchoolStatus = "active" | "inactive" | "archived" | "pending" | string;

export type SchoolType = "full" | "general" | "primary" | string;

export type SchoolLanguage = "az" | "ru" | "en" | string;

export interface School {
  id: string;
  name: string;
  regionId: string;
  region_id?: string; // Supabase uyğunluğu üçün əlavə edildi
  regionName?: string;
  sectorId: string;
  sector_id?: string; // Supabase uyğunluğu üçün əlavə edildi
  sectorName?: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  principal_name?: string; // Supabase uyğunluğu üçün əlavə edildi
  studentCount?: number;
  student_count?: number; // Supabase uyğunluğu üçün əlavə edildi
  teacherCount?: number;
  teacher_count?: number; // Supabase uyğunluğu üçün əlavə edildi
  type?: SchoolType;
  language?: SchoolLanguage;
  status: SchoolStatus;
  admin?: string;
  adminEmail?: string;
  admin_email?: string; // Supabase uyğunluğu üçün əlavə edildi
  createdAt?: string;
  created_at?: string; // Supabase uyğunluğu üçün əlavə edildi
  updatedAt?: string;
  updated_at?: string; // Supabase uyğunluğu üçün əlavə edildi
  logo?: string;
  completionRate?: number;
  completion_rate?: number; // Supabase uyğunluğu üçün əlavə edildi
}

export interface CreateSchoolParams {
  name: string;
  regionId: string;
  sectorId: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  studentCount?: number;
  teacherCount?: number;
  type?: SchoolType;
  language?: SchoolLanguage;
  status?: SchoolStatus;
  adminEmail?: string;
  logo?: string;
  completionRate?: number;
}

export interface SchoolFilter {
  searchTerm: string;
  regionId: string;
  sectorId: string;
  status: string;
}

export const adaptSchoolData = (rawData: any): School => {
  return {
    id: rawData.id || '',
    name: rawData.name || '',
    regionId: rawData.region_id || '',
    region_id: rawData.region_id || '',
    regionName: rawData.region_name || '',
    sectorId: rawData.sector_id || '',
    sector_id: rawData.sector_id || '',
    sectorName: rawData.sector_name || '',
    address: rawData.address || '',
    phone: rawData.phone || '',
    email: rawData.email || '',
    principalName: rawData.principal_name || '',
    principal_name: rawData.principal_name || '',
    studentCount: rawData.student_count || 0,
    student_count: rawData.student_count || 0,
    teacherCount: rawData.teacher_count || 0,
    teacher_count: rawData.teacher_count || 0,
    type: rawData.type || '',
    language: rawData.language || 'az',
    status: rawData.status || 'active',
    admin: rawData.admin || '',
    adminEmail: rawData.admin_email || '',
    admin_email: rawData.admin_email || '',
    createdAt: rawData.created_at || '',
    created_at: rawData.created_at || '',
    updatedAt: rawData.updated_at || '',
    updated_at: rawData.updated_at || '',
    logo: rawData.logo || '',
    completionRate: rawData.completion_rate || 0,
    completion_rate: rawData.completion_rate || 0
  };
};

export const adaptSchoolToApi = (school: Partial<School>) => {
  return {
    name: school.name,
    region_id: school.regionId || school.region_id,
    sector_id: school.sectorId || school.sector_id,
    address: school.address,
    phone: school.phone,
    email: school.email,
    principal_name: school.principalName || school.principal_name,
    student_count: school.studentCount || school.student_count,
    teacher_count: school.teacherCount || school.teacher_count,
    type: school.type,
    language: school.language,
    status: school.status || 'active',
    admin_email: school.adminEmail || school.admin_email,
    logo: school.logo,
    completion_rate: school.completionRate || school.completion_rate
  };
};
