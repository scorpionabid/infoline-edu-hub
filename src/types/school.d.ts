
import { School as SupabaseSchool, Region as SupabaseRegion, Sector as SupabaseSector } from './supabase';

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
  pendingCount?: number;
  pendingEntries?: number;
  totalEntries?: number;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  principalName?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Məktəb tipi - matched with Supabase.School
export interface School extends SupabaseSchool {
  status?: string;
}

// Region tipi - matched with Supabase.Region
export interface Region extends SupabaseRegion {
  status?: string;
}

// Sector tipi - matched with Supabase.Sector
export interface Sector extends SupabaseSector {
  status?: string;
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

// Helper functions for type adaptation
export function adaptSchoolFromSupabase(school: SupabaseSchool): School {
  return school as School;
}

export function adaptRegionFromSupabase(region: SupabaseRegion): Region {
  return region as Region;
}

export function adaptSectorFromSupabase(sector: SupabaseSector): Sector {
  return sector as Sector;
}
