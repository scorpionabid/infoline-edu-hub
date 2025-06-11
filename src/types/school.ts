
// School related types

export interface School {
  id: string;
  name: string;
  principal_name?: string;
  region_id: string;
  sector_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Region {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Sector {
  id: string;
  name: string;
  region_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
