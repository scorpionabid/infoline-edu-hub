
export interface Region {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  status: 'active' | 'inactive';
  admin_id?: string;
  admin_email?: string;
}

export type RegionFormData = {
  name: string;
  description?: string;
  status?: 'active' | 'inactive';
};
