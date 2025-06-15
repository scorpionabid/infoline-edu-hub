
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
  regionName?: string;
  region_name?: string;
  adminName?: string;
  admin_name?: string;
  schoolCount?: number;
  school_count?: number;
  sectorCount?: number;
  sector_count?: number;
  completionRate?: number;
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

export interface CreateRegionData {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
}
