
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
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  teacher_count?: number;
  student_count?: number;
  completion_rate?: number;
  type?: string;
  language?: string;
}
