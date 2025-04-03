
export type SchoolStatus = "active" | "inactive" | string;

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
  principal_name?: string; // SupaBase  əsaslı ad
  principalName?: string; // Frontend əsaslı ad
  student_count?: number; // SupaBase  əsaslı ad
  studentCount?: number; // Frontend əsaslı ad
  teacher_count?: number; // SupaBase  əsaslı ad
  teacherCount?: number; // Frontend əsaslı ad
  type?: string;
  logo?: string;
  status: SchoolStatus;
  createdAt?: string;
  updatedAt?: string;
  completion_rate?: number; // SupaBase  əsaslı ad
  completionRate?: number; // Frontend əsaslı ad
  language?: string; // Əlavə edildi
  adminEmail?: string; // Əlavə edildi
}

// Adaptor funksiyası
export const adaptSchoolData = (rawData: any): School => ({
  id: rawData.id,
  name: rawData.name,
  regionId: rawData.region_id,
  regionName: rawData.region_name || '',
  sectorId: rawData.sector_id,
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
  logo: rawData.logo || '',
  status: rawData.status || 'active',
  createdAt: rawData.created_at || '',
  updatedAt: rawData.updated_at || '',
  completionRate: rawData.completion_rate || 0,
  completion_rate: rawData.completion_rate || 0,
  language: rawData.language || '', // Əlavə edildi
  adminEmail: rawData.admin_email || '' // Əlavə edildi
});

export interface CreateSchoolParams {
  name: string;
  regionId: string;
  sectorId: string;
  status?: 'active' | 'inactive';
  address?: string;
  phone?: string;
  email?: string;
  principalName?: string;
  studentCount?: number;
  teacherCount?: number;
  type?: string;
  language?: string;
}
