
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: string;
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface SectorFormData {
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
}

export interface SectorFilter {
  search?: string;
  region_id?: string;
  status?: string;
}
