export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  adminEmail?: string;
  schoolCount?: number;
  adminCount?: number;
  created_at?: string;
  updated_at?: string;
}
