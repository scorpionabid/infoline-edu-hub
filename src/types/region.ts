
export interface Region {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedRegion extends Region {
  totalSectors?: number;
  totalSchools?: number;
  completionRate?: number;
  adminName?: string;
  sectorCount?: number;
  schoolCount?: number;
  // Add missing properties that are being used in the codebase
  name_az?: string;
  name_en?: string;
  sectors_count?: number;
  schools_count?: number;
  sector_count?: number;
  school_count?: number;
  admin_name?: string;
  adminEmail?: string;
  completion_rate?: number;
  admin?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface RegionFormData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface RegionFilter {
  search?: string;
  status?: string;
}
