
import { SchoolStat } from './supabase';

export interface SchoolFilter {
  regionId?: string;
  sectorId?: string;
  status?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface SchoolFormData {
  id?: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  language?: string;
}

export interface SchoolFormProps {
  initialData?: SchoolFormData;
  onSubmit: (data: SchoolFormData) => void;
  regions: Array<{id: string; name: string}>;
  sectors: Array<{id: string; name: string}>;
  isLoading?: boolean;
  submitButtonText?: string;
}

export interface EnhancedSchoolFormProps extends Partial<SchoolFormProps> {
  initialData?: SchoolFormData;
  onSubmit: (data: SchoolFormData) => void;
}

// Re-export supabase types to avoid circular dependencies
export { SchoolStat };
