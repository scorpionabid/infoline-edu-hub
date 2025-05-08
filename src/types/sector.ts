
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: string; // Changed to required to match other interfaces
  created_at: string; // Changed to required to match other interfaces
  updated_at: string; // Changed to required to match other interfaces
  admin_id?: string;
  admin_email?: string;
  completion_rate?: number;
  regionName?: string; // Added to match usage in components
  region_name?: string; // Added to match usage in components
}

export interface SectorFormData {
  id?: string;
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive' | 'blocked';
}
