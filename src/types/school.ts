
// Məktəb üçün statuslar
export type SchoolStatus = 'active' | 'inactive' | 'archived' | 'pending';

export interface School {
  id: string;
  name: string;
  regionId: string;
  regionName?: string;
  sectorId: string;
  sectorName?: string;
  status: SchoolStatus;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  studentCount?: number;
  teacherCount?: number;
  createdAt?: string;
  updatedAt?: string;
  language?: string; // Əlavə edildi
  type?: string; // Əlavə edildi
  adminEmail?: string; // Əlavə edildi
}

// Admin əşyası interfeysi
export interface SchoolAdmin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  schoolId: string;
  schoolName?: string;
  createdAt?: string;
}

// Məktəb yaratma parametrləri
export interface CreateSchoolParams {
  name: string;
  regionId: string;
  sectorId: string;
  status: SchoolStatus;
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  studentCount?: number;
  teacherCount?: number;
  adminEmail?: string;
  language?: string;
  schoolType?: string;
  teachingLanguage?: string;
}

// Supabase məlumatlarını School tipinə uyğunlaşdırmaq üçün adapter
export const adaptSupabaseSchool = (data: any): School => {
  return {
    id: data.id,
    name: data.name,
    regionId: data.region_id,
    regionName: data.region_name,
    sectorId: data.sector_id,
    sectorName: data.sector_name,
    status: data.status as SchoolStatus,
    address: data.address,
    phone: data.phone,
    email: data.email,
    principalName: data.principal_name,
    studentCount: data.student_count,
    teacherCount: data.teacher_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    language: data.language,
    type: data.type,
    adminEmail: data.admin_email
  };
};
