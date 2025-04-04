
// School tipini genişləndirib çatışmayan xüsusiyyətləri əlavə edək
export type SchoolStatus = 'active' | 'inactive';

export interface School {
  id: string;
  name: string;
  regionId: string;
  region_id: string;
  regionName?: string;
  sectorId: string;
  sector_id: string;
  sectorName?: string;
  status: SchoolStatus;
  address?: string;
  email?: string;
  phone?: string;
  principalName?: string;
  principal_name?: string;
  teacherCount?: number;
  teacher_count?: number;
  studentCount?: number;
  student_count?: number;
  language?: string;
  type?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  adminEmail?: string;
  admin_email?: string;
  logo?: string;
  completionRate?: number;
  completion_rate?: number;
}

export const adaptSchoolData = (data: any): School => {
  return {
    id: data.id,
    name: data.name,
    regionId: data.region_id,
    region_id: data.region_id,
    regionName: data.regionName || data.region_name,
    sectorId: data.sector_id,
    sector_id: data.sector_id,
    sectorName: data.sectorName || data.sector_name,
    status: data.status || 'active',
    address: data.address,
    email: data.email,
    phone: data.phone,
    principalName: data.principal_name,
    principal_name: data.principal_name,
    teacherCount: data.teacher_count,
    teacher_count: data.teacher_count,
    studentCount: data.student_count,
    student_count: data.student_count,
    language: data.language,
    type: data.type,
    createdAt: data.created_at,
    created_at: data.created_at,
    updatedAt: data.updated_at,
    updated_at: data.updated_at,
    adminEmail: data.admin_email,
    admin_email: data.admin_email,
    logo: data.logo,
    completionRate: data.completion_rate,
    completion_rate: data.completion_rate
  };
};
