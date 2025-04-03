
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
  principalName?: string;  // əlavə edildi
  studentCount?: number;
  teacherCount?: number;
  schoolType?: 'elementary' | 'middle' | 'high' | 'vocational' | 'special';
  teachingLanguage?: 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english';
  regionId: string;
  sectorId: string;
  status: 'active' | 'inactive';
  admin_id?: string; 
  adminEmail?: string;
  adminCount?: number;
  createdAt?: string;
  updatedAt?: string;
  // Supabase anlarında lazım olan sahələr
  region_id?: string;
  sector_id?: string;
  created_at?: string;
  updated_at?: string;
  principal_name?: string;
  language?: string;
  type?: string;
  completion_rate?: number;
  completionRate?: number; // əlavə edildi
  logo?: string;
  admin_email?: string;
  regionName?: string; // əlavə edildi
  sectorName?: string; // əlavə edildi
}

export interface CreateSchoolParams {
  name: string;
  principalName?: string;
  directorName?: string;
  address?: string;
  regionId?: string;
  sectorId?: string;
  region_id?: string;
  sector_id?: string;
  phone?: string;
  email?: string;
  studentCount?: number;
  teacherCount?: number;
  status?: 'active' | 'inactive';
  type?: string;
  schoolType?: string;
  language?: string;
  teachingLanguage?: string;
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
  adminStatus?: string;
}
