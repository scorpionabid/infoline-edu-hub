
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
  createdAt?: string;
  updatedAt?: string;
}
