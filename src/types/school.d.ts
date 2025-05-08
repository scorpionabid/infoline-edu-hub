
import { Region, Sector } from './supabase';

export interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  admin_id?: string;
  admin_email?: string;
  principal_name?: string;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  language?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  completion_rate?: number;
}

export interface SchoolFormProps {
  initialData?: Partial<School>;
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting?: boolean;
  regions?: Region[];
  sectors?: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

export interface SchoolFiltersProps {
  searchTerm: string;
  selectedRegion: string;
  selectedSector: string;
  selectedStatus: string;
  onSearchChange: (term: string) => void;
  onRegionChange: (regionId: string) => void;
  onSectorChange: (sectorId: string) => void;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
  regions: Region[];
  sectors: Sector[];
}
