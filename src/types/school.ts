
export interface School {
  id: string;
  name: string;
  principal_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  student_count?: number;
  teacher_count?: number;
  status?: 'active' | 'inactive';
  type?: string;
  language?: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  logo?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  completionRate: number;
  completion_rate?: number;
  totalEntries?: number;
  total_entries?: number;
  pendingEntries?: number;
  pending_entries?: number;
  pendingCount?: number;
  pendingForms?: number;
  approved_entries?: number;
  status?: 'active' | 'inactive';
  region_id?: string;
  sector_id?: string;
  formsCompleted?: number;
  totalForms?: number;
  lastUpdate?: string;
}

export interface SchoolFormProps {
  initialValues?: Partial<School>;
  onSubmit: (values: School) => void;
  onCancel: () => void;
  regions: Region[];
  sectors: Sector[];
  isSubmitting?: boolean;
}

export interface UploadFileData {
  file: File;
  category_id?: string;
  description?: string;
}

export const adaptToSchoolStat = (school: any): SchoolStat => {
  return {
    id: school.id,
    name: school.name,
    completionRate: school.completionRate || school.completion_rate || 0,
    totalEntries: school.totalEntries || school.total_entries || 0,
    pendingEntries: school.pendingEntries || school.pending_entries || school.pendingCount || 0,
    status: school.status || 'active',
    region_id: school.region_id,
    sector_id: school.sector_id,
    formsCompleted: school.formsCompleted || 0,
    totalForms: school.totalForms || 0,
    lastUpdate: school.lastUpdate
  };
};
