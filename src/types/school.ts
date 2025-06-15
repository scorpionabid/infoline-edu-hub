
import { Region } from './region';
import { Sector } from './sector';

// Export Region and Sector from their respective files
export { Region } from './region';
export { Sector } from './sector';

export interface School {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive' | 'pending' | 'archived';
  principal_name?: string;
  principal_email?: string;
  contact_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
  regionName?: string;
  sectorName?: string;
  completion_rate?: number;
}

export interface EnhancedSchool extends School {
  totalStudents?: number;
  totalTeachers?: number;
  adminName?: string;
}

export interface SchoolFormData {
  name: string;
  description?: string;
  region_id: string;
  sector_id: string;
  status?: 'active' | 'inactive' | 'pending' | 'archived';
  principal_name?: string;
  principal_email?: string;
  contact_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface CreateSchoolData {
  name: string;
  region_id: string;
  sector_id: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status?: 'active' | 'inactive' | 'pending' | 'archived';
  language?: string;
  admin_id?: string;
  admin_email?: string;
}

export interface SchoolFilter {
  search?: string;
  region_id?: string;
  sector_id?: string;
  status?: string;
}

// Add missing interface for SchoolsContainer
export interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  loading: boolean;
  error: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onSchoolSelect: (school: School) => void;
  onRefresh: () => Promise<void>;
}
