
// Main School interface
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  status?: string;
  region_name?: string;
  sector_name?: string;
  admin_id?: string;
  admin_name?: string;
  admin_email?: string;
  principal_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  student_count?: number;
  teacher_count?: number;
  created_at: string; // Changed to required to match Supabase type
  updated_at: string; // Changed to required to match Supabase type
  completion_rate?: number;
  completionRate?: number;
  type?: string;
  language?: string;
  logo?: string;
  // Properties for compatibility with different versions
  principalName?: string;
}

// Statistics for schools
export interface SchoolsStatistics {
  total: number;
  active: number;
  inactive: number;
  archived?: number;
  count?: number;
  draft?: number;
}

export interface SchoolWithStats extends School {
  stats?: SchoolsStatistics;
}

export interface EnhancedSchool extends School {
  region?: {
    id: string;
    name: string;
  };
  sector?: {
    id: string;
    name: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
  };
}

// Region interface
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string; // Changed to required to match Supabase type
  updated_at: string; // Changed to required to match Supabase type
  status: string; // Changed to required to match Supabase type
}

// EnhancedRegion extends Region
export interface EnhancedRegion extends Region {
  id: string; // Ensuring id is required
  school_count?: number;
  sector_count?: number;
  schools_count?: number;
  sectors_count?: number;
  admin_name?: string;
  completion_rate?: number;
  completionRate?: number;
  admin?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// Sector interface
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: string; // Required to match Supabase type
  created_at: string; // Required to match Supabase type
  updated_at: string; // Required to match Supabase type
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
}

// Enhanced Sector interface
export interface EnhancedSector extends Sector {
  region_name?: string;
  school_count?: number;
}

// School Stats for dashboard
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion?: number;
  status?: string;
  lastUpdate?: string;
  pendingCount?: number;
  pendingEntries?: number;
  totalEntries?: number;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  principal_name?: string; // Added to fix type errors
  address?: string;
  phone?: string;
  email?: string;
}

// Form props
export interface SchoolFormProps {
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: School;
  regions?: Region[];
  sectors?: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

// Enhanced form props
export interface EnhancedSchoolFormProps extends SchoolFormProps {
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}

// Edit dialog props
export interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSuccess?: () => void;
}

// For backward compatibility
export type SchoolStatus = 'active' | 'inactive' | 'archived' | string;
export type { School as SchoolProfile };
export type SchoolFormData = Partial<School>;

// Adapter functions for type conversion
export function adaptSchoolFromSupabase(school: any): School {
  return {
    ...school,
    completionRate: school.completion_rate,
    principalName: school.principal_name || school.principalName,
    principal_name: school.principal_name || school.principalName
  } as School;
}

// Adapter function for SchoolStat
export function adaptToSchoolStat(data: any): SchoolStat {
  return {
    ...data,
    completionRate: data.completionRate || data.completion_rate || data.completion || 0,
    principal_name: data.principal_name || data.principalName,
    principalName: data.principalName || data.principal_name
  };
}
