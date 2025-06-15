
export interface Region {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive'; // Make optional to match school types
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
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
