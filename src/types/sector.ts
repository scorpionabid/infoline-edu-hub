
export interface Sector {
  id: string;
  name: string;
  description?: string;
  region_id: string;
  status?: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  admin_id?: string;
  admin_email?: string;
}
