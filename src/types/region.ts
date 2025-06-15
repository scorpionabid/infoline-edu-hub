
export interface Region {
  id: string;
  name: string;
  description?: string;
  status: string;
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

export interface RegionFilter {
  search?: string;
  status?: string;
}
