
import { UserRole } from './user';

export type SchoolStatus = 'active' | 'inactive' | 'pending' | 'archived';

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  type?: string | null;
  language?: string | null;
  student_count?: number | null;
  teacher_count?: number | null;
  principal_name?: string | null;
  admin_id?: string | null;
  admin_email?: string | null;
  logo?: string | null;
  status?: SchoolStatus;
  completion_rate?: number | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolStat {
  id: string;
  name: string;
  status: string;
  completionRate: number;
  lastUpdate: string;
  pendingForms: number;
  formsCompleted: number;
  totalForms: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface SectorSchool extends School {
  pendingForms: number;
}

export interface SchoolFormProps {
  initialData?: Partial<School>;
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting: boolean;
  regions: any[];
  sectors: any[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}

export type EnhancedSchoolFormProps = SchoolFormProps;
