
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string; // Making this required to match Supabase interface
  status: string; // Making this required to match Supabase interface
}

export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  admin_id?: string;
  admin_email?: string;
  created_at: string;
  updated_at: string; // Making this required to match Supabase interface
  status: string; // Making this required to match Supabase interface
  completion_rate?: number;
  regionName?: string;
  region_name?: string;
}

export interface EnhancedRegion extends Region {
  completion_rate?: number;
  completionRate?: number;
  sectorCount?: number;
  schoolCount?: number;
}

export interface EnhancedSector extends Sector {
  regionName: string;
  schoolCount?: number;
  completion_rate?: number;
  completionRate?: number;
}
