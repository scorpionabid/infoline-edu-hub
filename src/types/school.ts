
export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  directorName?: string;
  studentCount?: number;
  teacherCount?: number;
  schoolType?: 'elementary' | 'middle' | 'high' | 'vocational' | 'special';
  teachingLanguage?: 'azerbaijani' | 'russian' | 'georgian' | 'turkish' | 'english';
  regionId: string;
  sectorId: string;
  status: 'active' | 'inactive';
  admin_id?: string; // admin_id əlavə edildi
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
  logo?: string;
  admin_email?: string;
}
