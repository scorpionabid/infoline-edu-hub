
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
  created_at: string; 
  updated_at: string;
  status: string;
  admin_id?: string; // admin_id əlavə edildi
  // Admin əlaqəli məlumatlar
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
}

// EnhancedRegion tipini region.ts faylında təyin edirik və ixrac edirik
export interface EnhancedRegion extends Region {
  sectorCount: number;
  schoolCount: number;
  adminCount: number;
  adminEmail?: string | null; // Region adminin email ünvanı
  completionRate: number;
}
