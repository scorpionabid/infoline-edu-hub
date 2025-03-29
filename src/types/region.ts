
export interface RegionFormData {
  name: string;
  description: string;
  status: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

export interface Region {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  status: string;
  // Admin əlaqəli məlumatlar
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}
