
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
