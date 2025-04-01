
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  regionName?: string;  // Əlavə edildi
  status: 'active' | 'inactive';
  admin_id?: string;
  adminEmail?: string;
  schoolCount?: number;
  adminCount?: number;
  completionRate?: number;  // Əlavə edildi
  created_at?: string;
  updated_at?: string;
}
