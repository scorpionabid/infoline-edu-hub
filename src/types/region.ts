
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  created_at?: string;
  updated_at?: string;
  status: string;
}

export interface EnhancedRegion extends Region {
  id: string; // Ensuring id is required
  school_count?: number;
  sector_count?: number;
  admin_name?: string;
  schools_count?: number; 
  sectors_count?: number;
  completion_rate?: number;
  admin?: {
    id: string;
    full_name: string;
    email: string;
  };
}
