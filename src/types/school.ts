
export type SchoolStatus = "active" | "inactive" | "archived" | "pending" | string;

export type SchoolType = "full" | "general" | "primary" | string;

export type SchoolLanguage = "az" | "ru" | "en" | string;

export interface School {
  id: string;
  name: string;
  regionId: string;
  regionName?: string;
  sectorId: string;
  sectorName?: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string; // directorName əvəzinə principalName istifadə et
  studentCount?: number;
  teacherCount?: number;
  type?: SchoolType;
  language?: SchoolLanguage;
  status: SchoolStatus;
  admin?: string;
  adminEmail?: string;
  createdAt?: string;
  updatedAt?: string;
  logo?: string;
  completionRate?: number;
}

export interface CreateSchoolParams {
  name: string;
  regionId: string;
  sectorId: string;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string; // directorName əvəzinə
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
    regionName: rawData.region_name || '',
    sectorId: rawData.sector_id || '',
    sectorName: rawData.sector_name || '',
    address: rawData.address || '',
    phone: rawData.phone || '',
    email: rawData.email || '',
    principalName: rawData.principal_name || '',
    studentCount: rawData.student_count || 0,
    teacherCount: rawData.teacher_count || 0,
    type: rawData.type || '',
    language: rawData.language || 'az',
    status: rawData.status || 'active',
    admin: rawData.admin || '',
    adminEmail: rawData.admin_email || '',
    createdAt: rawData.created_at || '',
    updatedAt: rawData.updated_at || '',
    logo: rawData.logo || '',
    completionRate: rawData.completion_rate || 0
  };
};

export const adaptSchoolToApi = (school: Partial<School>) => {
  return {
    name: school.name,
    region_id: school.regionId,
    sector_id: school.sectorId,
    address: school.address,
    phone: school.phone,
    email: school.email,
    principal_name: school.principalName,
    student_count: school.studentCount,
    teacher_count: school.teacherCount,
    type: school.type,
    language: school.language,
    status: school.status || 'active',
    admin_email: school.adminEmail,
    logo: school.logo,
    completion_rate: school.completionRate
  };
};
