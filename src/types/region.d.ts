
export interface Region {
  id: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EnhancedRegion extends Region {
  id: string; // Explicitly define id to fix type error
  sectors?: number;
  schools?: number;
  admins?: any[];
  completionRate?: number;
}

export interface RegionFormData {
  id?: string;
  name: string;
  description?: string;
  admin_id?: string;
  admin_email?: string;
  status?: string;
}
