
export type SectorStatus = 'active' | 'inactive' | 'deleted';

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  description?: string;
  status: SectorStatus;
  completion_rate?: number;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string;
}

export interface SectorFormData {
  name: string;
  region_id: string;
  description?: string;
  status?: SectorStatus;
  admin_id?: string;
  admin_email?: string;
}

export interface CreateSectorData {
  name: string;
  region_id: string;
  description?: string;
  status?: SectorStatus;
  admin_id?: string;
  admin_email?: string;
}

export interface UpdateSectorData extends Partial<CreateSectorData> {
  id: string;
}
