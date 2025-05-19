
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
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
  completionRate?: number;
  type?: string;
  language?: string;
  logo?: string;
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
  created_at?: string;
  updated_at?: string;
  status: string;
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
  status: string;
  created_at: string;
  updated_at: string;
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
  principal_name?: string;
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
    principal_name: school.principal_name || school.principalName
  } as School;
}
