
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  status: 'active' | 'inactive';
  completion_rate?: number;
  created_at: string;
  updated_at: string;
  region_name?: string;
  regionName?: string;
}

export interface CreateSectorData {
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
}

export interface UpdateSectorData extends Partial<CreateSectorData> {
  status?: 'active' | 'inactive';
  completion_rate?: number;
}
