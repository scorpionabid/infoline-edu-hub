
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
