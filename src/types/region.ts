
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
  created_at: string; // Burada created_at artıq optional deyil
  updated_at?: string;
  status: string;
  // Admin əlaqəli məlumatlar
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

// EnhancedRegion tipini region.ts faylında təyin edirik
export interface EnhancedRegion extends Region {
  sectorCount: number;
  schoolCount: number;
  adminCount: number;
  completionRate: number;
}
