
import { SchoolStat, Region, Sector } from './supabase';

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
  principalName?: string; // Added for compatibility
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  language?: string;
  created_at?: string; // Added to match supabase.School
  updated_at?: string; // Added to match supabase.School
}

export interface SchoolFormProps {
  initialData?: SchoolFormData;
  onSubmit: (data: SchoolFormData) => void;
  regions: Array<{id: string; name: string}>;
  sectors?: Array<{id: string; name: string}>;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export interface EnhancedSchoolFormProps extends SchoolFormProps {
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

// Re-export from supabase types to avoid circular dependencies
export { SchoolStat, Region, Sector } from './supabase';

// School interface for backwards compatibility
export interface School extends SchoolFormData {
  id: string;
  created_at: string; 
  updated_at: string; 
  completion_rate?: number;
  completionRate?: number;
  region_name?: string;
  sector_name?: string;
}

// Define SectorSchool for compatibility
export interface SectorSchool {
  id: string;
  name: string;
  status?: string;
  completionRate: number;
  principal_name?: string;
  principalName?: string;
}
