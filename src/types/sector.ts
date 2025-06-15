
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
  regionName?: string;
  region_name?: string;
}

export interface EnhancedSector extends Sector {
  adminName?: string;
  admin_name?: string;
  schoolCount?: number;
  school_count?: number;
  completionRate?: number;
}

export interface SectorFormData {
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
}

export interface CreateSectorData {
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
}
