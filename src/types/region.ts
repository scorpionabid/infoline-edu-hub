

export type RegionStatus = 'active' | 'inactive' | 'deleted';

export interface Region {
  id: string;
  name: string;
  description?: string;
  status: RegionStatus;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface EnhancedRegion extends Region {
  region_name?: string;
  admin_name?: string;
  completion_rate?: number;
  total_sectors?: number;
  total_schools?: number;
}

export interface RegionFormData {
  name: string;
  description?: string;
  status?: RegionStatus;
  admin_id?: string;
  admin_email?: string;
}

export interface CreateRegionData {
  name: string;
  description?: string;
  status?: RegionStatus;
  admin_id?: string;
  admin_email?: string;
}

export interface UpdateRegionData extends Partial<CreateRegionData> {
  id: string;
}

