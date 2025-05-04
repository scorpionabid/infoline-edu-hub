
export interface UserFormData {
  id?: string;
  email: string;
  password?: string;
  full_name: string;
  role?: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  status?: 'active' | 'inactive' | 'blocked';
  avatar?: string;
  phone?: string;
  position?: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
}
