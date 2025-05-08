
// Sector məktəbləri üçün tip
export interface SectorSchool {
  id: string;
  name: string;
  status: string;
  region_id: string;
  sector_id: string;
  completionRate?: number;
  completion_rate?: number;
  lastUpdate?: string;
  updated_at?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Məktəb statistikası üçün tip
export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  status?: string;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Məktəb tipi - updated to make compatible with Supabase.School
export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  email?: string;
  phone?: string;
  principal_name?: string;
  principalName?: string;
  status: string;
  created_at: string; // Changed from string | Date to just string
  updated_at?: string; // Changed from string | Date to just string
  teacher_count?: number;
  student_count?: number;
  completion_rate?: number;
  type?: string;
  language?: string;
  admin_id?: string;
  admin_email?: string;
  region_name?: string;
  sector_name?: string;
}

// Region tipi - updated to make compatible with Supabase.Region
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string; // Changed from string | Date to just string
  updated_at: string; // Changed from string | Date to just string
  status: string;
}

// Sector tipi - updated to make compatible with Supabase.Sector
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string; // Changed from string | Date to just string
  updated_at: string; // Changed from string | Date to just string
  status: string;
  completion_rate?: number;
  regionName?: string; // Added to match EnhancedSector
  region_name?: string; // Added to match usage in SectorCard
}

// SchoolForm props tipi
export interface SchoolFormProps {
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: School;
  regions?: Region[];
  sectors?: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

// EditSchoolDialog props tipi
export interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSuccess?: () => void;
}

// EnhancedSchoolFormProps props tipi
export interface EnhancedSchoolFormProps extends SchoolFormProps {
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}
