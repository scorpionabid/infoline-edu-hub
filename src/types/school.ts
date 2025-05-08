
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
  status: string;
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Məktəb tipi
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
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  teacher_count?: number;
  student_count?: number;
  completion_rate?: number;
  type?: string;
  language?: string;
  admin_id?: string;
  admin_email?: string;
}

// Region tipi
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  status: 'active' | 'inactive' | string;
}

// Sector tipi
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  status: 'active' | 'inactive' | string;
  completion_rate?: number;
}

// SchoolForm props tipi
export interface SchoolFormProps {
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting: boolean;
  initialData?: School;
}
