
export interface Sector {
  id: string;
  name: string;
  description?: string | null;
  region_id: string;
  regionName?: string;
  status: 'active' | 'inactive';
  admin_id?: string | null;
  adminEmail?: string | null;
  schoolCount?: number;
  adminCount?: number;
  completionRate?: number;
  created_at?: string;
  updated_at?: string;
}
