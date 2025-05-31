
export interface School {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive';
  principal_name?: string;
  region_id: string;
  sector_id: string;
  student_count?: number;
  teacher_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Region {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SchoolFormProps {
  onSubmit: (data: School) => Promise<void>;
  isSubmitting: boolean;
  regions: Region[];
  sectors: Sector[];
  school?: School; // initialData əvəzinə school istifadə edirik
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

export interface AddSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<School, 'id'>) => Promise<void>;
  isSubmitting: boolean;
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}
